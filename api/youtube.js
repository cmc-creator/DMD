// Vercel serverless — YouTube Data API v3 proxy
// ─────────────────────────────────────────────────────────────────────────────
// Required env var (set in Vercel dashboard → Project → Settings → Env Vars):
//   YOUTUBE_API_KEY = your YouTube Data API v3 key
//
// Google Cloud setup:
//   1. console.cloud.google.com → Enable "YouTube Data API v3"
//   2. Credentials → Create API Key → restrict to YouTube Data API v3
//   3. Paste the key into Vercel env vars as YOUTUBE_API_KEY
//
// Query params accepted by this handler:
//   action=data&channelId=UCxxxxxx        → full channel stats + recent videos
//   action=video&videoId=xxxxxxxxxxx      → single video stats
//   apiKey=xxx  (override server key for one-off use)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Accept key from env OR from query (allows per-user keys in dev)
  const apiKey     = process.env.YOUTUBE_API_KEY || req.query.apiKey;
  const { action, channelId, videoId, handle } = req.query;

  if (!apiKey) {
    return res.status(400).json({ ok: false, error: 'Missing API key — set YOUTUBE_API_KEY in Vercel env vars or pass ?apiKey=' });
  }

  // ── Resolve a @handle to a channel ID ───────────────────────────────────────
  const resolveHandle = async (h) => {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=id,snippet&forHandle=${encodeURIComponent(h)}&key=${apiKey}`;
    const r   = await fetch(url);
    const d   = await r.json();
    if (d.error) throw new Error(d.error.message);
    return d.items?.[0]?.id || null;
  };

  // ── Fetch full channel stats + recent 10 videos ──────────────────────────────
  const fetchChannelData = async (cid) => {
    // 1. Channel stats
    const chUrl  = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${cid}&key=${apiKey}`;
    const chRes  = await fetch(chUrl);
    const chData = await chRes.json();
    if (chData.error) throw new Error(chData.error.message);
    if (!chData.items?.length) throw new Error('Channel not found');

    const ch    = chData.items[0];
    const stats = ch.statistics || {};

    // 2. Recent uploads playlist
    const uploadsId = ch.contentDetails?.relatedPlaylists?.uploads || null;
    let recentVideos = [];

    if (uploadsId || stats.videoCount > 0) {
      // Get uploads playlist ID if not in contentDetails
      let plId = uploadsId;
      if (!plId) {
        const chFull  = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${cid}&key=${apiKey}`);
        const chFData = await chFull.json();
        plId = chFData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
      }
      if (plId) {
        const plUrl   = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${plId}&maxResults=10&key=${apiKey}`;
        const plRes   = await fetch(plUrl);
        const plData  = await plRes.json();
        const vids    = (plData.items || []).map(i => i.snippet?.resourceId?.videoId).filter(Boolean);

        if (vids.length) {
          const statsUrl  = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${vids.join(',')}&key=${apiKey}`;
          const statsRes  = await fetch(statsUrl);
          const statsData = await statsRes.json();
          recentVideos = (statsData.items || []).map(v => ({
            id:           v.id,
            title:        v.snippet?.title,
            publishedAt:  v.snippet?.publishedAt,
            thumbnail:    v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url,
            views:        Number(v.statistics?.viewCount    || 0),
            likes:        Number(v.statistics?.likeCount    || 0),
            comments:     Number(v.statistics?.commentCount || 0),
          }));
        }
      }
    }

    return {
      ok:          true,
      channelId:   cid,
      channelName: ch.snippet?.title,
      description: ch.snippet?.description?.slice(0, 200),
      thumbnail:   ch.snippet?.thumbnails?.default?.url,
      country:     ch.snippet?.country,
      subscribers: Number(stats.subscriberCount || 0),
      totalViews:  Number(stats.viewCount       || 0),
      videoCount:  Number(stats.videoCount      || 0),
      recentVideos,
    };
  };

  try {
    if (!action || action === 'data') {
      let cid = channelId;
      // Support @handle lookup
      if (!cid && handle) {
        cid = await resolveHandle(handle);
        if (!cid) return res.status(404).json({ ok: false, error: `Handle "${handle}" not found` });
      }
      if (!cid) return res.status(400).json({ ok: false, error: 'Pass channelId=UCxxx or handle=@YourChannel' });
      const data = await fetchChannelData(cid);
      return res.status(200).json(data);
    }

    if (action === 'video') {
      if (!videoId) return res.status(400).json({ ok: false, error: 'Pass videoId=xxx' });
      const url  = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
      const r    = await fetch(url);
      const d    = await r.json();
      if (d.error) return res.status(400).json({ ok: false, error: d.error.message });
      const v = d.items?.[0];
      if (!v) return res.status(404).json({ ok: false, error: 'Video not found' });
      return res.status(200).json({
        ok:          true,
        id:          v.id,
        title:       v.snippet?.title,
        publishedAt: v.snippet?.publishedAt,
        views:       Number(v.statistics?.viewCount    || 0),
        likes:       Number(v.statistics?.likeCount    || 0),
        comments:    Number(v.statistics?.commentCount || 0),
      });
    }

    return res.status(400).json({ ok: false, error: `Unknown action "${action}"` });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
