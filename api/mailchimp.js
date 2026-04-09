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

  // ── 5. Send weekly performance digest campaign ───────────────────────────────
  if (action === 'sendDigest' && req.method === 'POST') {
    const { apiKey, listId, stats = {}, digestText } = req.body || {};
    if (!apiKey) return res.status(400).json({ ok: false, error: 'apiKey required' });
    const dataDc = apiKey.split('-').pop() || 'us1';
    const base   = `https://${dataDc}.api.mailchimp.com/3.0`;
    const auth   = 'Basic ' + Buffer.from(`anystring:${apiKey}`).toString('base64');
    const headers = { Authorization: auth, 'Content-Type': 'application/json' };

    try {
      // 1. Get first audience list if no listId provided
      let targetListId = listId;
      if (!targetListId) {
        const listsRes  = await fetch(`${base}/lists?count=1`, { headers });
        const listsData = await listsRes.json();
        targetListId    = listsData.lists?.[0]?.id;
      }
      if (!targetListId) return res.status(400).json({ ok: false, error: 'No audience list found — provide listId' });

      const week = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;">
          <div style="background:#0d9488;padding:20px 24px;border-radius:12px;margin-bottom:24px;">
            <h1 style="color:#fff;margin:0;font-size:22px;">📊 Weekly Marketing Digest</h1>
            <p style="color:#ccfbf1;margin:4px 0 0;font-size:14px;">Destiny Springs Healthcare · ${week}</p>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
            ${[
              { label: 'Email Open Rate',    value: stats.openRate        || '—', color: '#0d9488' },
              { label: 'Subscribers',        value: stats.subscribers != null ? Number(stats.subscribers).toLocaleString() : '—', color: '#7c3aed' },
              { label: 'Click Rate',         value: stats.clickRate       || '—', color: '#059669' },
              { label: 'Total Campaigns',    value: stats.totalCampaigns  || '—', color: '#d97706' },
            ].map(s => `
              <div style="background:#fff;border-radius:10px;padding:16px;text-align:center;border:1px solid #e5e7eb;">
                <div style="font-size:26px;font-weight:900;color:${s.color}">${s.value}</div>
                <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-top:4px">${s.label}</div>
              </div>
            `).join('')}
          </div>
          ${digestText
            ? `<div style="background:#fff;border-radius:10px;padding:20px;border:1px solid #ede9fe;margin-bottom:24px;border-left:4px solid #7c3aed;">
              <h2 style="margin:0 0 12px;font-size:16px;color:#1e293b;">📝 AI Performance Summary</h2>
              <p style="color:#475569;font-size:14px;line-height:1.7;white-space:pre-wrap;margin:0;">${digestText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
            </div>`
            : `<div style="background:#fff;border-radius:10px;padding:20px;border:1px solid #e5e7eb;margin-bottom:24px;">
              <h2 style="margin:0 0 12px;font-size:16px;color:#1e293b;">📋 This Week's Highlights</h2>
              <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.8;">
                <li>Review the open rate trend and compare to industry average (21%)</li>
                <li>Check click-through rates on your most recent campaigns</li>
                <li>Plan next week's content based on top-performing topics</li>
                <li>Follow up on any subscriber feedback or unsubscribes</li>
              </ul>
            </div>`
          }
          <p style="text-align:center;font-size:12px;color:#9ca3af;">Generated by Destiny Springs Marketing Dashboard · <a href="https://destinysprings.com" style="color:#0d9488">destinysprings.com</a></p>
        </div>
      `;

      // 2. Create campaign
      const createRes  = await fetch(`${base}/campaigns`, {
        method: 'POST', headers,
        body: JSON.stringify({
          type: 'regular',
          settings: {
            subject_line: `📊 Weekly Marketing Digest — ${week}`,
            title:        `Weekly Digest ${week}`,
            from_name:    'Destiny Springs Healthcare',
            reply_to:     'marketing@destinysprings.com',
          },
          recipients: { list_id: targetListId },
        }),
      });
      const createData = await createRes.json();
      if (createData.status >= 400) return res.status(400).json({ ok: false, error: createData.detail || createData.title || 'Campaign creation failed' });

      const campaignId = createData.id;

      // 3. Set content
      await fetch(`${base}/campaigns/${campaignId}/content`, {
        method: 'PUT', headers,
        body: JSON.stringify({ html }),
      });

      // 4. Send now
      const sendRes  = await fetch(`${base}/campaigns/${campaignId}/actions/send`, { method: 'POST', headers });
      if (sendRes.status === 204 || sendRes.ok) {
        return res.json({ ok: true, campaignId, message: 'Digest campaign sent successfully!' });
      }
      const sendData = await sendRes.json();
      return res.status(400).json({ ok: false, error: sendData.detail || 'Failed to send campaign', campaignId, tip: 'Campaign was created but not sent — check Mailchimp dashboard' });
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
