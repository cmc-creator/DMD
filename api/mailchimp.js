// Vercel serverless — Mailchimp OAuth2
// ─────────────────────────────────────────────────────────────────────────────
// Required env vars (set in Vercel dashboard → Project → Settings → Env Vars):
//   MAILCHIMP_CLIENT_ID     = from mailchimp.com → Account → Extras → Registered Apps
//   MAILCHIMP_CLIENT_SECRET = from same page
//   MAILCHIMP_REDIRECT_URI  = https://YOUR_VERCEL_URL/api/mailchimp
//
// Mailchimp setup:
//   1. Log into Mailchimp → Account → Extras → Registered Apps → Register An App
//   2. Set "Redirect URI" to your Vercel URL + /api/mailchimp
//   3. Copy Client ID and Client Secret to Vercel env vars

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const CLIENT_ID     = process.env.MAILCHIMP_CLIENT_ID;
  const CLIENT_SECRET = process.env.MAILCHIMP_CLIENT_SECRET;
  const REDIRECT_URI  = process.env.MAILCHIMP_REDIRECT_URI;

  const { action, code, token, dc } = req.query;

  // ── 1. Initiate OAuth login ──────────────────────────────────────────────
  if (action === 'login') {
    if (!CLIENT_ID || !REDIRECT_URI) {
      return res.redirect('/?mailchimp_error=Server+not+configured+%E2%80%94+set+MAILCHIMP_CLIENT_ID+%26+MAILCHIMP_REDIRECT_URI+in+Vercel');
    }
    const url = new URL('https://login.mailchimp.com/oauth2/authorize');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id',     CLIENT_ID);
    url.searchParams.set('redirect_uri',  REDIRECT_URI);
    return res.redirect(url.toString());
  }

  // ── 2. OAuth callback ────────────────────────────────────────────────────
  if (code) {
    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
      return res.redirect('/?mailchimp_error=Server+not+configured');
    }
    try {
      const tokenRes = await fetch('https://login.mailchimp.com/oauth2/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams({
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
        return res.redirect(`/?mailchimp_error=${encodeURIComponent(msg)}`);
      }

      // Get data center from metadata endpoint
      const metaRes  = await fetch('https://login.mailchimp.com/oauth2/metadata', {
        headers: { Authorization: `OAuth ${tokenData.access_token}` },
      });
      const metaData = await metaRes.json();
      const dataDc   = metaData.dc;
      if (!dataDc) {
        return res.redirect('/?mailchimp_error=Could+not+determine+data+center+from+Mailchimp');
      }

      const data     = await fetchMailchimpStats(tokenData.access_token, dataDc);
      data.accessToken = tokenData.access_token;
      data.dc          = dataDc;

      const encoded = Buffer.from(JSON.stringify(data)).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return res.redirect(`/?mailchimp_data=${encoded}`);
    } catch (e) {
      return res.redirect(`/?mailchimp_error=${encodeURIComponent(e.message)}`);
    }
  }

  // ── 3. Refresh using stored token ────────────────────────────────────────
  if (action === 'refresh' && token && dc) {
    try {
      const data = await fetchMailchimpStats(token, dc);
      return res.json({ ok: true, ...data });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // ── 4. Direct API key (no OAuth — just paste the key from Mailchimp Account → API Keys) ──
  if (action === 'data') {
    const directKey = req.query.apiKey;
    const listId    = req.query.listId || '';
    if (!directKey) return res.status(400).json({ ok: false, error: 'apiKey required' });
    const dataDc = directKey.split('-').pop() || 'us1';
    try {
      const data = await fetchMailchimpWithKey(directKey, dataDc, listId);
      return res.json({ ok: true, ...data });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  return res.status(400).json({ error: 'Invalid request — use ?action=login, ?action=data&apiKey=, or OAuth callback ?code=' });
}

// ── Data fetching ────────────────────────────────────────────────────────────
function buildMailchimpStats(listsData, campaignsData, listId) {
  const targetList    = listId ? listsData.lists?.find(l => l.id === listId) : listsData.lists?.[0];
  const campaigns     = campaignsData.campaigns || [];
  const lastCampaign  = campaigns[0];
  return {
    listName:         targetList?.name || '',
    listId:           targetList?.id   || '',
    subscribers:      targetList?.stats?.member_count          || 0,
    avgSubscriberRate: targetList?.stats?.avg_sub_rate         || 0,
    openRate:         lastCampaign?.report_summary?.open_rate  != null
                        ? (lastCampaign.report_summary.open_rate  * 100).toFixed(1) + '%' : '—',
    clickRate:        lastCampaign?.report_summary?.click_rate != null
                        ? (lastCampaign.report_summary.click_rate * 100).toFixed(1) + '%' : '—',
    totalCampaigns:   campaignsData.total_items || 0,
    totalAudiences:   listsData.total_items     || 0,
    recentCampaigns:  campaigns.slice(0, 5).map(c => ({
      id:          c.id,
      title:       c.settings?.title        || '',
      subject:     c.settings?.subject_line || '',
      sentAt:      c.send_time              || null,
      openRate:    c.report_summary?.open_rate  != null ? (c.report_summary.open_rate  * 100).toFixed(1) + '%' : '—',
      clickRate:   c.report_summary?.click_rate != null ? (c.report_summary.click_rate * 100).toFixed(1) + '%' : '—',
      uniqueOpens: c.report_summary?.unique_opens || 0,
      emailsSent:  c.report_summary?.emails_sent  || 0,
    })),
    connectedAt:      new Date().toISOString(),
  };
}

async function fetchMailchimpStats(accessToken, dc) {
  const base    = `https://${dc}.api.mailchimp.com/3.0`;
  const headers = { Authorization: `Bearer ${accessToken}` };
  const [listsRes, campaignsRes] = await Promise.all([
    fetch(`${base}/lists?count=10&fields=lists.id,lists.name,lists.stats,total_items`, { headers }),
    fetch(`${base}/campaigns?count=5&status=sent&fields=campaigns.id,campaigns.settings.title,campaigns.settings.subject_line,campaigns.send_time,campaigns.report_summary,total_items&sort_field=send_time&sort_dir=DESC`, { headers }),
  ]);
  return buildMailchimpStats(await listsRes.json(), await campaignsRes.json(), '');
}

async function fetchMailchimpWithKey(apiKey, dc, listId) {
  const base    = `https://${dc}.api.mailchimp.com/3.0`;
  const auth    = 'Basic ' + Buffer.from(`anystring:${apiKey}`).toString('base64');
  const headers = { Authorization: auth };
  const [listsRes, campaignsRes] = await Promise.all([
    fetch(`${base}/lists?count=10&fields=lists.id,lists.name,lists.stats,total_items`, { headers }),
    fetch(`${base}/campaigns?count=5&status=sent&fields=campaigns.id,campaigns.settings.title,campaigns.settings.subject_line,campaigns.send_time,campaigns.report_summary,total_items&sort_field=send_time&sort_dir=DESC`, { headers }),
  ]);
  const listsData = await listsRes.json();
  if (listsData.status === 401 || listsData.title === 'API Key Invalid') throw new Error('Invalid Mailchimp API key');
  return buildMailchimpStats(listsData, await campaignsRes.json(), listId);
}
