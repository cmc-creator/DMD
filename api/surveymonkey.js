// Vercel serverless — SurveyMonkey Personal Access Token
// ─────────────────────────────────────────────────────────────────────────────
// No env vars required — token is entered by the user in the connect form.
//
// SurveyMonkey setup:
//   1. developer.surveymonkey.com → My Apps → your app (or create one)
//   2. Click "Access Token" on the app page — copy the token shown
//   3. Paste it into DMD → Integrations → SurveyMonkey → Access Token field

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, token } = req.query;

  // Use token from query param or env var fallback
  const accessToken = token || process.env.SURVEYMONKEY_ACCESS_TOKEN;

  if (action === 'sync') {
    if (!accessToken) {
      return res.status(400).json({ ok: false, error: 'No access token provided' });
    }
    try {
      const data = await fetchSurveyMonkeyData(accessToken);
      return res.json({ ok: true, ...data });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  return res.status(400).json({ error: 'Use ?action=sync&token=YOUR_TOKEN' });
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
      result.activeSurveyTitle     = activeSurvey.title;
      result.activeSurveyResponses = activeSurvey.response_count;

      // Get rollup summaries
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

          // Detect NPS question: rating/matrix type with 0-10 or 1-10 scale
          const npsQuestion = summaryData.data.find(q =>
            /recommend|nps|likely/i.test(q.heading || '') ||
            (q.family === 'rating' && (q.answers || []).some(a => parseInt(a.row || a.text) >= 9))
          );
          if (npsQuestion) {
            const answers = npsQuestion.answers || [];
            let promoters = 0, passives = 0, detractors = 0;
            answers.forEach(a => {
              const score = parseInt(a.row || a.text || '');
              const count = a.count || 0;
              if (!isNaN(score)) {
                if (score >= 9)      promoters  += count;
                else if (score >= 7) passives   += count;
                else                 detractors += count;
              }
            });
            const total = promoters + passives + detractors;
            if (total > 0) {
              result.npsBreakdown = { promoters, passives, detractors };
              result.npsScore     = Math.round(((promoters - detractors) / total) * 100);
            }
          }
        }
      } catch {}
    }
  } catch {}

  return result;
}
