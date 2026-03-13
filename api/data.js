// /api/data.js — shared cloud store for the DMD dashboard
// Backed by Vercel KV (Upstash Redis). All devices read/write the same data.
// Setup: Vercel dashboard → Storage → Create KV database → Connect to project.
// Vercel auto-adds KV_REST_API_URL and KV_REST_API_TOKEN as env vars.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const KV_URL   = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  if (!KV_URL || !KV_TOKEN) {
    return res.status(503).json({
      error: 'KV_REST_API_URL / KV_REST_API_TOKEN not configured. Go to Vercel dashboard → Storage → Create KV → connect to this project.',
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
