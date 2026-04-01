import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Flame, Calendar, SmilePlus, Loader2, Trophy } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../lib/api';
import toast from 'react-hot-toast';

const moodEmojis = [
  { score: 1, emoji: '😢', label: 'Very Low', color: '#ef4444' },
  { score: 2, emoji: '😟', label: 'Low',      color: '#f97316' },
  { score: 3, emoji: '😐', label: 'Okay',     color: '#f59e0b' },
  { score: 4, emoji: '😊', label: 'Good',     color: '#10b981' },
  { score: 5, emoji: '😄', label: 'Great',    color: '#06b6d4' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'rgba(13,16,37,0.97)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
      <p style={{ color: '#9ba3cc', marginBottom: '2px' }}>{label}</p>
      <p className="font-bold" style={{ color: '#a78bfa' }}>{payload[0].value}</p>
    </div>
  );
};

export default function Progress() {
  const [stats, setStats]           = useState(null);
  const [moods, setMoods]           = useState([]);
  const [streak, setStreak]         = useState({ current_streak: 0, longest_streak: 0 });
  const [loading, setLoading]       = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNote, setMoodNote]     = useState('');

  useEffect(() => {
    Promise.all([fetchStats(), fetchMoods(), fetchStreak()]).finally(() => setLoading(false));
  }, []);

  const fetchStats  = async () => { try { const { data } = await api.get('/progress/stats'); setStats(data); } catch {} };
  const fetchMoods  = async () => { try { const { data } = await api.get('/mood');            setMoods(data); } catch {} };
  const fetchStreak = async () => { try { const { data } = await api.get('/streak');          setStreak(data); } catch {} };

  const logMood = async () => {
    if (!selectedMood) return;
    try {
      await api.post('/mood', { mood_score: selectedMood, note: moodNote });
      toast.success('Mood logged! 🌱');
      setSelectedMood(null); setMoodNote('');
      fetchMoods();
    } catch { toast.error('Failed to log mood.'); }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#7c3aed' }} />
      </div>
    );
  }

  const weeklyData = stats?.weekly?.map(d => ({
    date:     new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    sessions: parseInt(d.sessions),
    score:    Math.round(parseFloat(d.avg_score)),
  })) || [];

  const moodData = moods.slice(0, 14).reverse().map(m => ({
    date: new Date(m.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    mood: m.mood_score,
  }));

  const statCards = [
    { label: 'Total Sessions', value: stats?.overview?.total_sessions || 0, icon: Calendar,    color: '#7c3aed', glow: 'rgba(124,58,237,0.2)' },
    { label: 'Avg Score',      value: Math.round(stats?.overview?.avg_score || 0), icon: TrendingUp, color: '#06b6d4', glow: 'rgba(6,182,212,0.2)' },
    { label: 'Day Streak',     value: streak.current_streak,    icon: Flame,       color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
    { label: 'Best Streak',    value: streak.longest_streak,    icon: Trophy,      color: '#10b981', glow: 'rgba(16,185,129,0.2)' },
  ];

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="section-title">Your Progress</h1>
        <p className="section-subtitle">Track your mental wellness journey over time</p>
      </motion.div>

      {/* ── STAT CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-5"
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: s.glow, border: `1px solid ${s.color}25` }}
            >
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div className="text-3xl font-black mb-0.5" style={{ fontFamily: 'Outfit, sans-serif', color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs" style={{ color: '#596080' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── CHARTS ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activity */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-4.5 h-4.5" style={{ color: '#7c3aed' }} />
            <h3 className="font-bold text-base" style={{ fontFamily: 'Outfit, sans-serif', color: '#f0f2ff' }}>
              Weekly Activity
            </h3>
          </div>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData} barSize={28}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#596080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#596080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sessions" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-sm" style={{ color: '#373e60' }}>
              No activity yet — start training! 🏋️
            </div>
          )}
        </motion.div>

        {/* Mood */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <SmilePlus className="w-4.5 h-4.5" style={{ color: '#10b981' }} />
            <h3 className="font-bold text-base" style={{ fontFamily: 'Outfit, sans-serif', color: '#f0f2ff' }}>
              Mood Trend
            </h3>
          </div>
          {moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={moodData}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#596080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fill: '#596080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2.5} fill="url(#moodGrad)" dot={{ fill: '#10b981', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-sm" style={{ color: '#373e60' }}>
              No mood data yet — log below!
            </div>
          )}
        </motion.div>
      </div>

      {/* ── MOOD LOGGER ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card p-7"
      >
        <h3 className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: '#f0f2ff' }}>
          How are you feeling right now?
        </h3>
        <p className="text-sm mb-6" style={{ color: '#596080' }}>
          Log your mood to track emotional patterns over time
        </p>

        <div className="flex gap-3 mb-6 flex-wrap">
          {moodEmojis.map(m => {
            const sel = selectedMood === m.score;
            return (
              <motion.button
                key={m.score}
                onClick={() => setSelectedMood(m.score)}
                whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center gap-1.5 p-4 rounded-2xl cursor-pointer border-2 transition-all bg-transparent"
                style={{
                  borderColor: sel ? m.color : 'rgba(255,255,255,0.07)',
                  background:  sel ? `${m.color}12` : 'rgba(255,255,255,0.03)',
                  minWidth: '72px',
                }}
              >
                <motion.span
                  className="text-3xl"
                  animate={{ scale: sel ? 1.15 : 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {m.emoji}
                </motion.span>
                <span className="text-xs font-medium" style={{ color: sel ? m.color : '#596080' }}>
                  {m.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <input
            value={moodNote}
            onChange={e => setMoodNote(e.target.value)}
            placeholder="Add a note (optional)"
            className="input-field flex-1"
          />
          <button
            onClick={logMood}
            disabled={!selectedMood}
            className="btn-primary shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderRadius: '14px', padding: '0.7rem 1.5rem' }}
          >
            Log Mood
          </button>
        </div>
      </motion.div>
    </div>
  );
}
