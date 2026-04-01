const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Get today's AI-generated plan
router.get('/today', auth, async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT name, age_group, goals, special_needs FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = userResult.rows[0];

    const streakResult = await db.query(
      'SELECT current_streak FROM streaks WHERE user_id = $1',
      [req.user.id]
    );
    const streak = streakResult.rows[0]?.current_streak || 0;

    // Get recent activity
    const recentResult = await db.query(
      `SELECT activity_type, game_name, score FROM progress WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [req.user.id]
    );

    let plan;

    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Generate a brief daily wellness plan for ${user.name} (${user.age_group} age group).
Their goals: ${user.goals?.join(', ') || 'general wellness'}.
${user.special_needs?.length ? `Special considerations: ${user.special_needs.join(', ')}` : ''}
Current streak: ${streak} days.
Recent activities: ${recentResult.rows.map(r => r.game_name || r.activity_type).join(', ') || 'none yet'}.
Provide exactly 4 items in JSON array format: [{"title": "...", "description": "...", "type": "training|chat|calm|mood", "duration": "X min"}]
Keep it encouraging and personalized. Each item should be 1 short sentence.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.8,
      });

      const content = completion.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      plan = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (apiError) {
      console.error('OpenAI plan error:', apiError.message);
    }

    // Fallback plan
    if (!plan) {
      const goalMap = {
        focus: { title: '🎯 Focus Training', description: 'Play a Pattern Recognition game to sharpen focus', type: 'training', duration: '5 min' },
        memory: { title: '🧠 Memory Boost', description: 'Complete a Memory Match challenge', type: 'training', duration: '5 min' },
        stress: { title: '🧘 Stress Relief', description: 'Try a breathing exercise in the Calm Zone', type: 'calm', duration: '3 min' },
        productivity: { title: '⚡ Quick Reaction', description: 'Test your reflexes with the Reaction Game', type: 'training', duration: '3 min' },
      };

      plan = [
        goalMap[user.goals?.[0]] || { title: '🧠 Brain Warm-up', description: 'Start with a quick memory game', type: 'training', duration: '5 min' },
        { title: '💬 Check In', description: 'Chat with your AI companion about how you feel', type: 'chat', duration: '5 min' },
        { title: '🧘 Mindful Break', description: 'Take a breathing exercise break', type: 'calm', duration: '3 min' },
        { title: '📊 Log Your Mood', description: 'Track how you\'re feeling today', type: 'mood', duration: '1 min' },
      ];
    }

    res.json({ plan, streak, greeting: `Good ${getTimeOfDay()}, ${user.name}!` });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ error: 'Failed to generate plan.' });
  }
});

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

module.exports = router;
