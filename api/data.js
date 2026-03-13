// /api/data.js — shared cloud store for the DMD dashboard
// Backed by Upstash Redis (free tier). All devices read/write the same data.
// Setup: upstash.com → Create Database (Redis) → copy REST URL + token
//        → add as UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel env vars.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Support both direct Upstash env vars and Vercel KV integration env vars
  const KV_URL   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!KV_URL || !KV_TOKEN) {
    return res.status(503).json({
      error: 'not configured — add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to Vercel env vars.',
    });
  }

  // Execute a Redis command via Upstash REST API
  const kv = (cmd) =>
    fetch(KV_URL, {
      method:  'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(cmd),
    }).then(r => r.json());

  try {
    if (req.method === 'GET') {
      const { result } = await kv(['GET', 'dmd_shared']);
      return res.status(200).json({ data: result ? JSON.parse(result) : null });
    }

    if (req.method === 'POST') {
      const value = JSON.stringify(req.body);
      await kv(['SET', 'dmd_shared', value]);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
