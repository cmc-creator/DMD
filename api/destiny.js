// Vercel serverless — Destiny Springs Healthcare Auto-Profile Fetcher
// ─────────────────────────────────────────────────────────────────────────────
// DATA SOURCES (most require NO API KEY):
//   • destinyspringshealthcare.com  — title, meta, H1/H2s, phones,
//                                     JSON-LD schema (AggregateRating!),
//                                     social media links
//   • Healthgrades                  — star rating, review count, specialties (free scrape)
//   • Google Search HTML            — knowledge panel rating/reviews (best-effort, no key)
//   • Google Places API (optional)  — full reviews text, hours, photos
//                                     env var: GOOGLE_PLACES_KEY
//
// Runs on every page load; the frontend also polls every 60 minutes.

const WEBSITE_URL    = 'https://destinyspringshealthcare.com';
const BUSINESS_NAME  = 'Destiny Springs Healthcare';
const BUSINESS_QUERY = 'Destiny Springs Healthcare Scottsdale AZ';

// ── Fetch with timeout + browser-like headers ───────────────────────────────
const BROWSER_HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control':   'no-cache',
};

const fetchT = (url, opts = {}, ms = 9000) =>
  fetch(url, {
    ...opts,
    headers: { ...BROWSER_HEADERS, ...(opts.headers || {}) },
    signal: AbortSignal.timeout(ms),
    redirect: 'follow',
  });

// ── Plain-text from HTML ─────────────────────────────────────────────────────
const stripHtml = (s = '') => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// ── Extract JSON-LD blocks from page ────────────────────────────────────────
function extractJsonLd(html) {
  const schemas = [];
  const rx = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = rx.exec(html)) !== null) {
    try { schemas.push(JSON.parse(m[1])); } catch { /* skip malformed */ }
  }
  return schemas;
}

// ── Walk JSON-LD tree looking for AggregateRating ───────────────────────────
function findAggregateRating(schemas) {
  const walk = (obj) => {
    if (!obj || typeof obj !== 'object') return null;
    if (obj.aggregateRating) {
      const ar = obj.aggregateRating;
      const rating      = parseFloat(ar.ratingValue) || null;
      const reviewCount = parseInt(ar.reviewCount ?? ar.ratingCount ?? ar.userInteractionCount) || null;
      if (rating) return { rating, reviewCount };
    }
    // @graph array
    if (Array.isArray(obj['@graph'])) {
      for (const item of obj['@graph']) {
        const r = walk(item); if (r) return r;
      }
    }
    return null;
  };
  for (const s of schemas) {
    const r = walk(s); if (r) return r;
  }
  return null;
}

// ── Extract social / contact links from HTML ─────────────────────────────────
function extractSocialLinks(html) {
  const links = {};
  const hrefRx = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = hrefRx.exec(html)) !== null) {
    const href = m[1];
    if (/facebook\.com\/[a-zA-Z0-9._%-]+/.test(href) && !links.facebook) links.facebook = href.trim();
    if (/instagram\.com\/[a-zA-Z0-9._%-]+/.test(href) && !links.instagram) links.instagram = href.trim();
    if (/twitter\.com\/[a-zA-Z0-9._%-]+|x\.com\/[a-zA-Z0-9._%-]+/.test(href) && !links.twitter) links.twitter = href.trim();
    if (/linkedin\.com\/(?:company|in)\/[a-zA-Z0-9._%-]+/.test(href) && !links.linkedin) links.linkedin = href.trim();
    if (/youtube\.com\/@?[a-zA-Z0-9._%-]+|youtu\.be\/[a-zA-Z0-9._%-]+/.test(href) && !links.youtube) links.youtube = href.trim();
    if (/tiktok\.com\/@[a-zA-Z0-9._%-]+/.test(href) && !links.tiktok) links.tiktok = href.trim();
  }
  return links;
}

// ── Main website scraper ─────────────────────────────────────────────────────
async function scrapeWebsite() {
  const r = await fetchT(WEBSITE_URL, {}, 10000);
  if (!r.ok) throw new Error(`Website HTTP ${r.status}`);
  const html = await r.text();

  const get = (rx) => { const m = html.match(rx); return m ? m[1].trim() : null; };

  const title    = get(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitle  = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)
                || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title/i);
  const ogDesc   = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i)
                || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description/i);
  const metaDesc = get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)
                || get(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description/i);
  const ogImage  = get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)
                || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image/i);

  const h1m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1  = h1m ? stripHtml(h1m[1]) : null;

  const h2s = [];
  const h2Rx = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let h2m;
  while ((h2m = h2Rx.exec(html)) !== null && h2s.length < 8) {
    const t = stripHtml(h2m[1]);
    if (t.length > 2 && t.length < 140) h2s.push(t);
  }

  const h3s = [];
  const h3Rx = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  let h3m;
  while ((h3m = h3Rx.exec(html)) !== null && h3s.length < 10) {
    const t = stripHtml(h3m[1]);
    if (t.length > 2 && t.length < 100) h3s.push(t);
  }

  const phones = [];
  const phoneRx = /\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/g;
  let pm;
  while ((pm = phoneRx.exec(html)) !== null && phones.length < 3) phones.push(pm[0]);

  const serviceKeywords = [
    'mental health','behavioral health','therapy','counseling','psychiatry',
    'depression','anxiety','ptsd','trauma','addiction','substance',
    'bipolar','outpatient','inpatient','residential','iop','php',
    'adolescent','adult','family therapy','group therapy','telehealth',
  ];
  const lowerHtml = html.toLowerCase();
  const services  = serviceKeywords.filter(kw => lowerHtml.includes(kw));
  const wordCount = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').split(' ').filter(w => w.length > 2).length;

  // ── JSON-LD schema → AggregateRating (no API key needed!) ─────────────────
  const schemas      = extractJsonLd(html);
  const schemaRating = findAggregateRating(schemas);

  // ── Social media links embedded on the site ────────────────────────────────
  const socialLinks = extractSocialLinks(html);

  return {
    url:         WEBSITE_URL,
    title:       ogTitle  || title,
    description: ogDesc   || metaDesc,
    image:       ogImage,
    h1, h2s, h3s,
    phones:      [...new Set(phones)],
    services,
    wordCount,
    schemaRating,   // { rating: 4.5, reviewCount: 123 } or null
    socialLinks,    // { facebook: '...', instagram: '...', ... }
    scrapedAt:   new Date().toISOString(),
  };
}

// ── Healthgrades scraper (no API key — public HTML) ──────────────────────────
async function scrapeHealthgrades() {
  try {
    // Search-first approach so we don't rely on a hardcoded slug
    const searchUrl = `https://www.healthgrades.com/search?what=${encodeURIComponent(BUSINESS_NAME)}&where=${encodeURIComponent('Scottsdale, AZ')}&pt=HOSPITAL`;
    const r = await fetchT(searchUrl, {}, 8000);
    if (!r.ok) throw new Error(`Healthgrades HTTP ${r.status}`);
    const html = await r.text();

    // Pull first result link
    const linkM = html.match(/href="(\/group-directory\/[^"]+)"/i) ||
                  html.match(/href="(\/physician\/[^"]+)"/i);
    if (!linkM) return null;

    const profileUrl = 'https://www.healthgrades.com' + linkM[1].split('?')[0];
    const r2 = await fetchT(profileUrl, {}, 8000);
    if (!r2.ok) return null;
    const html2 = await r2.text();

    // Extract rating from JSON-LD first
    const schemas = extractJsonLd(html2);
    const ldRating = findAggregateRating(schemas);
    if (ldRating) return { ...ldRating, source: 'Healthgrades', profileUrl };

    // Fallback: regex patterns Healthgrades uses in its HTML
    const ratingM = html2.match(/["']ratingValue["']\s*[=:]\s*["']?([\d.]+)/i) ||
                    html2.match(/class="[^"]*rating[^"]*"[^>]*>([\d.]+)/i);
    const countM  = html2.match(/["']reviewCount["']\s*[=:]\s*["']?(\d+)/i) ||
                    html2.match(/([\d,]+)\s+(?:reviews?|ratings?)/i);

    if (ratingM) {
      return {
        rating:      parseFloat(ratingM[1]),
        reviewCount: countM ? parseInt(countM[1].replace(/,/g, '')) : null,
        source:      'Healthgrades',
        profileUrl,
      };
    }
    return null;
  } catch { return null; }
}

// ── Google Search knowledge-panel scrape (no API key, best-effort) ─────────
async function scrapeGoogleRating() {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(BUSINESS_QUERY + ' reviews')}&num=3`;
    const r = await fetchT(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
      },
    }, 8000);
    if (!r.ok) throw new Error(`Google HTTP ${r.status}`);
    const html = await r.text();

    // Google embeds rating in several places in the HTML.
    // Pattern 1: aria-label="Rated X out of 5, (N reviews)"
    const ariaM = html.match(/aria-label=["']Rated?\s*([\d.]+)\s*(?:out of 5)?[^"']*\(([\d,]+)\s*review/i);
    if (ariaM) return { rating: parseFloat(ariaM[1]), reviewCount: parseInt(ariaM[2].replace(/,/g,'')), source: 'Google (search)' };

    // Pattern 2: JSON-LD in search results
    const schemas = extractJsonLd(html);
    const ldR = findAggregateRating(schemas);
    if (ldR) return { ...ldR, source: 'Google (search)' };

    // Pattern 3: numeric pattern near "reviews" / "Google reviews"
    const ratingRx = /([\d.]{3})\s*(?:[\u2605★]|\(|\s)(?:[^"]{0,40})?\(?([\d,]+)\s*(?:Google\s+)?reviews?/i;
    const inline   = html.match(ratingRx);
    if (inline) return { rating: parseFloat(inline[1]), reviewCount: parseInt(inline[2].replace(/,/g,'')), source: 'Google (search)' };

    // Pattern 4: review count only (for display)
    const countOnly = html.match(/([\d,]+)\s+Google reviews/i);
    if (countOnly) return { rating: null, reviewCount: parseInt(countOnly[1].replace(/,/g,'')), source: 'Google (search)' };

    return null;
  } catch { return null; }
}

// ── Google Places: find place ID ─────────────────────────────────────────────
async function findPlaceId(apiKey) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  url.searchParams.set('input',     BUSINESS_QUERY);
  url.searchParams.set('inputtype', 'textquery');
  url.searchParams.set('fields',    'place_id,name,rating,formatted_address');
  url.searchParams.set('key',       apiKey);
  const r = await fetchT(url.toString(), {}, 8000);
  const d = await r.json();
  if (d.status !== 'OK' && d.status !== 'ZERO_RESULTS') throw new Error(`Places find: ${d.status}`);
  return d.candidates?.[0] || null;
}

// ── Google Places: full details + reviews ────────────────────────────────────
async function getPlaceDetails(placeId, apiKey) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', [
    'name','rating','user_ratings_total','formatted_phone_number',
    'formatted_address','website','opening_hours','reviews',
    'photos','url','vicinity','business_status',
  ].join(','));
  url.searchParams.set('reviews_sort', 'newest');
  url.searchParams.set('key', apiKey);
  const r = await fetchT(url.toString(), {}, 8000);
  const d = await r.json();
  if (d.status !== 'OK') throw new Error(`Places details: ${d.status} — ${d.error_message || ''}`);
  const p = d.result;
  return {
    placeId,
    name:          p.name,
    rating:        p.rating,
    reviewCount:   p.user_ratings_total,
    phone:         p.formatted_phone_number,
    address:       p.formatted_address,
    vicinity:      p.vicinity,
    website:       p.website,
    googleUrl:     p.url,
    isOpen:        p.opening_hours?.open_now,
    businessStatus: p.business_status,
    hours:         p.opening_hours?.weekday_text || [],
    reviews:       (p.reviews || []).map(rv => ({
      author:       rv.author_name,
      authorUrl:    rv.author_url,
      rating:       rv.rating,
      text:         rv.text,
      relativeTime: rv.relative_time_description,
      time:         rv.time ? new Date(rv.time * 1000).toISOString() : null,
      photoUrl:     rv.profile_photo_url,
    })),
    photoRefs: (p.photos || []).slice(0, 3).map(ph => ({
      ref: ph.photo_reference, width: ph.width, height: ph.height,
    })),
    fetchedAt: new Date().toISOString(),
  };
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey   = process.env.GOOGLE_PLACES_KEY || req.query.apiKey || '';
  const { action, placeId: qPlaceId } = req.query;

  try {
    if (action === 'findplace') {
      if (!apiKey) return res.status(400).json({ ok: false, error: 'Requires GOOGLE_PLACES_KEY or ?apiKey=' });
      const candidate = await findPlaceId(apiKey);
      if (!candidate) return res.status(404).json({ ok: false, error: 'Business not found on Google Places' });
      return res.status(200).json({ ok: true, ...candidate });
    }

    if (action === 'website') {
      const data = await scrapeWebsite();
      return res.status(200).json({ ok: true, website: data });
    }

    if (action === 'google') {
      if (!apiKey) return res.status(400).json({ ok: false, error: 'Requires GOOGLE_PLACES_KEY or ?apiKey=' });
      let pid = qPlaceId || '';
      if (!pid) { const c = await findPlaceId(apiKey); pid = c?.place_id || ''; }
      if (!pid) return res.status(404).json({ ok: false, error: 'Could not find Place ID' });
      return res.status(200).json({ ok: true, google: await getPlaceDetails(pid, apiKey) });
    }

    // ── Default: run everything in parallel ─────────────────────────────────
    const result = { ok: true, fetchedAt: new Date().toISOString() };

    // 1. Website + JSON-LD schema (always free)
    const websiteP = scrapeWebsite()
      .then(d  => { result.website = d; })
      .catch(e => { result.websiteError = e.message; });

    // 2. Healthgrades (always free, no key)
    const hgP = scrapeHealthgrades()
      .then(d  => { if (d) result.healthgrades = d; })
      .catch(() => {}); // silent fail

    // 3. Google Search knowledge panel (no key, best-effort)
    const gSearchP = scrapeGoogleRating()
      .then(d  => { if (d) result.googleSearch = d; })
      .catch(() => {});

    // 4. Google Places API (only if key provided)
    const placesP = apiKey
      ? (async () => {
          try {
            let pid = qPlaceId || '';
            if (!pid) { const c = await findPlaceId(apiKey); pid = c?.place_id || ''; }
            if (pid) result.google = await getPlaceDetails(pid, apiKey);
            else result.googleError = 'Could not locate business via Places API.';
          } catch (e) { result.googleError = e.message; }
        })()
      : Promise.resolve().then(() => { result.googleSkipped = true; });

    await Promise.all([websiteP, hgP, gSearchP, placesP]);

    // ── Build a merged "best rating" from all available sources ─────────────
    // Priority: Google Places > Google Search > Website JSON-LD > Healthgrades
    const candidates = [
      result.google         && { rating: result.google.rating,      reviewCount: result.google.reviewCount,      source: 'Google Business (API)' },
      result.googleSearch   && { ...result.googleSearch },
      result.website?.schemaRating && { ...result.website.schemaRating, source: 'Website schema (Google)' },
      result.healthgrades   && { ...result.healthgrades },
    ].filter(Boolean);

    if (candidates.length > 0) {
      result.bestRating = candidates[0]; // first = highest priority
      result.allRatings = candidates;    // expose all for UI display
    }

    return res.status(200).json(result);

  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
