import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Brain, MessageCircle, BarChart3, Wind, User,
  Flame, Sparkles, ChevronRight, Clock, TrendingUp, Calendar,
} from 'lucide-react';
import api from '../lib/api';

const menuCards = [
  {
    path:     '/train',
    icon:     Brain,
    title:    'Brain Training',
    desc:     'Memory, patterns & reaction games',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    glow:     'rgba(124,58,237,0.35)',
    iconBg:   'var(--accent-p-glow)',
    iconColor:'var(--accent-p-light)',
    tag:      'Play Now',
  },
  {
    path:     '/chat',
    icon:     MessageCircle,
    title:    'Talk to AI',
    desc:     'Your calm AI therapy companion',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    glow:     'rgba(6,182,212,0.3)',
    iconBg:   'rgba(6,182,212,0.15)',
    iconColor:'var(--accent-secondary)',
    tag:      'Chat',
  },
  {
    path:     '/progress',
    icon:     BarChart3,
    title:    'View Progress',
    desc:     'Track your wellness journey',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    glow:     'rgba(16,185,129,0.28)',
    iconBg:   'rgba(16,185,129,0.15)',
    iconColor:'var(--accent-green)',
    tag:      'Insights',
  },
  {
    path:     '/calm',
    icon:     Wind,
    title:    'Calm Zone',
    desc:     'Breathe, relax, meditate',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    glow:     'rgba(245,158,11,0.28)',
    iconBg:   'rgba(245,158,11,0.15)',
    iconColor:'var(--accent-amber)',
    tag:      'Relax',
  },
  {
    path:     '/profile',
    icon:     User,
    title:    'Profile',
    desc:     'Accessibility & settings',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    glow:     'rgba(139,92,246,0.28)',
    iconBg:   'var(--accent-p-glow)',
    iconColor:'var(--accent-p-light)',
    tag:      'Settings',
  },
];

const planRouteMap = { training: '/train', chat: '/chat', calm: '/calm', mood: '/progress' };

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  return { text: 'Good evening', emoji: '🌙' };
}

export default function Dashboard() {
  const { user }                          = useAuth();
  const [plan, setPlan]                   = useState(null);
  const [streak, setStreak]               = useState(0);
  const [loadingPlan, setLoadingPlan]     = useState(true);
  const { text: timeText, emoji: timeEmoji } = getTimeGreeting();

  useEffect(() => {
    fetchTodayPlan();
    updateStreak();
  }, []);

  const fetchTodayPlan = async () => {
    try {
      const { data } = await api.get('/plan/today');
      setPlan(data.plan);
      setStreak(data.streak);
    } catch {
      // silent
    } finally {
      setLoadingPlan(false);
    }
  };

  const updateStreak = async () => {
    try {
      const { data } = await api.post('/streak/update');
      setStreak(data.current_streak);
    } catch {
      // silent
    }
  };

  return (
    <div className="page-container">

      {/* ── HERO GREETING ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1,  y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-10"
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              {timeEmoji} {timeText}
            </p>
            <h1
              className="text-4xl md:text-5xl font-black leading-tight"
              style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em', color: 'var(--text-primary)' }}
            >
              {user?.name?.split(' ')[0]}, let's grow.
            </h1>
            <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
              What would you like to work on today?
            </p>
          </div>

          {/* ── Streak badge ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
            className="glass-card px-5 py-4 flex items-center gap-3 shrink-0"
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid var(--accent-amber)' }}
            >
              <Flame className="w-5 h-5" style={{ color: 'var(--accent-amber)' }} />
            </div>
            <div>
              <div className="text-2xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--accent-amber)' }}>{streak}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Day Streak</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── TODAY'S PLAN ────────────────────────────────── */}
      {!loadingPlan && plan && plan.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1,  y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-4.5 h-4.5" style={{ color: 'var(--accent-p-light)' }} />
            <h2 className="font-bold text-base" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
              Today's Plan
            </h2>
            <span className="badge badge-primary ml-1 text-xs">AI Generated</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {plan.map((item, i) => (
              <Link
                key={i}
                to={planRouteMap[item.type] || '/dashboard'}
                className="group p-4 rounded-xl border no-underline transition-all"
                style={{
                  background: 'var(--bg-surface-1)',
                  borderColor: 'var(--border-base)',
                }}
              >
                <div className="font-semibold text-sm mb-1 transition-colors group-hover:text-purple-300" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                  {item.title}
                </div>
                <div className="text-xs mb-2.5" style={{ color: 'var(--text-secondary)' }}>{item.description}</div>
                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-3 h-3" /> {item.duration}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── FEATURE CARDS GRID ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {menuCards.map((card, i) => (
          <motion.div
            key={card.path}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1,  y: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
          >
            <Link
              to={card.path}
              className="no-underline block h-full"
            >
              <div
                className="glass-card card-hover p-6 flex flex-col h-full group relative overflow-hidden cursor-pointer"
                style={{ minHeight: '200px' }}
              >
                {/* Top glow accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${card.iconColor}50, transparent)` }}
                />

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: card.iconBg, border: `1px solid ${card.iconColor}25` }}
                >
                  <card.icon className="w-6 h-6" style={{ color: card.iconColor }} />
                </div>

                <h3 className="font-black text-lg mb-1.5" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
                  {card.title}
                </h3>
                <p className="text-sm flex-1 mb-5" style={{ color: 'var(--text-secondary)' }}>
                  {card.desc}
                </p>

                {/* CTA row */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: `${card.iconColor}15`, color: card.iconColor, border: `1px solid ${card.iconColor}30` }}
                  >
                    {card.tag}
                  </span>
                  <ChevronRight
                    className="w-4 h-4 transition-all duration-200 group-hover:translate-x-1"
                    style={{ color: card.iconColor }}
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
