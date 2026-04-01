const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Log progress
router.post('/', auth, async (req, res) => {
  try {
    const { activity_type, game_name, score, duration_seconds, difficulty } = req.body;

    const result = await db.query(
      'INSERT INTO progress (user_id, activity_type, game_name, score, duration_seconds, difficulty) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, activity_type, game_name, score || 0, duration_seconds || 0, difficulty || 1]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Log progress error:', error);
    res.status(500).json({ error: 'Failed to log progress.' });
  }
});

// Get progress history
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 50, activity_type } = req.query;
    let query = 'SELECT * FROM progress WHERE user_id = $1';
    const params = [req.user.id];

    if (activity_type) {
      query += ' AND activity_type = $2';
      params.push(activity_type);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit));

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress.' });
  }
});

// Get aggregated stats
router.get('/stats', auth, async (req, res) => {
  try {
    // Total sessions
    const totalResult = await db.query(
      'SELECT COUNT(*) as total_sessions, COALESCE(SUM(score), 0) as total_score, COALESCE(AVG(score), 0) as avg_score FROM progress WHERE user_id = $1',
      [req.user.id]
    );

    // Sessions by activity
    const byActivityResult = await db.query(
      'SELECT activity_type, COUNT(*) as count, COALESCE(AVG(score), 0) as avg_score FROM progress WHERE user_id = $1 GROUP BY activity_type',
      [req.user.id]
    );

    // Last 7 days activity
    const weeklyResult = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as sessions, COALESCE(AVG(score), 0) as avg_score 
       FROM progress WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(created_at) ORDER BY date`,
      [req.user.id]
    );

    // Last 30 days activity
    const monthlyResult = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as sessions, COALESCE(AVG(score), 0) as avg_score 
       FROM progress WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(created_at) ORDER BY date`,
      [req.user.id]
    );

    res.json({
      overview: totalResult.rows[0],
      by_activity: byActivityResult.rows,
      weekly: weeklyResult.rows,
      monthly: monthlyResult.rows,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats.' });
  }
});

module.exports = router;
