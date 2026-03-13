// Vercel serverless — Meta (Facebook + Instagram) OAuth2
// ─────────────────────────────────────────────────────────────────────────────
// Required env vars (set in Vercel dashboard → Project → Settings → Env Vars):
//   META_APP_ID       = Facebook App ID from developers.facebook.com
//   META_APP_SECRET   = Facebook App Secret
//   META_REDIRECT_URI = https://YOUR_VERCEL_URL/api/meta
//
// Meta setup:
//   1. developers.facebook.com → My Apps → Create App → Business type
//   2. Add "Facebook Login" product → Settings → Valid OAuth redirect URIs: add META_REDIRECT_URI
//   3. Add "Instagram Graph API" product for Instagram access
//   4. App Review: submit for "pages_read_engagement", "instagram_basic", "read_insights"
//      (or use Developer Mode to test with your own accounts first)
//   5. Copy App ID and Secret to Vercel env vars

const SCOPES = 'pages_read_engagement,pages_show_list,instagram_basic,instagram_manage_insights,read_insights,public_profile';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const APP_ID       = process.env.META_APP_ID;
  const APP_SECRET   = process.env.META_APP_SECRET;
  const REDIRECT_URI = process.env.META_REDIRECT_URI;

  const { action, code, token } = req.query;

  // ── 1. Initiate OAuth login ──────────────────────────────────────────────
  if (action === 'login') {
    if (!APP_ID || !REDIRECT_URI) {
      return res.redirect('/?meta_error=Server+not+configured+%E2%80%94+set+META_APP_ID+%26+META_REDIRECT_URI+in+Vercel');
    }
    const url = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    url.searchParams.set('client_id',     APP_ID);
    url.searchParams.set('redirect_uri',  REDIRECT_URI);
    url.searchParams.set('scope',         SCOPES);
    url.searchParams.set('response_type', 'code');
    return res.redirect(url.toString());
  }

  // ── 2. OAuth callback ────────────────────────────────────────────────────
  if (code) {
    if (!APP_ID || !APP_SECRET || !REDIRECT_URI) {
      return res.redirect('/?meta_error=Server+not+configured');
    }
    try {
      const tokenRes = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${APP_SECRET}&code=${code}`
      );
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        const msg = tokenData.error?.message || 'Token exchange failed';
        return res.redirect(`/?meta_error=${encodeURIComponent(msg)}`);
      }

      const data = await fetchMetaStats(tokenData.access_token);
      data.accessToken = tokenData.access_token;

      const encoded = Buffer.from(JSON.stringify(data)).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return res.redirect(`/?meta_data=${encoded}`);
    } catch (e) {
      return res.redirect(`/?meta_error=${encodeURIComponent(e.message)}`);
    }
  }

  // ── 3. Refresh using stored user access token ────────────────────────────
  if (action === 'refresh' && token) {
    try {
      const data = await fetchMetaStats(token);
      return res.json({ ok: true, ...data });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  return res.status(400).json({ error: 'Invalid request — use ?action=login, or OAuth callback ?code=' });
}

// ── Data fetching ────────────────────────────────────────────────────────────
async function fetchMetaStats(userToken) {
  const result = { connectedAt: new Date().toISOString() };

  // Get all pages this user manages
  const pagesRes  = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${userToken}&fields=id,name,access_token,fan_count,followers_count`
  );
  const pagesData = await pagesRes.json();
  const pages     = pagesData.data || [];

  result.pageCount = pages.length;

  const primaryPage = pages[0];
  if (!primaryPage) return result;

  result.pageName  = primaryPage.name;
  result.pageId    = primaryPage.id;
  result.pageToken = primaryPage.access_token;
  result.fanCount  = primaryPage.fan_count      || 0;
  result.followers = primaryPage.followers_count || 0;

  // Page reach + engagement insights (last 28 days)
  try {
    const insRes  = await fetch(
      `https://graph.facebook.com/v18.0/${primaryPage.id}/insights?` +
      `metric=page_impressions_unique,page_post_engagements&period=month&` +
      `access_token=${primaryPage.access_token}`
    );
    const insData = await insRes.json();
    const reach      = insData.data?.find(d => d.name === 'page_impressions_unique')?.values?.slice(-1)[0]?.value;
    const engagement = insData.data?.find(d => d.name === 'page_post_engagements')?.values?.slice(-1)[0]?.value;
    if (reach      != null) result.reach      = reach;
    if (engagement != null) result.engagement = engagement;
  } catch {}

  // Check for linked Instagram Business account
  try {
    const igPageRes  = await fetch(
      `https://graph.facebook.com/v18.0/${primaryPage.id}?fields=instagram_business_account&access_token=${primaryPage.access_token}`
    );
    const igPageData = await igPageRes.json();
    if (igPageData.instagram_business_account?.id) {
      const igId       = igPageData.instagram_business_account.id;
      const igRes      = await fetch(
        `https://graph.facebook.com/v18.0/${igId}?fields=followers_count,media_count,name,username&access_token=${primaryPage.access_token}`
      );
      const igData     = await igRes.json();
      result.igFollowers  = igData.followers_count || 0;
      result.igMediaCount = igData.media_count     || 0;
      result.igUsername   = igData.username        || '';
    }
  } catch {}

  return result;
}
