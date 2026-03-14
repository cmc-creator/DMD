import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  const hasDb = !!(url && token);
  const redis = hasDb ? new Redis({ url, token }) : null;
  const HASH  = 'dmd:store';

  // Diagnostic
  if (req.method === 'GET' && req.query.action) {
    const envCheck = {
      KV_REST_API_URL:   !!process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
      connected: hasDb,
    };
    if (!hasDb) return res.status(200).json({ status: 'not_configured', envCheck });
    try {
      if (req.query.action === 'status') {
        const [fields, leg] = await Promise.all([redis.hkeys(HASH), redis.exists('dmd_shared')]);
        return res.status(200).json({ status: 'ok', envCheck, hash_fields: fields || [], legacy_exists: leg === 1 });
      }
      if (req.query.action === 'recover') {
        const [legacy, hash] = await Promise.all([redis.get('dmd_shared'), redis.hgetall(HASH)]);
        return res.status(200).json({ legacy_data: legacy || null, hash_data: hash || {}, legacy_keys: legacy ? Object.keys(legacy) : [], hash_keys: hash ? Object.keys(hash) : [] });
      }
    } catch (e) { return res.status(200).json({ status: 'error', envCheck, error: e.message }); }
  }

  if (!hasDb) return res.status(503).json({ error: 'not configured' });

  try {
    if (req.method === 'GET') {
      if (req.query.key) {
        const value = await redis.hget(HASH, req.query.key);
        return res.status(200).json({ value: value ?? null });
      }
      const [hashData, legacy] = await Promise.all([redis.hgetall(HASH), redis.get('dmd_shared')]);
      const data = {};
      if (legacy && typeof legacy === 'object') Object.assign(data, legacy);
      if (hashData) {
        for (const [k, v] of Object.entries(hashData)) {
          if (v !== null && !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)) data[k] = v;
        }
      }
      if (legacy && typeof legacy === 'object' && (!hashData || Object.keys(hashData).length === 0)) {
        const entries = Object.fromEntries(Object.entries(legacy).filter(([,v]) => v != null));
        if (Object.keys(entries).length) redis.hset(HASH, entries);
      }
      return res.status(200).json({ data });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (req.query.key) { await redis.hset(HASH, { [req.query.key]: body }); return res.status(200).json({ ok: true }); }
      const entries = Object.fromEntries(Object.entries(body).filter(([,v]) => v != null));
      if (Object.keys(entries).length) await redis.hset(HASH, entries);
      return res.status(200).json({ ok: true, fields: Object.keys(entries).length });
    }

    if (req.method === 'DELETE') {
      if (!req.query.key) return res.status(400).json({ error: 'key required' });
      await redis.hdel(HASH, req.query.key);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) { return res.status(500).json({ error: e.message }); }
}
