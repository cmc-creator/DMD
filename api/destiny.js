// Vercel serverless — Destiny Springs Healthcare Auto-Profile Fetcher
// ─────────────────────────────────────────────────────────────────────────────
// Pulls live data from Destiny Springs' own public presence:
//   • Google Business Profile  — rating, review count, up to 5 reviews,
//                                address, phone, hours (via Places API)
//   • destinyspringshealthcare.com — title, description, H1/H2s, phone,
//                                    services mentioned, word count
//
// Optional env var (can also pass ?apiKey= in the request):
//   GOOGLE_PLACES_KEY = a Google Places API key
//
// Google Places API setup (free for this use case — $200/mo credit covers 40k+ calls):
//   1. console.cloud.google.com → Enable "Places API"
//   2. Credentials → Create API Key → restrict to Places API
//
// Endpoints:
//   GET /api/destiny                       → runs website + google in parallel
//   GET /api/destiny?action=website        → just website scrape
//   GET /api/destiny?action=google&apiKey= → just Google Places data
//   GET /api/destiny?action=findplace&apiKey= → search for the Place ID
//   GET /api/destiny?action=google&placeId=xxx&apiKey= → skip auto-search

const WEBSITE_URL   = 'https://destinyspringshealthcare.com';
const BUSINESS_QUERY = 'Destiny Springs Healthcare Scottsdale AZ';
const FALLBACK_PLACE_ID = ''; // leave blank — auto-discovered each sync

// ── Shared fetch helper with timeout ────────────────────────────────────────
const fetchT = (url, opts = {}, ms = 9000) =>
  fetch(url, { ...opts, signal: AbortSignal.timeout(ms) });

// ── Regex helpers ────────────────────────────────────────────────────────────
function extractMeta(html, sourceUrl) {
  const get = (rx) => { const m = html.match(rx); return m ? m[1].trim() : null; };
  const title       = get(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitle     = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)
                   || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title/i);
  const ogDesc      = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i)
                   || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description/i);
  const metaDesc    = get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)
                   || get(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description/i);
  const ogImage     = get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)
                   || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image/i);

  const h1m = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const h1  = h1m ? h1m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null;

  const h2s = [];
  const h2Rx = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let h2m;
  while ((h2m = h2Rx.exec(html)) !== null && h2s.length < 6) {
    const t = h2m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (t.length > 2 && t.length < 120) h2s.push(t);
  }

  const h3s = [];
  const h3Rx = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  let h3m;
  while ((h3m = h3Rx.exec(html)) !== null && h3s.length < 8) {
    const t = h3m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (t.length > 2 && t.length < 100) h3s.push(t);
  }

  // Phones
  const phones = [];
  const phoneRx = /\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/g;
  let pm;
  while ((pm = phoneRx.exec(html)) !== null && phones.length < 3) phones.push(pm[0]);

  // Services / programs (look for list items with service-like keywords near service-related sections)
  const serviceKeywords = [
    'mental health', 'behavioral health', 'therapy', 'counseling', 'psychiatry',
    'depression', 'anxiety', 'ptsd', 'trauma', 'addiction', 'substance',
    'bipolar', 'outpatient', 'inpatient', 'residential', 'iop', 'php',
    'adolescent', 'adult', 'family therapy', 'group therapy', 'telehealth',
  ];
  const lowerHtml = html.toLowerCase();
  const services = serviceKeywords.filter(kw => lowerHtml.includes(kw));

  const wordCount = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').split(' ').filter(w => w.length > 2).length;

  return {
    url:         sourceUrl,
    title:       ogTitle || title,
    description: ogDesc  || metaDesc,
    image:       ogImage,
    h1,
    h2s,
    h3s,
    phones:      [...new Set(phones)],
    services,
    wordCount,
    scrapedAt:   new Date().toISOString(),
  };
}

// ── Google Places: find place ID by text query ────────────────────────────────
async function findPlaceId(apiKey) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  url.searchParams.set('input',     BUSINESS_QUERY);
  url.searchParams.set('inputtype', 'textquery');
  url.searchParams.set('fields',    'place_id,name,rating,formatted_address');
  url.searchParams.set('key',       apiKey);

  const r = await fetchT(url.toString());
  const d = await r.json();

  if (d.status !== 'OK' && d.status !== 'ZERO_RESULTS') {
    throw new Error(`Places find: ${d.status} — ${d.error_message || ''}`);
  }
  return d.candidates?.[0] || null;
}

// ── Google Places: get full details + reviews ─────────────────────────────────
async function getPlaceDetails(placeId, apiKey) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', [
    'name', 'rating', 'user_ratings_total', 'formatted_phone_number',
    'formatted_address', 'international_phone_number', 'website',
    'opening_hours', 'reviews', 'photos', 'url', 'vicinity',
    'business_status', 'types', 'geometry',
  ].join(','));
  url.searchParams.set('reviews_sort', 'newest');
  url.searchParams.set('key', apiKey);

  const r = await fetchT(url.toString());
  const d = await r.json();

  if (d.status !== 'OK') throw new Error(`Places details: ${d.status} — ${d.error_message || ''}`);

  const p = d.result;
  const hours = p.opening_hours?.weekday_text || [];
  const isOpen = p.opening_hours?.open_now;

  const reviews = (p.reviews || []).map(rv => ({
    author:       rv.author_name,
    authorUrl:    rv.author_url,
    rating:       rv.rating,
    text:         rv.text,
    relativeTime: rv.relative_time_description,
    time:         rv.time ? new Date(rv.time * 1000).toISOString() : null,
    photoUrl:     rv.profile_photo_url,
  }));

  const photoRefs = (p.photos || []).slice(0, 3).map(ph => ({
    ref:    ph.photo_reference,
    width:  ph.width,
    height: ph.height,
    // You can build the URL client-side: https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=REF&key=KEY
  }));

  return {
    placeId,
    name:          p.name,
    rating:        p.rating,
    reviewCount:   p.user_ratings_total,
    phone:         p.formatted_phone_number || p.international_phone_number,
    address:       p.formatted_address,
    vicinity:      p.vicinity,
    website:       p.website,
    googleUrl:     p.url,
    isOpen,
    businessStatus: p.business_status,
    hours,
    types:         p.types || [],
    reviews,
    photoRefs,
    fetchedAt:     new Date().toISOString(),
  };
}

// ── Website scraper ──────────────────────────────────────────────────────────
async function scrapeWebsite() {
  const r = await fetchT(WEBSITE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept':     'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    redirect: 'follow',
  }, 10000);

  if (!r.ok) throw new Error(`Website returned HTTP ${r.status}`);

  const html = await r.text();
  return extractMeta(html, WEBSITE_URL);
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey  = process.env.GOOGLE_PLACES_KEY || req.query.apiKey;
  const { action, placeId: qPlaceId } = req.query;

  try {

    // ── Just find the Place ID ───────────────────────────────────────────────
    if (action === 'findplace') {
      if (!apiKey) return res.status(400).json({ ok: false, error: 'Pass ?apiKey= or set GOOGLE_PLACES_KEY env var' });
      const candidate = await findPlaceId(apiKey);
      if (!candidate) return res.status(404).json({ ok: false, error: 'Business not found on Google Places' });
      return res.status(200).json({ ok: true, ...candidate });
    }

    // ── Just website scrape ──────────────────────────────────────────────────
    if (action === 'website') {
      const data = await scrapeWebsite();
      return res.status(200).json({ ok: true, website: data });
    }

    // ── Just Google Places ───────────────────────────────────────────────────
    if (action === 'google') {
      if (!apiKey) return res.status(400).json({ ok: false, error: 'Pass ?apiKey= or set GOOGLE_PLACES_KEY env var' });
      let pid = qPlaceId || FALLBACK_PLACE_ID;
      if (!pid) {
        const candidate = await findPlaceId(apiKey);
        if (!candidate) return res.status(404).json({ ok: false, error: 'Could not find Place ID for Destiny Springs Healthcare' });
        pid = candidate.place_id;
      }
      const google = await getPlaceDetails(pid, apiKey);
      return res.status(200).json({ ok: true, google });
    }

    // ── Default: run everything in parallel ──────────────────────────────────
    const result = { ok: true, fetchedAt: new Date().toISOString() };

    // Website — no auth needed, always run
    const websitePromise = scrapeWebsite()
      .then(d  => { result.website = d; })
      .catch(e => { result.websiteError = e.message; });

    // Google — only if we have an API key
    const googlePromise = apiKey
      ? (async () => {
          try {
            let pid = qPlaceId || FALLBACK_PLACE_ID;
            if (!pid) {
              const candidate = await findPlaceId(apiKey);
              if (candidate) pid = candidate.place_id;
            }
            if (pid) {
              result.google = await getPlaceDetails(pid, apiKey);
            } else {
              result.googleError = 'Could not locate business on Google Places. Try connecting Google Business on the Integrations tab first.';
            }
          } catch (e) {
            result.googleError = e.message;
          }
        })()
      : Promise.resolve().then(() => {
          result.googleSkipped = true;
          result.googleNote    = 'Add a Google Places API key on the Integrations tab (Google Business → Places API Key) to pull your Google rating and reviews automatically.';
        });

    await Promise.all([websitePromise, googlePromise]);

    return res.status(200).json(result);

  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
