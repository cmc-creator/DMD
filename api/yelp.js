// Vercel serverless — Yelp Fusion API proxy
// ─────────────────────────────────────────────────────────────────────────────
// Required env var (set in Vercel dashboard → Project → Settings → Env Vars):
//   YELP_API_KEY = your Yelp Fusion API key
//
// Yelp API setup:
//   1. Register at https://api.yelp.com/v3
//   2. Create an App → copy the "API Key"
//   3. Paste into Vercel env vars as YELP_API_KEY
//   Note: Yelp Fusion is free up to 500 calls/day
//
// Query params accepted:
//   action=data&businessId=destiny-springs-healthcare-scottsdale
//     → business details: name, rating, reviewCount, categories, hours, url
//   action=reviews&businessId=xxx
//     → up to 3 most recent reviews (Yelp free tier limit)
//   action=search&term=mental+health&location=Scottsdale+AZ&limit=10
//     → search Yelp for businesses
//   apiKey=xxx (optional override — uses YELP_API_KEY env by default)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.YELP_API_KEY || req.query.apiKey;
  if (!apiKey) {
    return res.status(400).json({ ok: false, error: 'Missing API key — set YELP_API_KEY in Vercel env vars or pass ?apiKey=' });
  }

  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  const { action, businessId, term, location, limit = '10' } = req.query;

  try {
    // ── Business details ───────────────────────────────────────────────────────
    if (!action || action === 'data') {
      if (!businessId) return res.status(400).json({ ok: false, error: 'Pass businessId=your-yelp-business-slug' });

      const r = await fetch(`https://api.yelp.com/v3/businesses/${encodeURIComponent(businessId)}`, { headers });
      const d = await r.json();
      if (d.error) return res.status(400).json({ ok: false, error: d.error.description || d.error.code });

      return res.status(200).json({
        ok:           true,
        id:           d.id,
        name:         d.name,
        rating:       d.rating,
        reviewCount:  d.review_count,
        url:          d.url,
        phone:        d.display_phone,
        address:      d.location?.display_address?.join(', '),
        categories:   (d.categories || []).map(c => c.title).join(', '),
        photos:       (d.photos || []).slice(0, 3),
        isClaimed:    d.is_claimed,
        isClosed:     d.is_closed,
        hours:        d.hours?.[0]?.open?.map(h => ({
          day:   ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][h.day],
          start: h.start,
          end:   h.end,
        })) || [],
        priceRange:   d.price || '—',
        coordinates:  d.coordinates,
      });
    }

    // ── Recent reviews (max 3 on free tier) ────────────────────────────────────
    if (action === 'reviews') {
      if (!businessId) return res.status(400).json({ ok: false, error: 'Pass businessId=xxx' });

      const r = await fetch(`https://api.yelp.com/v3/businesses/${encodeURIComponent(businessId)}/reviews?sort_by=newest`, { headers });
      const d = await r.json();
      if (d.error) return res.status(400).json({ ok: false, error: d.error.description || d.error.code });

      return res.status(200).json({
        ok:    true,
        total: d.total,
        reviews: (d.reviews || []).map(rv => ({
          id:        rv.id,
          rating:    rv.rating,
          text:      rv.text,
          timeCreated: rv.time_created,
          user: {
            name:       rv.user?.name,
            imageUrl:   rv.user?.image_url,
            profileUrl: rv.user?.profile_url,
          },
          url: rv.url,
        })),
      });
    }

    // ── Business search ────────────────────────────────────────────────────────
    if (action === 'search') {
      const params = new URLSearchParams({
        term:     term || 'mental health',
        location: location || 'Scottsdale, AZ',
        limit:    String(Math.min(Number(limit), 50)),
        sort_by:  'best_match',
      });
      const r = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, { headers });
      const d = await r.json();
      if (d.error) return res.status(400).json({ ok: false, error: d.error.description || d.error.code });

      return res.status(200).json({
        ok:        true,
        total:     d.total,
        businesses: (d.businesses || []).map(b => ({
          id:          b.id,
          name:        b.name,
          rating:      b.rating,
          reviewCount: b.review_count,
          address:     b.location?.display_address?.join(', '),
          phone:       b.display_phone,
          url:         b.url,
          categories:  (b.categories || []).map(c => c.title).join(', '),
          distance:    b.distance ? (b.distance / 1609.34).toFixed(1) + ' mi' : null,
        })),
      });
    }

    return res.status(400).json({ ok: false, error: `Unknown action "${action}"` });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
