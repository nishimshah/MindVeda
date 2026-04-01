const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Update streak
router.post('/update', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT current_streak, longest_streak, last_active FROM streaks WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      await db.query('INSERT INTO streaks (user_id, current_streak, last_active) VALUES ($1, 1, CURRENT_DATE)', [req.user.id]);
      return res.json({ current_streak: 1, longest_streak: 1 });
    }

    const streak = result.rows[0];
    const lastActive = new Date(streak.last_active);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastActive.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

    let newStreak = streak.current_streak;
    if (diffDays === 0) {
      // Already logged today
      return res.json({ current_streak: streak.current_streak, longest_streak: streak.longest_streak });
    } else if (diffDays === 1) {
      newStreak = streak.current_streak + 1;
    } else {
      newStreak = 1; // Reset streak
    }

    const longestStreak = Math.max(newStreak, streak.longest_streak);

    await db.query(
      'UPDATE streaks SET current_streak = $1, longest_streak = $2, last_active = CURRENT_DATE WHERE user_id = $3',
      [newStreak, longestStreak, req.user.id]
    );

    res.json({ current_streak: newStreak, longest_streak: longestStreak });
  } catch (error) {
    console.error('Streak update error:', error);
    res.status(500).json({ error: 'Failed to update streak.' });
  }
});

// Get streak
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT current_streak, longest_streak, last_active FROM streaks WHERE user_id = $1',
      [req.user.id]
    );
    res.json(result.rows[0] || { current_streak: 0, longest_streak: 0 });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ error: 'Failed to get streak.' });
  }
});

module.exports = router;
