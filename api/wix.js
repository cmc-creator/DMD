// Vercel serverless — Wix Analytics via API Key
// GET /api/wix?action=sync&token=<api_key>
//
// How to get an API key:
//   manage.wix.com → select your site → Settings → Advanced → API Keys
//   Click "+ Generate Key" → give it a name → enable Analytics permissions
//   Copy the key (typically starts with IST2.)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action, token } = req.query;

    if (action !== 'sync' || !token) {
      return res.status(400).json({ ok: false, error: 'Use ?action=sync&token=<your_wix_api_key>' });
    }

    const headers = {
      Authorization: token,
      'Content-Type': 'application/json',
    };

    const payload = { apiKey: token.slice(0, 8) + '...', connectedAt: new Date().toISOString() };

    // Step 1: Get site info + siteId (required for analytics calls)
    let siteId = null;
    try {
      const siteRes  = await fetch('https://www.wixapis.com/site-list/v2/sites/query', {
        method: 'POST', headers,
        body: JSON.stringify({ query: { paging: { limit: 1 } } }),
      });
      const siteText = await siteRes.text();
      let siteData;
      try { siteData = JSON.parse(siteText); } catch { payload.siteListRaw = siteText.slice(0, 300); }
      const site = siteData?.sites?.[0];
      if (site) {
        payload.siteName = site.displayName || site.name || '';
        payload.siteId   = site.id || '';
        siteId           = site.id || null;
      } else if (siteData) {
        payload.siteListData = JSON.stringify(siteData).slice(0, 300);
      }
    } catch (e) { payload.siteListError = e.message; }

    // Step 2: Analytics — last 30 days (include wix-site-id if available)
    const aHeaders = { ...headers };
    if (siteId) aHeaders['wix-site-id'] = siteId;

    const now     = new Date();
    const from    = new Date(now); from.setDate(from.getDate() - 30);
    const toStr   = now.toISOString().split('T')[0];
    const fromStr = from.toISOString().split('T')[0];

    try {
      const analyticsRes  = await fetch('https://www.wixapis.com/analytics/v2/reports', {
        method: 'POST', headers: aHeaders,
        body: JSON.stringify({
          namespace: 'web_analytics',
          metrics: [
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
      const analyticsText = await analyticsRes.text();
      let analyticsData;
      try { analyticsData = JSON.parse(analyticsText); } catch { payload.analyticsRaw = analyticsText.slice(0, 300); }
      const totals = analyticsData?.totals;
      if (totals) {
        payload.sessions    = Math.round(totals.SESSIONS         || 0);
        payload.pageViews   = Math.round(totals.PAGE_VIEWS       || 0);
        payload.visitors    = Math.round(totals.UNIQUE_VISITORS  || 0);
        payload.bounceRate  = totals.BOUNCE_RATE        ? (Number(totals.BOUNCE_RATE)        * 100).toFixed(1) : null;
        payload.avgDuration = totals.AVG_VISIT_DURATION ? Math.round(Number(totals.AVG_VISIT_DURATION)) + 's' : null;
      } else if (analyticsData) {
        payload.analyticsResp = JSON.stringify(analyticsData).slice(0, 300);
      }
    } catch (e) { payload.analyticsError = e.message; }

    // Step 3: Traffic sources
    try {
      const sourcesRes  = await fetch('https://www.wixapis.com/analytics/v2/reports', {
        method: 'POST', headers: aHeaders,
        body: JSON.stringify({
          namespace:  'web_analytics',
          metrics:    [{ expression: 'SESSIONS' }],
          dimensions: [{ expression: 'TRAFFIC_SOURCE' }],
          dateRange:  { from: fromStr, to: toStr },
        }),
      });
      const sourcesData = JSON.parse(await sourcesRes.text());
      const rows = sourcesData?.rows || [];
      if (rows.length > 0) {
        const total = rows.reduce((s, r) => s + Number(r.metrics?.[0] || 0), 0);
        const pct   = (name) => {
          const row = rows.find(r => (r.dimensions?.[0] || '').toLowerCase().includes(name));
          return row && total > 0 ? Math.round((Number(row.metrics?.[0] || 0) / total) * 100) : 0;
        };
        payload.organic  = pct('organic') || pct('search');
        payload.social   = pct('social');
        payload.direct   = pct('direct');
        payload.referral = pct('referral');
      }
    } catch (e) { payload.sourcesError = e.message; }

    return res.json({ ok: true, ...payload });

  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message, stack: e.stack?.split('\n')[0] });
  }
}
