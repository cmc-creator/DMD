// Vercel serverless — Google OAuth2 for Analytics (GA4) + Business Profile
// ─────────────────────────────────────────────────────────────────────────────
// Required env vars (set in Vercel dashboard → Project → Settings → Env Vars):
//   GOOGLE_CLIENT_ID      = your OAuth client ID from console.cloud.google.com
//   GOOGLE_CLIENT_SECRET  = your OAuth client secret
//   GOOGLE_REDIRECT_URI   = https://YOUR_VERCEL_URL/api/google
//
// Google Cloud setup:
//   1. console.cloud.google.com → New Project
//   2. Enable: "Google Analytics Data API" and "My Business Account Management API"
//   3. OAuth consent screen → External → add scopes (analytics.readonly, business.manage)
//   4. Credentials → OAuth 2.0 Client ID → Web → add redirect URI above

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI  = process.env.GOOGLE_REDIRECT_URI;

  const { action, code, state, refresh_token, propertyId } = req.query;

  const SCOPES = [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/business.manage',
    'openid',
    'email',
    'profile',
  ].join(' ');

  // ── 1. Initiate OAuth login ──────────────────────────────────────────────
  if (action === 'login') {
    if (!CLIENT_ID || !REDIRECT_URI) {
      return res.redirect('/?google_error=Server+not+configured+%E2%80%94+set+GOOGLE_CLIENT_ID+%26+GOOGLE_REDIRECT_URI+in+Vercel');
    }
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id',     CLIENT_ID);
    url.searchParams.set('redirect_uri',  REDIRECT_URI);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope',         SCOPES);
    url.searchParams.set('access_type',   'offline');
    url.searchParams.set('prompt',        'consent');
    url.searchParams.set('state',         state || '{}');
    return res.redirect(url.toString());
  }

  // ── 2. OAuth callback ────────────────────────────────────────────────────
  if (code) {
    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
      return res.redirect('/?google_error=Server+not+configured');
    }
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams({
          code,
          client_id:     CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri:  REDIRECT_URI,
          grant_type:    'authorization_code',
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        const msg = tokenData.error_description || tokenData.error || 'Token exchange failed';
        return res.redirect(`/?google_error=${encodeURIComponent(msg)}`);
      }

      const stateData  = (() => { try { return JSON.parse(state || '{}'); } catch { return {}; } })();
      const pid        = stateData.propertyId || '';
      const payload    = await fetchGoogleData(tokenData.access_token, tokenData.refresh_token, pid);

      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return res.redirect(`/?google_data=${encoded}`);
    } catch (e) {
      return res.redirect(`/?google_error=${encodeURIComponent(e.message)}`);
    }
  }

  // ── 3. Refresh using stored refresh_token ────────────────────────────────
  if (action === 'refresh' && refresh_token) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({ ok: false, error: 'Server not configured' });
    }
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams({
          refresh_token,
          client_id:     CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type:    'refresh_token',
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return res.status(401).json({ ok: false, error: 'Token refresh failed' });
      }
      const data = await fetchGoogleData(tokenData.access_token, refresh_token, propertyId || '');
      return res.json({ ok: true, ...data });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  return res.status(400).json({ error: 'Invalid request — use ?action=login, or OAuth callback ?code=' });
}

// ── Data fetching ────────────────────────────────────────────────────────────
async function fetchGoogleData(accessToken, refreshToken, propertyId) {
  const payload = {
    refreshToken,
    connectedAt: new Date().toISOString(),
    propertyId,
  };

  // Fetch GA4 report (last 30 days)
  if (propertyId) {
    try {
      const reportRes = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          method:  'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            dateRanges:  [{ startDate: '30daysAgo', endDate: 'today' }],
            metrics:     [
              { name: 'sessions'              },
              { name: 'bounceRate'            },
              { name: 'averageSessionDuration'},
              { name: 'conversions'           },
              { name: 'newUsers'              },
            ],
            dimensions:  [{ name: 'date' }],
          }),
        }
      );
      const reportData = await reportRes.json();
      if (reportData.totals) {
        const t = reportData.totals[0]?.metricValues || [];
        payload.sessions     = Number(t[0]?.value || 0).toLocaleString();
        payload.bounceRate   = (Number(t[1]?.value || 0) * 100).toFixed(1) + '%';
        payload.avgDuration  = Math.round(Number(t[2]?.value || 0)) + 's';
        payload.conversions  = Math.round(Number(t[3]?.value || 0));
        payload.newUsers     = Number(t[4]?.value || 0).toLocaleString();
        payload.gaRows       = (reportData.rows || []).slice(0, 30).map(r => ({
          date:        r.dimensionValues[0]?.value,
          sessions:    Number(r.metricValues[0]?.value || 0),
          bounceRate:  Number(r.metricValues[1]?.value || 0),
          conversions: Number(r.metricValues[3]?.value || 0),
        }));
      } else if (reportData.error) {
        payload.gaError = reportData.error.message;
      }
    } catch (e) { payload.gaError = e.message; }
  }

  // Fetch Google Business Profile — list accounts
  try {
    const accountsRes  = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const accountsData = await accountsRes.json();
    const account      = accountsData.accounts?.[0];
    if (account) {
      payload.businessAccountName = account.name;
      payload.businessAccountId   = account.name.split('/').pop();

      // List locations
      const locRes  = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const locData = await locRes.json();
      payload.locationCount = locData.locations?.length || 0;
      payload.primaryLocation = locData.locations?.[0]?.title || '';
    }
  } catch (e) { payload.businessError = e.message; }

  return payload;
}
