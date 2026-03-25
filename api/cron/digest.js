/**
 * Weekly AI Digest Cron  ΓÇö  Mondays 8 am AZ (15:00 UTC)
 *
 * Reads the last 7 days of history + current metrics from Redis,
 * calls Gemini to produce a client-ready narrative, and stores the
 * result in Redis under `dmd_weekly_digest`.
 *
 * Vercel invokes this automatically via the crons config in vercel.json.
 * It can also be triggered manually: GET /api/cron/digest
 * (Vercel sets x-vercel-cron-signature automatically for scheduled runs;
 *  for manual calls, pass Authorization: Bearer <CRON_SECRET>)
 */

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url:   process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export default async function handler(req, res) {
  // ΓöÇΓöÇ Auth ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const isCronInvocation = req.headers['x-vercel-cron-signature'];
  const manualSecret     = (req.headers.authorization || '').replace('Bearer ', '');
  if (!isCronInvocation && manualSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const log    = [];
  const errors = [];

  try {
    // ΓöÇΓöÇ Load Redis data ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const store = await redis.hgetall('dmd:store') || {};

    const parse = (key, fallback = null) => {
      try { return typeof store[key] === 'string' ? JSON.parse(store[key]) : (store[key] ?? fallback); }
      catch { return fallback; }
    };

    const history    = parse('dmd_history', []);
    const manual     = parse('dmd_manual', {});
    const liveData   = parse('dmd_livedata', {});
    const destiny    = parse('dmd_destiny', {});
    const competitor = parse('dmd_competitors', {});

    // ΓöÇΓöÇ Slice last 7 days of history ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const cutoff   = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const weekData = history.filter(h => h.date >= cutoff).sort((a, b) => a.date.localeCompare(b.date));
    log.push(`History points this week: ${weekData.length}`);

    // ΓöÇΓöÇ Build metric summary ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const adSpend    = (manual.ad_spend || []);
    const totalSpend = adSpend.reduce((s, r) => s + Number(r.spend || 0), 0);
    const totalLeads = adSpend.reduce((s, r) => s + Number(r.leads || 0), 0);
    const cpl        = totalSpend && totalLeads ? (totalSpend / totalLeads).toFixed(0) : null;

    const googleRating   = destiny?.google?.rating ?? destiny?.bestRating?.rating ?? null;
    const reviewCount    = destiny?.google?.reviewCount ?? null;
    const fbFollowers    = destiny?.facebook?.followers ?? destiny?.facebook?.likes ?? null;
    const igFollowers    = destiny?.instagram?.followers ?? null;
    const ttFollowers    = destiny?.tiktok?.followers ?? null;
    const sessions       = (manual.analytics_data?.sessions || liveData?.analytics?.sessions) ?? null;
    const emailOpenRate  = manual.email_metrics?.openRate ?? null;

    // Week-over-week changes from history
    const oldest  = weekData[0];
    const newest  = weekData[weekData.length - 1];
    const delta   = (key) => {
      const a = oldest?.[key], b = newest?.[key];
      if (!a || !b) return null;
      const diff = Number(b) - Number(a);
      return { diff, pct: ((diff / Number(a)) * 100).toFixed(1) };
    };

    const igDelta  = delta('igFollowers');
    const fbDelta  = delta('fbFollowers');
    const sesDelta = delta('sessions');
    const ldDelta  = delta('totalLeads');
    const ratDelta = delta('googleRating');

    const competitors = competitor?.competitors?.slice(0, 3).map(c =>
      `${c.name}: ${c.avgRating?.toFixed(1) ?? '?'} Γÿà (${c.totalReviews ?? '?'} reviews)`
    ).join('; ') || 'Not loaded yet';

    const prompt = `You are a sharp, upbeat digital marketing analyst for Destiny Springs Healthcare ΓÇö a mental health clinic in Scottsdale, AZ.

Write a concise, honest, and motivating WEEKLY PERFORMANCE DIGEST for this week. Address the client directly (use "you" / "your team"). Be specific with numbers. Include wins, concerns, and 2-3 actionable priorities for next week. Keep it under 350 words. No bullet lists ΓÇö use short paragraphs with clear subheadings.

## THIS WEEK'S DATA

**Reputation**
- Google Rating: ${googleRating ? `${Number(googleRating).toFixed(1)} Γÿà` : 'N/A'}${ratDelta ? ` (${ratDelta.diff >= 0 ? '+' : ''}${ratDelta.diff.toFixed(2)} this week)` : ''}
- Review Count: ${reviewCount?.toLocaleString() ?? 'N/A'}

**Social Media**
- Instagram: ${igFollowers?.toLocaleString() ?? 'N/A'} followers${igDelta ? ` (${igDelta.diff >= 0 ? '+' : ''}${igDelta.diff} this week)` : ''}
- Facebook: ${fbFollowers?.toLocaleString() ?? 'N/A'} followers${fbDelta ? ` (${fbDelta.diff >= 0 ? '+' : ''}${fbDelta.diff} this week)` : ''}
- TikTok: ${ttFollowers?.toLocaleString() ?? 'N/A'} followers

**Website & Leads**
- Sessions: ${sessions?.toLocaleString() ?? 'N/A'}${sesDelta ? ` (${sesDelta.diff >= 0 ? '+' : ''}${sesDelta.diff} this week)` : ''}
- Total Leads: ${totalLeads > 0 ? totalLeads : 'N/A'}${ldDelta ? ` (${ldDelta.diff >= 0 ? '+' : ''}${ldDelta.diff} this week)` : ''}
- Cost Per Lead: ${cpl ? '$' + cpl : 'N/A'}

**Email**
- Open Rate: ${emailOpenRate ?? 'N/A'}

**Competitor Snapshot (top 3 rivals)**
${competitors}

**History data points this week:** ${weekData.length}

Write the digest now:`;

    // ΓöÇΓöÇ Call Gemini ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) throw new Error('GEMINI_API_KEY not set');

    const geminiRes = await fetch(`${GEMINI_API}?key=${geminiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents:         [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 600 },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini error ${geminiRes.status}: ${errText.slice(0, 200)}`);
    }

    const geminiData = await geminiRes.json();
    const digestText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!digestText) throw new Error('Gemini returned empty digest');

    log.push('Gemini digest generated successfully');

    // ΓöÇΓöÇ Store digest in Redis ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const digestPayload = {
      text:        digestText,
      generatedAt: new Date().toISOString(),
      weekStart:   cutoff,
      metrics: {
        googleRating, reviewCount, igFollowers, fbFollowers, ttFollowers,
        sessions, totalLeads, cpl, emailOpenRate,
      },
    };

    await redis.hset('dmd:store', { dmd_weekly_digest: JSON.stringify(digestPayload) });
    log.push('Digest stored in Redis at dmd_weekly_digest');

    return res.status(200).json({
      ok:          true,
      completedAt: new Date().toISOString(),
      digestLength: digestText.length,
      log,
      errors,
    });

  } catch (err) {
    errors.push(err.message);
    console.error('[cron/digest] Fatal error:', err.message);
    return res.status(500).json({ ok: false, errors, log });
  }
}
