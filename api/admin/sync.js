// POST /api/admin/sync — trigger a manual full data refresh
// Proxies to /api/cron/daily using the server-side CRON_SECRET so the
// frontend never needs to know it.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  const BASE   = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const secret = process.env.CRON_SECRET || '';

  try {
    const r = await fetch(`${BASE}/api/cron/daily`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${secret}` },
    });
    const d = await r.json().catch(() => ({}));
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok, ...d });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
