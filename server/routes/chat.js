import express from 'express';
import { dbAll, dbGet } from '../db.js';

const router = express.Router();

// Keep conversations reasonably sized so requests stay fast and cheap.
// This is a "long conversation" cap, not a hard wall — older turns just roll off.
const MAX_HISTORY_MESSAGES = 30;

const LANGUAGE_NAMES = {
  en: 'English',
  ur: 'Urdu (اردو)',
  zh: 'Chinese (中文)'
};

const buildSystemPrompt = async ({ language, contextCountrySlug, contextCityName }) => {
  let contextBlock = '';

  if (contextCountrySlug) {
    try {
      const country = await dbGet(
        'SELECT name, famous_places_summary FROM countries WHERE slug = ?',
        [contextCountrySlug]
      );
      if (country) {
        const cities = await dbAll(
          'SELECT name FROM cities WHERE country_id = (SELECT id FROM countries WHERE slug = ?)',
          [contextCountrySlug]
        );
        contextBlock = `\n\nThe user is currently browsing the "${country.name}" page on the site. Its cities include: ${cities.map(c => c.name).join(', ')}. Famous places summary: ${country.famous_places_summary}. Prefer answering about ${country.name} when the question is ambiguous (e.g. "what's the food like here"), but you can still help with any other country if asked directly.`;
      }
    } catch {
      // Context is best-effort; never block the chat if this lookup fails.
    }
  } else if (contextCityName) {
    contextBlock = `\n\nThe user is currently browsing the "${contextCityName}" city page on the site. Prefer answering about ${contextCityName} when the question is ambiguous.`;
  }

  const languageName = LANGUAGE_NAMES[language] || 'English';

  return `You are the Historica Explorer travel assistant, a warm and knowledgeable guide embedded in a travel & history website. You help users with:
- Countries and cities featured on the site (their history, culture, and travel appeal)
- Famous landmarks and places to visit
- Local foods and cuisine
- Practical travel suggestions and itinerary ideas

The site currently covers: Japan, Italy, Egypt, France, Greece, Peru, Pakistan, China, India, the United States, the United Kingdom, Turkey, the UAE, Saudi Arabia, and Germany.

Respond in ${languageName}, unless the user clearly writes in a different language — in that case, reply in the language they used instead.

Be concise but genuinely helpful — a few warm, well-organized sentences or a short list, not an essay, unless the user asks for depth. If a question falls well outside travel/history/culture/food, gently steer back to what you can help with. Never invent specific prices, opening hours, or visa rules you're not sure about — recommend the user verify current details for anything time-sensitive like that.${contextBlock}`;
};

router.post('/', async (req, res) => {
  try {
    const { messages, language, contextCountrySlug, contextCityName } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Chat is not configured yet. Add ANTHROPIC_API_KEY to your .env file to enable the assistant.'
      });
    }

    // Trim to the most recent messages so long conversations stay fast/affordable
    // without hard-capping how long a user can chat.
    const trimmedMessages = messages.slice(-MAX_HISTORY_MESSAGES).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 4000)
    }));

    const systemPrompt = await buildSystemPrompt({ language, contextCountrySlug, contextCityName });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 700,
        system: systemPrompt,
        messages: trimmedMessages
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return res.status(502).json({ error: 'The chat assistant is temporarily unavailable. Please try again.' });
    }

    const data = await response.json();
    const reply = (data.content || [])
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim();

    res.json({ reply: reply || "Sorry, I didn't catch that — could you rephrase?" });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
  }
});

export default router;
