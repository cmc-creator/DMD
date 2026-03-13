// api/reviews.js — Live review score scraper for all major platforms
// ─────────────────────────────────────────────────────────────────────────────
// Endpoints:
//   ?platform=google       — Google Places API (GOOGLE_PLACES_KEY) or search scrape
//   ?platform=yelp         — Yelp Fusion API  (YELP_API_KEY required)
//   ?platform=glassdoor    — HTML scrape + JSON-LD
//   ?platform=indeed       — HTML scrape + JSON-LD
//   ?platform=healthgrades — HTML scrape + JSON-LD
//   ?platform=zocdoc       — HTML scrape + JSON-LD
//   ?platform=facebook     — Facebook Graph API (FACEBOOK_PAGE_TOKEN) or mobile scrape
//   ?platform=all          — fetch all in parallel
//
// Optional env vars:
//   GOOGLE_PLACES_KEY      — enables Places API (falls back to search scrape)
//   YELP_API_KEY           — required for Yelp
//   FACEBOOK_PAGE_TOKEN    — required for Facebook ratings
//   FACEBOOK_PAGE_ID       — Facebook page slug/id (default: destinyspringshealthcare)
//   DS_YELP_ID             — Yelp business slug (default: destiny-springs-healthcare-scottsdale)
//   DS_ZOCDOC_URL          — full ZocDoc profile URL
//   DS_INDEED_SLUG         — Indeed company slug  (default: destiny-springs-healthcare)
//   DS_GLASSDOOR_SLUG      — Glassdoor review page slug

// ── Shared fetch helper with browser UA ──────────────────────────────────────
const fetchH = (url, extraHeaders = {}, ms = 9000) =>
  fetch(url, {
    headers: {
      'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control':   'no-cache',
      'Pragma':          'no-cache',
      ...extraHeaders,
    },
    redirect: 'follow',
    signal:   AbortSignal.timeout(ms),
  });

// ── JSON-LD helpers ───────────────────────────────────────────────────────────
function getJsonLd(html) {
  const out = [];
  const rx = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
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
      if (!isNaN(rating)) return { rating, reviewCount: isNaN(count) ? null : count };
    }
    if (Array.isArray(o['@graph'])) for (const i of o['@graph']) { const r = walk(i); if (r) return r; }
    return null;
  };
  for (const s of items) { const r = walk(s); if (r) return r; }
  return null;
}
const num = (s = '') => { const n = parseInt(String(s).replace(/,/g, '')); return isNaN(n) ? null : n; };

// ── 1. GOOGLE ─────────────────────────────────────────────────────────────────
async function scrapeGoogle(opts = {}) {
  const apiKey  = opts.apiKey  || process.env.GOOGLE_PLACES_KEY;
  const placeId = opts.placeId || process.env.GOOGLE_PLACE_ID;

  // Option A: Google Places API with known place_id (most reliable)
  if (apiKey && placeId) {
    const detR = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,rating,user_ratings_total,url&key=${apiKey}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const detD = await detR.json();
    const r = detD.result;
    if (r?.rating != null) {
      return { rating: r.rating, reviewCount: r.user_ratings_total ?? null, source: 'Google Places API', url: r.url || `https://search.google.com/local/reviews?placeid=${placeId}` };
    }
  }

  // Option B: Google Places API text search
  if (apiKey) {
    const q      = encodeURIComponent('Destiny Springs Healthcare Scottsdale AZ');
    const findR  = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${q}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total&key=${apiKey}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const findD = await findR.json();
    const c = findD.candidates?.[0];
    if (c?.rating != null) {
      return {
        rating:      c.rating,
        reviewCount: c.user_ratings_total ?? null,
        source:      'Google Places API',
        url:         c.place_id ? `https://search.google.com/local/reviews?placeid=${c.place_id}` : 'https://www.google.com/maps/search/Destiny+Springs+Healthcare+Scottsdale+AZ',
      };
    }
  }

  // Option B: Google Search knowledge-panel scrape (no key)
  const q   = encodeURIComponent('Destiny Springs Healthcare Scottsdale AZ reviews');
  const r   = await fetchH(`https://www.google.com/search?q=${q}&hl=en&num=3`, {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
  });
  if (!r.ok) throw new Error(`Google HTTP ${r.status}`);
  const html = await r.text();

  const aria = html.match(/aria-label=["'][Rr]ated?\s*([\d.]+)[^"']*\(([\d,]+)\s+review/i);
  if (aria) return { rating: parseFloat(aria[1]), reviewCount: num(aria[2]), source: 'Google Search', url: 'https://www.google.com/search?q=Destiny+Springs+Healthcare+reviews' };

  const ld = findAggRating(getJsonLd(html));
  if (ld) return { ...ld, source: 'Google Search', url: 'https://www.google.com/search?q=Destiny+Springs+Healthcare+reviews' };

  const inline = html.match(/([\d.]{3,})\s*(?:★|\()\s*(?:[^)]{0,60})?\(?([\d,]+)\s*(?:Google\s+)?reviews?/i);
  if (inline) return { rating: parseFloat(inline[1]), reviewCount: num(inline[2]), source: 'Google Search', url: 'https://www.google.com/search?q=Destiny+Springs+Healthcare+reviews' };

  const gErr = new Error('Google rating not found — add GOOGLE_PLACES_KEY to Vercel env vars for reliable data, or enter manually');
  gErr.reviewUrl = 'https://www.google.com/maps/search/Destiny+Springs+Healthcare+Scottsdale+AZ';
  throw gErr;
}

// ── 2. YELP ───────────────────────────────────────────────────────────────────
async function scrapeYelp(opts = {}) {
  const apiKey     = opts.apiKey     || process.env.YELP_API_KEY;
  const businessId = opts.businessId || process.env.DS_YELP_ID || 'destiny-springs-healthcare-surprise';
  if (!apiKey) {
    const yErr = new Error('Connect your Yelp API key in the Integrations tab (or set YELP_API_KEY in Vercel env vars) — or enter your rating manually');
    yErr.reviewUrl = `https://www.yelp.com/biz/${businessId}`;
    throw yErr;
  }
  const r = await fetch(
    `https://api.yelp.com/v3/businesses/${encodeURIComponent(businessId)}`,
    { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(8000) }
  );
  const d = await r.json();
  if (d.error) throw new Error(d.error.description || d.error.code);
  return { rating: d.rating, reviewCount: d.review_count, source: 'Yelp Fusion API', url: d.url };
}

// ── 3. GLASSDOOR ──────────────────────────────────────────────────────────────
async function scrapeGlassdoor(opts = {}) {
  const slug    = opts.slug || process.env.DS_GLASSDOOR_SLUG || 'Destiny-Springs-Healthcare-Reviews-E3272383';
  const baseUrl = `https://www.glassdoor.com/Reviews/${slug}.htm`;

  // Try direct profile first, then search
  const urls = [
    baseUrl,
    `https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent('Destiny Springs Healthcare')}&locT=N&locId=0`,
  ];

  for (const url of urls) {
    try {
      const r = await fetchH(url, {}, 9000);
      if (!r.ok) continue;
      const html = await r.text();

      const ld = findAggRating(getJsonLd(html));
      if (ld) return { ...ld, source: 'Glassdoor', url };

      const rM = html.match(/"overallRating"\s*:\s*([\d.]+)/i)
               || html.match(/class="[^"]*rating[^"]*"[^>]*>\s*([\d.]+)\s*<\/span>/i)
               || html.match(/"ratingValue"\s*:\s*"?([\d.]+)/i);
      const cM = html.match(/([\d,]+)\s+(?:reviews?|ratings?)/i);
      if (rM) return { rating: parseFloat(rM[1]), reviewCount: cM ? num(cM[1]) : null, source: 'Glassdoor', url };
    } catch {} // try next URL
  }
  const gdErr = new Error('Glassdoor blocks automated access — enter your rating manually');
  gdErr.reviewUrl = `https://www.glassdoor.com/Reviews/${slug}.htm`;
  throw gdErr;
}

// ── 4. INDEED ─────────────────────────────────────────────────────────────────
async function scrapeIndeed(opts = {}) {
  const slug = opts.slug || process.env.DS_INDEED_SLUG || 'Destiny-Springs-Healthcare';
  const url  = `https://www.indeed.com/cmp/${slug}`;

  const r = await fetchH(url, {}, 9000);
  if (!r.ok) {
    const iErr = new Error(`Indeed blocks automated access (HTTP ${r.status}) — enter your rating manually`);
    iErr.reviewUrl = url;
    throw iErr;
  }
  const html = await r.text();

  const ld = findAggRating(getJsonLd(html));
  if (ld) return { ...ld, source: 'Indeed', url };

  // Indeed embeds window.__NEXT_DATA__ or similar
  const ndM = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (ndM) {
    try {
      const nd = JSON.parse(ndM[1]);
      const props = nd?.props?.pageProps?.cmpProfile || nd?.props?.pageProps;
      const rating = props?.overallRating ?? props?.rating;
      const count  = props?.numReviews ?? props?.reviewCount;
      if (rating != null) return { rating: parseFloat(rating), reviewCount: count ? Number(count) : null, source: 'Indeed', url };
    } catch {}
  }

  const rM = html.match(/"ratingValue"\s*:\s*"?([\d.]+)/i)
           || html.match(/aria-label="([\d.]+) out of 5/i)
           || html.match(/data-testid="[^"]*rating[^"]*"[^>]*>([\d.]+)/i);
  const cM = html.match(/([\d,]+)\s+(?:reviews?|ratings?)/i);
  if (rM) return { rating: parseFloat(rM[1]), reviewCount: cM ? num(cM[1]) : null, source: 'Indeed', url };

  const iErr = new Error('Indeed rating not found — enter your rating manually');
  iErr.reviewUrl = `https://www.indeed.com/cmp/${slug}`;
  throw iErr;
}

// ── 5. HEALTHGRADES ───────────────────────────────────────────────────────────
async function scrapeHealthgrades(opts = {}) {
  const searchUrl = `https://www.healthgrades.com/search?what=${encodeURIComponent('Destiny Springs Healthcare')}&where=${encodeURIComponent('Scottsdale, AZ')}`;
  const r1 = await fetchH(searchUrl, {}, 9000);
  if (!r1.ok) {
    const hErr = new Error(`Healthgrades search failed (HTTP ${r1.status}) — enter your rating manually`);
    hErr.reviewUrl = searchUrl;
    throw hErr;
  }
  const html1 = await r1.text();

  const linkM = html1.match(/href="(\/group-directory\/[^"?#]+)/i)
             || html1.match(/href="(\/physician\/[^"?#]+)/i)
             || html1.match(/href="(\/hospital-directory\/[^"?#]+)/i)
             || html1.match(/href="(\/mental-health-directory\/[^"?#]+)/i)
             || html1.match(/href="(\/facility-directory\/[^"?#]+)/i);
  if (!linkM) {
    const hErr = new Error('Healthgrades: profile not found in search — enter your rating manually');
    hErr.reviewUrl = searchUrl;
    throw hErr;
  }

  const profileUrl = 'https://www.healthgrades.com' + linkM[1];
  const r2 = await fetchH(profileUrl, {}, 9000);
  if (!r2.ok) {
    const hErr = new Error(`Healthgrades profile failed (HTTP ${r2.status}) — enter your rating manually`);
    hErr.reviewUrl = profileUrl;
    throw hErr;
  }
  const html2 = await r2.text();

  const ld = findAggRating(getJsonLd(html2));
  if (ld) return { ...ld, source: 'Healthgrades', url: profileUrl };

  const rM = html2.match(/"ratingValue"\s*:\s*"?([\d.]+)/i)
           || html2.match(/aria-label="Rating:\s*([\d.]+)/i);
  const cM = html2.match(/"reviewCount"\s*:\s*"?(\d+)/i)
           || html2.match(/([\d,]+)\s+(?:reviews?|ratings?)/i);
  if (rM) return { rating: parseFloat(rM[1]), reviewCount: cM ? num(cM[1]) : null, source: 'Healthgrades', url: profileUrl };

  const hErr = new Error('Healthgrades: rating not found in profile — enter your rating manually');
  hErr.reviewUrl = profileUrl;
  throw hErr;
}

// ── 6. ZOCDOC ─────────────────────────────────────────────────────────────────
async function scrapeZocdoc(opts = {}) {
  const directUrl = process.env.DS_ZOCDOC_URL;
  const searchUrl = `https://www.zocdoc.com/search?address=Scottsdale%2C+AZ&reason_visit=84&insurance_carrier=-1&search_query=${encodeURIComponent('Destiny Springs')}`;

  const urls = directUrl
    ? [directUrl, searchUrl]
    : [searchUrl, 'https://www.zocdoc.com/practice/destiny-springs-healthcare'];

  for (const url of urls) {
    try {
      const r = await fetchH(url, {}, 9000);
      if (!r.ok) continue;
      const html = await r.text();

      const ld = findAggRating(getJsonLd(html));
      if (ld) return { ...ld, source: 'ZocDoc', url };

      // ZocDoc uses next data
      const ndM = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
      if (ndM) {
        try {
          const nd = JSON.parse(ndM[1]);
          const walk = (o) => {
            if (!o || typeof o !== 'object') return null;
            if ('averageRating' in o && 'totalReviews' in o) return { rating: o.averageRating, reviewCount: o.totalReviews };
            if ('rating' in o && 'reviewCount' in o && typeof o.rating === 'number') return { rating: o.rating, reviewCount: o.reviewCount };
            for (const v of Object.values(o)) { const r = walk(v); if (r) return r; }
            return null;
          };
          const found = walk(nd);
          if (found?.rating) return { ...found, source: 'ZocDoc', url };
        } catch {}
      }

      const rM = html.match(/averageRating["']\s*:\s*([\d.]+)/i)
               || html.match(/"ratingValue"\s*:\s*"?([\d.]+)/i)
               || html.match(/aria-label="([\d.]+)\s+(?:out of|star)/i);
      const cM = html.match(/([\d,]+)\s+(?:reviews?|ratings?)/i);
      if (rM) return { rating: parseFloat(rM[1]), reviewCount: cM ? num(cM[1]) : null, source: 'ZocDoc', url };
    } catch {}
  }
  const zdErr = new Error('ZocDoc: set DS_ZOCDOC_URL env var with your ZocDoc profile URL — or enter manually');
  zdErr.reviewUrl = 'https://www.zocdoc.com/search?address=Scottsdale%2C+AZ&search_query=Destiny+Springs';
  throw zdErr;
}

// ── 7. FACEBOOK ───────────────────────────────────────────────────────────────
async function scrapeFacebook(opts = {}) {
  const token  = opts.accessToken || process.env.FACEBOOK_PAGE_TOKEN;
  const pageId = opts.pageId      || process.env.FACEBOOK_PAGE_ID || '61581511228047';

  // Option A: Graph API (needs page access token)
  if (token) {
    const r = await fetch(
      `https://graph.facebook.com/v18.0/${encodeURIComponent(pageId)}?fields=overall_star_rating,rating_count,name&access_token=${token}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const d = await r.json();
    if (d.error) throw new Error(`Facebook API: ${d.error.message}`);
    if (d.overall_star_rating != null) {
      return {
        rating:      d.overall_star_rating,
        reviewCount: d.rating_count ?? null,
        source:      'Facebook Graph API',
        url:         `https://www.facebook.com/${pageId}/reviews`,
      };
    }
  }

  // Option B: Mobile page scrape (no token — limited)
  // Use numeric ID URL when it looks like a numeric ID, otherwise slug
  const fbProfileUrl = /^\d+$/.test(pageId)
    ? `https://www.facebook.com/profile.php?id=${pageId}`
    : `https://www.facebook.com/${pageId}`;
  const fbReviewUrl = /^\d+$/.test(pageId)
    ? `https://www.facebook.com/profile.php?id=${pageId}&sk=reviews`
    : `https://www.facebook.com/${pageId}/reviews`;
  const url  = /^\d+$/.test(pageId)
    ? `https://m.facebook.com/profile.php?id=${pageId}`
    : `https://m.facebook.com/${pageId}`;
  const r    = await fetchH(url, { Accept: 'text/html' }, 9000);
  if (!r.ok) {
    const fErr = new Error(`Facebook blocks automated access (HTTP ${r.status}) — add FACEBOOK_PAGE_TOKEN to Vercel env vars or enter manually`);
    fErr.reviewUrl = fbReviewUrl;
    throw fErr;
  }
  const html = await r.text();

  const ld = findAggRating(getJsonLd(html));
  if (ld) return { ...ld, source: 'Facebook', url: fbReviewUrl };

  const rM = html.match(/([\d.]+)\s*(?:out of\s*5|★)/i)
           || html.match(/aggregateRating["']\s*:\s*["']?([\d.]+)/i);
  const cM = html.match(/([\d,]+)\s*(?:reviews?|ratings?|people\s+rated)/i);
  if (rM) return { rating: parseFloat(rM[1]), reviewCount: cM ? num(cM[1]) : null, source: 'Facebook', url: fbReviewUrl };

  const fErr = new Error('Facebook rating not found — add FACEBOOK_PAGE_TOKEN to Vercel env vars or enter manually');
  fErr.reviewUrl = fbReviewUrl;
  throw fErr;
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
const scrapers = {
  google:       scrapeGoogle,
  yelp:         scrapeYelp,
  glassdoor:    scrapeGlassdoor,
  indeed:       scrapeIndeed,
  healthgrades: scrapeHealthgrades,
  zocdoc:       scrapeZocdoc,
  facebook:     scrapeFacebook,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { platform } = req.query;
  const fetchedAt    = new Date().toISOString();

  if (!platform) {
    return res.status(400).json({ ok: false, error: 'Pass ?platform=google|yelp|glassdoor|indeed|healthgrades|zocdoc|facebook|all' });
  }

  // Fetch all platforms in parallel
  if (platform === 'all') {
    const results = await Promise.allSettled(
      Object.entries(scrapers).map(async ([key, fn]) => {
        const d = await fn(req.query);
        return [key, { ok: true, ...d, fetchedAt }];
      })
    );
    const out = {};
    results.forEach((r, i) => {
      const key = Object.keys(scrapers)[i];
      out[key] = r.status === 'fulfilled'
        ? r.value[1]
        : { ok: false, error: r.reason?.message || 'Unknown error', ...(r.reason?.reviewUrl ? { url: r.reason.reviewUrl } : {}), fetchedAt };
    });
    return res.status(200).json({ ok: true, results: out });
  }

  // Single platform
  const scraper = scrapers[platform];
  if (!scraper) {
    return res.status(400).json({ ok: false, error: `Unknown platform "${platform}". Valid: ${Object.keys(scrapers).join(', ')}` });
  }

  try {
    const data = await scraper(req.query);
    return res.status(200).json({ ok: true, ...data, fetchedAt });
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message, ...(e.reviewUrl ? { url: e.reviewUrl } : {}), fetchedAt });
  }
}
