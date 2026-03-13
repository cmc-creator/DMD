// Vercel serverless — Public Social Media Profile Scraper
// ─────────────────────────────────────────────────────────────────────────────
// Scrapes public-facing data from Facebook, Instagram, and TikTok profiles.
// NO API KEY OR OAUTH REQUIRED — reads what any visitor sees in their browser.
//
// Endpoints:
//   GET /api/social                         → all three platforms in parallel
//   GET /api/social?platform=instagram      → just Instagram
//   GET /api/social?platform=facebook       → just Facebook
//   GET /api/social?platform=tiktok         → just TikTok
//   GET /api/social?fbUrl=...&igUrl=...&ttUrl=... → override detected URLs
//
// Fallback handles (used if website scraper didn't find them):
const FALLBACK_FB  = 'https://www.facebook.com/destinyspringshealthcare';
const FALLBACK_IG  = 'https://www.instagram.com/destinyspringshealthcare/';
const FALLBACK_TT  = 'https://www.tiktok.com/@destinyspringshealthcare';

// ── Shared fetch with browser headers + timeout ──────────────────────────────
const fetchT = (url, extraHeaders = {}, ms = 9000) =>
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

const stripHtml = (s = '') => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// ── Parse compact number strings: "1.2K" → 1200, "4.5M" → 4500000 ──────────
function parseCount(str) {
  if (!str) return null;
  const s = String(str).replace(/,/g, '').trim();
  const m = s.match(/^([\d.]+)\s*([KkMmBb]?)$/);
  if (!m) return parseInt(s.replace(/\D/g, '')) || null;
  const n = parseFloat(m[1]);
  const mul = { k: 1e3, m: 1e6, b: 1e9 }[m[2].toLowerCase()] || 1;
  return Math.round(n * mul);
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTAGRAM — public profile scrape
// Instagram embeds profile JSON in several places in the HTML. We try multiple
// extraction strategies in order of reliability.
// ─────────────────────────────────────────────────────────────────────────────
async function scrapeInstagram(profileUrl) {
  const url = profileUrl || FALLBACK_IG;
  // Normalise to desktop URL (mobile sometimes redirects to app store)
  const cleanUrl = url.replace(/m\.instagram/, 'www.instagram').replace(/\/$/, '') + '/';

  try {
    // Strategy 1: Instagram's unofficial JSON endpoint (returns profile JSON for ~public accounts)
    const username = cleanUrl.match(/instagram\.com\/([^/?#]+)/i)?.[1];
    if (username) {
      try {
        const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
        const apiRes = await fetchT(apiUrl, {
          'X-IG-App-ID': '936619743392459',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': `https://www.instagram.com/${username}/`,
        }, 7000);
        if (apiRes.ok) {
          const json = await apiRes.json();
          const user = json?.data?.user;
          if (user) {
            return {
              platform:   'Instagram',
              url:        cleanUrl,
              username:   user.username,
              fullName:   user.full_name,
              bio:        user.biography,
              followers:  user.edge_followed_by?.count,
              following:  user.edge_follow?.count,
              posts:      user.edge_owner_to_timeline_media?.count,
              profilePic: user.profile_pic_url_hd || user.profile_pic_url,
              isVerified: user.is_verified,
              website:    user.external_url,
              fetchedAt:  new Date().toISOString(),
              method:     'api',
            };
          }
        }
      } catch { /* fall through to HTML scrape */ }
    }

    // Strategy 2: Scrape the HTML page and look for embedded JSON
    const r = await fetchT(cleanUrl, {}, 8000);
    if (!r.ok) throw new Error(`Instagram HTTP ${r.status}`);
    const html = await r.text();

    // Newer Instagram embeds data in <script type="application/json"> blocks
    const jsonBlocks = [];
    const jRx = /<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi;
    let jm;
    while ((jm = jRx.exec(html)) !== null) {
      try { jsonBlocks.push(JSON.parse(jm[1])); } catch { /* skip */ }
    }
    // Walk blocks looking for follower count
    const findInObj = (obj, depth = 0) => {
      if (!obj || typeof obj !== 'object' || depth > 8) return null;
      if (obj.edge_followed_by?.count !== undefined) return obj;
      for (const v of Object.values(obj)) {
        const r = findInObj(v, depth + 1); if (r) return r;
      }
      return null;
    };
    for (const block of jsonBlocks) {
      const user = findInObj(block);
      if (user) {
        return {
          platform:  'Instagram',
          url:       cleanUrl,
          username:  user.username,
          fullName:  user.full_name,
          bio:       user.biography,
          followers: user.edge_followed_by?.count,
          following: user.edge_follow?.count,
          posts:     user.edge_owner_to_timeline_media?.count,
          isVerified: user.is_verified,
          fetchedAt: new Date().toISOString(),
          method:    'html-json',
        };
      }
    }

    // Strategy 3: Regex patterns in HTML meta/title
    const followersM = html.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+Followers/i) ||
                       html.match(/"edge_followed_by":\{"count":(\d+)/);
    const postsM     = html.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+Posts/i) ||
                       html.match(/"edge_owner_to_timeline_media":\{"count":(\d+)/);
    const nameM      = html.match(/<title>([^<]+)<\/title>/i);
    const bioM       = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);

    return {
      platform:  'Instagram',
      url:       cleanUrl,
      username:  username || null,
      fullName:  nameM ? stripHtml(nameM[1]).replace(/\s*•\s*Instagram.*$/i, '').trim() : null,
      bio:       bioM ? stripHtml(bioM[1]) : null,
      followers: followersM ? parseCount(followersM[1]) : null,
      posts:     postsM ? parseCount(postsM[1]) : null,
      fetchedAt: new Date().toISOString(),
      method:    'regex',
    };
  } catch (e) {
    return { platform: 'Instagram', url, error: e.message, fetchedAt: new Date().toISOString() };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FACEBOOK — public page scrape (mobile version is less JS-heavy)
// ─────────────────────────────────────────────────────────────────────────────
async function scrapeFacebook(profileUrl) {
  const url = profileUrl || FALLBACK_FB;
  // Use mobile Facebook which returns simpler HTML
  const mobileUrl = url.replace('www.facebook.com', 'm.facebook.com')
                       .replace('//facebook.com', '//m.facebook.com');

  try {
    const r = await fetchT(mobileUrl, {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    }, 8000);
    if (!r.ok) throw new Error(`Facebook HTTP ${r.status}`);
    const html = await r.text();

    // Extract page name
    const nameM = html.match(/<title>([^<]+)<\/title>/i);
    const name  = nameM ? stripHtml(nameM[1]).replace(/\s*[-|].*$/, '').trim() : null;

    // Followers / likes patterns in mobile HTML
    const followersM = html.match(/\b([\d,]+(?:\.\d+)?[KkMm]?)\s+(?:people\s+)?(?:follow|followers|likes)\b/i) ||
                       html.match(/([\d,]+)\s+Followers/i) ||
                       html.match(/"follower_count"\s*:\s*(\d+)/i) ||
                       html.match(/([\d,.]+[KkMm]?)\s+(?:like|follow)/i);
    const likesM     = html.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+(?:people\s+)?like\s+this/i) ||
                       html.match(/"like_count"\s*:\s*(\d+)/i);

    // Category
    const catM = html.match(/class="[^"]*page-category[^"]*"[^>]*>([^<]+)/i) ||
                 html.match(/"category"\s*:\s*"([^"]+)"/i);

    // About text
    const aboutM = html.match(/id="[^"]*about[^"]*"[^>]*>([\s\S]{0,400})/i);
    const about  = aboutM ? stripHtml(aboutM[1]).slice(0, 200) : null;

    // Meta description often has follower count
    const metaM = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
    const metaDesc = metaM ? metaM[1] : null;

    // Try extracting from meta description: "X · X followers"
    const metaFollowersM = metaDesc?.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+follower/i);

    return {
      platform:  'Facebook',
      url:       url.replace('m.facebook.com', 'www.facebook.com'),
      name,
      followers: followersM  ? parseCount(followersM[1])
                : metaFollowersM ? parseCount(metaFollowersM[1])
                : null,
      likes:     likesM ? parseCount(likesM[1]) : null,
      category:  catM ? stripHtml(catM[1]).trim() : null,
      about:     about || (metaDesc ? stripHtml(metaDesc).slice(0, 200) : null),
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    return { platform: 'Facebook', url, error: e.message, fetchedAt: new Date().toISOString() };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TIKTOK — public profile scrape
// TikTok embeds profile data in window.__UNIVERSAL_DATA_FOR_REHYDRATION__ 
// ─────────────────────────────────────────────────────────────────────────────
async function scrapeTikTok(profileUrl) {
  const url  = profileUrl || FALLBACK_TT;
  const handle = url.match(/@([^/?#]+)/)?.[1] || url.split('/').filter(Boolean).pop();
  const cleanUrl = `https://www.tiktok.com/@${handle}`;

  try {
    const r = await fetchT(cleanUrl, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    }, 9000);
    if (!r.ok) throw new Error(`TikTok HTTP ${r.status}`);
    const html = await r.text();

    // Strategy 1: TikTok's NEXT_DATA / universal rehydration JSON
    const dataM = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i) ||
                  html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (dataM) {
      try {
        const json = JSON.parse(dataM[1]);
        // Walk the tree for user stats
        const findUser = (obj, d = 0) => {
          if (!obj || typeof obj !== 'object' || d > 10) return null;
          if (obj.userInfo?.user && obj.userInfo?.stats) return obj.userInfo;
          if (obj.user?.stats?.followerCount !== undefined) return obj;
          for (const v of Object.values(obj)) {
            const r = findUser(v, d + 1); if (r) return r;
          }
          return null;
        };
        const found = findUser(json);
        if (found) {
          const user  = found.user  || found.userInfo?.user;
          const stats = found.stats || found.userInfo?.stats;
          if (user || stats) {
            return {
              platform:  'TikTok',
              url:       cleanUrl,
              username:  user?.uniqueId   || handle,
              nickname:  user?.nickname,
              bio:       user?.signature,
              followers: stats?.followerCount,
              following: stats?.followingCount,
              likes:     stats?.heartCount || stats?.heart,
              videos:    stats?.videoCount,
              isVerified: user?.verified,
              fetchedAt: new Date().toISOString(),
              method:    'json',
            };
          }
        }
      } catch { /* fall through */ }
    }

    // Strategy 2: JSON-LD on the page
    const ldRx = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let ldM;
    while ((ldM = ldRx.exec(html)) !== null) {
      try {
        const ld = JSON.parse(ldM[1]);
        if (ld.interactionStatistic || ld.author) {
          const followers = [].concat(ld.interactionStatistic || [])
            .find(s => s.interactionType?.includes('Follow'))?.userInteractionCount;
          return {
            platform:  'TikTok',
            url:       cleanUrl,
            username:  handle,
            nickname:  ld.author?.name || ld.name,
            bio:       ld.description,
            followers: followers || null,
            fetchedAt: new Date().toISOString(),
            method:    'json-ld',
          };
        }
      } catch { /* skip */ }
    }

    // Strategy 3: Regex fallback
    const followersM = html.match(/"followerCount":\s*(\d+)/) ||
                       html.match(/([\d.]+[KkMm]?)\s+Followers/i);
    const likesM     = html.match(/"heartCount":\s*(\d+)/) ||
                       html.match(/"heart":\s*(\d+)/);
    const videosM    = html.match(/"videoCount":\s*(\d+)/);
    const nameM      = html.match(/<title>([^<]+)<\/title>/i);
    const bioM       = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);

    return {
      platform:  'TikTok',
      url:       cleanUrl,
      username:  handle,
      nickname:  nameM ? stripHtml(nameM[1]).replace(/\s*[-|].*$/, '').trim() : null,
      bio:       bioM ? stripHtml(bioM[1]).slice(0, 200) : null,
      followers: followersM ? parseCount(followersM[1]) : null,
      likes:     likesM ? parseCount(likesM[1]) : null,
      videos:    videosM ? parseInt(videosM[1]) : null,
      fetchedAt: new Date().toISOString(),
      method:    'regex',
    };
  } catch (e) {
    return { platform: 'TikTok', url: cleanUrl, error: e.message, fetchedAt: new Date().toISOString() };
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { platform, fbUrl, igUrl, ttUrl } = req.query;

  try {
    if (platform === 'instagram') {
      return res.status(200).json({ ok: true, instagram: await scrapeInstagram(igUrl) });
    }
    if (platform === 'facebook') {
      return res.status(200).json({ ok: true, facebook: await scrapeFacebook(fbUrl) });
    }
    if (platform === 'tiktok') {
      return res.status(200).json({ ok: true, tiktok: await scrapeTikTok(ttUrl) });
    }

    // Default: run all three in parallel
    const [facebook, instagram, tiktok] = await Promise.all([
      scrapeFacebook(fbUrl).catch(e => ({ platform: 'Facebook', error: e.message })),
      scrapeInstagram(igUrl).catch(e => ({ platform: 'Instagram', error: e.message })),
      scrapeTikTok(ttUrl).catch(e => ({ platform: 'TikTok', error: e.message })),
    ]);

    return res.status(200).json({
      ok:        true,
      fetchedAt: new Date().toISOString(),
      facebook,
      instagram,
      tiktok,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
