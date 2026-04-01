const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Update user preferences (onboarding)
router.put('/preferences', auth, async (req, res) => {
  try {
    const { age_group, goals, special_needs, accessibility_mode } = req.body;

    const result = await db.query(
      `UPDATE users SET 
        age_group = COALESCE($1, age_group),
        goals = COALESCE($2, goals),
        special_needs = COALESCE($3, special_needs),
        accessibility_mode = COALESCE($4, accessibility_mode),
        onboarding_complete = true,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, name, email, age_group, goals, special_needs, onboarding_complete, accessibility_mode`,
      [age_group, goals, special_needs, accessibility_mode, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences.' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT id, name, email, age_group, goals, special_needs, onboarding_complete, accessibility_mode, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    const streakResult = await db.query(
      'SELECT current_streak, longest_streak, last_active FROM streaks WHERE user_id = $1',
      [req.user.id]
    );

    const user = userResult.rows[0];
    user.streak = streakResult.rows[0] || { current_streak: 0, longest_streak: 0 };

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile.' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, accessibility_mode } = req.body;

    const result = await db.query(
      `UPDATE users SET 
        name = COALESCE($1, name),
        accessibility_mode = COALESCE($2, accessibility_mode),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, email, age_group, goals, special_needs, onboarding_complete, accessibility_mode`,
      [name, accessibility_mode, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
