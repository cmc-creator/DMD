// api/vision.js GÇö AI-powered screenshot data extractor
// Accepts an image (base64) and uses Gemini 2.5 Flash Vision to extract
// structured marketing metrics from any screenshot.
//
// POST /api/vision
// Body: { imageBase64: string, mimeType: string, context?: string }
// Returns: { fields: {...}, rawText: string, confidence: string }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const { imageBase64, mimeType = 'image/png', context = '' } = req.body || {};
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });

  // Validate mimeType to prevent injection
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  if (!allowedMimeTypes.includes(mimeType)) {
    return res.status(400).json({ error: 'Invalid mimeType. Must be image/png, image/jpeg, image/webp, or image/gif.' });
  }

  const systemPrompt = `You are a precise marketing data extractor for a healthcare marketing dashboard.
Your job is to look at screenshots from any digital marketing platform and extract structured data.
Always respond with valid JSON only GÇö no markdown, no explanation, just the JSON object.`;

  const userPrompt = `${context ? `Context: ${context}\n\n` : ''}Analyze this screenshot and extract ALL visible marketing metrics.

Return a JSON object with these fields (use null for any not visible):
{
  "platform": "detected platform name (Google, Facebook, Instagram, TikTok, Yelp, etc.)",
  "dataType": "reviews|social|analytics|ads|email|seo|other",
  "confidence": "high|medium|low",
  "extractedAt": "ISO date string",
  
  // Reviews & Ratings
  "rating": number or null,
  "reviewCount": number or null,
  "ratingPlatform": "google|yelp|facebook|healthgrades|zocdoc|glassdoor|indeed|other" or null,
  
  // Social Media
  "followers": number or null,
  "following": number or null,
  "posts": number or null,
  "likes": number or null,
  "comments": number or null,
  "shares": number or null,
  "reach": number or null,
  "impressions": number or null,
  "engagementRate": number or null,
  "socialPlatform": "facebook|instagram|tiktok|linkedin|youtube|twitter|other" or null,
  
  // Website / Analytics
  "sessions": number or null,
  "pageViews": number or null,
  "bounceRate": number or null,
  "avgSessionDuration": "string like '2m 34s'" or null,
  "newUsers": number or null,
  "conversions": number or null,
  
  // Ads
  "adSpend": number or null,
  "impressionsAds": number or null,
  "clicks": number or null,
  "ctr": number or null,
  "cpl": number or null,
  "roas": number or null,
  "leads": number or null,
  
  // Email
  "subscribers": number or null,
  "openRate": number or null,
  "clickRate": number or null,
  "campaignsSent": number or null,
  
  // Period / context
  "period": "date range visible in screenshot" or null,
  
  // Any other notable metrics visible
  "otherMetrics": {}
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{
            role:  'user',
            parts: [
              { inlineData: { mimeType, data: imageBase64 } },
              { text: userPrompt },
            ],
          }],
          generationConfig: {
            maxOutputTokens: 1200,
            temperature:     0.1,  // Low temp for factual extraction
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(502).json({ error: err?.error?.message || 'Gemini Vision API error' });
    }

    const data    = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    let fields = {};
    try {
      // Gemini sometimes wraps JSON in ```json ``` blocks even with responseMimeType set
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      fields = JSON.parse(cleaned);
    } catch {
      // Return raw text if JSON parse fails so the client can still show something
      return res.status(200).json({ fields: {}, rawText, parseError: true });
    }

    return res.status(200).json({ fields, rawText });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
