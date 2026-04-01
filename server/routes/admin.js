const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Get all users (admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, age_group, goals, special_needs, onboarding_complete, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to get users.' });
  }
});

// Get platform stats (admin only)
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const usersCount = await db.query('SELECT COUNT(*) as count FROM users');
    const sessionsCount = await db.query('SELECT COUNT(*) as count FROM progress');
    const todayActive = await db.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM progress WHERE DATE(created_at) = CURRENT_DATE'
    );
    const avgMood = await db.query(
      'SELECT COALESCE(AVG(mood_score), 0) as avg_mood FROM mood_logs WHERE created_at >= CURRENT_DATE - INTERVAL \'7 days\''
    );

    res.json({
      total_users: parseInt(usersCount.rows[0].count),
      total_sessions: parseInt(sessionsCount.rows[0].count),
      today_active: parseInt(todayActive.rows[0].count),
      avg_mood_7d: parseFloat(avgMood.rows[0].avg_mood).toFixed(1),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to get stats.' });
  }
});

module.exports = router;
