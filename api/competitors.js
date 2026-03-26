// api/competitors.js — Competitor Intelligence for Destiny Springs Healthcare
// ─────────────────────────────────────────────────────────────────────────────
// Scrapes Google Search knowledge panels, Healthgrades, and website meta for
// Scottsdale/Phoenix-area behavioral health competitors.
// All 6 competitors scraped FULLY IN PARALLEL — single handler, one cold start.
//
// GET /api/competitors          — fetch all 6 competitors
// GET /api/competitors?id=slug  — refresh one competitor by ID
// GET /api/competitors?debug=1  — include raw errors in response

const COMPETITORS = [
  {
    id:    'springboard-recovery',
    name:  'Springboard Recovery',
    web:   'https://springboardrecovery.com',
    query: 'Springboard Recovery Scottsdale AZ addiction treatment reviews',
    hgQuery: 'Springboard Recovery Scottsdale AZ',
  },
  {
    id:    'the-meadows',
    name:  'The Meadows',
    web:   'https://www.themeadows.com',
    query: 'The Meadows Wickenburg AZ treatment center reviews',
    hgQuery: 'The Meadows Wickenburg AZ',
  },
  {
    id:    'aurora-behavioral',
    name:  'Aurora Behavioral Health System',
    web:   'https://www.auroraarizona.com',
    query: 'Aurora Behavioral Health System Tempe AZ reviews',
    hgQuery: 'Aurora Behavioral Health System Tempe AZ',
  },
  {
    id:    'banner-behavioral',
    name:  'Banner Behavioral Health Hospital',
    web:   'https://www.bannerhealth.com/services/behavioral-health',
    query: 'Banner Behavioral Health Hospital Scottsdale AZ reviews',
    hgQuery: 'Banner Behavioral Health Hospital Scottsdale AZ',
  },
  {
    id:    'terros-health',
    name:  'Terros Health',
    web:   'https://terroshealth.org',
    query: 'Terros Health Phoenix AZ mental health reviews',
    hgQuery: 'Terros Health Phoenix AZ',
  },
  {
    id:    'southwest-behavioral',
    name:  'Southwest Behavioral & Health Services',
    web:   'https://www.sbhservices.org',
    query: 'Southwest Behavioral Health Services Arizona reviews',
    hgQuery: 'Southwest Behavioral Health Services AZ',
  },
];

// ── Shared fetch with browser UA + timeout ────────────────────────────────────
const fetchH = (url, extraHeaders = {}, ms = 8000) =>
  fetch(url, {
    headers: {
      'User-Agent':      'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
      'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control':   'no-cache',
      ...extraHeaders,
    },
    redirect: 'follow',
    signal:   AbortSignal.timeout(ms),
  });

const strip  = (s = '') => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#\d+;/g, '').replace(/\s+/g, ' ').trim();

// ── JSON-LD helpers ───────────────────────────────────────────────────────────
function getJsonLd(html) {
  const out = [];
  const rx  = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = rx.exec(html))) { try { out.push(JSON.parse(m[1])); } catch {} }
  return out;
}
function findAggRating(items) {
  const walk = (o) => {
    if (!o || typeof o !== 'object') return null;
    if (o.aggregateRating) {
      const ar     = o.aggregateRating;
      const rating = parseFloat(ar.ratingValue);
      const count  = parseInt(ar.reviewCount ?? ar.ratingCount ?? ar.userInteractionCount ?? 0);
      if (!isNaN(rating)) return { rating, reviewCount: isNaN(count) ? null : count || null };
    }
    if (Array.isArray(o['@graph'])) for (const i of o['@graph']) { const r = walk(i); if (r) return r; }
    return null;
  };
  for (const s of items) { const r = walk(s); if (r) return r; }
  return null;
}

// ── Google Places API — the reliable way to get ratings ─────────────────────
// Google blocks server-side scraping from Vercel IPs (returns CAPTCHA pages).
// The Places Text Search API is the proper solution — returns rating +
// user_ratings_total for any business name + location query.
//
// Required: set GOOGLE_PLACES_API_KEY in Vercel → Project → Settings → Env Vars
// How to get one:
//   console.cloud.google.com → Enable "Places API" → Credentials → Create API Key
async function scrapeGoogleRating(query) {
  const key = process.env.GOOGLE_PLACES_KEY || process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  // ── Method 1: Google Places Text Search (requires API key, most reliable) ──
  if (key) {
    try {
      const url  = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${encodeURIComponent(key)}`;
      const r    = await fetch(url, { signal: AbortSignal.timeout(7000) });
      const data = await r.json();
      const place = data.results?.[0];
      if (place?.rating) {
        return {
          rating:      place.rating,
          reviewCount: place.user_ratings_total || null,
          source:      'Google',
          placeId:     place.place_id,
        };
      }
    } catch {}
  }

  // ── Method 2: Scrape Google Search (fallback — often blocked by Vercel IPs) ─
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=3&hl=en`;
    const r   = await fetchH(url, {}, 7000);
    if (!r.ok) return null;
    const html = await r.text();

    const aria = html.match(/aria-label=["'][Rr]ated?\s*([\d.]+)[^"']*\(([\d,]+)\s*review/i);
    if (aria) return { rating: parseFloat(aria[1]), reviewCount: parseInt(aria[2].replace(/,/g, '')), source: 'Google' };

    const ld = findAggRating(getJsonLd(html));
    if (ld) return { ...ld, source: 'Google' };

    const inline = html.match(/([\d.]{3})\s*(?:★|\()\s*(?:[^)]{0,40})?\(?([\d,]+)\s*(?:Google\s+)?reviews?/i);
    if (inline) return { rating: parseFloat(inline[1]), reviewCount: parseInt(inline[2].replace(/,/g, '')), source: 'Google' };

    return null;
  } catch { return null; }
}

// ── Scrape Healthgrades for a competitor ─────────────────────────────────────
async function scrapeHealthgrades(hgQuery) {
  try {
    const searchUrl = `https://www.healthgrades.com/search?what=${encodeURIComponent(hgQuery)}&pt=HOSPITAL`;
    const r1 = await fetchH(searchUrl, {}, 7000);
    if (!r1.ok) return null;
    const html1 = await r1.text();
    // Try multiple link patterns Healthgrades uses
    const linkM = html1.match(/href="(\/group-directory\/[^"?#]+)/i)
                || html1.match(/href="(\/hospital\/[^"?#]+)/i)
                || html1.match(/href="(\/facility\/[^"?#]+)/i)
                || html1.match(/href="(\/provider\/[^"?#]+)/i)
                || html1.match(/"url"\s*:\s*"(https?:\/\/www\.healthgrades\.com\/[^"]+\/[^"?#]{10,})"/i);
    if (!linkM) return null;
    const profileUrl = linkM[1].startsWith('http') ? linkM[1] : 'https://www.healthgrades.com' + linkM[1];
    const r2 = await fetchH(profileUrl, {}, 7000);
    if (!r2.ok) return null;
    const html2 = await r2.text();
    const ld = findAggRating(getJsonLd(html2));
    if (ld) return { ...ld, source: 'Healthgrades', url: profileUrl };
    const rM = html2.match(/"ratingValue"\s*:\s*"?([\d.]+)/i);
    const cM = html2.match(/"reviewCount"\s*:\s*"?(\d+)/i) || html2.match(/([\d,]+)\s+(?:reviews?|ratings?)/i);
    if (rM) return { rating: parseFloat(rM[1]), reviewCount: cM ? parseInt(cM[1].replace(/,/g, '')) : null, source: 'Healthgrades', url: profileUrl };
    return null;
  } catch { return null; }
}

// ── Scrape competitor website for basic profile info ─────────────────────────
async function scrapeWebsite(url) {
  try {
    const r = await fetchH(url, {}, 7000);
    if (!r.ok) return null;
    const html = await r.text();
    const get  = rx => { const m = html.match(rx); return m ? strip(m[1]) : null; };
    const title   = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i) || get(/<title[^>]*>([^<]+)<\/title>/i);
    const desc    = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i) || get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i);
    const phones  = [];
    const telRx   = /href=["']tel:([\d\s().+\-]+)["']/gi;
    let tm;
    while ((tm = telRx.exec(html)) && phones.length < 2) {
      const digits = tm[1].replace(/\D/g, '');
      if (digits.length >= 10) phones.push(tm[1].trim());
    }
    // Count keyword density as a proxy for service depth
    const kws      = ['mental health','behavioral health','therapy','counseling','psychiatry','addiction','substance','iop','php','outpatient','inpatient','trauma','depression','anxiety'];
    const lo       = html.toLowerCase();
    const services = kws.filter(k => lo.includes(k));
    const wordCount = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').split(' ').filter(w => w.length > 2).length;
    const schemaRating = findAggRating(getJsonLd(html));

    return { title, description: desc, phones, services, wordCount, schemaRating };
  } catch { return null; }
}

// ── Scrape a single competitor (runs 3 sub-scrapers in parallel) ──────────────
async function scrapeCompetitor(competitor) {
  const [google, healthgrades, website] = await Promise.all([
    scrapeGoogleRating(competitor.query).catch(() => null),
    scrapeHealthgrades(competitor.hgQuery).catch(() => null),
    scrapeWebsite(competitor.web).catch(() => null),
  ]);

  // Score: weighted average of available ratings
  const ratings = [
    google?.rating       ? { r: google.rating,       w: 3 } : null,
    healthgrades?.rating ? { r: healthgrades.rating, w: 2 } : null,
    website?.schemaRating?.rating ? { r: website.schemaRating.rating, w: 1 } : null,
  ].filter(Boolean);

  const avgRating = ratings.length
    ? ratings.reduce((s, x) => s + x.r * x.w, 0) / ratings.reduce((s, x) => s + x.w, 0)
    : null;

  const totalReviews = (google?.reviewCount || 0) + (healthgrades?.reviewCount || 0);

  return {
    id:           competitor.id,
    name:         competitor.name,
    web:          competitor.web,
    google,
    healthgrades,
    website: website ? {
      title:         website.title,
      description:   website.description,
      phones:        website.phones,
      services:      website.services,
      wordCount:     website.wordCount,
      schemaRating:  website.schemaRating,
    } : null,
    avgRating:    avgRating ? parseFloat(avgRating.toFixed(2)) : null,
    totalReviews: totalReviews || null,
    scrapedAt:    new Date().toISOString(),
  };
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, debug } = req.query;

  // If POST with a custom competitors array, use those instead of the hardcoded list
  let customList = null;
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (Array.isArray(body?.competitors) && body.competitors.length > 0) {
        customList = body.competitors.map(c => ({
          id:      c.id || c.url?.replace(/https?:\/\//,'').replace(/[^a-z0-9]/gi,'-').toLowerCase() || String(Math.random()),
          name:    c.label || c.name || 'Unknown',
          web:     c.url  || c.web  || '',
          query:   c.query   || `${c.label || c.name} behavioral health reviews`,
          hgQuery: c.hgQuery || (c.label || c.name),
        }));
      }
    } catch {}
  }

  const LIST = customList || COMPETITORS;

  try {
    // Single-competitor refresh
    if (id) {
      const comp = LIST.find(c => c.id === id) || COMPETITORS.find(c => c.id === id);
      if (!comp) return res.status(404).json({ ok: false, error: `Unknown competitor id: ${id}` });
      const result = await scrapeCompetitor(comp);
      return res.json({ ok: true, competitor: result });
    }

    // All competitors in parallel
    const results = await Promise.all(
      LIST.map(c => scrapeCompetitor(c).catch(e => ({
        id: c.id, name: c.name, web: c.web, error: e.message, scrapedAt: new Date().toISOString(),
      })))
    );

    // Sort by avgRating descending (nulls last)
    const sorted = [...results].sort((a, b) => {
      if (a.avgRating == null && b.avgRating == null) return 0;
      if (a.avgRating == null) return 1;
      if (b.avgRating == null) return -1;
      return b.avgRating - a.avgRating;
    });

    const response = {
      ok:          true,
      fetchedAt:   new Date().toISOString(),
      competitors: sorted,
      summary: {
        avgRatingAcrossAll:  (() => {
          const rated = sorted.filter(c => c.avgRating != null);
          return rated.length ? parseFloat((rated.reduce((s, c) => s + c.avgRating, 0) / rated.length).toFixed(2)) : null;
        })(),
        totalReviewsAcrossAll: sorted.reduce((s, c) => s + (c.totalReviews || 0), 0) || null,
        count: sorted.length,
      },
    };

    if (debug === '1') {
      response._debug = results.map(r => ({ id: r.id, error: r.error, googleOk: !!r.google, hgOk: !!r.healthgrades, webOk: !!r.website }));
    }

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
