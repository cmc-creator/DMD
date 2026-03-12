// Vercel serverless function — TikTok OAuth + proxy
// Env vars required (set in Vercel dashboard, never commit):
//   TIKTOK_CLIENT_KEY     = aw6m6kygsji67pla
//   TIKTOK_CLIENT_SECRET  = (your secret)
//   TIKTOK_REDIRECT_URI   = https://YOUR_VERCEL_URL/api/tiktok

export default async function handler(req, res) {
  const CLIENT_KEY    = process.env.TIKTOK_CLIENT_KEY    || 'aw6m6kygsji67pla';
  const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
  const REDIRECT_URI  = process.env.TIKTOK_REDIRECT_URI;

  const { action, code, state, token } = req.query;

  // CORS — allow the Vercel frontend to call /api/tiktok directly
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── 1. Initiate OAuth login ────────────────────────────────
  if (action === 'login') {
    const url = new URL('https://www.tiktok.com/v2/auth/authorize/');
    url.searchParams.set('client_key',    CLIENT_KEY);
    url.searchParams.set('scope',         'user.info.basic,video.list');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri',  REDIRECT_URI);
    url.searchParams.set('state',         state || 'dmd');
    return res.redirect(url.toString());
  }

  // ── 2. OAuth callback (TikTok redirects here with ?code=) ──
  if (code) {
    if (!CLIENT_SECRET || !REDIRECT_URI) {
      return res.redirect('/?tiktok_error=Server+not+configured+-+set+TIKTOK_CLIENT_SECRET+and+TIKTOK_REDIRECT_URI+in+Vercel+env');
    }
    try {
      // Exchange code for access token
      const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
        body:    new URLSearchParams({
          client_key:    CLIENT_KEY,
          client_secret: CLIENT_SECRET,
          code,
          grant_type:    'authorization_code',
          redirect_uri:  REDIRECT_URI,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        const msg = tokenData.error_description || tokenData.message || 'Token exchange failed';
        return res.redirect(`/?tiktok_error=${encodeURIComponent(msg)}`);
      }

      const accessToken = tokenData.access_token;
      const openId      = tokenData.open_id;

      // Fetch user info
      const userRes  = await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=display_name,follower_count,following_count,video_count,likes_count,avatar_url',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const userData = await userRes.json();

      // Fetch recent video list
      const videoRes  = await fetch(
        'https://open.tiktokapis.com/v2/video/list/?fields=id,title,view_count,like_count,comment_count,share_count,create_time,cover_image_url',
        {
          method:  'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body:    JSON.stringify({ max_count: 20 }),
        }
      );
      const videoData = await videoRes.json();
      const videos    = videoData.data?.videos || [];

      const payload = {
        accessToken,
        openId,
        displayName:    userData.data?.user?.display_name,
        avatarUrl:      userData.data?.user?.avatar_url,
        followers:      userData.data?.user?.follower_count    || 0,
        videoCount:     userData.data?.user?.video_count       || 0,
        totalLikes:     userData.data?.user?.likes_count       || 0,
        recentPosts:    videos.length,
        recentViews:    videos.reduce((s, v) => s + (v.view_count    || 0), 0),
        recentLikes:    videos.reduce((s, v) => s + (v.like_count    || 0), 0),
        recentComments: videos.reduce((s, v) => s + (v.comment_count || 0), 0),
        recentShares:   videos.reduce((s, v) => s + (v.share_count   || 0), 0),
        videos:         videos.slice(0, 10),
        connectedAt:    new Date().toISOString(),
      };

      // base64url-encode payload and redirect back to the SPA
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return res.redirect(`/?tiktok_data=${encoded}`);

    } catch (e) {
      return res.redirect(`/?tiktok_error=${encodeURIComponent(e.message)}`);
    }
  }

  // ── 3. Proxy: refresh data using stored access token ──────
  if (action === 'refresh' && token) {
    try {
      const [userRes, videoRes] = await Promise.all([
        fetch(
          'https://open.tiktokapis.com/v2/user/info/?fields=display_name,follower_count,video_count,likes_count',
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(
          'https://open.tiktokapis.com/v2/video/list/?fields=id,title,view_count,like_count,comment_count,share_count',
          {
            method:  'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body:    JSON.stringify({ max_count: 20 }),
          }
        ),
      ]);

      const userData  = await userRes.json();
      const videoData = await videoRes.json();
      const videos    = videoData.data?.videos || [];

      return res.json({
        ok:             true,
        displayName:    userData.data?.user?.display_name,
        followers:      userData.data?.user?.follower_count    || 0,
        videoCount:     userData.data?.user?.video_count       || 0,
        totalLikes:     userData.data?.user?.likes_count       || 0,
        recentPosts:    videos.length,
        recentViews:    videos.reduce((s, v) => s + (v.view_count    || 0), 0),
        recentLikes:    videos.reduce((s, v) => s + (v.like_count    || 0), 0),
        recentComments: videos.reduce((s, v) => s + (v.comment_count || 0), 0),
        recentShares:   videos.reduce((s, v) => s + (v.share_count   || 0), 0),
        videos:         videos.slice(0, 10),
      });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  return res.status(400).json({ error: 'Invalid request' });
}
