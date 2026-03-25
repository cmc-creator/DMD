// ΓöÇΓöÇ Destiny Springs Healthcare ΓÇö All-in-One Live Data Fetcher ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Runs ALL scrapers in TRUE parallel (no sequential chains, no self-referential
// HTTP calls). Everything is inlined in this single file.
//
// Sources (all run at the same time):
//   ΓÇó destinyspringshealthcare.com ΓÇö title, meta, H1/H2s, schema rating, social links
//   ΓÇó Facebook (mobile HTML)       ΓÇö followers, likes, about
//   ΓÇó Instagram (unofficial API)   ΓÇö followers, posts, bio
//   ΓÇó TikTok (UNIVERSAL_DATA JSON) ΓÇö followers, total likes, videos
//   ΓÇó Healthgrades (HTML scrape)   ΓÇö star rating, review count
//   ΓÇó Google Search (HTML scrape)  ΓÇö knowledge panel rating/reviews (no key)
//   ΓÇó Google Places API (optional) ΓÇö full reviews, hours, photos (needs key)
//
// Env var (optional):  GOOGLE_PLACES_KEY
// Debug endpoint:      GET /api/destiny?debug=1

// ΓöÇΓöÇ Hardcoded Destiny Springs social handles ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const DS_FB  = 'https://www.facebook.com/profile.php?id=61581511228047';
const DS_IG  = 'https://www.instagram.com/destinyspringshealthcare/';
const DS_TT  = 'https://www.tiktok.com/@destinyspringshealthcare';
const DS_LI  = 'https://www.linkedin.com/company/destiny-springs-healthcare';
const DS_YELP_QUERY = 'Destiny Springs Healthcare Surprise AZ';
const DS_GD  = 'destiny-springs-healthcare';
const DS_WEB = 'https://destinyspringshealthcare.com';
const DS_QUERY = 'Destiny Springs Healthcare Surprise AZ';

// ΓöÇΓöÇ Shared fetch with browser UA + timeout ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const fetchH = (url, headers = {}, ms = 8000) =>
  fetch(url, {
    headers: {
      'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control':   'no-cache',
      ...headers,
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(ms),
  });

const strip = (s = '') => s.replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').replace(/&#\d+;/g,'').replace(/\s+/g, ' ').trim();

function parseCount(s) {
  if (s == null) return null;
  const str = String(s).replace(/,/g, '').trim();
  const m = str.match(/^([\d.]+)\s*([KkMmBb]?)$/);
  if (!m) { const n = parseInt(str.replace(/\D/g,'')); return isNaN(n) ? null : n; }
  return Math.round(parseFloat(m[1]) * ({ k:1e3, m:1e6, b:1e9 }[m[2].toLowerCase()] || 1));
}

// ΓöÇΓöÇ JSON-LD helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function getJsonLd(html) {
  const out = [];
  const rx = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = rx.exec(html))) { try { out.push(JSON.parse(m[1])); } catch {} }
  return out;
}
function findAggRating(items) {
  const walk = (o) => {
    if (!o || typeof o !== 'object') return null;
    if (o.aggregateRating) {
      const ar = o.aggregateRating;
      const rating = parseFloat(ar.ratingValue);
      const count  = parseInt(ar.reviewCount ?? ar.ratingCount ?? ar.userInteractionCount ?? 0);
      if (!isNaN(rating)) return { rating, reviewCount: count || null };
    }
    if (Array.isArray(o['@graph'])) for (const i of o['@graph']) { const r = walk(i); if (r) return r; }
    return null;
  };
  for (const s of items) { const r = walk(s); if (r) return r; }
  return null;
}

// ΓöÇΓöÇ 1. WEBSITE SCRAPER ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
async function scrapeWebsite() {
  const r = await fetchH(DS_WEB, {}, 9000);
  if (!r.ok) throw new Error(`Website HTTP ${r.status}`);
  const html = await r.text();

  const get = rx => { const m = html.match(rx); return m ? strip(m[1]) : null; };
  const title    = get(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitle  = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i) || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title/i);
  const ogDesc   = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i) || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description/i);
  const metaDesc = get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i) || get(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description/i);
  const ogImage  = get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i) || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image/i);
  const h1m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1  = h1m ? strip(h1m[1]) : null;
  const h2s = []; const h2Rx = /<h2[^>]*>([\s\S]*?)<\/h2>/gi; let hm;
  while ((hm = h2Rx.exec(html)) && h2s.length < 8) { const t = strip(hm[1]); if (t.length>2&&t.length<140) h2s.push(t); }
  // Phones ΓÇö prefer tel: links (authoritative), fall back to stripped text only
  const phones = [];
  const telRx = /href=["']tel:([\d\s().+\-]+)["']/gi; let tm;
  while ((tm = telRx.exec(html)) && phones.length < 3) {
    const digits = tm[1].replace(/\D/g, '');
    if (digits.length >= 10) phones.push(tm[1].trim());
  }
  if (phones.length === 0) {
    const textOnly = html.replace(/<[^>]+>/g, ' ');
    const pRx = /\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/g; let pm2;
    while ((pm2 = pRx.exec(textOnly)) && phones.length < 3) phones.push(pm2[0]);
  }
  const kws = ['mental health','behavioral health','therapy','counseling','psychiatry','depression','anxiety','ptsd','trauma','addiction','substance','bipolar','outpatient','inpatient','iop','php','adolescent','telehealth'];
  const lo  = html.toLowerCase();
  const services = kws.filter(k => lo.includes(k));
  const wordCount = html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').split(' ').filter(w=>w.length>2).length;
  const schemaRating = findAggRating(getJsonLd(html));

  // Social media links found on page (bonus ΓÇö hardcoded handles used as primary)
  const socialLinks = {};
  const hrefs = html.match(/href=["']([^"']+)["']/gi) || [];
  for (const h of hrefs) {
    const href = h.replace(/href=["']/,'').replace(/["']$/,'');
    if (/facebook\.com\/[a-zA-Z0-9._%-]+/.test(href)  && !socialLinks.facebook)  socialLinks.facebook  = href;
    if (/instagram\.com\/[a-zA-Z0-9._%-]+/.test(href) && !socialLinks.instagram) socialLinks.instagram = href;
    if (/tiktok\.com\/@[a-zA-Z0-9._%-]+/.test(href)   && !socialLinks.tiktok)    socialLinks.tiktok    = href;
    if (/linkedin\.com\/(company|in)/.test(href)       && !socialLinks.linkedin)  socialLinks.linkedin  = href;
    if (/youtube\.com\/@?[a-zA-Z]/.test(href)          && !socialLinks.youtube)   socialLinks.youtube   = href;
  }
  // Fallback: always include known Destiny Springs handles even if not linked from the site
  if (!socialLinks.facebook)  socialLinks.facebook  = DS_FB;
  if (!socialLinks.instagram) socialLinks.instagram = DS_IG;
  if (!socialLinks.tiktok)    socialLinks.tiktok    = DS_TT;
  if (!socialLinks.linkedin)  socialLinks.linkedin  = DS_LI;

  return { url: DS_WEB, title: ogTitle||title, description: ogDesc||metaDesc, image: ogImage, h1, h2s, phones: [...new Set(phones)], services, wordCount, schemaRating, socialLinks, scrapedAt: new Date().toISOString() };
}

// ΓöÇΓöÇ 2. FACEBOOK SCRAPER ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
async function scrapeFacebook(url = DS_FB) {
  // ΓöÇΓöÇ Strategy A: Facebook Graph API (reliable for any public Business Page) ΓöÇΓöÇ
  const APP_ID     = process.env.META_APP_ID;
  const APP_SECRET = process.env.META_APP_SECRET;
  if (APP_ID && APP_SECRET) {
    try {
      const pageId   = url.match(/[?&]id=(\d+)/)?.[1] || url.replace(/\/$/, '').split('/').pop() || '';
      const appToken = `${APP_ID}|${APP_SECRET}`;
      const [pageRes, postsRes] = await Promise.all([
        fetch(`https://graph.facebook.com/v18.0/${pageId}?fields=name,fan_count,followers_count,about,category,website,picture.type(large)&access_token=${appToken}`, { signal: AbortSignal.timeout(8000) }),
        fetch(`https://graph.facebook.com/v18.0/${pageId}/posts?fields=message,story,created_time,full_picture,permalink_url,likes.summary(true),comments.summary(true),shares&limit=12&access_token=${appToken}`, { signal: AbortSignal.timeout(8000) }),
      ]);
      const pageData  = await pageRes.json();
      const postsData = await postsRes.json();
      if (!pageData.error && pageData.name) {
        const posts = (postsData.data || []).map(p => ({
          id:       p.id,
          message:  p.message || p.story || '',
          image:    p.full_picture     || null,
          url:      p.permalink_url    || null,
          date:     p.created_time,
          likes:    p.likes?.summary?.total_count    || 0,
          comments: p.comments?.summary?.total_count || 0,
          shares:   p.shares?.count || 0,
        }));
        return {
          platform:  'Facebook',
          url:       `https://www.facebook.com/${pageId}`,
          name:      pageData.name,
          followers: pageData.followers_count || pageData.fan_count || 0,
          likes:     pageData.fan_count       || 0,
          about:     pageData.about           || null,
          picture:   pageData.picture?.data?.url || null,
          posts,
          fetchedAt: new Date().toISOString(),
          method:    'graph_api',
        };
      }
    } catch (_) { /* fall through to HTML scrape */ }
  }

  // ΓöÇΓöÇ Strategy B: Mobile HTML scrape (fallback when Graph API unavailable) ΓöÇΓöÇ
  const mobileUrl = url.replace('www.facebook.com','m.facebook.com').replace('//facebook.com','//m.facebook.com');
  try {
    const r = await fetchH(mobileUrl, {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    }, 8000);
    if (!r.ok) throw new Error(`FB HTTP ${r.status}`);
    const html = await r.text();

    const nameM = html.match(/<title>([^<]+)<\/title>/i);
    const name  = nameM ? strip(nameM[1]).replace(/\s*[-|].*$/,'').trim() : null;

    // Meta description often contains "X followers ┬╖ X likes ┬╖ Page ┬╖ mental health..."
    const metaM = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i) ||
                  html.match(/<meta[^>]+content="([^"]+)"[^>]+name="description"/i);
    const metaDesc = metaM ? metaM[1] : '';

    // Pattern attempts in meta description and page body
    const followersM = metaDesc.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+[Ff]ollower/)?.[1]
                    || html.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+[Ff]ollower/)?.[1]
                    || html.match(/"follower_count"\s*:\s*(\d+)/)?.[1];
    const likesM     = metaDesc.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+[Ll]ike/)?.[1]
                    || html.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+[Pp]eople\s+like/)?.[1]
                    || html.match(/"like_count"\s*:\s*(\d+)/)?.[1];
    const aboutM    = metaDesc.length > 20 ? strip(metaDesc).slice(0,250) : null;

    return { platform:'Facebook', url: url.replace('m.facebook.com','www.facebook.com'), name, followers: parseCount(followersM), likes: parseCount(likesM), about: aboutM, fetchedAt: new Date().toISOString() };
  } catch(e) {
    return { platform:'Facebook', url, error: e.message, fetchedAt: new Date().toISOString() };
  }
}

// ΓöÇΓöÇ 3. INSTAGRAM SCRAPER ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
async function scrapeInstagram(url = DS_IG, userToken = null, userPageId = null) {
  const username = url.match(/instagram\.com\/([^/?#\s]+)/i)?.[1] || 'destinyspringshealthcare';

  // ΓöÇΓöÇ Strategy A: Graph API ΓÇö prefer passed user token, fall back to app token ΓöÇΓöÇ
  const APP_ID     = process.env.META_APP_ID;
  const APP_SECRET = process.env.META_APP_SECRET;
  const graphToken = userToken || (APP_ID && APP_SECRET ? `${APP_ID}|${APP_SECRET}` : null);
  if (graphToken) {
    try {
      const fbPageId = userPageId || DS_FB.match(/[?&]id=(\d+)/)?.[1] || '61581511228047';
      const appToken = graphToken;
      const igChkRes = await fetch(`https://graph.facebook.com/v18.0/${fbPageId}?fields=instagram_business_account&access_token=${appToken}`, { signal: AbortSignal.timeout(6000) });
      const igChk    = await igChkRes.json();
      if (igChk.instagram_business_account?.id) {
        const igId = igChk.instagram_business_account.id;
        const [igRes, mediaRes] = await Promise.all([
          fetch(`https://graph.facebook.com/v18.0/${igId}?fields=followers_count,media_count,name,username,biography,profile_picture_url&access_token=${appToken}`, { signal: AbortSignal.timeout(6000) }),
          fetch(`https://graph.facebook.com/v18.0/${igId}/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count&limit=12&access_token=${appToken}`, { signal: AbortSignal.timeout(6000) }),
        ]);
        const igData    = await igRes.json();
        const mediaData = await mediaRes.json();
        if (!igData.error && igData.username) {
          return {
            platform:    'Instagram',
            url:         `https://www.instagram.com/${igData.username}/`,
            username:    igData.username,
            fullName:    igData.name,
            bio:         igData.biography,
            followers:   igData.followers_count,
            posts:       igData.media_count,
            profilePic:  igData.profile_picture_url,
            recentMedia: (mediaData.data || []).map(p => ({
              id:       p.id,
              type:     p.media_type,
              image:    p.media_url || p.thumbnail_url,
              url:      p.permalink,
              caption:  p.caption?.slice(0, 120) || '',
              date:     p.timestamp,
              likes:    p.like_count     || 0,
              comments: p.comments_count || 0,
            })),
            fetchedAt: new Date().toISOString(),
            method:    'graph_api',
          };
        }
      }
    } catch (_) { /* fall through */ }
  }

  try {
    // Strategy B: unofficial profile info API
    try {
      const apiRes = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
        headers: {
          'User-Agent':       'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          'X-IG-App-ID':      '936619743392459',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept':           'application/json',
          'Referer':          `https://www.instagram.com/${username}/`,
          'Cookie':           '', // needs session in reality; works serverless sometimes
        },
        signal: AbortSignal.timeout(6000),
        redirect: 'follow',
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        const user = json?.data?.user;
        if (user?.edge_followed_by) {
          return {
            platform: 'Instagram', url: `https://www.instagram.com/${username}/`,
            username: user.username, fullName: user.full_name, bio: user.biography,
            followers: user.edge_followed_by?.count, following: user.edge_follow?.count,
            posts: user.edge_owner_to_timeline_media?.count,
            isVerified: user.is_verified, profilePic: user.profile_pic_url_hd,
            fetchedAt: new Date().toISOString(), method: 'api',
          };
        }
      }
    } catch {}

    // Strategy B: scrape HTML, look for embedded JSON data blocks
    const r = await fetchH(`https://www.instagram.com/${username}/`, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    }, 8000);
    if (!r.ok) throw new Error(`IG HTTP ${r.status}`);
    const html = await r.text();

    // Look for follower count in meta/title
    const nameM  = html.match(/<title>([^<]+)<\/title>/i);
    const metaM  = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i) ||
                   html.match(/<meta[^>]+content="([^"]+)"[^>]+name="description"/i);
    const metaD  = metaM ? metaM[1] : '';
    // Meta: "X Followers, Y Following, Z Posts - See Instagram photos..."
    const fM = metaD.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+Follower/i) ||
               html.match(/"edge_followed_by":\{"count":(\d+)/) ||
               html.match(/"followerCount":(\d+)/);
    const pM = metaD.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+Post/i) ||
               html.match(/"edge_owner_to_timeline_media":\{"count":(\d+)/);
    return {
      platform: 'Instagram', url: `https://www.instagram.com/${username}/`, username,
      fullName: nameM ? strip(nameM[1]).replace(/\s*[ΓÇó(].*$/,'').trim() : null,
      bio: metaD ? strip(metaD).slice(0,200) : null,
      followers: fM ? parseCount(fM[1]) : null,
      posts: pM ? parseCount(pM[1]) : null,
      fetchedAt: new Date().toISOString(), method: 'html',
    };
  } catch(e) {
    return { platform:'Instagram', url, error: e.message, fetchedAt: new Date().toISOString() };
  }
}

// ΓöÇΓöÇ 4. TIKTOK SCRAPER ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
async function scrapeTikTok(url = DS_TT) {
  const handle = url.match(/@([^/?#\s]+)/)?.[1] || 'destinyspringshealthcare';
  const cleanUrl = `https://www.tiktok.com/@${handle}`;
  try {
    const r = await fetchH(cleanUrl, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    }, 8000);
    if (!r.ok) throw new Error(`TT HTTP ${r.status}`);
    const html = await r.text();

    // Strategy A: TikTok embeds all profile data in a JSON blob
    const dataScriptM = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/) ||
                        html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (dataScriptM) {
      try {
        const json = JSON.parse(dataScriptM[1]);
        // Walk tree looking for user stats object
        const findStats = (o, d=0) => {
          if (!o || typeof o !== 'object' || d>12) return null;
          if (o.stats?.followerCount != null && o.user?.uniqueId) return { user: o.user, stats: o.stats };
          if (o.userInfo?.user && o.userInfo?.stats) return { user: o.userInfo.user, stats: o.userInfo.stats };
          for (const v of Object.values(o)) { const r = findStats(v,d+1); if (r) return r; }
          return null;
        };
        const found = findStats(json);
        if (found?.stats) {
          return {
            platform: 'TikTok', url: cleanUrl,
            username: found.user?.uniqueId || handle,
            nickname: found.user?.nickname,
            bio:      found.user?.signature,
            followers: found.stats.followerCount,
            following: found.stats.followingCount,
            likes:    found.stats.heartCount || found.stats.heart,
            videos:   found.stats.videoCount,
            isVerified: found.user?.verified,
            fetchedAt: new Date().toISOString(), method: 'json',
          };
        }
      } catch {}
    }

    // Strategy B: regex fallback
    const fM   = html.match(/"followerCount"\s*:\s*(\d+)/) || html.match(/([\d.]+[KkMm]?)\s+Followers/i);
    const likM  = html.match(/"heartCount"\s*:\s*(\d+)/) || html.match(/"heart"\s*:\s*(\d+)/);
    const vidM  = html.match(/"videoCount"\s*:\s*(\d+)/);
    const nameM = html.match(/<title>([^<]+)<\/title>/i);
    const metaM = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i) ||
                  html.match(/<meta[^>]+content="([^"]+)"[^>]+name="description"/i);

    return {
      platform: 'TikTok', url: cleanUrl, username: handle,
      nickname: nameM ? strip(nameM[1]).replace(/\s*[-|].*$/,'').trim() : null,
      bio: metaM ? strip(metaM[1]).slice(0,200) : null,
      followers: fM ? parseCount(fM[1]) : null,
      likes: likM ? parseCount(likM[1]) : null,
      videos: vidM ? parseInt(vidM[1]) : null,
      fetchedAt: new Date().toISOString(), method: 'regex',
    };
  } catch(e) {
    return { platform:'TikTok', url: cleanUrl, error: e.message, fetchedAt: new Date().toISOString() };
  }
}

// ΓöÇΓöÇ 5. LINKEDIN SCRAPER ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
async function scrapeLinkedIn(url = DS_LI) {
  const slug = url.match(/linkedin\.com\/company\/([^/?#\s]+)/i)?.[1] || 'destiny-springs-healthcare';
  const cleanUrl = `https://www.linkedin.com/company/${slug}`;
  try {
    // Strategy A: public company page JSON-LD / meta
    const r = await fetchH(cleanUrl, {
      'User-Agent': 'Mozilla/5.0 (compatible; LinkedInBot/1.0; +http://www.linkedin.com/)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }, 9000);
    if (!r.ok) throw new Error(`LI HTTP ${r.status}`);
    const html = await r.text();

    // LinkedIn embeds data in <code> tags with JSON inside (voyager data)
    const codeBlocks = [];
    const codeRx = /<code[^>]*>(<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/code>/gi;
    let cm;
    while ((cm = codeRx.exec(html)) && codeBlocks.length < 20) {
      try { codeBlocks.push(JSON.parse(cm[2])); } catch {}
    }

    // Walk JSON trees for follower count
    const findLiData = (o, d = 0) => {
      if (!o || typeof o !== 'object' || d > 10) return null;
      if (o.followersCount != null || o.followerCount != null) return o;
      if (o.$recipeType === 'com.linkedin.voyager.identity.shared.MiniCompany') return o;
      for (const v of Object.values(o)) {
        const r = findLiData(v, d + 1);
        if (r) return r;
      }
      return null;
    };

    let followers = null, name = null, tagline = null, employees = null;

    for (const block of codeBlocks) {
      const found = findLiData(block);
      if (found) {
        followers = found.followersCount ?? found.followerCount ?? followers;
        name      = found.name ?? found.localizedName ?? name;
        tagline   = found.tagline ?? found.localizedTagline ?? tagline;
        employees = found.staffCountRange ?? found.staffCount ?? employees;
        if (followers != null) break;
      }
    }

    // Strategy B: meta description / page text fallbacks
    if (followers == null) {
      const metaM = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i) ||
                    html.match(/<meta[^>]+content="([^"]+)"[^>]+name="description"/i);
      const metaD = metaM ? metaM[1] : '';
      const fM = metaD.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+follower/i) ||
                 html.match(/([\d,]+(?:\.\d+)?[KkMm]?)\s+follower/i) ||
                 html.match(/"followersCount":(\d+)/) ||
                 html.match(/"followerCount":(\d+)/);
      if (fM) followers = parseCount(fM[1]);
      if (!name) {
        const titleM = html.match(/<title>([^<]+)<\/title>/i);
        name = titleM ? strip(titleM[1]).replace(/\s*[|:ΓÇô].*$/, '').trim() : null;
      }
      if (!tagline) {
        const ogM = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i);
        tagline = ogM ? strip(ogM[1]).slice(0, 200) : null;
      }
    }

    // Strategy C: try the public API endpoint for company info
    if (followers == null) {
      try {
        const apiR = await fetch(`https://www.linkedin.com/voyager/api/organization/companies?q=universalName&universalName=${slug}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'application/vnd.linkedin.normalized+json+2.1',
            'csrf-token': 'ajax:0',
            'x-li-lang': 'en_US',
            'x-li-track': '{"clientVersion":"1.13.5765"}',
          },
          signal: AbortSignal.timeout(5000),
        });
        if (apiR.ok) {
          const aj = await apiR.json();
          const elem = aj?.included?.find(e => e.followersCount != null);
          if (elem) followers = elem.followersCount;
        }
      } catch {}
    }

    return {
      platform: 'LinkedIn', url: cleanUrl, slug, name,
      tagline, followers, employees: (employees != null && typeof employees === 'object') ? `${employees.start || ''}ΓÇô${employees.end || ''}` : employees,
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    return { platform: 'LinkedIn', url: cleanUrl, error: e.message, fetchedAt: new Date().toISOString() };
  }
}

// ΓöÇΓöÇ 6. HEALTHGRADES SCRAPER ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
async function scrapeHealthgrades() {
  try {
    const searchUrl = `https://www.healthgrades.com/search?what=${encodeURIComponent('Destiny Springs Healthcare')}&where=${encodeURIComponent('Scottsdale, AZ')}&pt=HOSPITAL`;
    const r1 = await fetchH(searchUrl, {}, 7000);
    if (!r1.ok) return null;
    const html1 = await r1.text();
    const linkM = html1.match(/href="(\/group-directory\/[^"?]+)/i) || html1.match(/href="(\/physician\/[^"?]+)/i);
    if (!linkM) return null;
    const profileUrl = 'https://www.healthgrades.com' + linkM[1];
    const r2 = await fetchH(profileUrl, {}, 7000);
    if (!r2.ok) return null;
    const html2 = await r2.text();
    const ld = findAggRating(getJsonLd(html2));
    if (ld) return { ...ld, source: 'Healthgrades', profileUrl };
    const rM = html2.match(/"ratingValue"\s*:\s*"?([\d.]+)/i);
    const cM = html2.match(/"reviewCount"\s*:\s*"?(\d+)/i) || html2.match(/([\d,]+)\s+(?:reviews?|ratings?)/i);
    if (rM) return { rating: parseFloat(rM[1]), reviewCount: cM ? parseInt(cM[1].replace(/,/g,'')) : null, source: 'Healthgrades', profileUrl };
    return null;
  } catch { return null; }
}

// ΓöÇΓöÇ 8. YELP SCRAPER ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
async function scrapeYelp() {
  try {
    // 1. Search for the business
    const searchUrl = `https://www.yelp.com/search?find_desc=${encodeURIComponent(DS_YELP_QUERY)}&find_loc=${encodeURIComponent('Scottsdale, AZ')}`;
    const r1 = await fetchH(searchUrl, {}, 8000);
    if (!r1.ok) throw new Error(`Yelp search HTTP ${r1.status}`);
    const html1 = await r1.text();

    // Extract first business result link
    const bizM = html1.match(/href="(\/biz\/[a-z0-9-]+)"/i);
    if (!bizM) throw new Error('No Yelp listing found in search');

    const bizUrl = 'https://www.yelp.com' + bizM[1];
    const r2 = await fetchH(bizUrl, {}, 8000);
    if (!r2.ok) throw new Error(`Yelp profile HTTP ${r2.status}`);
    const html2 = await r2.text();

    // Try JSON-LD first (most reliable)
    const ld = (function() {
      const rx  = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      let m;
      while ((m = rx.exec(html2))) {
        try {
          const j = JSON.parse(m[1]);
          if (j.aggregateRating?.ratingValue) return j;
          if (Array.isArray(j['@graph'])) {
            const found = j['@graph'].find(x => x.aggregateRating?.ratingValue);
            if (found) return found;
          }
        } catch {}
      }
      return null;
    })();

    if (ld?.aggregateRating) {
      return {
        platform: 'Yelp', url: bizUrl,
        name:        strip(ld.name || ''),
        rating:      parseFloat(ld.aggregateRating.ratingValue),
        reviewCount: parseInt(ld.aggregateRating.reviewCount || ld.aggregateRating.ratingCount || 0) || null,
        priceRange:  ld.priceRange || null,
        category:    ld['@type'] || null,
        phone:       ld.telephone || null,
        address:     ld.address ? [ld.address.streetAddress, ld.address.addressLocality, ld.address.addressRegion].filter(Boolean).join(', ') : null,
        fetchedAt:   new Date().toISOString(),
      };
    }

    // Fallback: regex
    const rM = html2.match(/"ratingValue":"?([\d.]+)/) || html2.match(/([\d.]+)\s+star rating/i);
    const cM = html2.match(/"reviewCount":"?(\d+)/) || html2.match(/(\d+)\s+reviews?/i);
    const nameM = html2.match(/<title>([^|<]+)/i);
    return {
      platform: 'Yelp', url: bizUrl,
      name:        nameM ? strip(nameM[1]).trim() : null,
      rating:      rM ? parseFloat(rM[1]) : null,
      reviewCount: cM ? parseInt(cM[1]) : null,
      fetchedAt:   new Date().toISOString(),
    };
  } catch (e) {
    return { platform: 'Yelp', error: e.message, fetchedAt: new Date().toISOString() };
  }
}

// ΓöÇΓöÇ 9. GLASSDOOR SCRAPER ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const GLASSDOOR_SLUG = process.env.DS_GLASSDOOR_SLUG || DS_GD;
async function scrapeGlassdoor() {
  try {
    const searchUrl = `https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent('Destiny Springs Healthcare')}&locId=0&locName=Anywhere`;
    const r1 = await fetchH(searchUrl, { 'Referer': 'https://www.glassdoor.com/' }, 8000);
    if (!r1.ok) throw new Error(`GD search HTTP ${r1.status}`);
    const html1 = await r1.text();

    // Find employer link
    const linkM = html1.match(/href="(\/Overview\/[^"?]+)"/i) || html1.match(/href="(\/Reviews\/[^"?]+)"/i);
    if (!linkM) throw new Error('No Glassdoor listing found');

    const profileUrl = 'https://www.glassdoor.com' + linkM[1];
    const r2 = await fetchH(profileUrl, { 'Referer': 'https://www.glassdoor.com/' }, 8000);
    if (!r2.ok) throw new Error(`GD profile HTTP ${r2.status}`);
    const html2 = await r2.text();

    // Try JSON-LD
    const jsonLd = (function() {
      const rx = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      let m;
      while ((m = rx.exec(html2))) {
        try {
          const j = JSON.parse(m[1]);
          if (j.aggregateRating || (j['@graph'] || []).some(x => x.aggregateRating)) return j;
        } catch {}
      }
      return null;
    })();

    const findAR = (o) => {
      if (!o) return null;
      if (o.aggregateRating?.ratingValue) return o.aggregateRating;
      if (Array.isArray(o['@graph'])) {
        for (const i of o['@graph']) { if (i.aggregateRating?.ratingValue) return i.aggregateRating; }
      }
      return null;
    };
    const ar = findAR(jsonLd);

    const rM    = html2.match(/"overallRating":"?([\d.]+)/) || html2.match(/class="[^"]*ratingNumber[^"]*">([\d.]+)</);
    const cM    = html2.match(/"numberOfRatings":(\d+)/) || html2.match(/(\d+)\s+Reviews/i);
    const empM  = html2.match(/"numberOfEmployees":"([^"]+)"/) || html2.match(/(\d+[ΓÇô-]\d+[^<"]{0,30}employees)/i);
    const nameM = html2.match(/"name":"([^"]+)"/i);

    return {
      platform: 'Glassdoor', url: profileUrl,
      name:        nameM ? nameM[1] : null,
      rating:      ar ? parseFloat(ar.ratingValue) : (rM ? parseFloat(rM[1]) : null),
      reviewCount: ar ? parseInt(ar.reviewCount || ar.ratingCount || 0) || null : (cM ? parseInt(cM[1]) : null),
      employees:   empM ? empM[1] : null,
      fetchedAt:   new Date().toISOString(),
    };
  } catch (e) {
    return { platform: 'Glassdoor', error: e.message, fetchedAt: new Date().toISOString() };
  }
}

// ΓöÇΓöÇ 10. GOOGLE / BING / DDG RATING SCRAPER ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Tries multiple sources in order. Google blocks Vercel IPs aggressively;
// Bing and DuckDuckGo are more permissive from cloud environments.
function _parseRatingFromHtml(html, sourceName) {
  // JSON-LD aggregate rating
  const ld = findAggRating(getJsonLd(html));
  if (ld?.rating) return { ...ld, source: sourceName };
  // aria-label pattern (Google)
  const aria = html.match(/aria-label=["'][Rr]ated?\s*([\d.]+)[^"']*\(([\d,]+)\s+review/i);
  if (aria) return { rating: parseFloat(aria[1]), reviewCount: parseInt(aria[2].replace(/,/g,'')), source: sourceName };
  // inline rating + review count
  const inline = html.match(/([\d.]{1,3})\s*(?:(?:out of|\/)\s*5|Γÿà).*?([\d,]{3,})\s*(?:Google\s+)?reviews?/i)
               || html.match(/([\d.]{3})\s*\([^)]*([\d,]{3,})\s*(?:Google\s+)?reviews?/i);
  if (inline) return { rating: parseFloat(inline[1]), reviewCount: parseInt(inline[2].replace(/,/g,'')), source: sourceName };
  // Bing structured snippets: "4.2 ┬╖ 168 Google reviews"
  const bing = html.match(/(\d\.\d)\s*[┬╖ΓÇó]\s*([\d,]+)\s+(?:Google\s+)?reviews?/i);
  if (bing) return { rating: parseFloat(bing[1]), reviewCount: parseInt(bing[2].replace(/,/g,'')), source: sourceName };
  // count only (no star)
  const countOnly = html.match(/([\d,]+)\s+Google reviews/i);
  if (countOnly) return { rating: null, reviewCount: parseInt(countOnly[1].replace(/,/g,'')), source: sourceName };
  return null;
}
async function scrapeGoogleRating() {
  // ΓöÇΓöÇ 1. Bing search (cloud-friendly, returns knowledge card with rating) ΓöÇΓöÇ
  try {
    const bingUrl = `https://www.bing.com/search?q=${encodeURIComponent(DS_QUERY + ' reviews')}&setmkt=en-US&setlang=en`;
    const rb = await fetchH(bingUrl, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.bing.com/',
    }, 8000);
    if (rb.ok) {
      const bHtml = await rb.text();
      const res = _parseRatingFromHtml(bHtml, 'Google (search)');
      if (res?.rating) return res;
    }
  } catch { /* continue */ }

  // ΓöÇΓöÇ 2. DuckDuckGo search HTML (very permissive, no IP blocking) ΓöÇΓöÇ
  try {
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(DS_QUERY + ' reviews rating site:google.com OR site:healthgrades.com')}`;
    const rd = await fetchH(ddgUrl, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': 'https://duckduckgo.com/',
    }, 8000);
    if (rd.ok) {
      const dHtml = await rd.text();
      const res = _parseRatingFromHtml(dHtml, 'Google (search)');
      if (res?.rating) return res;
    }
  } catch { /* continue */ }

  // ΓöÇΓöÇ 3. Google search (often blocked from Vercel IPs, but try last) ΓöÇΓöÇ
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(DS_QUERY + ' reviews rating')}&num=3&hl=en`;
    const r = await fetchH(url, {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    }, 7000);
    if (r.ok) {
      const html = await r.text();
      const res = _parseRatingFromHtml(html, 'Google (search)');
      if (res?.rating) return res;
    }
  } catch { /* continue */ }

  return null;
}

// ΓöÇΓöÇ 8. GOOGLE PLACES API (optional ΓÇö needs GOOGLE_PLACES_KEY env var) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
async function findPlaceId(apiKey) {
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(DS_QUERY)}&inputtype=textquery&fields=place_id,name,rating,formatted_address&key=${apiKey}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(7000) });
  const d = await r.json();
  if (d.status !== 'OK' && d.status !== 'ZERO_RESULTS') throw new Error(`Places find: ${d.status}`);
  return d.candidates?.[0] || null;
}
async function getPlaceDetails(placeId, apiKey) {
  const fields = 'name,rating,user_ratings_total,formatted_phone_number,formatted_address,website,opening_hours,reviews,photos,url,vicinity,business_status';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&reviews_sort=newest&key=${apiKey}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(7000) });
  const d = await r.json();
  if (d.status !== 'OK') throw new Error(`Places details: ${d.status} ΓÇö ${d.error_message||''}`);
  const p = d.result;
  return {
    placeId, name: p.name, rating: p.rating, reviewCount: p.user_ratings_total,
    phone: p.formatted_phone_number, address: p.formatted_address, vicinity: p.vicinity,
    website: p.website, googleUrl: p.url, isOpen: p.opening_hours?.open_now,
    businessStatus: p.business_status, hours: p.opening_hours?.weekday_text || [],
    reviews: (p.reviews||[]).map(rv => ({
      author: rv.author_name, rating: rv.rating, text: rv.text,
      relativeTime: rv.relative_time_description,
      time: rv.time ? new Date(rv.time*1000).toISOString() : null,
      photoUrl: rv.profile_photo_url,
    })),
    fetchedAt: new Date().toISOString(),
  };
}

// ΓöÇΓöÇ MAIN HANDLER ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey    = process.env.GOOGLE_PLACES_KEY || req.query.apiKey || '';
  const { action, placeId: qPid, debug, metaToken, metaPageId } = req.query;

  try {
    // ΓöÇΓöÇ Env-var diagnostic (no key values exposed) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    if (action === 'envcheck') {
      const envKeys = Object.keys(process.env);
      return res.json({
        ok: true,
        GOOGLE_PLACES_KEY:  !!process.env.GOOGLE_PLACES_KEY,
        META_APP_ID:        !!process.env.META_APP_ID,
        META_APP_SECRET:    !!process.env.META_APP_SECRET,
        GOOGLE_PLACES_KEY_len: (process.env.GOOGLE_PLACES_KEY || '').length,
        META_APP_ID_len:       (process.env.META_APP_ID       || '').length,
        META_APP_SECRET_len:   (process.env.META_APP_SECRET   || '').length,
        allEnvKeys: envKeys.filter(k => !k.includes('SECRET') && !k.includes('KEY') && !k.includes('TOKEN') && !k.includes('PASSWORD')),
        envCount: envKeys.length,
      });
    }

    // Single-source debug endpoints
    if (action === 'website')   return res.json({ ok:true, website:   await scrapeWebsite() });
    if (action === 'facebook')  return res.json({ ok:true, facebook:  await scrapeFacebook() });
    if (action === 'instagram') return res.json({ ok:true, instagram: await scrapeInstagram(DS_IG, metaToken||null, metaPageId||null) });
    if (action === 'tiktok')    return res.json({ ok:true, tiktok:    await scrapeTikTok() });
    if (action === 'linkedin')  return res.json({ ok:true, linkedin:  await scrapeLinkedIn() });
    if (action === 'yelp')      return res.json({ ok:true, yelp:      await scrapeYelp() });
    if (action === 'glassdoor') return res.json({ ok:true, glassdoor: await scrapeGlassdoor() });
    if (action === 'hg')        return res.json({ ok:true, healthgrades: await scrapeHealthgrades() });
    if (action === 'gsearch')   return res.json({ ok:true, googleSearch: await scrapeGoogleRating() });
    if (action === 'findplace') {
      if (!apiKey) return res.status(400).json({ ok:false, error:'Requires GOOGLE_PLACES_KEY' });
      return res.json({ ok:true, ...(await findPlaceId(apiKey)) });
    }

    // ΓöÇΓöÇ Run ALL sources in TRUE parallel ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const result = { ok: true, fetchedAt: new Date().toISOString(), sources: {} };

    const [website, facebook, instagram, tiktok, linkedin, healthgrades, googleSearch, googlePlaces, yelp, glassdoor] =
      await Promise.all([
        scrapeWebsite().catch(e    => ({ error: `Website: ${e.message}` })),
        scrapeFacebook().catch(e   => ({ platform:'Facebook',  error: e.message })),
        scrapeInstagram(DS_IG, metaToken || null, metaPageId || null).catch(e  => ({ platform:'Instagram', error: e.message })),
        scrapeTikTok().catch(e     => ({ platform:'TikTok',    error: e.message })),
        scrapeLinkedIn().catch(e   => ({ platform:'LinkedIn',  error: e.message })),
        scrapeHealthgrades().catch(() => null),
        scrapeGoogleRating().catch(() => null),
        apiKey
          ? (async () => {
              try {
                let pid = qPid || '';
                if (!pid) { const c = await findPlaceId(apiKey); pid = c?.place_id||''; }
                if (pid) return await getPlaceDetails(pid, apiKey);
                return { error: 'Place not found' };
              } catch(e) { return { error: e.message }; }
            })()
          : Promise.resolve(null),
        scrapeYelp().catch(() => null),
        scrapeGlassdoor().catch(() => null),
      ]);

    if (website && !website.error) result.website = website;
    else result.websiteError = website?.error || 'Failed';

    if (facebook && !facebook.error) result.facebook = facebook;
    else result.sources.facebook = { error: facebook?.error || 'Blocked or not found' };

    if (instagram && !instagram.error) result.instagram = instagram;
    else result.sources.instagram = { error: instagram?.error || 'Blocked or not found' };

    if (tiktok && !tiktok.error) result.tiktok = tiktok;
    else result.sources.tiktok = { error: tiktok?.error || 'Blocked or not found' };

    if (linkedin && !linkedin.error) result.linkedin = linkedin;
    else result.sources.linkedin = { error: linkedin?.error || 'Blocked or not found' };

    if (yelp && !yelp.error) result.yelp = yelp;
    else result.sources.yelp = { error: yelp?.error || 'Not found' };

    if (glassdoor && !glassdoor.error) result.glassdoor = glassdoor;
    else result.sources.glassdoor = { error: glassdoor?.error || 'Not found' };

    if (healthgrades) result.healthgrades = healthgrades;
    if (googleSearch) result.googleSearch = googleSearch;
    if (googlePlaces && !googlePlaces.error) result.google = googlePlaces;
    else if (googlePlaces?.error) result.googleError = googlePlaces.error;
    else result.googleSkipped = true;

    // Best available rating (priority: Places API > Google Search > Website Schema > Healthgrades)
    const rCandidates = [
      result.google         && { rating: result.google.rating, reviewCount: result.google.reviewCount, source: 'Google Business (API)' },
      googleSearch          && { ...googleSearch },
      result.yelp           && result.yelp.rating && { rating: result.yelp.rating, reviewCount: result.yelp.reviewCount, source: 'Yelp' },
      website?.schemaRating && { ...website.schemaRating, source: 'Website JSON-LD schema' },
      healthgrades          && { ...healthgrades },
      result.glassdoor      && result.glassdoor.rating && { rating: result.glassdoor.rating, reviewCount: result.glassdoor.reviewCount, source: 'Glassdoor' },
    ].filter(c => c && c.rating);

    if (rCandidates.length > 0) {
      result.bestRating = rCandidates[0];
      result.allRatings = rCandidates;
    }

    // Debug mode: include raw source errors
    if (debug === '1') result._debug = {
      facebookError:  facebook?.error,
      instagramError: instagram?.error,
      tiktokError:    tiktok?.error,
      linkedinError:  linkedin?.error,
      yelpError:      yelp?.error,
      glassdoorError: glassdoor?.error,
      websiteError:   website?.error,
    };

    return res.status(200).json(result);
  } catch(e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
}
