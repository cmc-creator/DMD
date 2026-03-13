// Vercel serverless — News API proxy + web page metadata scraper
// ─────────────────────────────────────────────────────────────────────────────
// Required env var (optional — users can supply their own key via query param):
//   NEWS_API_KEY = your newsapi.org API key
//
// newsapi.org setup:
//   1. Register free at https://newsapi.org → Get API Key
//   2. Free plan: 100 req/day, news delayed 24h (dev only)
//      Paid plan: real-time, unlimited
//   3. Paste key into Vercel env vars as NEWS_API_KEY
//
// Query params accepted:
//   action=news&q=mental+health+arizona&pageSize=10
//     → searches newsapi.org headlines
//   action=headlines&category=health&country=us
//     → top headlines by category
//   action=scrape&url=https://example.com
//     → fetches the page and extracts metadata (title, description, OG tags,
//       first H1, contact info) — no headless browser needed
//   action=rss&url=https://example.com/feed.xml
//     → fetches an RSS/Atom feed and returns parsed entries
//   apiKey=xxx (optional override — uses NEWS_API_KEY env by default)

// ── Enhanced metadata extractor — pure regex, no cheerio needed ─────────────
function extractMeta(html, sourceUrl) {
  const get = (pattern) => {
    const m = html.match(pattern);
    return m ? m[1].trim() : null;
  };

  const title    = get(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitle  = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)
                || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title/i);
  const ogDesc   = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i)
                || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description/i);
  const metaDesc = get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)
                || get(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description/i);
  const ogImage  = get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)
                || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image/i);
  const canonical = get(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i);
  const keywords  = get(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)/i)
                 || get(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']keywords/i);
  const favicon   = get(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)/i)
                 || get(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);

  // First H1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1      = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null;

  // Collect first 8 H2s
  const h2s  = [];
  const h2Rx = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let h2m;
  while ((h2m = h2Rx.exec(html)) !== null && h2s.length < 8) {
    const t = h2m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (t) h2s.push(t);
  }

  // Collect first 5 H3s
  const h3s  = [];
  const h3Rx = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  let h3m;
  while ((h3m = h3Rx.exec(html)) !== null && h3s.length < 5) {
    const t = h3m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (t) h3s.push(t);
  }

  // Phone numbers (US format) — up to 5
  const phones  = [];
  const phoneRx = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g;
  let pm;
  while ((pm = phoneRx.exec(html)) !== null && phones.length < 5) phones.push(pm[0]);

  // Email addresses — up to 5
  const emails  = [];
  const emailRx = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  let em;
  while ((em = emailRx.exec(html)) !== null && emails.length < 5) {
    if (!em[0].includes('example') && !em[0].includes('test')) emails.push(em[0]);
  }

  // Social media link detection
  const socials = {};
  const socialPatterns = [
    ['facebook',  /<a[^>]+href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'\s?#>]+)/i],
    ['instagram', /<a[^>]+href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'\s?#>]+)/i],
    ['twitter',   /<a[^>]+href=["'](https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^"'\s?#>]+)/i],
    ['linkedin',  /<a[^>]+href=["'](https?:\/\/(?:www\.)?linkedin\.com\/[^"'\s?#>]+)/i],
    ['youtube',   /<a[^>]+href=["'](https?:\/\/(?:www\.)?youtube\.com\/[^"'\s?#>]+)/i],
    ['tiktok',    /<a[^>]+href=["'](https?:\/\/(?:www\.)?tiktok\.com\/[^"'\s?#>]+)/i],
    ['pinterest', /<a[^>]+href=["'](https?:\/\/(?:www\.)?pinterest\.com\/[^"'\s?#>]+)/i],
  ];
  for (const [name, rx] of socialPatterns) {
    const m = html.match(rx);
    if (m) socials[name] = m[1];
  }

  // Behavioral health & addiction service keyword detection
  const lower = html.toLowerCase();
  const allServiceKw = [
    'detox', 'medical detox', 'residential', 'inpatient', 'outpatient', 'iop',
    'intensive outpatient', 'php', 'partial hospitalization', 'sober living',
    'mental health', 'behavioral health', 'addiction', 'substance abuse',
    'substance use disorder', 'dual diagnosis', 'co-occurring', 'telehealth',
    'teletherapy', 'trauma', 'ptsd', 'anxiety', 'depression', 'bipolar',
    'eating disorder', 'ocd', 'recovery', 'therapy', 'counseling', 'psychiatry',
    'medication assisted', 'mat treatment', 'suboxone', 'vivitrol',
    'family therapy', 'group therapy', '12-step', 'holistic',
    'crisis stabilization', 'case management', 'aftercare', 'alumni program',
  ];
  const servicesFound = allServiceKw.filter(k => lower.includes(k));

  // Tech stack fingerprinting
  const techStack = [];
  if (html.includes('wp-content') || html.includes('wp-includes'))              techStack.push('WordPress');
  if (html.includes('wix.com') || /wixsite\.com/.test(html))                    techStack.push('Wix');
  if (html.includes('squarespace.com') || html.includes('squarespace-cdn'))     techStack.push('Squarespace');
  if (html.includes('webflow.io') || html.includes('webflow.com'))              techStack.push('Webflow');
  if (html.includes('_next/static') || html.includes('__NEXT_DATA__'))          techStack.push('Next.js');
  if (html.includes('data-reactroot') || html.includes('__reactFiber'))         techStack.push('React');
  if (html.includes('gtag(') || html.includes('google-analytics.com'))          techStack.push('Google Analytics');
  if (html.includes('fbevents.js') || html.includes('facebook.net/en_US/fbevents')) techStack.push('Meta Pixel');
  if (html.includes('hotjar'))                                                   techStack.push('Hotjar');
  if (html.includes('intercom'))                                                 techStack.push('Intercom');
  if (html.includes('hubspot'))                                                  techStack.push('HubSpot');
  if (html.includes('drift.com') || html.includes('driftt.com'))                techStack.push('Drift');
  if (html.includes('clarity.ms'))                                              techStack.push('MS Clarity');

  // JSON-LD schema.org parsing (ratings, address, business name)
  let schemaRating      = null;
  let schemaReviewCount = null;
  let schemaAddress     = null;
  let schemaName        = null;
  const jsonLdRx = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jm;
  while ((jm = jsonLdRx.exec(html)) !== null) {
    try {
      const obj   = JSON.parse(jm[1].trim());
      const items = Array.isArray(obj) ? obj : [obj];
      for (const item of items) {
        if (!schemaName && item.name)            schemaName = item.name;
        if (!schemaRating && item.aggregateRating) {
          schemaRating      = item.aggregateRating.ratingValue;
          schemaReviewCount = item.aggregateRating.reviewCount || item.aggregateRating.ratingCount;
        }
        if (!schemaAddress && item.address) {
          const a = item.address;
          schemaAddress = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode].filter(Boolean).join(', ');
        }
      }
    } catch { /* malformed JSON-LD — skip */ }
  }

  // Word count estimate
  const stripped  = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const wordCount = stripped.split(' ').filter(w => w.length > 2).length;

  // Total anchor/link count
  const linkCount = (html.match(/<a\s[^>]*href=/gi) || []).length;

  return {
    url:              canonical || sourceUrl,
    title:            ogTitle || title,
    description:      ogDesc  || metaDesc,
    image:            ogImage,
    favicon,
    keywords,
    h1,
    h2s,
    h3s,
    phones:           [...new Set(phones)],
    emails:           [...new Set(emails)],
    socials,
    servicesFound,
    techStack,
    schemaName,
    schemaRating,
    schemaReviewCount,
    schemaAddress,
    wordCount,
    linkCount,
    scraped:          new Date().toISOString(),
  };
}

// ── Tiny RSS/Atom parser — pure regex ────────────────────────────────────────
function parseRSS(xml) {
  const isAtom = xml.includes('<feed');
  const items  = [];
  const itemPattern = isAtom ? /<entry>([\s\S]*?)<\/entry>/gi : /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemPattern.exec(xml)) !== null && items.length < 20) {
    const block = m[1];
    const g = (rx) => { const r = block.match(rx); return r ? r[1].trim() : null; };
    const title   = g(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const link    = g(/<link[^>]*>([^<]+)<\/link>/i)
                 || (block.match(/<link[^>]+href=["']([^"']+)["']/i) || [])[1];
    const pubDate = g(/<pubDate>([\s\S]*?)<\/pubDate>/i)
                 || g(/<published>([\s\S]*?)<\/published>/i)
                 || g(/<updated>([\s\S]*?)<\/updated>/i);
    const desc    = g(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)
                 || g(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i);
    if (title || link) items.push({
      title:       title?.replace(/\s+/g, ' '),
      link,
      pubDate,
      description: desc?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 300),
    });
  }
  return items;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const newsApiKey = process.env.NEWS_API_KEY || req.query.apiKey;
  const { action, q, category, country, pageSize, url } = req.query;

  try {
    // ── Keyword news search ────────────────────────────────────────────────────
    if (!action || action === 'news') {
      if (!newsApiKey) return res.status(400).json({ ok: false, error: 'Missing NEWS_API_KEY env var or ?apiKey= query param. Register free at newsapi.org.' });
      const params = new URLSearchParams({
        q:        q || 'mental health Arizona',
        pageSize: String(Math.min(Number(pageSize) || 10, 20)),
        language: 'en',
        sortBy:   'publishedAt',
        apiKey:   newsApiKey,
      });
      const r = await fetch(`https://newsapi.org/v2/everything?${params}`);
      const d = await r.json();
      if (d.status !== 'ok') return res.status(400).json({ ok: false, error: d.message || 'newsapi.org error' });
      return res.status(200).json({
        ok:           true,
        totalResults: d.totalResults,
        articles:     (d.articles || []).map(a => ({
          title:       a.title,
          description: a.description,
          url:         a.url,
          urlToImage:  a.urlToImage,
          source:      a.source?.name,
          publishedAt: a.publishedAt,
          author:      a.author,
        })),
      });
    }

    // ── Top headlines by category ──────────────────────────────────────────────
    if (action === 'headlines') {
      if (!newsApiKey) return res.status(400).json({ ok: false, error: 'Missing NEWS_API_KEY or ?apiKey=' });
      const params = new URLSearchParams({
        country:  country  || 'us',
        category: category || 'health',
        pageSize: String(Math.min(Number(pageSize) || 10, 20)),
        apiKey:   newsApiKey,
      });
      const r = await fetch(`https://newsapi.org/v2/top-headlines?${params}`);
      const d = await r.json();
      if (d.status !== 'ok') return res.status(400).json({ ok: false, error: d.message || 'newsapi.org error' });
      return res.status(200).json({
        ok:           true,
        totalResults: d.totalResults,
        articles:     (d.articles || []).map(a => ({
          title:       a.title,
          description: a.description,
          url:         a.url,
          urlToImage:  a.urlToImage,
          source:      a.source?.name,
          publishedAt: a.publishedAt,
          author:      a.author,
        })),
      });
    }

    // ── Web page metadata scraper ──────────────────────────────────────────────
    if (action === 'scrape') {
      if (!url) return res.status(400).json({ ok: false, error: 'Pass url=https://example.com' });
      // Block private network requests
      try { const u = new URL(url); if (u.hostname === 'localhost' || u.hostname.startsWith('192.168') || u.hostname.startsWith('10.')) return res.status(400).json({ ok: false, error: 'Private URLs not allowed' }); }
      catch (e) { return res.status(400).json({ ok: false, error: 'Invalid URL' }); }

      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DMD-Bot/1.0; +https://destinyspringshealthcare.com)',
          'Accept':     'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
        signal:   AbortSignal.timeout(8000),
      });

      if (!r.ok) return res.status(400).json({ ok: false, error: `HTTP ${r.status} from target URL` });

      const contentType = r.headers.get('content-type') || '';
      if (!contentType.includes('html') && !contentType.includes('text')) {
        return res.status(400).json({ ok: false, error: 'Target URL does not return HTML' });
      }

      const html = await r.text();
      const meta = extractMeta(html, url);
      return res.status(200).json({ ok: true, ...meta });
    }

    // ── RSS / Atom feed parser ─────────────────────────────────────────────────
    if (action === 'rss') {
      if (!url) return res.status(400).json({ ok: false, error: 'Pass url=https://example.com/feed.xml' });
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DMD-Bot/1.0)', 'Accept': 'application/rss+xml, application/atom+xml, text/xml, */*' },
        signal:  AbortSignal.timeout(8000),
      });
      if (!r.ok) return res.status(400).json({ ok: false, error: `HTTP ${r.status} from feed URL` });
      const xml   = await r.text();
      const items = parseRSS(xml);
      return res.status(200).json({ ok: true, items });
    }

    return res.status(400).json({ ok: false, error: `Unknown action "${action}". Use news, headlines, scrape, or rss.` });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
