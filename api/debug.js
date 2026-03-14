// Temporary debug endpoint — shows all env var NAMES visible to this function
// Visit: /api/debug
export default function handler(req, res) {
  const allKeys = Object.keys(process.env).sort();
  const kvKeys  = allKeys.filter(k => k.includes('KV') || k.includes('REDIS') || k.includes('UPSTASH'));
  return res.status(200).json({
    kv_related: kvKeys,
    kv_values_redacted: Object.fromEntries(
      kvKeys.map(k => [k, process.env[k] ? process.env[k].slice(0, 12) + '…' : '(empty)'])
    ),
    all_keys: allKeys,
  });
}
