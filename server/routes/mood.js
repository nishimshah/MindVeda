const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Log mood
router.post('/', auth, async (req, res) => {
  try {
    const { mood_score, note } = req.body;

    if (mood_score < 1 || mood_score > 5) {
      return res.status(400).json({ error: 'Mood score must be between 1 and 5.' });
    }

    const result = await db.query(
      'INSERT INTO mood_logs (user_id, mood_score, note) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, mood_score, note || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Log mood error:', error);
    res.status(500).json({ error: 'Failed to log mood.' });
  }
});

// Get mood history
router.get('/', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const result = await db.query(
      `SELECT * FROM mood_logs WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '1 day' * $2 ORDER BY created_at DESC`,
      [req.user.id, parseInt(days)]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get mood error:', error);
    res.status(500).json({ error: 'Failed to get mood history.' });
  }
});

module.exports = router;
