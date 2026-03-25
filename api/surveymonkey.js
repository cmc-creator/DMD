// Vercel serverless — SurveyMonkey OAuth2
// ─────────────────────────────────────────────────────────────────────────────
// Required env vars (set in Vercel dashboard → Project → Settings → Env Vars):
//   SURVEYMONKEY_CLIENT_ID     = from SurveyMonkey Developer Portal
//   SURVEYMONKEY_CLIENT_SECRET = from SurveyMonkey Developer Portal
//   SURVEYMONKEY_REDIRECT_URI  = https://YOUR_VERCEL_URL/api/surveymonkey
//
// SurveyMonkey setup:
//   1. developer.surveymonkey.com → My Apps → Create App
//   2. Scopes: surveys_read, responses_read, contacts_read
//   3. Redirect URI: add SURVEYMONKEY_REDIRECT_URI
//   4. Copy Client ID and Secret to Vercel env vars

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const CLIENT_ID     = process.env.SURVEYMONKEY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SURVEYMONKEY_CLIENT_SECRET;
  const REDIRECT_URI  = process.env.SURVEYMONKEY_REDIRECT_URI;

  const { action, code, token } = req.query;

  // ── 1. Initiate OAuth login ──────────────────────────────────────────────
  if (action === 'login') {
    if (!CLIENT_ID || !REDIRECT_URI) {
      return res.redirect('/?surveymonkey_error=Server+not+configured+%E2%80%94+set+SURVEYMONKEY_CLIENT_ID+%26+SURVEYMONKEY_REDIRECT_URI+in+Vercel');
    }
    const url = new URL('https://api.surveymonkey.com/oauth/authorize');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', CLIENT_ID);
    url.searchParams.set('redirect_uri', REDIRECT_URI);
    return res.redirect(url.toString());
  }

  // ── 2. OAuth callback ────────────────────────────────────────────────────
  if (code) {
    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
      return res.redirect('/?surveymonkey_error=Server+not+configured');
    }
    try {
      const tokenRes = await fetch('https://api.surveymonkey.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'authorization_code',
          code,
          redirect_uri:  REDIRECT_URI,
          client_id:     CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        const msg = tokenData.error_description || tokenData.error || 'Token exchange failed';
        return res.redirect(`/?surveymonkey_error=${encodeURIComponent(msg)}`);
      }

      const data = await fetchSurveyMonkeyData(tokenData.access_token);
      data.accessToken = tokenData.access_token;

      const encoded = Buffer.from(JSON.stringify(data)).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return res.redirect(`/?surveymonkey_data=${encoded}`);
    } catch (e) {
      return res.redirect(`/?surveymonkey_error=${encodeURIComponent(e.message)}`);
    }
  }

  // ── 3. Refresh using stored token ────────────────────────────────────────
  if (action === 'refresh' && token) {
    try {
      const data = await fetchSurveyMonkeyData(token);
      return res.json({ ok: true, ...data });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  return res.status(400).json({ error: 'Invalid request — use ?action=login or OAuth callback ?code=' });
}

// ── Data fetching ─────────────────────────────────────────────────────────────
async function fetchSurveyMonkeyData(token) {
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const result = { connectedAt: new Date().toISOString() };

  // Get user info
  try {
    const userRes  = await fetch('https://api.surveymonkey.com/v3/users/me', { headers });
    const userData = await userRes.json();
    result.username  = userData.username  || '';
    result.email     = userData.email     || '';
    result.firstName = userData.first_name || '';
    result.lastName  = userData.last_name  || '';
  } catch {}

  // Get surveys list
  try {
    const surveysRes  = await fetch('https://api.surveymonkey.com/v3/surveys?per_page=10&include=response_count,date_modified', { headers });
    const surveysData = await surveysRes.json();
    const surveys = surveysData.data || [];

    result.totalSurveys = surveysData.total || surveys.length;
    result.totalResponses = surveys.reduce((sum, s) => sum + (s.response_count || 0), 0);

    // Get details on most recent surveys
    result.recentSurveys = surveys.slice(0, 5).map(s => ({
      id:            s.id,
      title:         s.title,
      responses:     s.response_count || 0,
      modified:      s.date_modified,
      href:          s.href,
    }));

    // Get latest responses from newest survey with responses
    const activeSurvey = surveys.find(s => s.response_count > 0);
    if (activeSurvey) {
      result.activeSurveyTitle = activeSurvey.title;
      result.activeSurveyResponses = activeSurvey.response_count;

      try {
        const summaryRes  = await fetch(`https://api.surveymonkey.com/v3/surveys/${activeSurvey.id}/rollups`, { headers });
        const summaryData = await summaryRes.json();
        if (summaryData.data) {
          result.rollups = summaryData.data.slice(0, 10).map(q => ({
            question: q.heading || '',
            type:     q.family  || '',
            answers:  (q.answers || []).slice(0, 8).map(a => ({
              text:  a.row   || a.text || '',
              count: a.count || 0,
            })),
          }));
        }
      } catch {}
    }
  } catch {}

  return result;
}
