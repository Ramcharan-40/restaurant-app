import { Router } from 'express';
import db from '../db';

const router = Router();

router.post('/ask', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  const menu = db.prepare(
    'SELECT id, name, price, category FROM menu_items WHERE available = 1'
  ).all();

  const systemPrompt = `You are "Ask Aadhya", a warm and concise restaurant waiter assistant for Hotel Aadhya.
You can ONLY recommend dishes from this exact menu (never invent dishes):
${JSON.stringify(menu)}

Rules:
- Reply ONLY with raw JSON, no markdown fences, no preamble.
- Format: {"reply": "1-2 short friendly sentences", "recommendations": [{"id": number, "reason": "5-10 word reason"}]}
- recommendations should have 1-3 items max, using real "id" values from the menu above.
- If nothing truly fits, set recommendations to [] and explain briefly in "reply".
- Keep "reply" conversational, like a friendly waiter, not robotic.`;

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY as string,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();

    const raw = (data.candidates?.[0]?.content?.parts || [])
      .map((p: any) => p.text || '')
      .join('')
      .trim();

    const cleaned = raw.replace(/^```json\s*|^```\s*|```$/g, '').trim();
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (err) {
    console.error('AI ask error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;