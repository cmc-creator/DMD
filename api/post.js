// Vercel serverless — Facebook/Instagram auto-post via Graph API
// ─────────────────────────────────────────────────────────────────────────────
// POST  /api/post
// Body: { message, pageId, token, imageUrl?, published? }
//
// Requires a Page Access Token that has pages_manage_posts permission.
// token = the access_token stored when connecting Meta Business Suite.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { message, pageId, token, imageUrl, published = true } = req.body || {};

  if (!message)  return res.status(400).json({ ok: false, error: 'message is required' });
  if (!pageId)   return res.status(400).json({ ok: false, error: 'pageId is required' });
  if (!token)    return res.status(400).json({ ok: false, error: 'token is required' });

  const BASE_URL = `https://graph.facebook.com/v18.0`;

  try {
    // ── Choose endpoint based on whether there's a photo ──────────────────────
    let endpoint, body;

    if (imageUrl) {
      // Post with photo: use /photos endpoint
      endpoint = `${BASE_URL}/${pageId}/photos`;
      body = new URLSearchParams({
        message,
        url:          imageUrl,
        access_token: token,
        published:    String(published),
      });
    } else {
      // Text-only post: use /feed endpoint
      endpoint = `${BASE_URL}/${pageId}/feed`;
      body = new URLSearchParams({
        message,
        access_token: token,
        published:    String(published),
      });
    }

    const postRes  = await fetch(endpoint, { method: 'POST', body });
    const postData = await postRes.json();

    if (postData.error) {
      return res.status(400).json({ ok: false, error: postData.error.message || 'Facebook API error', details: postData.error });
    }

    const postId = postData.id || postData.post_id;
    return res.status(200).json({
      ok:     true,
      postId,
      url:    `https://www.facebook.com/${postId}`,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
