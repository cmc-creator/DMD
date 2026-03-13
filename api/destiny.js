// ── Destiny Springs Healthcare — All-in-One Live Data Fetcher ────────────────
// Runs ALL scrapers in TRUE parallel (no sequential chains, no self-referential
// HTTP calls). Everything is inlined in this single file.
//
// Sources (all run at the same time):
//   • destinyspringshealthcare.com — title, meta, H1/H2s, schema rating, social links
//   • Facebook (mobile HTML)       — followers, likes, about
//   • Instagram (unofficial API)   — followers, posts, bio
//   • TikTok (UNIVERSAL_DATA JSON) — followers, total likes, videos
//   • Healthgrades (HTML scrape)   — star rating, review count
//   • Google Search (HTML scrape)  — knowledge panel rating/reviews (no key)
//   • Google Places API (optional) — full reviews, hours, photos (needs key)
//
// Env var (optional):  GOOGLE_PLACES_KEY
// Debug endpoint:      GET /api/destiny?debug=1

// ── Hardcoded Destiny Springs social handles ──────────────────────────────────
const DS_FB  = 'https://www.facebook.com/destinyspringshealthcare';
const DS_IG  = 'https://www.instagram.com/destinyspringshealthcare/';
const DS_TT  = 'https://www.tiktok.com/@destinyspringshealthcare';
const DS_WEB = 'https://destinyspringshealthcare.com';
const DS_QUERY = 'Destiny Springs Healthcare Scottsdale AZ';

// ── Shared fetch with browser UA + timeout ────────────────────────────────────
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

// ── JSON-LD helpers ───────────────────────────────────────────────────────────
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

// ── 1. WEBSITE SCRAPER ────────────────────────────────────────────────────────
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
  // Phones — prefer tel: links (authoritative), fall back to stripped text only
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

  // Social media links found on page (bonus — hardcoded handles used as primary)
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

  return { url: DS_WEB, title: ogTitle||title, description: ogDesc||metaDesc, image: ogImage, h1, h2s, phones: [...new Set(phones)], services, wordCount, schemaRating, socialLinks, scrapedAt: new Date().toISOString() };
}

// ── 2. FACEBOOK SCRAPER ───────────────────────────────────────────────────────
async function scrapeFacebook(url = DS_FB) {
  // Mobile Facebook has lighter, more parseable HTML
  const mobileUrl = url.replace('www.facebook.com','m.facebook.com').replace('//facebook.com','//m.facebook.com');
  try {
    const r = await fetchH(mobileUrl, {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    }, 8000);
    if (!r.ok) throw new Error(`FB HTTP ${r.status}`);
    const html = await r.text();

    const nameM = html.match(/<title>([^<]+)<\/title>/i);
    const name  = nameM ? strip(nameM[1]).replace(/\s*[-|].*$/,'').trim() : null;

    // Meta description often contains "X followers · X likes · Page · mental health..."
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

// ── 3. INSTAGRAM SCRAPER ──────────────────────────────────────────────────────
async function scrapeInstagram(url = DS_IG) {
  const username = url.match(/instagram\.com\/([^/?#\s]+)/i)?.[1] || 'destinyspringshealthcare';
  try {
    // Strategy A: unofficial profile info API (most reliable for public accounts)
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
      fullName: nameM ? strip(nameM[1]).replace(/\s*[•(].*$/,'').trim() : null,
      bio: metaD ? strip(metaD).slice(0,200) : null,
      followers: fM ? parseCount(fM[1]) : null,
      posts: pM ? parseCount(pM[1]) : null,
      fetchedAt: new Date().toISOString(), method: 'html',
    };
  } catch(e) {
    return { platform:'Instagram', url, error: e.message, fetchedAt: new Date().toISOString() };
  }
}

// ── 4. TIKTOK SCRAPER ─────────────────────────────────────────────────────────
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

// ── 5. HEALTHGRADES SCRAPER ───────────────────────────────────────────────────
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

// ── 6. GOOGLE SEARCH KNOWLEDGE PANEL ─────────────────────────────────────────
async function scrapeGoogleRating() {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(DS_QUERY + ' reviews rating')}&num=3&hl=en`;
    const r = await fetchH(url, {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
    }, 7000);
    if (!r.ok) return null;
    const html = await r.text();
    const aria = html.match(/aria-label=["'][Rr]ated?\s*([\d.]+)[^"']*\(([\d,]+)\s+review/i);
    if (aria) return { rating: parseFloat(aria[1]), reviewCount: parseInt(aria[2].replace(/,/g,'')), source: 'Google (search)' };
    const ld = findAggRating(getJsonLd(html));
    if (ld) return { ...ld, source: 'Google (search)' };
    const inline = html.match(/([\d.]{3})\s*(?:★|\()\s*(?:[^)]{0,40})?\(?([\d,]+)\s*(?:Google\s+)?reviews?/i);
    if (inline) return { rating: parseFloat(inline[1]), reviewCount: parseInt(inline[2].replace(/,/g,'')), source: 'Google (search)' };
    const countOnly = html.match(/([\d,]+)\s+Google reviews/i);
    if (countOnly) return { rating: null, reviewCount: parseInt(countOnly[1].replace(/,/g,'')), source: 'Google (search)' };
    return null;
  } catch { return null; }
}

// ── 7. GOOGLE PLACES API (optional — needs GOOGLE_PLACES_KEY env var) ─────────
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
  if (d.status !== 'OK') throw new Error(`Places details: ${d.status} — ${d.error_message||''}`);
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

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey    = process.env.GOOGLE_PLACES_KEY || req.query.apiKey || '';
  const { action, placeId: qPid, debug } = req.query;

  try {
    // Single-source debug endpoints
    if (action === 'website')   return res.json({ ok:true, website:   await scrapeWebsite() });
    if (action === 'facebook')  return res.json({ ok:true, facebook:  await scrapeFacebook() });
    if (action === 'instagram') return res.json({ ok:true, instagram: await scrapeInstagram() });
    if (action === 'tiktok')    return res.json({ ok:true, tiktok:    await scrapeTikTok() });
    if (action === 'hg')        return res.json({ ok:true, healthgrades: await scrapeHealthgrades() });
    if (action === 'gsearch')   return res.json({ ok:true, googleSearch: await scrapeGoogleRating() });
    if (action === 'findplace') {
      if (!apiKey) return res.status(400).json({ ok:false, error:'Requires GOOGLE_PLACES_KEY' });
      return res.json({ ok:true, ...(await findPlaceId(apiKey)) });
    }

    // ── Run ALL sources in TRUE parallel ──────────────────────────────────────
    const result = { ok: true, fetchedAt: new Date().toISOString(), sources: {} };

    const [website, facebook, instagram, tiktok, healthgrades, googleSearch, googlePlaces] =
      await Promise.all([
        scrapeWebsite().catch(e    => ({ error: `Website: ${e.message}` })),
        scrapeFacebook().catch(e   => ({ platform:'Facebook',  error: e.message })),
        scrapeInstagram().catch(e  => ({ platform:'Instagram', error: e.message })),
        scrapeTikTok().catch(e     => ({ platform:'TikTok',    error: e.message })),
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
      ]);

    if (website && !website.error) result.website = website;
    else result.websiteError = website?.error || 'Failed';

    if (facebook && !facebook.error) result.facebook = facebook;
    else result.sources.facebook = { error: facebook?.error || 'Blocked or not found' };

    if (instagram && !instagram.error) result.instagram = instagram;
    else result.sources.instagram = { error: instagram?.error || 'Blocked or not found' };

    if (tiktok && !tiktok.error) result.tiktok = tiktok;
    else result.sources.tiktok = { error: tiktok?.error || 'Blocked or not found' };

    if (healthgrades) result.healthgrades = healthgrades;
    if (googleSearch) result.googleSearch = googleSearch;
    if (googlePlaces && !googlePlaces.error) result.google = googlePlaces;
    else if (googlePlaces?.error) result.googleError = googlePlaces.error;
    else result.googleSkipped = true;

    // Best available rating (priority: Places API > Google Search > Website Schema > Healthgrades)
    const rCandidates = [
      result.google      && { rating: result.google.rating, reviewCount: result.google.reviewCount, source: 'Google Business (API)' },
      googleSearch       && { ...googleSearch },
      website?.schemaRating && { ...website.schemaRating, source: 'Website JSON-LD schema' },
      healthgrades       && { ...healthgrades },
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
      websiteError:   website?.error,
    };

    return res.status(200).json(result);
  } catch(e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
}
