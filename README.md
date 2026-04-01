# 🧠 MindVeda — AI-Powered Mental Wellness Platform

MindVeda is a full-stack cognitive training and mental wellness system designed for all age groups and neurodiverse users. It combines adaptive brain training, AI therapy, mood tracking, and calming exercises — personalized for every mind.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **PostgreSQL** installed and running
- **OpenAI API Key** (optional, for AI chat features)

### 1. Setup Database
Open pgAdmin or psql and create the database:
```sql
CREATE DATABASE mindveda;
```

### 2. Configure Backend
```bash
cd server
# Edit .env file with your PostgreSQL credentials and OpenAI key
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/mindveda
# OPENAI_API_KEY=sk-your-key-here
```

### 3. Start Backend
```bash
cd server
npm run dev
```
The server will auto-create all database tables on first run.

### 4. Start Frontend
```bash
cd client
npm run dev
```
Open **http://localhost:5173** in your browser.

## 📁 Project Structure
```
MindVeda/
├── client/                  # React Frontend
│   ├── src/
│   │   ├── components/      # Navbar, ProtectedRoute
│   │   ├── contexts/        # AuthContext, AccessibilityContext
│   │   ├── lib/             # API client, utilities
│   │   ├── pages/           # All page components
│   │   ├── App.jsx          # Router setup
│   │   └── index.css        # Design system
│   └── vite.config.js
├── server/                  # Node.js Backend
│   ├── db/                  # Database schema & connection
│   ├── middleware/           # JWT auth
│   ├── routes/              # All API routes
│   └── index.js             # Express server
└── README.md
```

## ✨ Features
- **Authentication** — JWT signup/login with protected routes
- **Onboarding** — Personalized setup (age, goals, special needs)
- **Dashboard** — Card-based menu with AI daily plan + streaks
- **Brain Training** — Memory Match, Pattern Recognition, Reaction Test
- **AI Chat** — OpenAI-powered therapist with sentiment analysis
- **Voice** — Speech-to-text input & text-to-speech output
- **Progress** — Charts for activity, mood tracking, streaks
- **Calm Zone** — Breathing exercises, guided meditation, ambient sounds
- **Accessibility** — ADHD, Dyslexia, Autism modes
- **Admin Panel** — User management & platform stats

## 🛠 Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| UI | Custom glassmorphism design system |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT (bcryptjs + jsonwebtoken) |
| AI | OpenAI GPT-3.5-turbo |
| Voice | Web Speech API |
