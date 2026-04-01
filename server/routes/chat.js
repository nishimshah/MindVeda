const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Simple sentiment analysis
function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  const positiveWords = ['happy', 'great', 'good', 'wonderful', 'amazing', 'love', 'excited', 'grateful', 'thankful', 'joy', 'fantastic', 'excellent', 'blessed', 'hopeful', 'calm', 'peaceful'];
  const negativeWords = ['sad', 'angry', 'depressed', 'anxious', 'worried', 'stressed', 'scared', 'lonely', 'hopeless', 'tired', 'frustrated', 'overwhelmed', 'hurt', 'pain', 'afraid', 'panic', 'cry'];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(w => { if (lower.includes(w)) positiveCount++; });
  negativeWords.forEach(w => { if (lower.includes(w)) negativeCount++; });

  if (negativeCount > positiveCount) return 'negative';
  if (positiveCount > negativeCount) return 'positive';
  return 'neutral';
}

// Chat with AI
router.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    const sentiment = analyzeSentiment(message);

    // Save user message
    await db.query(
      'INSERT INTO chat_messages (user_id, role, content, sentiment) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'user', message, sentiment]
    );

    // Get user profile for context
    const userResult = await db.query(
      'SELECT name, age_group, goals, special_needs FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = userResult.rows[0];

    // Get recent chat history for context
    const historyResult = await db.query(
      'SELECT role, content FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    );
    const history = historyResult.rows.reverse();

    let aiResponse;

    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const systemPrompt = `You are MindVeda AI, a calm, supportive, and empathetic mental wellness companion. 
You are NOT a licensed therapist or medical professional. Never provide medical advice or diagnoses.
The user's name is ${user.name}. They are in the ${user.age_group} age group.
Their goals are: ${user.goals?.join(', ') || 'general wellness'}.
${user.special_needs?.length ? `They have noted: ${user.special_needs.join(', ')}` : ''}
The detected sentiment of their current message is: ${sentiment}.
Respond in a warm, calming tone. Keep responses concise (2-4 sentences unless they ask for more).
If they seem distressed, gently suggest professional help resources.
Use simple language. Be encouraging and supportive.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      });

      aiResponse = completion.choices[0].message.content;
    } catch (apiError) {
      console.error('OpenAI API error:', apiError.message);
      // Fallback responses when API is not available
      const fallbackResponses = {
        negative: `I hear you, ${user.name}. It sounds like you're going through a tough time, and that's okay. Remember, it's perfectly normal to feel this way sometimes. Would you like to try a breathing exercise in our Calm Zone, or would you prefer to keep talking?`,
        positive: `That's wonderful to hear, ${user.name}! 😊 It's great that you're feeling good. Keep nurturing those positive feelings. Is there anything specific you'd like to work on today?`,
        neutral: `Thank you for sharing, ${user.name}. I'm here to listen and support you. What's on your mind today? We can chat, or if you'd prefer, we have some great brain training exercises and calming activities available.`,
      };
      aiResponse = fallbackResponses[sentiment];
    }

    // Save AI response
    await db.query(
      'INSERT INTO chat_messages (user_id, role, content) VALUES ($1, $2, $3)',
      [req.user.id, 'assistant', aiResponse]
    );

    res.json({ response: aiResponse, sentiment });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message.' });
  }
});

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT role, content, sentiment, created_at FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC LIMIT 100',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history.' });
  }
});

module.exports = router;
