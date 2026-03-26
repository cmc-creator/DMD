// Vercel serverless — Wix OAuth2 for Analytics
// ─────────────────────────────────────────────────────────────────────────────
// Required env vars (set in Vercel dashboard → Project → Settings → Env Vars):
//   WIX_CLIENT_ID     = from manage.wix.com → Settings → Advanced → API Keys  (OAuth App Client ID)
//   WIX_CLIENT_SECRET = OAuth App Client Secret
//   WIX_REDIRECT_URI  = https://YOUR_VERCEL_URL/api/wix
//
// Wix setup:
//   1. manage.wix.com → Settings → Advanced → Headless Settings → OAuth Apps → + Add App
//   2. Set Allowed Redirect Domain to: dmd-flax.vercel.app
//   3. Copy the Client ID shown
//   4. Contact Wix support or use API keys for server-to-server calls

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const CLIENT_ID     = process.env.WIX_CLIENT_ID;
  const CLIENT_SECRET = process.env.WIX_CLIENT_SECRET;
  const REDIRECT_URI  = process.env.WIX_REDIRECT_URI || 'https://dmd-flax.vercel.app/api/wix';

  const { action, code } = req.query;

  // ── 0. Config diagnostic ────────────────────────────────────────────────
  if (action === 'check') {
    return res.json({
      WIX_CLIENT_ID:     CLIENT_ID     ? `set (${CLIENT_ID.slice(0,8)}...)` : 'MISSING',
      WIX_CLIENT_SECRET: CLIENT_SECRET ? 'set'                              : 'MISSING',
      WIX_REDIRECT_URI:  REDIRECT_URI,
    });
  }

  // ── 1. Initiate OAuth login ──────────────────────────────────────────────
  if (action === 'login') {
    if (!CLIENT_ID) {
      return res.redirect('/?wix_error=WIX_CLIENT_ID+not+set+in+Vercel+%E2%80%94+see+manage.wix.com+%E2%86%92+Settings+%E2%86%92+Headless+Settings+%E2%86%92+OAuth+Apps');
    }
    // Wix Headless OAuth — uses camelCase params
    const url = new URL('https://www.wix.com/oauth/access');
    url.searchParams.set('clientId',      CLIENT_ID);
    url.searchParams.set('redirectUri',   REDIRECT_URI);
    url.searchParams.set('responseType',  'code');
    url.searchParams.set('scope',         'offline_access');
    return res.redirect(url.toString());
  }

  // ── 2. OAuth callback ────────────────────────────────────────────────────
  if (code) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.redirect('/?wix_error=Server+not+configured');
    }
    try {
      const tokenRes = await fetch('https://www.wix.com/oauth/access', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          grant_type:    'authorization_code',
          client_id:     CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri:  REDIRECT_URI,
          code,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        const msg = tokenData.error_description || tokenData.error || 'Token exchange failed';
        return res.redirect(`/?wix_error=${encodeURIComponent(msg)}`);
      }

      const data = await fetchWixData(tokenData.access_token, tokenData.refresh_token);

      const encoded = Buffer.from(JSON.stringify(data)).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return res.redirect(`/?wix_data=${encoded}`);
    } catch (e) {
      return res.redirect(`/?wix_error=${encodeURIComponent(e.message)}`);
    }
  }

  // ── 3. Refresh using stored refresh_token ────────────────────────────────
  if (action === 'refresh') {
    const refresh_token = req.query.refresh_token;
    if (!refresh_token || !CLIENT_ID || !CLIENT_SECRET) {
      return res.status(400).json({ ok: false, error: 'Missing refresh_token or server config' });
    }
    try {
      const tokenRes = await fetch('https://www.wix.com/oauth/access', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          grant_type:    'refresh_token',
          client_id:     CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return res.status(401).json({ ok: false, error: 'Token refresh failed — please reconnect' });
      }
      const data = await fetchWixData(tokenData.access_token, refresh_token);
      return res.json({ ok: true, ...data });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  return res.status(400).json({ error: 'Use ?action=login or OAuth callback ?code=' });
}

// ── Fetch Wix site analytics ──────────────────────────────────────────────────
async function fetchWixData(accessToken, refreshToken) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
  const payload = {
    refreshToken,
    connectedAt: new Date().toISOString(),
  };

  // Get site info
  try {
    const siteRes  = await fetch('https://www.wixapis.com/site-list/v2/sites/query', {
      method: 'POST', headers,
      body: JSON.stringify({ query: { paging: { limit: 1 } } }),
    });
    const siteData = await siteRes.json();
    const site     = siteData.sites?.[0];
    if (site) {
      payload.siteName = site.displayName || site.name || '';
      payload.siteId   = site.id || '';
    }
  } catch {}

  // Get analytics - sessions, bounce rate, page views (last 30 days)
  try {
    const now       = new Date();
    const from      = new Date(now); from.setDate(from.getDate() - 30);
    const toStr     = now.toISOString().split('T')[0];
    const fromStr   = from.toISOString().split('T')[0];

    const analyticsRes = await fetch('https://www.wixapis.com/analytics/v2/reports', {
      method: 'POST', headers,
      body: JSON.stringify({
        namespace: 'web_analytics',
        metrics:   [
          { expression: 'SESSIONS'           },
          { expression: 'BOUNCE_RATE'        },
          { expression: 'PAGE_VIEWS'         },
          { expression: 'UNIQUE_VISITORS'    },
          { expression: 'AVG_VISIT_DURATION' },
        ],
        dimensionFilters: [],
        dateRange: { from: fromStr, to: toStr },
      }),
    });
    const analyticsData = await analyticsRes.json();
    const totals = analyticsData?.totals;
    if (totals) {
      payload.sessions    = Math.round(totals.SESSIONS || 0);
      payload.bounceRate  = totals.BOUNCE_RATE ? (Number(totals.BOUNCE_RATE) * 100).toFixed(1) : null;
      payload.pageViews   = Math.round(totals.PAGE_VIEWS || 0);
      payload.visitors    = Math.round(totals.UNIQUE_VISITORS || 0);
      payload.avgDuration = totals.AVG_VISIT_DURATION ? Math.round(Number(totals.AVG_VISIT_DURATION)) + 's' : null;
    }

    // Traffic sources breakdown
    const sourcesRes = await fetch('https://www.wixapis.com/analytics/v2/reports', {
      method: 'POST', headers,
      body: JSON.stringify({
        namespace:  'web_analytics',
        metrics:    [{ expression: 'SESSIONS' }],
        dimensions: [{ expression: 'TRAFFIC_SOURCE' }],
        dateRange:  { from: fromStr, to: toStr },
      }),
    });
    const sourcesData = await sourcesRes.json();
    const rows        = sourcesData?.rows || [];
    if (rows.length > 0) {
      const total = rows.reduce((s, r) => s + (Number(r.metrics?.[0] || 0)), 0);
      const pct   = (name) => {
        const row = rows.find(r => (r.dimensions?.[0] || '').toLowerCase().includes(name));
        return row && total > 0 ? Math.round((Number(row.metrics?.[0] || 0) / total) * 100) : 0;
      };
      payload.organic  = pct('organic') || pct('search');
      payload.social   = pct('social');
      payload.direct   = pct('direct');
      payload.referral = pct('referral');
    }
  } catch (e) {
    payload.analyticsError = e.message;
  }

  return payload;
}
