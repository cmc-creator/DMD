// /api/chat.js — OpenAI proxy for Sir Clicks-a-Lot chatbot + AI data analysis
// Requires OPENAI_API_KEY env var in Vercel project settings.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: 'not configured — add OPENAI_API_KEY to Vercel environment variables.',
    });
  }

  const { messages = [], systemPrompt } = req.body || {};
  if (!messages.length) return res.status(400).json({ error: 'No messages provided' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt ||
              "You are Sir Clicks-a-Lot 🎤 — a witty, sharp, and occasionally hilarious marketing analytics assistant built into the Destiny Springs Healthcare marketing dashboard. Destiny Springs is a mental health clinic in Scottsdale, AZ. Be helpful, concise, and funny but professional.",
          },
          ...messages,
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(502).json({ error: err?.error?.message || 'OpenAI error' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response generated.';
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
