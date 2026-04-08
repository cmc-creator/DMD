// /api/chat.js ΓÇö Google Gemini proxy for Captain KPI chatbot + AI data analysis
// Supports text AND vision (image) inputs via Gemini 2.0 Flash multimodal.
// Requires GEMINI_API_KEY env var in Vercel project settings.
// Get a free key at: aistudio.google.com ΓåÆ Get API Key

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = process.env.GEMINI_API_KEY;

  // GET: diagnostic ping — visit /api/chat in browser to check config
  if (req.method === 'GET') {
    return res.status(key ? 200 : 503).json({
      ok: !!key,
      configured: !!key,
      key_length: (key || '').length,
      key_prefix: key ? key.slice(0, 6) + '...' : 'NOT SET',
      model: 'gemini-2.5-flash (with fallbacks)',
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!key) {
    return res.status(503).json({
      error: 'not configured ΓÇö add GEMINI_API_KEY to Vercel environment variables. Get a free key at aistudio.google.com',
    });
  }

  const { messages = [], systemPrompt, maxTokens, imageBase64, imageMimeType, textContent, fileName, files = [], enableSearch } = req.body || {};
  if (!messages.length) return res.status(400).json({ error: 'No messages provided' });

  const system = systemPrompt ||
    "You are Captain KPI ≡ƒ½í ΓÇö a witty, sharp, and occasionally hilarious marketing analytics assistant built into the Destiny Springs Healthcare marketing dashboard. Destiny Springs is a mental health clinic in Scottsdale, AZ. Be helpful, concise, and funny but professional.";

  const TEXT_TYPES = ['text/plain', 'text/csv', 'text/tab-separated-values'];

  // Normalise: support legacy single-file fields AND new `files` array
  const allFiles = files.length > 0
    ? files
    : imageBase64
      ? [{ base64: imageBase64, mimeType: imageMimeType }]
      : textContent
        ? [{ text: textContent, mimeType: imageMimeType, name: fileName }]
        : [];

  // Build Gemini contents array from OpenAI-style messages
  const contents = messages.map((m, idx) => {
    const isLast = idx === messages.length - 1;
    const parts  = [];

    if (isLast && m.role === 'user' && allFiles.length > 0) {
      allFiles.forEach(f => {
        if (TEXT_TYPES.includes(f.mimeType) && f.text) {
          parts.push({ text: `📄 File: ${f.name || 'document'}\n\n${f.text}` });
        } else if (f.base64 && f.mimeType) {
          parts.push({ inlineData: { mimeType: f.mimeType, data: f.base64 } });
        }
      });
    }

    parts.push({ text: m.content || '' });

    return {
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts,
    };
  });

  // Try models in order — fall back on quota/rate errors
  // Google Search grounding: only supported on non-lite flash/pro models
  const SEARCH_SUPPORTED_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro'];
  const MODELS = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite',
  ];

  const basePayload = {
    system_instruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { maxOutputTokens: maxTokens || (allFiles.length > 0 ? 12000 : 3000), temperature: allFiles.length > 0 ? 0.1 : 0.7 },
  };

  let lastError = 'Gemini API error';
  for (const model of MODELS) {
    try {
      // Enable Google Search grounding when requested and model supports it
      const useSearch = enableSearch !== false && allFiles.length === 0 && SEARCH_SUPPORTED_MODELS.includes(model);
      const payload = JSON.stringify(useSearch
        ? { ...basePayload, tools: [{ googleSearch: {} }] }
        : basePayload
      );
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const msg = err?.error?.message || '';
        // Quota/rate errors — try next model
        if (response.status === 429 || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          lastError = `Quota exceeded on ${model} — trying fallback`;
          continue;
        }
        return res.status(502).json({ error: msg || 'Gemini API error', model });
      }

      const data  = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
      return res.status(200).json({ reply, model });
    } catch (e) {
      lastError = e.message;
      continue;
    }
  }

  return res.status(429).json({
    error: 'All Gemini models are over quota. Go to aistudio.google.com and generate a fresh API key, then update GEMINI_API_KEY in Vercel Settings → Environment Variables.',
  });
}
