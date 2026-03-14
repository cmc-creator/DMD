// /api/data.js — multi-key cloud store backed by Upstash Redis (Vercel KV integration)
//
// Uses the official @upstash/redis SDK which auto-reads KV_REST_API_URL + KV_REST_API_TOKEN
// injected by Vercel's built-in Upstash KV storage integration.
//
// Endpoints
//   GET    /api/data               → { data: { dmd_destiny: {…}, … } }
//   GET    /api/data?key=X         → { value: <stored value> }
//   GET    /api/data?action=status → connection diagnostic
//   GET    /api/data?action=recover→ show both legacy + new hash contents
//   POST   /api/data               → body = flat object of keys to upsert
//   POST   /api/data?key=X         → body = value to store for one key
//   DELETE /api/data?key=X         → remove one field

import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const hasUrl   = !!(process.env.KV_REST_API_URL          || process.env.UPSTASH_REDIS_REST_URL);
  const hasToken = !!(process.env.KV_REST_API_TOKEN         || process.env.UPSTASH_REDIS_REST_TOKEN);

  // ── Diagnostic endpoints (work even without SDK connection) ─────────────────
  if (req.method === 'GET' && req.query.action) {
    const envCheck = {
      KV_REST_API_URL:          !!process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN:        !!process.env.KV_REST_API_TOKEN,
      UPSTASH_REDIS_REST_URL:   !!process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      connected:                hasUrl && hasToken,
    };

    if (!hasUrl || !hasToken) {
      return res.status(200).json({ status: 'not_configured', envCheck });
    }

    try {
      const redis = Redis.fromEnv();
      if (req.query.action === 'status') {
        const [hashFields, legacyExists] = await Promise.all([
          redis.hkeys('dmd:store'),
          redis.exists('dmd_shared'),
        ]);
        return res.status(200).json({
          status:       'ok',
          envCheck,
          hash_fields:  hashFields  || [],
          legacy_exists: legacyExists === 1,
        });
      }
      if (req.query.action === 'recover') {
        const [legacy, hashData] = await Promise.all([
          redis.get('dmd_shared'),
          redis.hgetall('dmd:store'),
        ]);
        return res.status(200).json({
          legacy_data:  legacy   || null,
          hash_data:    hashData || {},
          legacy_keys:  legacy   ? Object.keys(legacy)   : [],
          hash_keys:    hashData ? Object.keys(hashData) : [],
        });
      }
    } catch (e) {
      return res.status(200).json({ status: 'error', envCheck, error: e.message });
    }
  }

  if (!hasUrl || !hasToken) {
    return res.status(503).json({
      error: 'not configured — KV env vars missing',
      hint:  'Check /api/data?action=status for diagnostics',
    });
  }

  try {
    const redis = Redis.fromEnv();
    const HASH  = 'dmd:store';

    // ── GET ───────────────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      if (req.query.key) {
        const value = await redis.hget(HASH, req.query.key);
        return res.status(200).json({ value: value ?? null });
      }

      // Read new hash + legacy blob in parallel
      const [hashData, legacy] = await Promise.all([
        redis.hgetall(HASH),
        redis.get('dmd_shared'),
      ]);

      const data = {};

      // Layer 1: legacy blob (yesterday's data) — lowest priority
      if (legacy && typeof legacy === 'object') {
        Object.assign(data, legacy);
      }

      // Layer 2: new hash fields — higher priority, skip empty objects
      if (hashData) {
        for (const [k, v] of Object.entries(hashData)) {
          if (v !== null && !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)) {
            data[k] = v;
          }
        }
      }

      // Migrate legacy → hash if hash is empty
      if (legacy && typeof legacy === 'object' && (!hashData || Object.keys(hashData).length === 0)) {
        const entries = Object.entries(legacy).filter(([, v]) => v !== null && v !== undefined);
        if (entries.length) {
          redis.hset(HASH, Object.fromEntries(entries)); // fire-and-forget
        }
      }

      return res.status(200).json({ data });
    }

    // ── POST ──────────────────────────────────────────────────────────────────
    if (req.method === 'POST') {
      const body = req.body || {};
      if (req.query.key) {
        await redis.hset(HASH, { [req.query.key]: body });
        return res.status(200).json({ ok: true });
      }
      const entries = Object.fromEntries(
        Object.entries(body).filter(([, v]) => v !== null && v !== undefined)
      );
      if (Object.keys(entries).length) await redis.hset(HASH, entries);
      return res.status(200).json({ ok: true, fields: Object.keys(entries).length });
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!req.query.key) return res.status(400).json({ error: 'key query param required' });
      await redis.hdel(HASH, req.query.key);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
// The Vercel integration injects KV_REST_API_URL + KV_REST_API_TOKEN — no extra setup needed.
//
// Endpoints
//   GET    /api/data               → { data: { dmd_destiny: {…}, … } }
//   GET    /api/data?key=X         → { value: <stored value> }
//   GET    /api/data?action=status → connection diagnostic
//   GET    /api/data?action=recover→ read raw legacy dmd_shared blob from Redis
//   POST   /api/data               → body = flat object of keys to upsert
//   POST   /api/data?key=X         → body = value to store for one key
//   DELETE /api/data?key=X         → remove one field

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Vercel KV integration names  vs  manual Upstash names
  const KV_URL   = process.env.KV_REST_API_URL          || process.env.UPSTASH_REDIS_REST_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN         || process.env.UPSTASH_REDIS_REST_TOKEN;

  const kv = (cmd) =>
    fetch(KV_URL, {
      method:  'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(cmd),
    }).then(r => r.json());

  const HASH = 'dmd:store';

  // ── Diagnostic / recovery endpoints ─────────────────────────────────────────
  if (req.method === 'GET' && req.query.action) {
    const envCheck = {
      KV_REST_API_URL:          !!process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN:        !!process.env.KV_REST_API_TOKEN,
      UPSTASH_REDIS_REST_URL:   !!process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      resolved_url_prefix:      KV_URL ? KV_URL.slice(0, 40) + '…' : '(none)',
      connected:                !!(KV_URL && KV_TOKEN),
    };

    if (!KV_URL || !KV_TOKEN) {
      return res.status(200).json({ status: 'not_configured', envCheck });
    }

    try {
      if (req.query.action === 'status') {
        const [hashKeys, legacyExists] = await Promise.all([
          kv(['HKEYS', HASH]),
          kv(['EXISTS', 'dmd_shared']),
        ]);
        return res.status(200).json({
          status:        'ok',
          envCheck,
          hash_fields:   hashKeys.result  || [],
          legacy_exists: legacyExists.result === 1,
        });
      }

      if (req.query.action === 'recover') {
        // Read legacy blob and also the new hash — useful for manual recovery
        const [legacy, hashResult] = await Promise.all([
          kv(['GET', 'dmd_shared']),
          kv(['HGETALL', HASH]),
        ]);
        let legacyParsed = null;
        try { legacyParsed = legacy.result ? JSON.parse(legacy.result) : null; } catch {}

        // Parse new hash
        const hashData = {};
        if (Array.isArray(hashResult.result)) {
          for (let i = 0; i < hashResult.result.length; i += 2) {
            try { hashData[hashResult.result[i]] = JSON.parse(hashResult.result[i + 1]); } catch {}
          }
        }

        return res.status(200).json({
          legacy_data:   legacyParsed,
          hash_data:     hashData,
          legacy_keys:   legacyParsed ? Object.keys(legacyParsed) : [],
          hash_keys:     Object.keys(hashData),
        });
      }
    } catch (e) {
      return res.status(200).json({ status: 'error', envCheck, error: e.message });
    }
  }

  if (!KV_URL || !KV_TOKEN) {
    return res.status(503).json({
      error: 'not configured',
      hint:  'Vercel KV env vars missing. Check /api/data?action=status for diagnostics.',
    });
  }

  try {
    // ── GET ──────────────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      if (req.query.key) {
        const { result } = await kv(['HGET', HASH, req.query.key]);
        let value = null;
        try { value = result ? JSON.parse(result) : null; } catch { value = result; }
        return res.status(200).json({ value });
      }

      // Fetch new hash + legacy blob in parallel every time
      const [hashResult, legacyResult] = await Promise.all([
        kv(['HGETALL', HASH]),
        kv(['GET', 'dmd_shared']),
      ]);

      const data = {};

      // Parse legacy blob first (lower priority — will be overwritten by newer hash values)
      if (legacyResult.result) {
        try {
          const legacy = JSON.parse(legacyResult.result);
          Object.assign(data, legacy);
        } catch {}
      }

      // Parse hash fields (higher priority — overwrite any matching legacy keys)
      if (Array.isArray(hashResult.result)) {
        for (let i = 0; i < hashResult.result.length; i += 2) {
          try {
            const val = JSON.parse(hashResult.result[i + 1]);
            // Only overwrite legacy data if the hash value is non-null and non-empty
            if (val !== null && !(typeof val === 'object' && Object.keys(val).length === 0)) {
              data[hashResult.result[i]] = val;
            }
          } catch {}
        }
      }

      // If we got legacy data and the hash was empty/sparse, migrate it now
      if (legacyResult.result && (!Array.isArray(hashResult.result) || hashResult.result.length === 0)) {
        try {
          const legacy = JSON.parse(legacyResult.result);
          const pairs  = [];
          for (const [k, v] of Object.entries(legacy)) {
            if (v !== null && v !== undefined) pairs.push(k, JSON.stringify(v));
          }
          if (pairs.length) kv(['HSET', HASH, ...pairs]); // fire-and-forget migration
        } catch {}
      }

      return res.status(200).json({ data });
    }

    // ── POST ─────────────────────────────────────────────────────────────────
    if (req.method === 'POST') {
      const body = req.body || {};

      if (req.query.key) {
        await kv(['HSET', HASH, req.query.key, JSON.stringify(body)]);
        return res.status(200).json({ ok: true });
      }

      const pairs = [];
      for (const [k, v] of Object.entries(body)) {
        if (v !== null && v !== undefined) pairs.push(k, JSON.stringify(v));
      }
      if (pairs.length) await kv(['HSET', HASH, ...pairs]);
      return res.status(200).json({ ok: true, fields: pairs.length / 2 });
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!req.query.key) return res.status(400).json({ error: 'key query param required' });
      await kv(['HDEL', HASH, req.query.key]);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
// so reads/writes are atomic per-key and never stomp each other across devices.
//
// ONE-TIME SETUP:
//   1. upstash.com → Create Redis Database (free tier) → copy REST URL + token
//   2. Vercel → your project → Settings → Environment Variables:
//        UPSTASH_REDIS_REST_URL   = https://xxxx.upstash.io
//        UPSTASH_REDIS_REST_TOKEN = AXxx...
//   3. Redeploy — dashboard syncs across all devices automatically.
//
// Endpoints
//   GET    /api/data          → { data: { dmd_destiny: {…}, dmd_manual: {…}, … } }
//   GET    /api/data?key=X    → { value: <stored value> }
//   POST   /api/data          → body = flat object of keys to upsert  (bulk)
//   POST   /api/data?key=X    → body = value to store                 (single key)
//   DELETE /api/data?key=X    → removes one field

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Support both direct Upstash env vars and Vercel KV integration env vars
  const KV_URL   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL   || process.env.KV_URL;
  const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || process.env.KV_REST_API_READ_ONLY_TOKEN;

  // ── Status / debug endpoint — GET /api/data?action=status ─────────────────
  if (req.method === 'GET' && req.query.action === 'status') {
    const envCheck = {
      UPSTASH_REDIS_REST_URL:   !!process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      KV_REST_API_URL:          !!process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN:        !!process.env.KV_REST_API_TOKEN,
      KV_URL:                   !!process.env.KV_URL,
      resolved_url_prefix:      KV_URL ? KV_URL.slice(0, 30) + '…' : null,
      connected:                !!(KV_URL && KV_TOKEN),
    };
    if (!KV_URL || !KV_TOKEN) return res.status(200).json({ status: 'not_configured', envCheck });

    try {
      const kv = (cmd) =>
        fetch(KV_URL, {
          method:  'POST',
          headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
          body:    JSON.stringify(cmd),
        }).then(r => r.json());

      const [hashKeys, legacyKey] = await Promise.all([
        kv(['HKEYS', 'dmd:store']),
        kv(['EXISTS', 'dmd_shared']),
      ]);
      return res.status(200).json({
        status: 'ok',
        envCheck,
        hash_fields:    hashKeys.result || [],
        legacy_exists:  legacyKey.result === 1,
      });
    } catch (e) {
      return res.status(200).json({ status: 'error', envCheck, error: e.message });
    }
  }

  if (!KV_URL || !KV_TOKEN) {
    return res.status(503).json({
      error: 'not configured',
      hint:  'Vercel KV / Upstash env vars not found. Visit /api/data?action=status to see which vars are present.',
    });
  }

  // Execute a Redis command via Upstash REST API
  const kv = (cmd) =>
    fetch(KV_URL, {
      method:  'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(cmd),
    }).then(r => r.json());

  const HASH = 'dmd:store'; // Redis Hash — one field per dmd_ key
  const { key } = req.query;

  try {
    // ── GET ──────────────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      if (key) {
        // Single field lookup
        const { result } = await kv(['HGET', HASH, key]);
        let value = null;
        try { value = result ? JSON.parse(result) : null; } catch { value = result; }
        return res.status(200).json({ value });
      }

      // All fields — HGETALL returns [field, value, field, value, …]
      const { result } = await kv(['HGETALL', HASH]);
      const data = {};
      if (Array.isArray(result)) {
        for (let i = 0; i < result.length; i += 2) {
          try { data[result[i]] = JSON.parse(result[i + 1]); } catch { data[result[i]] = result[i + 1]; }
        }
      }

      // ── Migrate legacy single-blob format (dmd_shared key) ───────────────
      // On first run after this upgrade the hash will be empty; read the old key.
      if (Object.keys(data).length === 0) {
        const { result: legacy } = await kv(['GET', 'dmd_shared']);
        if (legacy) {
          try {
            const parsed = JSON.parse(legacy);
            const pairs  = [];
            for (const [k, v] of Object.entries(parsed)) {
              if (v !== null && v !== undefined) { pairs.push(k, JSON.stringify(v)); data[k] = v; }
            }
            if (pairs.length) await kv(['HSET', HASH, ...pairs]); // migrate once
          } catch { /* ignore malformed legacy */ }
        }
      }

      return res.status(200).json({ data });
    }

    // ── POST ─────────────────────────────────────────────────────────────────
    if (req.method === 'POST') {
      const body = req.body || {};

      if (key) {
        // Single-key mode: POST /api/data?key=X  with body = value
        await kv(['HSET', HASH, key, JSON.stringify(body)]);
        return res.status(200).json({ ok: true });
      }

      // Bulk mode: body is a flat object { dmd_key: value, … }
      const pairs = [];
      for (const [k, v] of Object.entries(body)) {
        if (v !== null && v !== undefined) pairs.push(k, JSON.stringify(v));
      }
      if (pairs.length) await kv(['HSET', HASH, ...pairs]);
      return res.status(200).json({ ok: true, fields: pairs.length / 2 });
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!key) return res.status(400).json({ error: 'key query param required' });
      await kv(['HDEL', HASH, key]);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
