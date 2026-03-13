// /api/chat.js — Google Gemini proxy for Sir Clicks-a-Lot chatbot + AI data analysis
// Requires GEMINI_API_KEY env var in Vercel project settings.
// Get a free key at: aistudio.google.com → Get API Key

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: 'not configured — add GEMINI_API_KEY to Vercel environment variables. Get a free key at aistudio.google.com',
    });
  }

  const { messages = [], systemPrompt } = req.body || {};
  if (!messages.length) return res.status(400).json({ error: 'No messages provided' });

  const system = systemPrompt ||
    "You are Sir Clicks-a-Lot 🎤 — a witty, sharp, and occasionally hilarious marketing analytics assistant built into the Destiny Springs Healthcare marketing dashboard. Destiny Springs is a mental health clinic in Scottsdale, AZ. Be helpful, concise, and funny but professional.";

  // Gemini uses a different format — convert OpenAI-style messages to Gemini contents
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(502).json({ error: err?.error?.message || 'Gemini API error' });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
