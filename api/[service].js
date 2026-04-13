// api/[service].js — unified dynamic-route handler
// Vercel routes /api/google, /api/meta, /api/tiktok, /api/social, /api/reviews,
// /api/yelp, /api/youtube, /api/mailchimp, /api/news, /api/post, /api/vision,
// /api/wix, and /api/surveymonkey to this single serverless function.
// Static routes (data, chat, competitors, destiny, admin/sync, cron/*) take
// precedence and are unaffected by this dynamic route.

// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE — OAuth2 for Analytics (GA4) + Business Profile
// ═══════════════════════════════════════════════════════════════════════════

async function fetchGoogleData(accessToken, refreshToken, propertyId) {
  const payload = { refreshToken, connectedAt: new Date().toISOString(), propertyId };

  if (propertyId) {
    try {
      const reportRes = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            metrics: [
              { name: 'sessions' }, { name: 'bounceRate' },
              { name: 'averageSessionDuration' }, { name: 'conversions' }, { name: 'newUsers' },
            ],
            dimensions: [{ name: 'date' }],
          }),
        }
      );
      const reportData = await reportRes.json();
      if (reportData.totals) {
        const t = reportData.totals[0]?.metricValues || [];
        payload.sessions    = Number(t[0]?.value || 0).toLocaleString();
        payload.bounceRate  = (Number(t[1]?.value || 0) * 100).toFixed(1) + '%';
        payload.avgDuration = Math.round(Number(t[2]?.value || 0)) + 's';
        payload.conversions = Math.round(Number(t[3]?.value || 0));
        payload.newUsers    = Number(t[4]?.value || 0).toLocaleString();
        payload.gaRows = (reportData.rows || []).slice(0, 30).map(r => ({
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

  try {
    const accountsRes  = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const accountsData = await accountsRes.json();
    const account = accountsData.accounts?.[0];
    if (account) {
      payload.businessAccountName = account.name;
      payload.businessAccountId   = account.name.split('/').pop();
      const locRes  = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const locData = await locRes.json();
      payload.locationCount   = locData.locations?.length || 0;
      payload.primaryLocation = locData.locations?.[0]?.title || '';
    }
  } catch (e) { payload.businessError = e.message; }

  return payload;
}

async function handleGoogle(req, res) {
  const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI  = process.env.GOOGLE_REDIRECT_URI;
  const { action, code, state, refresh_token, propertyId } = req.query;

  const GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/business.manage',
    'openid', 'email', 'profile',
  ].join(' ');

  if (action === 'check') {
    return res.json({
      GOOGLE_CLIENT_ID:     CLIENT_ID     ? `set (${CLIENT_ID.slice(0,8)}...)` : 'MISSING',
      GOOGLE_CLIENT_SECRET: CLIENT_SECRET ? 'set' : 'MISSING',
      GOOGLE_REDIRECT_URI:  REDIRECT_URI  ? REDIRECT_URI : 'MISSING',
    });
  }

  if (action === 'login') {
    if (!CLIENT_ID || !REDIRECT_URI)
      return res.redirect('/?google_error=Server+not+configured+%E2%80%94+set+GOOGLE_CLIENT_ID+%26+GOOGLE_REDIRECT_URI+in+Vercel');
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id',     CLIENT_ID);
    url.searchParams.set('redirect_uri',  REDIRECT_URI);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope',         GOOGLE_SCOPES);
    url.searchParams.set('access_type',   'offline');
    url.searchParams.set('prompt',        'consent');
    url.searchParams.set('state',         state || '{}');
    return res.redirect(url.toString());
  }

  if (code) {
    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI)
      return res.redirect('/?google_error=Server+not+configured');
    try {
      const tokenRes  = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:   new URLSearchParams({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI, grant_type: 'authorization_code' }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        const msg = tokenData.error_description || tokenData.error || 'Token exchange failed';
        return res.redirect(`/?google_error=${encodeURIComponent(msg)}`);
      }
      const stateData = (() => { try { return JSON.parse(state || '{}'); } catch { return {}; } })();
      const pid       = stateData.propertyId || '';
      const payload   = await fetchGoogleData(tokenData.access_token, tokenData.refresh_token, pid);
      const encoded   = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return res.redirect(`/?google_data=${encoded}`);
    } catch (e) { return res.redirect(`/?google_error=${encodeURIComponent(e.message)}`); }
  }

  if (action === 'refresh' && refresh_token) {
    if (!CLIENT_ID || !CLIENT_SECRET)
      return res.status(500).json({ ok: false, error: 'Server not configured' });
    try {
      const tokenRes  = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:   new URLSearchParams({ refresh_token, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'refresh_token' }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return res.status(401).json({ ok: false, error: 'Token refresh failed' });
      const data = await fetchGoogleData(tokenData.access_token, refresh_token, propertyId || '');
      return res.json({ ok: true, ...data });
    } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
  }

  return res.status(400).json({ error: 'Invalid request — use ?action=login, or OAuth callback ?code=' });
}

// ═══════════════════════════════════════════════════════════════════════════
// META — Facebook + Instagram OAuth2
// ═══════════════════════════════════════════════════════════════════════════

const META_SCOPES = 'pages_read_engagement,pages_show_list,instagram_basic,instagram_manage_insights,read_insights,public_profile';

async function fetchMetaStats(userToken) {
  const result = { connectedAt: new Date().toISOString() };
  const pagesRes  = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?access_token=${userToken}&fields=id,name,access_token,fan_count,followers_count`
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
  try {
    const insRes  = await fetch(
      `https://graph.facebook.com/v21.0/${primaryPage.id}/insights?metric=page_impressions_unique,page_post_engagements&period=month&access_token=${primaryPage.access_token}`
    );
    const insData = await insRes.json();
    const reach      = insData.data?.find(d => d.name === 'page_impressions_unique')?.values?.slice(-1)[0]?.value;
    const engagement = insData.data?.find(d => d.name === 'page_post_engagements')?.values?.slice(-1)[0]?.value;
    if (reach      != null) result.reach      = reach;
    if (engagement != null) result.engagement = engagement;
  } catch {}
  try {
    const igPageRes  = await fetch(
      `https://graph.facebook.com/v21.0/${primaryPage.id}?fields=instagram_business_account&access_token=${primaryPage.access_token}`
    );
    const igPageData = await igPageRes.json();
    if (igPageData.instagram_business_account?.id) {
      const igId   = igPageData.instagram_business_account.id;
      const igRes  = await fetch(
        `https://graph.facebook.com/v21.0/${igId}?fields=followers_count,media_count,name,username&access_token=${primaryPage.access_token}`
      );
      const igData = await igRes.json();
      result.igFollowers  = igData.followers_count || 0;
      result.igMediaCount = igData.media_count     || 0;
      result.igUsername   = igData.username        || '';
    }
  } catch {}
  return result;
}

async function handleMeta(req, res) {
  const APP_ID       = process.env.META_APP_ID;
  const APP_SECRET   = process.env.META_APP_SECRET;
  const REDIRECT_URI = process.env.META_REDIRECT_URI;
  const { action, code, token } = req.query;

  if (action === 'login') {
    if (!APP_ID || !REDIRECT_URI)
      return res.redirect('/?meta_error=Server+not+configured+%E2%80%94+set+META_APP_ID+%26+META_REDIRECT_URI+in+Vercel');
    const url = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    url.searchParams.set('client_id',     APP_ID);
    url.searchParams.set('redirect_uri',  REDIRECT_URI);
    url.searchParams.set('scope',         META_SCOPES);
    url.searchParams.set('response_type', 'code');
    return res.redirect(url.toString());
  }

  if (code) {
    if (!APP_ID || !APP_SECRET || !REDIRECT_URI) return res.redirect('/?meta_error=Server+not+configured');
    try {
      const tokenRes  = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${APP_SECRET}&code=${code}`
      );
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        const msg = tokenData.error?.message || 'Token exchange failed';
        return res.redirect(`/?meta_error=${encodeURIComponent(msg)}`);
      }
      const data    = await fetchMetaStats(tokenData.access_token);
      data.accessToken = tokenData.access_token;
      const encoded = Buffer.from(JSON.stringify(data)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return res.redirect(`/?meta_data=${encoded}`);
    } catch (e) { return res.redirect(`/?meta_error=${encodeURIComponent(e.message)}`); }
  }

  if (action === 'refresh' && token) {
    try {
      const data = await fetchMetaStats(token);
      return res.json({ ok: true, ...data });
    } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
  }

  if (action === 'feed') {
    const { token: pageToken, pageId } = req.query;
    if (!pageToken || !pageId) return res.status(400).json({ error: 'token and pageId required' });
    try {
      const [postsRes, igLinkRes] = await Promise.all([
        fetch(`https://graph.facebook.com/v21.0/${pageId}/posts?fields=message,story,created_time,full_picture,permalink_url,likes.summary(true),comments.summary(true)&limit=10&access_token=${encodeURIComponent(pageToken)}`),
        fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${encodeURIComponent(pageToken)}`),
      ]);
      const postsData  = await postsRes.json();
      const igLinkData = await igLinkRes.json();
      const fbPosts = (postsData.data || []).map(p => ({
        id: p.id, message: p.message || p.story || '', image: p.full_picture || null,
        url: p.permalink_url || null, date: p.created_time,
        likes: p.likes?.summary?.total_count || 0, comments: p.comments?.summary?.total_count || 0,
      }));
      let igPosts = [];
      if (igLinkData.instagram_business_account?.id) {
        const igId    = igLinkData.instagram_business_account.id;
        const mediaRes = await fetch(`https://graph.facebook.com/v21.0/${igId}/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count&limit=12&access_token=${encodeURIComponent(pageToken)}`);
        const mediaData = await mediaRes.json();
        igPosts = (mediaData.data || []).map(p => ({
          id: p.id, type: p.media_type, image: p.media_url || p.thumbnail_url || null,
          url: p.permalink || null, caption: p.caption ? p.caption.slice(0, 120) : '',
          date: p.timestamp, likes: p.like_count || 0, comments: p.comments_count || 0,
        }));
      }
      return res.json({ ok: true, fbPosts, igPosts, fetchedAt: new Date().toISOString() });
    } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
  }

  return res.status(400).json({ error: 'Invalid request — use ?action=login, or OAuth callback ?code=' });
}

// ═══════════════════════════════════════════════════════════════════════════
// SOCIAL — Public social media profile scraper (no OAuth)
// ═══════════════════════════════════════════════════════════════════════════

const FALLBACK_FB = 'https://www.facebook.com/destinyspringshealthcare';
const FALLBACK_IG = 'https://www.instagram.com/destinyspringshealthcare/';
const FALLBACK_TT = 'https://www.tiktok.com/@destinyspringshealthcare';

const socialFetchT = (url, extraHeaders = {}, ms = 9000) =>
  fetch(url, {
    headers: {
      'User-Agent':      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control':   'no-cache',
      ...extraHeaders,
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(ms),
  });

const socialStripHtml = (s = '') => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function socialParseCount(str) {
  if (!str) return null;
  const s = String(str).replace(/,/g, '').trim();
  const m = s.match(/^([\d.]+)\s*([KkMmBb]?)$/);
  if (!m) return parseInt(s.replace(/\D/g, '')) || null;
  const n   = parseFloat(m[1]);
  const mul = { k: 1e3, m: 1e6, b: 1e9 }[m[2].toLowerCase()] || 1;
  return Math.round(n * mul);
}

async function scrapeInstagram(profileUrl) {
  const url      = profileUrl || FALLBACK_IG;
  const cleanUrl = url.replace(/m\.instagram/, 'www.instagram').replace(/\/$/, '') + '/';
  try {
    const username = cleanUrl.match(/instagram\.com\/([^/?#]+)/i)?.[1];
    if (username) {
      try {
        const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
        const apiRes = await socialFetchT(apiUrl, { 'X-IG-App-ID': '936619743392459', 'X-Requested-With': 'XMLHttpRequest', 'Referer': `https://www.instagram.com/${username}/` }, 7000);
        if (apiRes.ok) {
          const json = await apiRes.json();
          const user = json?.data?.user;
          if (user) return { platform: 'Instagram', url: cleanUrl, username: user.username, fullName: user.full_name, bio: user.biography, followers: user.edge_followed_by?.count, following: user.edge_follow?.count, posts: user.edge_owner_to_timeline_media?.count, profilePic: user.profile_pic_url_hd || user.profile_pic_url, isVerified: user.is_verified, website: user.external_url, fetchedAt: new Date().toISOString(), method: 'api' };
        }
      } catch { /* fall through */ }
    }
    const r = await socialFetchT(cleanUrl, {}, 8000);
    if (!r.ok) throw new Error(`Instagram HTTP ${r.status}`);
    const html = await r.text();
    const jsonBlocks = [];
    const jRx = /<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi;
    let jm;
    while ((jm = jRx.exec(html)) !== null) { try { jsonBlocks.push(JSON.parse(jm[1])); } catch {} }
    const findInObj = (obj, depth = 0) => {
      if (!obj || typeof obj !== 'object' || depth > 8) return null;
      if (obj.edge_followed_by?.count !== undefined) return obj;
      for (const v of Object.values(obj)) { const r2 = findInObj(v, depth + 1); if (r2) return r2; }
      return null;
    };
    for (const block of jsonBlocks) {
      const user = findInObj(block);
      if (user) return { platform: 'Instagram', url: cleanUrl, username: user.username, fullName: user.full_name, bio: user.biography, followers: user.edge_followed_by?.count, following: user.edge_follow?.count, posts: user.edge_owner_to_timeline_media?.count, isVerified: user.is_verified, fetchedAt: new Date().toISOString(), method: 'html-json' };
    }
    const followersM = html.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+Followers/i) || html.match(/"edge_followed_by":\{"count":(\d+)/);
    const postsM     = html.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+Posts/i)     || html.match(/"edge_owner_to_timeline_media":\{"count":(\d+)/);
    const nameM      = html.match(/<title>([^<]+)<\/title>/i);
    const bioM       = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
    return { platform: 'Instagram', url: cleanUrl, username: username || null, fullName: nameM ? socialStripHtml(nameM[1]).replace(/\s*•\s*Instagram.*$/i, '').trim() : null, bio: bioM ? socialStripHtml(bioM[1]) : null, followers: followersM ? socialParseCount(followersM[1]) : null, posts: postsM ? socialParseCount(postsM[1]) : null, fetchedAt: new Date().toISOString(), method: 'regex' };
  } catch (e) { return { platform: 'Instagram', url, error: e.message, fetchedAt: new Date().toISOString() }; }
}

async function scrapeSocialFacebook(profileUrl) {
  const url       = profileUrl || FALLBACK_FB;
  const mobileUrl = url.replace('www.facebook.com', 'm.facebook.com').replace('//facebook.com', '//m.facebook.com');
  try {
    const r = await socialFetchT(mobileUrl, { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' }, 8000);
    if (!r.ok) throw new Error(`Facebook HTTP ${r.status}`);
    const html       = await r.text();
    const nameM      = html.match(/<title>([^<]+)<\/title>/i);
    const name       = nameM ? socialStripHtml(nameM[1]).replace(/\s*[-|].*$/, '').trim() : null;
    const followersM = html.match(/\b([\d,]+(?:\.\d+)?[KkMm]?)\s+(?:people\s+)?(?:follow|followers|likes)\b/i) || html.match(/([\d,]+)\s+Followers/i) || html.match(/"follower_count"\s*:\s*(\d+)/i) || html.match(/([\d,.]+[KkMm]?)\s+(?:like|follow)/i);
    const likesM     = html.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+(?:people\s+)?like\s+this/i) || html.match(/"like_count"\s*:\s*(\d+)/i);
    const catM       = html.match(/class="[^"]*page-category[^"]*"[^>]*>([^<]+)/i) || html.match(/"category"\s*:\s*"([^"]+)"/i);
    const aboutM     = html.match(/id="[^"]*about[^"]*"[^>]*>([\s\S]{0,400})/i);
    const about      = aboutM ? socialStripHtml(aboutM[1]).slice(0, 200) : null;
    const metaM      = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
    const metaDesc   = metaM ? metaM[1] : null;
    const metaFollM  = metaDesc?.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+follower/i);
    return { platform: 'Facebook', url: url.replace('m.facebook.com', 'www.facebook.com'), name, followers: followersM ? socialParseCount(followersM[1]) : metaFollM ? socialParseCount(metaFollM[1]) : null, likes: likesM ? socialParseCount(likesM[1]) : null, category: catM ? socialStripHtml(catM[1]).trim() : null, about: about || (metaDesc ? socialStripHtml(metaDesc).slice(0, 200) : null), fetchedAt: new Date().toISOString() };
  } catch (e) { return { platform: 'Facebook', url, error: e.message, fetchedAt: new Date().toISOString() }; }
}

async function scrapeTikTokPublic(profileUrl) {
  const url    = profileUrl || FALLBACK_TT;
  const handle = url.match(/@([^/?#]+)/)?.[1] || url.split('/').filter(Boolean).pop();
  const cleanUrl = `https://www.tiktok.com/@${handle}`;
  try {
    const r = await socialFetchT(cleanUrl, { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36' }, 9000);
    if (!r.ok) throw new Error(`TikTok HTTP ${r.status}`);
    const html = await r.text();
    const dataM = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i) || html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (dataM) {
      try {
        const json = JSON.parse(dataM[1]);
        const findUser = (obj, d = 0) => {
          if (!obj || typeof obj !== 'object' || d > 10) return null;
          if (obj.userInfo?.user && obj.userInfo?.stats) return obj.userInfo;
          if (obj.user?.stats?.followerCount !== undefined) return obj;
          for (const v of Object.values(obj)) { const r2 = findUser(v, d + 1); if (r2) return r2; }
          return null;
        };
        const found = findUser(json);
        if (found) {
          const user  = found.user  || found.userInfo?.user;
          const stats = found.stats || found.userInfo?.stats;
          if (user || stats) return { platform: 'TikTok', url: cleanUrl, username: user?.uniqueId || handle, nickname: user?.nickname, bio: user?.signature, followers: stats?.followerCount, following: stats?.followingCount, likes: stats?.heartCount || stats?.heart, videos: stats?.videoCount, isVerified: user?.verified, fetchedAt: new Date().toISOString(), method: 'json' };
        }
      } catch {}
    }
    const ldRx = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let ldM;
    while ((ldM = ldRx.exec(html)) !== null) {
      try {
        const ld = JSON.parse(ldM[1]);
        if (ld.interactionStatistic || ld.author) {
          const followers = [].concat(ld.interactionStatistic || []).find(s => s.interactionType?.includes('Follow'))?.userInteractionCount;
          return { platform: 'TikTok', url: cleanUrl, username: handle, nickname: ld.author?.name || ld.name, bio: ld.description, followers: followers || null, fetchedAt: new Date().toISOString(), method: 'json-ld' };
        }
      } catch {}
    }
    const followersM = html.match(/"followerCount":\s*(\d+)/) || html.match(/([\d.]+[KkMm]?)\s+Followers/i);
    const likesM     = html.match(/"heartCount":\s*(\d+)/) || html.match(/"heart":\s*(\d+)/);
    const videosM    = html.match(/"videoCount":\s*(\d+)/);
    const nameM      = html.match(/<title>([^<]+)<\/title>/i);
    const bioM       = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
    return { platform: 'TikTok', url: cleanUrl, username: handle, nickname: nameM ? socialStripHtml(nameM[1]).replace(/\s*[-|].*$/, '').trim() : null, bio: bioM ? socialStripHtml(bioM[1]).slice(0, 200) : null, followers: followersM ? socialParseCount(followersM[1]) : null, likes: likesM ? socialParseCount(likesM[1]) : null, videos: videosM ? parseInt(videosM[1]) : null, fetchedAt: new Date().toISOString(), method: 'regex' };
  } catch (e) { return { platform: 'TikTok', url: cleanUrl, error: e.message, fetchedAt: new Date().toISOString() }; }
}

async function handleSocial(req, res) {
  const { platform, fbUrl, igUrl, ttUrl } = req.query;
  try {
    if (platform === 'instagram') return res.status(200).json({ ok: true, instagram: await scrapeInstagram(igUrl) });
    if (platform === 'facebook')  return res.status(200).json({ ok: true, facebook:  await scrapeSocialFacebook(fbUrl) });
    if (platform === 'tiktok')    return res.status(200).json({ ok: true, tiktok:    await scrapeTikTokPublic(ttUrl) });
    const [facebook, instagram, tiktok] = await Promise.all([
      scrapeSocialFacebook(fbUrl).catch(e => ({ platform: 'Facebook',  error: e.message })),
      scrapeInstagram(igUrl).catch(e     => ({ platform: 'Instagram', error: e.message })),
      scrapeTikTokPublic(ttUrl).catch(e  => ({ platform: 'TikTok',    error: e.message })),
    ]);
    return res.status(200).json({ ok: true, fetchedAt: new Date().toISOString(), facebook, instagram, tiktok });
  } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
}

// ═══════════════════════════════════════════════════════════════════════════
// TIKTOK — OAuth2 + API proxy
// ═══════════════════════════════════════════════════════════════════════════

async function handleTiktok(req, res) {
  const CLIENT_KEY    = process.env.TIKTOK_CLIENT_KEY    || 'aw6m6kygsji67pla';
  const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
  const REDIRECT_URI  = process.env.TIKTOK_REDIRECT_URI;
  const { action, code, state, token } = req.query;

  if (action === 'login') {
    const url = new URL('https://www.tiktok.com/v2/auth/authorize/');
    url.searchParams.set('client_key',    CLIENT_KEY);
    url.searchParams.set('scope',         'user.info.basic,video.list');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri',  REDIRECT_URI);
    url.searchParams.set('state',         state || 'dmd');
    return res.redirect(url.toString());
  }

  if (code) {
    if (!CLIENT_SECRET || !REDIRECT_URI)
      return res.redirect('/?tiktok_error=Server+not+configured+-+set+TIKTOK_CLIENT_SECRET+and+TIKTOK_REDIRECT_URI+in+Vercel+env');
    try {
      const tokenRes  = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
        body:    new URLSearchParams({ client_key: CLIENT_KEY, client_secret: CLIENT_SECRET, code, grant_type: 'authorization_code', redirect_uri: REDIRECT_URI }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        const msg = tokenData.error_description || tokenData.message || 'Token exchange failed';
        return res.redirect(`/?tiktok_error=${encodeURIComponent(msg)}`);
      }
      const accessToken  = tokenData.access_token;
      const refreshToken = tokenData.refresh_token || null;
      const openId       = tokenData.open_id;
      const userRes      = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=display_name,follower_count,following_count,video_count,likes_count,avatar_url', { headers: { Authorization: `Bearer ${accessToken}` } });
      const userData     = await userRes.json();
      const videoRes     = await fetch('https://open.tiktokapis.com/v2/video/list/?fields=id,title,view_count,like_count,comment_count,share_count,create_time,cover_image_url', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ max_count: 20 }) });
      const videoData    = await videoRes.json();
      const videos       = videoData.data?.videos || [];
      const payload = { accessToken, refreshToken, openId, displayName: userData.data?.user?.display_name, avatarUrl: userData.data?.user?.avatar_url, followers: userData.data?.user?.follower_count || 0, videoCount: userData.data?.user?.video_count || 0, totalLikes: userData.data?.user?.likes_count || 0, recentPosts: videos.length, recentViews: videos.reduce((s, v) => s + (v.view_count || 0), 0), recentLikes: videos.reduce((s, v) => s + (v.like_count || 0), 0), recentComments: videos.reduce((s, v) => s + (v.comment_count || 0), 0), recentShares: videos.reduce((s, v) => s + (v.share_count || 0), 0), videos: videos.slice(0, 10), connectedAt: new Date().toISOString() };
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return res.redirect(`/?tiktok_data=${encoded}`);
    } catch (e) { return res.redirect(`/?tiktok_error=${encodeURIComponent(e.message)}`); }
  }

  if (action === 'refresh' && token) {
    try {
      const { refreshToken: storedRefresh } = req.query;
      let activeToken = token;
      if (storedRefresh && CLIENT_SECRET) {
        const reTokenRes  = await fetch('https://open.tiktokapis.com/v2/oauth/token/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' }, body: new URLSearchParams({ client_key: CLIENT_KEY, client_secret: CLIENT_SECRET, grant_type: 'refresh_token', refresh_token: storedRefresh }) });
        const reTokenData = await reTokenRes.json();
        if (reTokenData.access_token) activeToken = reTokenData.access_token;
      }
      const [userRes, videoRes] = await Promise.all([
        fetch('https://open.tiktokapis.com/v2/user/info/?fields=display_name,follower_count,video_count,likes_count', { headers: { Authorization: `Bearer ${activeToken}` } }),
        fetch('https://open.tiktokapis.com/v2/video/list/?fields=id,title,view_count,like_count,comment_count,share_count', { method: 'POST', headers: { Authorization: `Bearer ${activeToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ max_count: 20 }) }),
      ]);
      const userData  = await userRes.json();
      const videoData = await videoRes.json();
      const videos    = videoData.data?.videos || [];
      return res.json({ ok: true, displayName: userData.data?.user?.display_name, followers: userData.data?.user?.follower_count || 0, videoCount: userData.data?.user?.video_count || 0, totalLikes: userData.data?.user?.likes_count || 0, recentPosts: videos.length, recentViews: videos.reduce((s, v) => s + (v.view_count || 0), 0), recentLikes: videos.reduce((s, v) => s + (v.like_count || 0), 0), recentComments: videos.reduce((s, v) => s + (v.comment_count || 0), 0), recentShares: videos.reduce((s, v) => s + (v.share_count || 0), 0), videos: videos.slice(0, 10) });
    } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
  }

  return res.status(400).json({ error: 'Invalid request' });
}

// ═══════════════════════════════════════════════════════════════════════════
// YOUTUBE — Data API v3 proxy
// ═══════════════════════════════════════════════════════════════════════════

async function handleYoutube(req, res) {
  const apiKey = process.env.YOUTUBE_API_KEY || req.query.apiKey;
  const { action, channelId, videoId, handle } = req.query;

  if (!apiKey) return res.status(400).json({ ok: false, error: 'Missing API key — set YOUTUBE_API_KEY in Vercel env vars or pass ?apiKey=' });

  const resolveHandle = async (h) => {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id,snippet&forHandle=${encodeURIComponent(h)}&key=${apiKey}`);
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    return d.items?.[0]?.id || null;
  };

  const fetchChannelData = async (cid) => {
    const chRes  = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${cid}&key=${apiKey}`);
    const chData = await chRes.json();
    if (chData.error) throw new Error(chData.error.message);
    if (!chData.items?.length) throw new Error('Channel not found');
    const ch = chData.items[0];
    const stats = ch.statistics || {};
    let recentVideos = [];
    let plId = ch.contentDetails?.relatedPlaylists?.uploads;
    if (!plId && stats.videoCount > 0) {
      const chFull  = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${cid}&key=${apiKey}`);
      const chFData = await chFull.json();
      plId = chFData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    }
    if (plId) {
      const plRes  = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${plId}&maxResults=10&key=${apiKey}`);
      const plData = await plRes.json();
      const vids   = (plData.items || []).map(i => i.snippet?.resourceId?.videoId).filter(Boolean);
      if (vids.length) {
        const statsRes  = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${vids.join(',')}&key=${apiKey}`);
        const statsData = await statsRes.json();
        recentVideos = (statsData.items || []).map(v => ({ id: v.id, title: v.snippet?.title, publishedAt: v.snippet?.publishedAt, thumbnail: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url, views: Number(v.statistics?.viewCount || 0), likes: Number(v.statistics?.likeCount || 0), comments: Number(v.statistics?.commentCount || 0) }));
      }
    }
    return { ok: true, channelId: cid, channelName: ch.snippet?.title, description: ch.snippet?.description?.slice(0, 200), thumbnail: ch.snippet?.thumbnails?.default?.url, country: ch.snippet?.country, subscribers: Number(stats.subscriberCount || 0), totalViews: Number(stats.viewCount || 0), videoCount: Number(stats.videoCount || 0), recentVideos };
  };

  try {
    if (!action || action === 'data') {
      let cid = channelId;
      if (!cid && handle) { cid = await resolveHandle(handle); if (!cid) return res.status(404).json({ ok: false, error: `Handle "${handle}" not found` }); }
      if (!cid) return res.status(400).json({ ok: false, error: 'Pass channelId=UCxxx or handle=@YourChannel' });
      return res.status(200).json(await fetchChannelData(cid));
    }
    if (action === 'video') {
      if (!videoId) return res.status(400).json({ ok: false, error: 'Pass videoId=xxx' });
      const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`);
      const d = await r.json();
      if (d.error) return res.status(400).json({ ok: false, error: d.error.message });
      const v = d.items?.[0];
      if (!v) return res.status(404).json({ ok: false, error: 'Video not found' });
      return res.status(200).json({ ok: true, id: v.id, title: v.snippet?.title, publishedAt: v.snippet?.publishedAt, views: Number(v.statistics?.viewCount || 0), likes: Number(v.statistics?.likeCount || 0), comments: Number(v.statistics?.commentCount || 0) });
    }
    return res.status(400).json({ ok: false, error: `Unknown action "${action}"` });
  } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEWS — Live review score scraper for all major platforms
// ═══════════════════════════════════════════════════════════════════════════

const reviewFetchH = (url, extraHeaders = {}, ms = 9000) =>
  fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.9', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', ...extraHeaders },
    redirect: 'follow',
    signal:   AbortSignal.timeout(ms),
  });

function reviewGetJsonLd(html) {
  const out = [];
  const rx = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = rx.exec(html))) { try { out.push(JSON.parse(m[1])); } catch {} }
  return out;
}

function reviewFindAggRating(items) {
  const walk = (o) => {
    if (!o || typeof o !== 'object') return null;
    if (o.aggregateRating) {
      const ar = o.aggregateRating;
      const rating = parseFloat(ar.ratingValue);
      const count  = parseInt(ar.reviewCount ?? ar.ratingCount ?? ar.userInteractionCount ?? 0);
      if (!isNaN(rating)) return { rating, reviewCount: isNaN(count) ? null : count };
    }
    if (Array.isArray(o['@graph'])) for (const i of o['@graph']) { const r = walk(i); if (r) return r; }
    return null;
  };
  for (const s of items) { const r = walk(s); if (r) return r; }
  return null;
}

const reviewNum = (s = '') => { const n = parseInt(String(s).replace(/,/g, '')); return isNaN(n) ? null : n; };

async function scrapeReviewGoogle(opts = {}) {
  const apiKey  = opts.apiKey  || process.env.GOOGLE_PLACES_KEY;
  const placeId = opts.placeId || process.env.GOOGLE_PLACE_ID;
  if (apiKey && placeId) {
    const detR = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,rating,user_ratings_total,url&key=${apiKey}`, { signal: AbortSignal.timeout(8000) });
    const detD = await detR.json();
    const r = detD.result;
    if (r?.rating != null) return { rating: r.rating, reviewCount: r.user_ratings_total ?? null, source: 'Google Places API', url: r.url || `https://search.google.com/local/reviews?placeid=${placeId}` };
  }
  if (apiKey) {
    const q     = encodeURIComponent('Destiny Springs Healthcare Scottsdale AZ');
    const findR = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${q}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total&key=${apiKey}`, { signal: AbortSignal.timeout(8000) });
    const findD = await findR.json();
    const c = findD.candidates?.[0];
    if (c?.rating != null) return { rating: c.rating, reviewCount: c.user_ratings_total ?? null, source: 'Google Places API', url: c.place_id ? `https://search.google.com/local/reviews?placeid=${c.place_id}` : 'https://www.google.com/maps/search/Destiny+Springs+Healthcare+Scottsdale+AZ' };
  }
  const q    = encodeURIComponent('Destiny Springs Healthcare Scottsdale AZ reviews');
  const r    = await reviewFetchH(`https://www.google.com/search?q=${q}&hl=en&num=3`, { 'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36' });
  if (!r.ok) throw new Error(`Google HTTP ${r.status}`);
  const html  = await r.text();
  const aria  = html.match(/aria-label=["'][Rr]ated?\s*([\d.]+)[^"']*\(([\d,]+)\s+review/i);
  if (aria) return { rating: parseFloat(aria[1]), reviewCount: reviewNum(aria[2]), source: 'Google Search', url: 'https://www.google.com/search?q=Destiny+Springs+Healthcare+reviews' };
  const ld = reviewFindAggRating(reviewGetJsonLd(html));
  if (ld) return { ...ld, source: 'Google Search', url: 'https://www.google.com/search?q=Destiny+Springs+Healthcare+reviews' };
  const inline = html.match(/([\d.]{3,})\s*(?:★|\()\s*(?:[^)]{0,60})?\(?([\d,]+)\s*(?:Google\s+)?reviews?/i);
  if (inline) return { rating: parseFloat(inline[1]), reviewCount: reviewNum(inline[2]), source: 'Google Search', url: 'https://www.google.com/search?q=Destiny+Springs+Healthcare+reviews' };
  const gErr = new Error('Google rating not found — add GOOGLE_PLACES_KEY to Vercel env vars for reliable data, or enter manually');
  gErr.reviewUrl = 'https://www.google.com/maps/search/Destiny+Springs+Healthcare+Scottsdale+AZ';
  throw gErr;
}

async function scrapeReviewYelp(opts = {}) {
  const apiKey     = opts.apiKey     || process.env.YELP_API_KEY;
  const businessId = opts.businessId || process.env.DS_YELP_ID || 'destiny-springs-healthcare-surprise';
  if (!apiKey) {
    const yErr = new Error('Connect your Yelp API key in the Integrations tab (or set YELP_API_KEY in Vercel env vars) — or enter your rating manually');
    yErr.reviewUrl = `https://www.yelp.com/biz/${businessId}`;
    throw yErr;
  }
  const r = await fetch(`https://api.yelp.com/v3/businesses/${encodeURIComponent(businessId)}`, { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(8000) });
  const d = await r.json();
  if (d.error) throw new Error(d.error.description || d.error.code);
  return { rating: d.rating, reviewCount: d.review_count, source: 'Yelp Fusion API', url: d.url };
}

async function scrapeReviewGlassdoor(opts = {}) {
  const slug    = opts.slug || process.env.DS_GLASSDOOR_SLUG || 'Destiny-Springs-Healthcare-Reviews-E3272383';
  const baseUrl = `https://www.glassdoor.com/Reviews/${slug}.htm`;
  const urls    = [baseUrl, `https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent('Destiny Springs Healthcare')}&locT=N&locId=0`];
  for (const url of urls) {
    try {
      const r = await reviewFetchH(url, {}, 9000);
      if (!r.ok) continue;
      const html = await r.text();
      const ld = reviewFindAggRating(reviewGetJsonLd(html));
      if (ld) return { ...ld, source: 'Glassdoor', url };
      const rM = html.match(/"overallRating"\s*:\s*([\d.]+)/i) || html.match(/class="[^"]*rating[^"]*"[^>]*>\s*([\d.]+)\s*<\/span>/i) || html.match(/"ratingValue"\s*:\s*"?([\d.]+)/i);
      const cM = html.match(/([\d,]+)\s+(?:reviews?|ratings?)/i);
      if (rM) return { rating: parseFloat(rM[1]), reviewCount: cM ? reviewNum(cM[1]) : null, source: 'Glassdoor', url };
    } catch {}
  }
  const gdErr = new Error('Glassdoor blocks automated access — enter your rating manually');
  gdErr.reviewUrl = `https://www.glassdoor.com/Reviews/${slug}.htm`;
  throw gdErr;
}

async function scrapeReviewIndeed(opts = {}) {
  const slug = opts.slug || process.env.DS_INDEED_SLUG || 'Destiny-Springs-Healthcare';
  const url  = `https://www.indeed.com/cmp/${slug}`;
  const r    = await reviewFetchH(url, {}, 9000);
  if (!r.ok) {
    const iErr = new Error(`Indeed blocks automated access (HTTP ${r.status}) — enter your rating manually`);
    iErr.reviewUrl = url;
    throw iErr;
  }
  const html = await r.text();
  const ld = reviewFindAggRating(reviewGetJsonLd(html));
  if (ld) return { ...ld, source: 'Indeed', url };
  const ndM = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (ndM) {
    try {
      const nd    = JSON.parse(ndM[1]);
      const props = nd?.props?.pageProps?.cmpProfile || nd?.props?.pageProps;
      const rating = props?.overallRating ?? props?.rating;
      const count  = props?.numReviews ?? props?.reviewCount;
      if (rating != null) return { rating: parseFloat(rating), reviewCount: count ? Number(count) : null, source: 'Indeed', url };
    } catch {}
  }
  const rM = html.match(/"ratingValue"\s*:\s*"?([\d.]+)/i) || html.match(/aria-label="([\d.]+) out of 5/i) || html.match(/data-testid="[^"]*rating[^"]*"[^>]*>([\d.]+)/i);
  const cM = html.match(/([\d,]+)\s+(?:reviews?|ratings?)/i);
  if (rM) return { rating: parseFloat(rM[1]), reviewCount: cM ? reviewNum(cM[1]) : null, source: 'Indeed', url };
  const iErr = new Error('Indeed rating not found — enter your rating manually');
  iErr.reviewUrl = `https://www.indeed.com/cmp/${slug}`;
  throw iErr;
}

async function scrapeReviewHealthgrades(opts = {}) {
  const directUrl  = process.env.DS_HEALTHGRADES_URL;
  const urlsToTry  = directUrl ? [directUrl] : [
    'https://www.healthgrades.com/group-directory/az-arizona/scottsdale/destiny-springs-healthcare',
    'https://www.healthgrades.com/group-directory/az-arizona/surprise/destiny-springs-healthcare',
    `https://www.healthgrades.com/search-results?what=${encodeURIComponent('Destiny Springs Healthcare')}&city=${encodeURIComponent('Scottsdale')}&state=AZ`,
    `https://www.healthgrades.com/search?what=${encodeURIComponent('Destiny Springs Healthcare')}&where=${encodeURIComponent('Scottsdale, AZ')}`,
  ];
  for (const url of urlsToTry) {
    try {
      const r1    = await reviewFetchH(url, {}, 9000);
      if (!r1.ok) continue;
      const html1 = await r1.text();
      const linkM = html1.match(/href="(\/group-directory\/[^"?#]+)/i) || html1.match(/href="(\/hospital-directory\/[^"?#]+)/i) || html1.match(/href="(\/facility-directory\/[^"?#]+)/i) || html1.match(/href="(\/physician\/[^"?#]+)/i);
      const profileUrl    = linkM ? 'https://www.healthgrades.com' + linkM[1] : url;
      const htmlToCheck   = linkM ? await (async () => { const r2 = await reviewFetchH(profileUrl, {}, 9000); if (!r2.ok) return null; return r2.text(); })() : html1;
      if (!htmlToCheck) continue;
      const ld = reviewFindAggRating(reviewGetJsonLd(htmlToCheck));
      if (ld) return { ...ld, source: 'Healthgrades', url: profileUrl };
      const rM = htmlToCheck.match(/"ratingValue"\s*:\s*"?([\d.]+)/i) || htmlToCheck.match(/aria-label="Rating:\s*([\d.]+)/i) || htmlToCheck.match(/"overallRating"\s*:\s*([\d.]+)/i);
      const cM = htmlToCheck.match(/"reviewCount"\s*:\s*"?(\d+)/i) || htmlToCheck.match(/([\d,]+)\s+(?:reviews?|ratings?)/i);
      if (rM) return { rating: parseFloat(rM[1]), reviewCount: cM ? reviewNum(cM[1]) : null, source: 'Healthgrades', url: profileUrl };
    } catch {}
  }
  const hErr = new Error('Healthgrades: profile not found — set DS_HEALTHGRADES_URL in Vercel env vars or enter your rating manually');
  hErr.reviewUrl = 'https://www.healthgrades.com/search?what=Destiny+Springs+Healthcare';
  throw hErr;
}

async function scrapeReviewZocdoc(opts = {}) {
  const directUrl = process.env.DS_ZOCDOC_URL;
  const searchUrl = `https://www.zocdoc.com/search?address=Scottsdale%2C+AZ&reason_visit=84&insurance_carrier=-1&search_query=${encodeURIComponent('Destiny Springs')}`;
  const urls = directUrl ? [directUrl, searchUrl] : [searchUrl, 'https://www.zocdoc.com/practice/destiny-springs-healthcare'];
  for (const url of urls) {
    try {
      const r = await reviewFetchH(url, {}, 9000);
      if (!r.ok) continue;
      const html = await r.text();
      const ld   = reviewFindAggRating(reviewGetJsonLd(html));
      if (ld) return { ...ld, source: 'ZocDoc', url };
      const ndM = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
      if (ndM) {
        try {
          const nd   = JSON.parse(ndM[1]);
          const walk = (o) => {
            if (!o || typeof o !== 'object') return null;
            if ('averageRating' in o && 'totalReviews' in o) return { rating: o.averageRating, reviewCount: o.totalReviews };
            if ('rating' in o && 'reviewCount' in o && typeof o.rating === 'number') return { rating: o.rating, reviewCount: o.reviewCount };
            for (const v of Object.values(o)) { const r2 = walk(v); if (r2) return r2; }
            return null;
          };
          const found = walk(nd);
          if (found?.rating) return { ...found, source: 'ZocDoc', url };
        } catch {}
      }
      const rM = html.match(/averageRating["']\s*:\s*([\d.]+)/i) || html.match(/"ratingValue"\s*:\s*"?([\d.]+)/i) || html.match(/aria-label="([\d.]+)\s+(?:out of|star)/i);
      const cM = html.match(/([\d,]+)\s+(?:reviews?|ratings?)/i);
      if (rM) return { rating: parseFloat(rM[1]), reviewCount: cM ? reviewNum(cM[1]) : null, source: 'ZocDoc', url };
    } catch {}
  }
  const zdErr = new Error('ZocDoc: set DS_ZOCDOC_URL env var with your ZocDoc profile URL — or enter manually');
  zdErr.reviewUrl = 'https://www.zocdoc.com/search?address=Scottsdale%2C+AZ&search_query=Destiny+Springs';
  throw zdErr;
}

async function scrapeReviewFacebook(opts = {}) {
  const token  = opts.accessToken || process.env.FACEBOOK_PAGE_TOKEN;
  const pageId = opts.pageId      || process.env.FACEBOOK_PAGE_ID || '61581511228047';
  if (token) {
    const r = await fetch(`https://graph.facebook.com/v18.0/${encodeURIComponent(pageId)}?fields=overall_star_rating,rating_count,name&access_token=${token}`, { signal: AbortSignal.timeout(8000) });
    const d = await r.json();
    if (d.error) throw new Error(`Facebook API: ${d.error.message}`);
    if (d.overall_star_rating != null) return { rating: d.overall_star_rating, reviewCount: d.rating_count ?? null, source: 'Facebook Graph API', url: `https://www.facebook.com/${pageId}/reviews` };
  }
  const fbReviewUrl = /^\d+$/.test(pageId) ? `https://www.facebook.com/profile.php?id=${pageId}&sk=reviews` : `https://www.facebook.com/${pageId}/reviews`;
  const url  = /^\d+$/.test(pageId) ? `https://m.facebook.com/profile.php?id=${pageId}` : `https://m.facebook.com/${pageId}`;
  const r    = await reviewFetchH(url, { Accept: 'text/html' }, 9000);
  if (!r.ok) {
    const fErr = new Error(`Facebook blocks automated access (HTTP ${r.status}) — add FACEBOOK_PAGE_TOKEN to Vercel env vars or enter manually`);
    fErr.reviewUrl = fbReviewUrl;
    throw fErr;
  }
  const html = await r.text();
  const ld   = reviewFindAggRating(reviewGetJsonLd(html));
  if (ld) return { ...ld, source: 'Facebook', url: fbReviewUrl };
  const rM = html.match(/([\d.]+)\s*(?:out of\s*5|★)/i) || html.match(/aggregateRating["']\s*:\s*["']?([\d.]+)/i);
  const cM = html.match(/([\d,]+)\s*(?:reviews?|ratings?|people\s+rated)/i);
  if (rM) return { rating: parseFloat(rM[1]), reviewCount: cM ? reviewNum(cM[1]) : null, source: 'Facebook', url: fbReviewUrl };
  const fErr = new Error('Facebook rating not found — add FACEBOOK_PAGE_TOKEN to Vercel env vars or enter manually');
  fErr.reviewUrl = fbReviewUrl;
  throw fErr;
}

const reviewScrapers = {
  google:       scrapeReviewGoogle,
  yelp:         scrapeReviewYelp,
  glassdoor:    scrapeReviewGlassdoor,
  indeed:       scrapeReviewIndeed,
  healthgrades: scrapeReviewHealthgrades,
  zocdoc:       scrapeReviewZocdoc,
  facebook:     scrapeReviewFacebook,
};

async function handleReviews(req, res) {
  const { platform } = req.query;
  const fetchedAt    = new Date().toISOString();
  if (!platform) return res.status(400).json({ ok: false, error: 'Pass ?platform=google|yelp|glassdoor|indeed|healthgrades|zocdoc|facebook|all' });
  if (platform === 'all') {
    const results = await Promise.allSettled(
      Object.entries(reviewScrapers).map(async ([key, fn]) => {
        const d = await fn(req.query);
        return [key, { ok: true, ...d, fetchedAt }];
      })
    );
    const out = {};
    results.forEach((r, i) => {
      const key = Object.keys(reviewScrapers)[i];
      out[key] = r.status === 'fulfilled' ? r.value[1] : { ok: false, error: r.reason?.message || 'Unknown error', ...(r.reason?.reviewUrl ? { url: r.reason.reviewUrl } : {}), fetchedAt };
    });
    return res.status(200).json({ ok: true, results: out });
  }
  const scraper = reviewScrapers[platform];
  if (!scraper) return res.status(400).json({ ok: false, error: `Unknown platform "${platform}". Valid: ${Object.keys(reviewScrapers).join(', ')}` });
  try {
    const data = await scraper(req.query);
    return res.status(200).json({ ok: true, ...data, fetchedAt });
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message, ...(e.reviewUrl ? { url: e.reviewUrl } : {}), fetchedAt });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// YELP — Yelp Fusion API proxy (business details, reviews, search)
// ═══════════════════════════════════════════════════════════════════════════

async function handleYelp(req, res) {
  const apiKey = process.env.YELP_API_KEY || req.query.apiKey;
  if (!apiKey) return res.status(400).json({ ok: false, error: 'Missing API key — set YELP_API_KEY in Vercel env vars or pass ?apiKey=' });

  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  const { action, businessId, term, location, limit = '10' } = req.query;

  try {
    if (!action || action === 'data') {
      if (!businessId) return res.status(400).json({ ok: false, error: 'Pass businessId=your-yelp-business-slug' });
      const r = await fetch(`https://api.yelp.com/v3/businesses/${encodeURIComponent(businessId)}`, { headers });
      const d = await r.json();
      if (d.error) return res.status(400).json({ ok: false, error: d.error.description || d.error.code });
      return res.status(200).json({ ok: true, id: d.id, name: d.name, rating: d.rating, reviewCount: d.review_count, url: d.url, phone: d.display_phone, address: d.location?.display_address?.join(', '), categories: (d.categories || []).map(c => c.title).join(', '), photos: (d.photos || []).slice(0, 3), isClaimed: d.is_claimed, isClosed: d.is_closed, hours: d.hours?.[0]?.open?.map(h => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][h.day], start: h.start, end: h.end })) || [], priceRange: d.price || '—', coordinates: d.coordinates });
    }
    if (action === 'reviews') {
      if (!businessId) return res.status(400).json({ ok: false, error: 'Pass businessId=xxx' });
      const r = await fetch(`https://api.yelp.com/v3/businesses/${encodeURIComponent(businessId)}/reviews?sort_by=newest`, { headers });
      const d = await r.json();
      if (d.error) return res.status(400).json({ ok: false, error: d.error.description || d.error.code });
      return res.status(200).json({ ok: true, total: d.total, reviews: (d.reviews || []).map(rv => ({ id: rv.id, rating: rv.rating, text: rv.text, timeCreated: rv.time_created, user: { name: rv.user?.name, imageUrl: rv.user?.image_url, profileUrl: rv.user?.profile_url }, url: rv.url })) });
    }
    if (action === 'search') {
      const params = new URLSearchParams({ term: term || 'mental health', location: location || 'Scottsdale, AZ', limit: String(Math.min(Number(limit), 50)), sort_by: 'best_match' });
      const r = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, { headers });
      const d = await r.json();
      if (d.error) return res.status(400).json({ ok: false, error: d.error.description || d.error.code });
      return res.status(200).json({ ok: true, total: d.total, businesses: (d.businesses || []).map(b => ({ id: b.id, name: b.name, rating: b.rating, reviewCount: b.review_count, address: b.location?.display_address?.join(', '), phone: b.display_phone, url: b.url, categories: (b.categories || []).map(c => c.title).join(', '), distance: b.distance ? (b.distance / 1609.34).toFixed(1) + ' mi' : null })) });
    }
    return res.status(400).json({ ok: false, error: `Unknown action "${action}"` });
  } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
}

// ═══════════════════════════════════════════════════════════════════════════
// NEWS — News API proxy + web page metadata scraper
// ═══════════════════════════════════════════════════════════════════════════

function extractMeta(html, sourceUrl) {
  const get = (pattern) => { const m = html.match(pattern); return m ? m[1].trim() : null; };
  const title    = get(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitle  = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i) || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title/i);
  const ogDesc   = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i) || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description/i);
  const metaDesc = get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i) || get(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description/i);
  const ogImage  = get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i) || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image/i);
  const canonical = get(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i);
  const keywords  = get(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)/i) || get(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']keywords/i);
  const favicon   = get(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)/i) || get(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);
  const h1Match  = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1       = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null;
  const h2s = []; const h2Rx = /<h2[^>]*>([\s\S]*?)<\/h2>/gi; let h2m;
  while ((h2m = h2Rx.exec(html)) !== null && h2s.length < 8) { const t = h2m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); if (t) h2s.push(t); }
  const h3s = []; const h3Rx = /<h3[^>]*>([\s\S]*?)<\/h3>/gi; let h3m;
  while ((h3m = h3Rx.exec(html)) !== null && h3s.length < 5) { const t = h3m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); if (t) h3s.push(t); }
  const phones = []; const phoneRx = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g; let pm;
  while ((pm = phoneRx.exec(html)) !== null && phones.length < 5) phones.push(pm[0]);
  const emails = []; const emailRx = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g; let em;
  while ((em = emailRx.exec(html)) !== null && emails.length < 5) { if (!em[0].includes('example') && !em[0].includes('test')) emails.push(em[0]); }
  const socials = {};
  const socialPatterns = [['facebook', /<a[^>]+href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'\s?#>]+)/i], ['instagram', /<a[^>]+href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'\s?#>]+)/i], ['twitter', /<a[^>]+href=["'](https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^"'\s?#>]+)/i], ['linkedin', /<a[^>]+href=["'](https?:\/\/(?:www\.)?linkedin\.com\/[^"'\s?#>]+)/i], ['youtube', /<a[^>]+href=["'](https?:\/\/(?:www\.)?youtube\.com\/[^"'\s?#>]+)/i], ['tiktok', /<a[^>]+href=["'](https?:\/\/(?:www\.)?tiktok\.com\/[^"'\s?#>]+)/i], ['pinterest', /<a[^>]+href=["'](https?:\/\/(?:www\.)?pinterest\.com\/[^"'\s?#>]+)/i]];
  for (const [name, rx] of socialPatterns) { const m = html.match(rx); if (m) socials[name] = m[1]; }
  const lower = html.toLowerCase();
  const allServiceKw = ['detox','medical detox','residential','inpatient','outpatient','iop','intensive outpatient','php','partial hospitalization','sober living','mental health','behavioral health','addiction','substance abuse','substance use disorder','dual diagnosis','co-occurring','telehealth','teletherapy','trauma','ptsd','anxiety','depression','bipolar','eating disorder','ocd','recovery','therapy','counseling','psychiatry','medication assisted','mat treatment','suboxone','vivitrol','family therapy','group therapy','12-step','holistic','crisis stabilization','case management','aftercare','alumni program'];
  const servicesFound = allServiceKw.filter(k => lower.includes(k));
  const techStack = [];
  if (html.includes('wp-content') || html.includes('wp-includes'))      techStack.push('WordPress');
  if (html.includes('wix.com') || /wixsite\.com/.test(html))            techStack.push('Wix');
  if (html.includes('squarespace.com') || html.includes('squarespace-cdn')) techStack.push('Squarespace');
  if (html.includes('webflow.io') || html.includes('webflow.com'))      techStack.push('Webflow');
  if (html.includes('_next/static') || html.includes('__NEXT_DATA__'))  techStack.push('Next.js');
  if (html.includes('data-reactroot') || html.includes('__reactFiber')) techStack.push('React');
  if (html.includes('gtag(') || html.includes('google-analytics.com')) techStack.push('Google Analytics');
  if (html.includes('fbevents.js') || html.includes('facebook.net/en_US/fbevents')) techStack.push('Meta Pixel');
  if (html.includes('hotjar'))   techStack.push('Hotjar');
  if (html.includes('intercom')) techStack.push('Intercom');
  if (html.includes('hubspot'))  techStack.push('HubSpot');
  if (html.includes('drift.com') || html.includes('driftt.com')) techStack.push('Drift');
  if (html.includes('clarity.ms')) techStack.push('MS Clarity');
  let schemaRating = null, schemaReviewCount = null, schemaAddress = null, schemaName = null;
  const jsonLdRx2 = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi; let jm2;
  while ((jm2 = jsonLdRx2.exec(html)) !== null) {
    try {
      const obj = JSON.parse(jm2[1].trim());
      const items = Array.isArray(obj) ? obj : [obj];
      for (const item of items) {
        if (!schemaName && item.name) schemaName = item.name;
        if (!schemaRating && item.aggregateRating) { schemaRating = item.aggregateRating.ratingValue; schemaReviewCount = item.aggregateRating.reviewCount || item.aggregateRating.ratingCount; }
        if (!schemaAddress && item.address) { const a = item.address; schemaAddress = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode].filter(Boolean).join(', '); }
      }
    } catch {}
  }
  const stripped  = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const wordCount = stripped.split(' ').filter(w => w.length > 2).length;
  const linkCount = (html.match(/<a\s[^>]*href=/gi) || []).length;
  return { url: canonical || sourceUrl, title: ogTitle || title, description: ogDesc || metaDesc, image: ogImage, favicon, keywords, h1, h2s, h3s, phones: [...new Set(phones)], emails: [...new Set(emails)], socials, servicesFound, techStack, schemaName, schemaRating, schemaReviewCount, schemaAddress, wordCount, linkCount, scraped: new Date().toISOString() };
}

function parseRSS(xml) {
  const isAtom = xml.includes('<feed');
  const items  = [];
  const itemPattern = isAtom ? /<entry>([\s\S]*?)<\/entry>/gi : /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemPattern.exec(xml)) !== null && items.length < 20) {
    const block = m[1];
    const g = (rx) => { const r = block.match(rx); return r ? r[1].trim() : null; };
    const title   = g(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const link    = g(/<link[^>]*>([^<]+)<\/link>/i) || (block.match(/<link[^>]+href=["']([^"']+)["']/i) || [])[1];
    const pubDate = g(/<pubDate>([\s\S]*?)<\/pubDate>/i) || g(/<published>([\s\S]*?)<\/published>/i) || g(/<updated>([\s\S]*?)<\/updated>/i);
    const desc    = g(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) || g(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i);
    if (title || link) items.push({ title: title?.replace(/\s+/g, ' '), link, pubDate, description: desc?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 300) });
  }
  return items;
}

async function handleNews(req, res) {
  const newsApiKey = process.env.NEWS_API_KEY || req.query.apiKey;
  const { action, q, category, country, pageSize, url } = req.query;
  try {
    if (!action || action === 'news') {
      if (!newsApiKey) return res.status(400).json({ ok: false, error: 'Missing NEWS_API_KEY env var or ?apiKey= query param. Register free at newsapi.org.' });
      const params = new URLSearchParams({ q: q || 'mental health Arizona', pageSize: String(Math.min(Number(pageSize) || 10, 20)), language: 'en', sortBy: 'publishedAt', apiKey: newsApiKey });
      const r = await fetch(`https://newsapi.org/v2/everything?${params}`);
      const d = await r.json();
      if (d.status !== 'ok') return res.status(400).json({ ok: false, error: d.message || 'newsapi.org error' });
      return res.status(200).json({ ok: true, totalResults: d.totalResults, articles: (d.articles || []).map(a => ({ title: a.title, description: a.description, url: a.url, urlToImage: a.urlToImage, source: a.source?.name, publishedAt: a.publishedAt, author: a.author })) });
    }
    if (action === 'headlines') {
      if (!newsApiKey) return res.status(400).json({ ok: false, error: 'Missing NEWS_API_KEY or ?apiKey=' });
      const params = new URLSearchParams({ country: country || 'us', category: category || 'health', pageSize: String(Math.min(Number(pageSize) || 10, 20)), apiKey: newsApiKey });
      const r = await fetch(`https://newsapi.org/v2/top-headlines?${params}`);
      const d = await r.json();
      if (d.status !== 'ok') return res.status(400).json({ ok: false, error: d.message || 'newsapi.org error' });
      return res.status(200).json({ ok: true, totalResults: d.totalResults, articles: (d.articles || []).map(a => ({ title: a.title, description: a.description, url: a.url, urlToImage: a.urlToImage, source: a.source?.name, publishedAt: a.publishedAt, author: a.author })) });
    }
    if (action === 'scrape') {
      if (!url) return res.status(400).json({ ok: false, error: 'Pass url=https://example.com' });
      try { const u = new URL(url); if (u.hostname === 'localhost' || u.hostname.startsWith('192.168') || u.hostname.startsWith('10.')) return res.status(400).json({ ok: false, error: 'Private URLs not allowed' }); }
      catch { return res.status(400).json({ ok: false, error: 'Invalid URL' }); }
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DMD-Bot/1.0; +https://destinyspringshealthcare.com)', Accept: 'text/html,application/xhtml+xml' }, redirect: 'follow', signal: AbortSignal.timeout(8000) });
      if (!r.ok) return res.status(400).json({ ok: false, error: `HTTP ${r.status} from target URL` });
      const ct = r.headers.get('content-type') || '';
      if (!ct.includes('html') && !ct.includes('text')) return res.status(400).json({ ok: false, error: 'Target URL does not return HTML' });
      const html = await r.text();
      return res.status(200).json({ ok: true, ...extractMeta(html, url) });
    }
    if (action === 'rss') {
      if (!url) return res.status(400).json({ ok: false, error: 'Pass url=https://example.com/feed.xml' });
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DMD-Bot/1.0)', Accept: 'application/rss+xml, application/atom+xml, text/xml, */*' }, signal: AbortSignal.timeout(8000) });
      if (!r.ok) return res.status(400).json({ ok: false, error: `HTTP ${r.status} from feed URL` });
      const xml   = await r.text();
      const items = parseRSS(xml);
      return res.status(200).json({ ok: true, items });
    }
    return res.status(400).json({ ok: false, error: `Unknown action "${action}". Use news, headlines, scrape, or rss.` });
  } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST — Facebook/Instagram auto-post via Graph API
// ═══════════════════════════════════════════════════════════════════════════

async function handlePost(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const { message, pageId, token, imageUrl, published = true } = req.body || {};
  if (!message) return res.status(400).json({ ok: false, error: 'message is required' });
  if (!pageId)  return res.status(400).json({ ok: false, error: 'pageId is required' });
  if (!token)   return res.status(400).json({ ok: false, error: 'token is required' });
  const BASE_URL = 'https://graph.facebook.com/v18.0';
  try {
    let endpoint, body;
    if (imageUrl) {
      endpoint = `${BASE_URL}/${pageId}/photos`;
      body = new URLSearchParams({ message, url: imageUrl, access_token: token, published: String(published) });
    } else {
      endpoint = `${BASE_URL}/${pageId}/feed`;
      body = new URLSearchParams({ message, access_token: token, published: String(published) });
    }
    const postRes  = await fetch(endpoint, { method: 'POST', body });
    const postData = await postRes.json();
    if (postData.error) return res.status(400).json({ ok: false, error: postData.error.message || 'Facebook API error', details: postData.error });
    const postId = postData.id || postData.post_id;
    return res.status(200).json({ ok: true, postId, url: `https://www.facebook.com/${postId}` });
  } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
}

// ═══════════════════════════════════════════════════════════════════════════
// VISION — AI-powered screenshot data extractor (Gemini Vision)
// ═══════════════════════════════════════════════════════════════════════════

async function handleVision(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
  const { imageBase64, mimeType = 'image/png', context = '' } = req.body || {};
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  if (!allowedMimeTypes.includes(mimeType)) return res.status(400).json({ error: 'Invalid mimeType. Must be image/png, image/jpeg, image/webp, or image/gif.' });

  const systemPrompt = `You are a precise marketing data extractor for a healthcare marketing dashboard.\nYour job is to look at screenshots from any digital marketing platform and extract structured data.\nAlways respond with valid JSON only — no markdown, no explanation, just the JSON object.`;
  const userPrompt   = `${context ? `Context: ${context}\n\n` : ''}Analyze this screenshot and extract ALL visible marketing metrics.\n\nReturn a JSON object with these fields (use null for any not visible):\n{\n  "platform": "detected platform name (Google, Facebook, Instagram, TikTok, Yelp, etc.)",\n  "dataType": "reviews|social|analytics|ads|email|seo|other",\n  "confidence": "high|medium|low",\n  "extractedAt": "ISO date string",\n  "rating": number or null,\n  "reviewCount": number or null,\n  "ratingPlatform": "google|yelp|facebook|healthgrades|zocdoc|glassdoor|indeed|other" or null,\n  "followers": number or null,\n  "following": number or null,\n  "posts": number or null,\n  "likes": number or null,\n  "comments": number or null,\n  "shares": number or null,\n  "reach": number or null,\n  "impressions": number or null,\n  "engagementRate": number or null,\n  "socialPlatform": "facebook|instagram|tiktok|linkedin|youtube|twitter|other" or null,\n  "sessions": number or null,\n  "pageViews": number or null,\n  "bounceRate": number or null,\n  "avgSessionDuration": "string like \'2m 34s\'" or null,\n  "newUsers": number or null,\n  "conversions": number or null,\n  "adSpend": number or null,\n  "impressionsAds": number or null,\n  "clicks": number or null,\n  "ctr": number or null,\n  "cpl": number or null,\n  "roas": number or null,\n  "leads": number or null,\n  "subscribers": number or null,\n  "openRate": number or null,\n  "clickRate": number or null,\n  "campaignsSent": number or null,\n  "period": "date range visible in screenshot" or null,\n  "otherMetrics": {}\n}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system_instruction: { parts: [{ text: systemPrompt }] }, contents: [{ role: 'user', parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: userPrompt }] }], generationConfig: { maxOutputTokens: 1200, temperature: 0.1, responseMimeType: 'application/json' } }) }
    );
    if (!response.ok) { const err = await response.json().catch(() => ({})); return res.status(502).json({ error: err?.error?.message || 'Gemini Vision API error' }); }
    const data    = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let fields = {};
    try {
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      fields = JSON.parse(cleaned);
    } catch { return res.status(200).json({ fields: {}, rawText, parseError: true }); }
    return res.status(200).json({ fields, rawText });
  } catch (e) { return res.status(500).json({ error: e.message }); }
}

// ═══════════════════════════════════════════════════════════════════════════
// WIX — Analytics via API Key
// ═══════════════════════════════════════════════════════════════════════════

async function handleWix(req, res) {
  try {
    const { action, token } = req.query;
    if (action !== 'sync' || !token) return res.status(400).json({ ok: false, error: 'Use ?action=sync&token=<your_wix_api_key>' });
    const headers = { Authorization: token, 'Content-Type': 'application/json' };
    const payload = { apiKey: token.slice(0, 8) + '...', connectedAt: new Date().toISOString() };
    let siteId = null;
    try {
      const siteRes  = await fetch('https://www.wixapis.com/site-list/v2/sites/query', { method: 'POST', headers, body: JSON.stringify({ query: { paging: { limit: 1 } } }) });
      const siteText = await siteRes.text();
      let siteData;
      try { siteData = JSON.parse(siteText); } catch { payload.siteListRaw = siteText.slice(0, 300); }
      const site = siteData?.sites?.[0];
      if (site) { payload.siteName = site.displayName || site.name || ''; payload.siteId = site.id || ''; siteId = site.id || null; }
      else if (siteData) { payload.siteListData = JSON.stringify(siteData).slice(0, 300); }
    } catch (e) { payload.siteListError = e.message; }
    const aHeaders = { ...headers };
    if (siteId) aHeaders['wix-site-id'] = siteId;
    const now     = new Date();
    const from    = new Date(now); from.setDate(from.getDate() - 30);
    const toStr   = now.toISOString().split('T')[0];
    const fromStr = from.toISOString().split('T')[0];
    try {
      const analyticsRes  = await fetch('https://www.wixapis.com/analytics/v2/reports', { method: 'POST', headers: aHeaders, body: JSON.stringify({ namespace: 'web_analytics', metrics: [{ expression: 'SESSIONS' }, { expression: 'BOUNCE_RATE' }, { expression: 'PAGE_VIEWS' }, { expression: 'UNIQUE_VISITORS' }, { expression: 'AVG_VISIT_DURATION' }], dimensionFilters: [], dateRange: { from: fromStr, to: toStr } }) });
      const analyticsText = await analyticsRes.text();
      let analyticsData;
      try { analyticsData = JSON.parse(analyticsText); } catch { payload.analyticsRaw = analyticsText.slice(0, 300); }
      const totals = analyticsData?.totals;
      if (totals) { payload.sessions = Math.round(totals.SESSIONS || 0); payload.pageViews = Math.round(totals.PAGE_VIEWS || 0); payload.visitors = Math.round(totals.UNIQUE_VISITORS || 0); payload.bounceRate = totals.BOUNCE_RATE ? (Number(totals.BOUNCE_RATE) * 100).toFixed(1) : null; payload.avgDuration = totals.AVG_VISIT_DURATION ? Math.round(Number(totals.AVG_VISIT_DURATION)) + 's' : null; }
      else if (analyticsData) { payload.analyticsResp = JSON.stringify(analyticsData).slice(0, 300); }
    } catch (e) { payload.analyticsError = e.message; }
    try {
      const sourcesRes  = await fetch('https://www.wixapis.com/analytics/v2/reports', { method: 'POST', headers: aHeaders, body: JSON.stringify({ namespace: 'web_analytics', metrics: [{ expression: 'SESSIONS' }], dimensions: [{ expression: 'TRAFFIC_SOURCE' }], dateRange: { from: fromStr, to: toStr } }) });
      const sourcesData = JSON.parse(await sourcesRes.text());
      const rows = sourcesData?.rows || [];
      if (rows.length > 0) {
        const total = rows.reduce((s, r) => s + Number(r.metrics?.[0] || 0), 0);
        const pct   = (name) => { const row = rows.find(r => (r.dimensions?.[0] || '').toLowerCase().includes(name)); return row && total > 0 ? Math.round((Number(row.metrics?.[0] || 0) / total) * 100) : 0; };
        payload.organic  = pct('organic') || pct('search');
        payload.social   = pct('social');
        payload.direct   = pct('direct');
        payload.referral = pct('referral');
      }
    } catch (e) { payload.sourcesError = e.message; }
    return res.json({ ok: true, ...payload });
  } catch (e) { return res.status(500).json({ ok: false, error: e.message, stack: e.stack?.split('\n')[0] }); }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAILCHIMP — OAuth2 + API key + campaign management
// ═══════════════════════════════════════════════════════════════════════════

function buildMailchimpStats(listsData, campaignsData, listId) {
  const targetList   = listId ? listsData.lists?.find(l => l.id === listId) : listsData.lists?.[0];
  const campaigns    = campaignsData.campaigns || [];
  const lastCampaign = campaigns[0];
  return {
    listName:          targetList?.name || '',
    listId:            targetList?.id   || '',
    subscribers:       targetList?.stats?.member_count          || 0,
    avgSubscriberRate: targetList?.stats?.avg_sub_rate          || 0,
    openRate:          lastCampaign?.report_summary?.open_rate  != null ? (lastCampaign.report_summary.open_rate  * 100).toFixed(1) + '%' : '—',
    clickRate:         lastCampaign?.report_summary?.click_rate != null ? (lastCampaign.report_summary.click_rate * 100).toFixed(1) + '%' : '—',
    totalCampaigns:    campaignsData.total_items || 0,
    totalAudiences:    listsData.total_items     || 0,
    recentCampaigns:   campaigns.slice(0, 5).map(c => ({ id: c.id, title: c.settings?.title || '', subject: c.settings?.subject_line || '', sentAt: c.send_time || null, openRate: c.report_summary?.open_rate != null ? (c.report_summary.open_rate * 100).toFixed(1) + '%' : '—', clickRate: c.report_summary?.click_rate != null ? (c.report_summary.click_rate * 100).toFixed(1) + '%' : '—', uniqueOpens: c.report_summary?.unique_opens || 0, emailsSent: c.report_summary?.emails_sent || 0 })),
    connectedAt:       new Date().toISOString(),
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

async function handleMailchimp(req, res) {
  const CLIENT_ID     = process.env.MAILCHIMP_CLIENT_ID;
  const CLIENT_SECRET = process.env.MAILCHIMP_CLIENT_SECRET;
  const REDIRECT_URI  = process.env.MAILCHIMP_REDIRECT_URI;
  const { action, code, token, dc } = req.query;

  if (action === 'login') {
    if (!CLIENT_ID || !REDIRECT_URI) return res.redirect('/?mailchimp_error=Server+not+configured+%E2%80%94+set+MAILCHIMP_CLIENT_ID+%26+MAILCHIMP_REDIRECT_URI+in+Vercel');
    const url = new URL('https://login.mailchimp.com/oauth2/authorize');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id',     CLIENT_ID);
    url.searchParams.set('redirect_uri',  REDIRECT_URI);
    return res.redirect(url.toString());
  }

  if (code) {
    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) return res.redirect('/?mailchimp_error=Server+not+configured');
    try {
      const tokenRes  = await fetch('https://login.mailchimp.com/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI, code }) });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) { const msg = tokenData.error_description || tokenData.error || 'Token exchange failed'; return res.redirect(`/?mailchimp_error=${encodeURIComponent(msg)}`); }
      const metaRes  = await fetch('https://login.mailchimp.com/oauth2/metadata', { headers: { Authorization: `OAuth ${tokenData.access_token}` } });
      const metaData = await metaRes.json();
      const dataDc   = metaData.dc;
      if (!dataDc) return res.redirect('/?mailchimp_error=Could+not+determine+data+center+from+Mailchimp');
      const data = await fetchMailchimpStats(tokenData.access_token, dataDc);
      data.accessToken = tokenData.access_token;
      data.dc          = dataDc;
      const encoded = Buffer.from(JSON.stringify(data)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return res.redirect(`/?mailchimp_data=${encoded}`);
    } catch (e) { return res.redirect(`/?mailchimp_error=${encodeURIComponent(e.message)}`); }
  }

  if (action === 'refresh' && token && dc) {
    try { return res.json({ ok: true, ...(await fetchMailchimpStats(token, dc)) }); }
    catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
  }

  if (action === 'data') {
    const directKey = req.query.apiKey;
    const listId    = req.query.listId || '';
    if (!directKey) return res.status(400).json({ ok: false, error: 'apiKey required' });
    const dataDc = directKey.split('-').pop() || 'us1';
    try { return res.json({ ok: true, ...(await fetchMailchimpWithKey(directKey, dataDc, listId)) }); }
    catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
  }

  if (action === 'sendDigest' && req.method === 'POST') {
    const { apiKey, listId, stats = {}, digestText } = req.body || {};
    if (!apiKey) return res.status(400).json({ ok: false, error: 'apiKey required' });
    const dataDc = apiKey.split('-').pop() || 'us1';
    const base   = `https://${dataDc}.api.mailchimp.com/3.0`;
    const auth   = 'Basic ' + Buffer.from(`anystring:${apiKey}`).toString('base64');
    const headers = { Authorization: auth, 'Content-Type': 'application/json' };
    try {
      let targetListId = listId;
      if (!targetListId) { const listsRes = await fetch(`${base}/lists?count=1`, { headers }); const listsData = await listsRes.json(); targetListId = listsData.lists?.[0]?.id; }
      if (!targetListId) return res.status(400).json({ ok: false, error: 'No audience list found — provide listId' });
      const week = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;"><div style="background:#0d9488;padding:20px 24px;border-radius:12px;margin-bottom:24px;"><h1 style="color:#fff;margin:0;font-size:22px;">📊 Weekly Marketing Digest</h1><p style="color:#ccfbf1;margin:4px 0 0;font-size:14px;">Destiny Springs Healthcare · ${week}</p></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">${[{label:'Email Open Rate',value:stats.openRate||'—',color:'#0d9488'},{label:'Subscribers',value:stats.subscribers!=null?Number(stats.subscribers).toLocaleString():'—',color:'#7c3aed'},{label:'Click Rate',value:stats.clickRate||'—',color:'#059669'},{label:'Total Campaigns',value:stats.totalCampaigns||'—',color:'#d97706'}].map(s=>`<div style="background:#fff;border-radius:10px;padding:16px;text-align:center;border:1px solid #e5e7eb;"><div style="font-size:26px;font-weight:900;color:${s.color}">${s.value}</div><div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-top:4px">${s.label}</div></div>`).join('')}</div>${digestText?`<div style="background:#fff;border-radius:10px;padding:20px;border:1px solid #ede9fe;margin-bottom:24px;border-left:4px solid #7c3aed;"><h2 style="margin:0 0 12px;font-size:16px;color:#1e293b;">📝 AI Performance Summary</h2><p style="color:#475569;font-size:14px;line-height:1.7;white-space:pre-wrap;margin:0;">${digestText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p></div>`:`<div style="background:#fff;border-radius:10px;padding:20px;border:1px solid #e5e7eb;margin-bottom:24px;"><h2 style="margin:0 0 12px;font-size:16px;color:#1e293b;">📋 This Week's Highlights</h2><ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.8;"><li>Review the open rate trend and compare to industry average (21%)</li><li>Check click-through rates on your most recent campaigns</li><li>Plan next week's content based on top-performing topics</li><li>Follow up on any subscriber feedback or unsubscribes</li></ul></div>`}<p style="text-align:center;font-size:12px;color:#9ca3af;">Generated by Destiny Springs Marketing Dashboard · <a href="https://destinysprings.com" style="color:#0d9488">destinysprings.com</a></p></div>`;
      const createRes  = await fetch(`${base}/campaigns`, { method: 'POST', headers, body: JSON.stringify({ type: 'regular', settings: { subject_line: `📊 Weekly Marketing Digest — ${week}`, title: `Weekly Digest ${week}`, from_name: 'Destiny Springs Healthcare', reply_to: 'marketing@destinysprings.com' }, recipients: { list_id: targetListId } }) });
      const createData = await createRes.json();
      if (createData.status >= 400) return res.status(400).json({ ok: false, error: createData.detail || createData.title || 'Campaign creation failed' });
      const campaignId = createData.id;
      await fetch(`${base}/campaigns/${campaignId}/content`, { method: 'PUT', headers, body: JSON.stringify({ html }) });
      const sendRes  = await fetch(`${base}/campaigns/${campaignId}/actions/send`, { method: 'POST', headers });
      if (sendRes.status === 204 || sendRes.ok) return res.json({ ok: true, campaignId, message: 'Digest campaign sent successfully!' });
      const sendData = await sendRes.json();
      return res.status(400).json({ ok: false, error: sendData.detail || 'Failed to send campaign', campaignId, tip: 'Campaign was created but not sent — check Mailchimp dashboard' });
    } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
  }

  return res.status(400).json({ error: 'Invalid request — use ?action=login, ?action=data&apiKey=, or OAuth callback ?code=' });
}

// ═══════════════════════════════════════════════════════════════════════════
// SURVEYMONKEY — Personal Access Token
// ═══════════════════════════════════════════════════════════════════════════

async function fetchSurveyMonkeyData(token, requestedSurveyId) {
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const result  = { connectedAt: new Date().toISOString() };
  const userRes = await fetch('https://api.surveymonkey.com/v3/users/me', { headers });
  if (!userRes.ok) { const raw = await userRes.text().catch(() => ''); throw new Error(`SurveyMonkey auth failed (${userRes.status})${raw ? `: ${raw.slice(0, 180)}` : ''}`); }
  const userData = await userRes.json();
  result.username  = userData.username   || '';
  result.email     = userData.email      || '';
  result.firstName = userData.first_name || '';
  result.lastName  = userData.last_name  || '';
  const surveysRes = await fetch('https://api.surveymonkey.com/v3/surveys?per_page=50&include=response_count,date_modified', { headers });
  if (!surveysRes.ok) { const raw = await surveysRes.text().catch(() => ''); throw new Error(`Survey list fetch failed (${surveysRes.status})${raw ? `: ${raw.slice(0, 180)}` : ''}`); }
  const surveysData = await surveysRes.json();
  const surveys     = surveysData.data || [];
  result.totalSurveys   = surveysData.total || surveys.length;
  result.totalResponses = surveys.reduce((sum, s) => sum + (s.response_count || 0), 0);
  result.recentSurveys  = surveys.slice(0, 10).map(s => ({ id: s.id, title: s.title, responses: s.response_count || 0, modified: s.date_modified, href: s.href }));
  const cleanRequestedId = String(requestedSurveyId || '').trim();
  const activeSurvey     = cleanRequestedId ? surveys.find(s => String(s.id) === cleanRequestedId) : surveys.find(s => s.response_count > 0);
  if (cleanRequestedId && !activeSurvey) throw new Error(`Survey ID not found in this account: ${cleanRequestedId}`);
  if (activeSurvey) {
    result.activeSurveyId        = activeSurvey.id;
    result.activeSurveyTitle     = activeSurvey.title;
    result.activeSurveyResponses = activeSurvey.response_count;
    const summaryRes = await fetch(`https://api.surveymonkey.com/v3/surveys/${activeSurvey.id}/rollups`, { headers });
    if (summaryRes.ok) {
      const summaryData = await summaryRes.json();
      if (summaryData.data) {
        result.rollups = summaryData.data.slice(0, 10).map(q => ({ question: q.heading || '', type: q.family || '', answers: (q.answers || []).slice(0, 8).map(a => ({ text: a.row || a.text || '', count: a.count || 0 })) }));
        const npsQ = summaryData.data.find(q => /recommend|nps|likely/i.test(q.heading || '') || (q.family === 'rating' && (q.answers || []).some(a => parseInt(a.row || a.text) >= 9)));
        if (npsQ) {
          const answers = npsQ.answers || [];
          let promoters = 0, passives = 0, detractors = 0;
          answers.forEach(a => { const score = parseInt(a.row || a.text || ''); const count = a.count || 0; if (!isNaN(score)) { if (score >= 9) promoters += count; else if (score >= 7) passives += count; else detractors += count; } });
          const total = promoters + passives + detractors;
          if (total > 0) { result.npsBreakdown = { promoters, passives, detractors }; result.npsScore = Math.round(((promoters - detractors) / total) * 100); }
        }
      }
    }
  }
  return result;
}

async function handleSurveyMonkey(req, res) {
  const { action, token, surveyId } = req.query;
  const accessToken = token || process.env.SURVEYMONKEY_ACCESS_TOKEN;
  if (action === 'sync') {
    if (!accessToken) return res.status(400).json({ ok: false, error: 'No access token provided' });
    try { return res.json({ ok: true, ...(await fetchSurveyMonkeyData(accessToken, surveyId)) }); }
    catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
  }
  return res.status(400).json({ error: 'Use ?action=sync&token=YOUR_TOKEN' });
}

// ═══════════════════════════════════════════════════════════════════════════
// DISPATCHER — routes /api/{service} to the correct handler
// ═══════════════════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { service } = req.query;

  const dispatch = {
    google:        handleGoogle,
    meta:          handleMeta,
    social:        handleSocial,
    tiktok:        handleTiktok,
    youtube:       handleYoutube,
    reviews:       handleReviews,
    yelp:          handleYelp,
    news:          handleNews,
    post:          handlePost,
    vision:        handleVision,
    wix:           handleWix,
    mailchimp:     handleMailchimp,
    surveymonkey:  handleSurveyMonkey,
  };

  const fn = dispatch[service];
  if (!fn) return res.status(404).json({ error: `Unknown service: "${service}"` });
  return fn(req, res);
}
