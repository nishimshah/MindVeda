const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/plan', require('./routes/plan'));
app.use('/api/streak', require('./routes/streak'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database tables
async function initDB() {
  try {
    const fs = require('fs');
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    await db.query(schema);
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    console.log('⚠️  Make sure PostgreSQL is running and the database exists.');
    console.log('   Create the database with: CREATE DATABASE mindveda;');
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`\n🧠 MindVeda Server running on http://localhost:${PORT}`);
  await initDB();
});

module.exports = app;
