import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { motion } from 'framer-motion';
import { Save, Settings, Eye, Focus, Shield, Loader2, Flame, Star, Sun, Moon, Leaf } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const themeCards = [
  { value: 'light', label: 'Light Theme', desc: 'Minimal, clean Apple-style', icon: Sun,  color: '#7c3aed' },
  { value: 'dark',  label: 'Dark Theme',  desc: 'Midnight therapeutic experience', icon: Moon, color: '#a78bfa' },
  { value: 'calm',  label: 'Calm Mode',   desc: 'Low-brightness, anxiety-safe sage', icon: Leaf, color: '#10b981' },
];

export default function Profile() {
  const { user, updateUser }      = useAuth();
  const { mode, setMode }         = useAccessibility();
  const { theme, setTheme }       = useTheme();
  const [name, setName]           = useState(user?.name || '');
  const [loading, setLoading]     = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try { const { data } = await api.get('/user/profile'); setProfileData(data); setName(data.name); }
    catch {}
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/user/profile', { name, accessibility_mode: mode });
      updateUser(data);
      toast.success('Profile updated! ✨');
    } catch { toast.error('Failed to save.'); }
    finally { setLoading(false); }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="page-container max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="section-title">Profile</h1>
        <p className="section-subtitle">Manage your account and accessibility preferences</p>
      </motion.div>

      {/* ── USER CARD ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-7 mb-6"
      >
        {/* Avatar + info row */}
        <div className="flex items-center gap-5 mb-7 pb-7" style={{ borderBottom: '1px solid var(--border-base)' }}>
          <div className="relative shrink-0">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                color: '#fff',
                fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 0 0 3px var(--accent-p-glow), var(--shadow-lg)',
              }}
            >
              {initials}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black truncate" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
              {user?.name}
            </h2>
            <p className="text-sm truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            {/* Stats row */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" style={{ color: 'var(--accent-amber)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--accent-amber)' }}>
                  {profileData?.streak?.current_streak || 0} day streak
                </span>
              </div>
              {user?.goals?.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" style={{ color: 'var(--accent-p-light)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {user.goals.slice(0, 2).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Display Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="input-field"
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Age Group</label>
            <div
              className="px-4 py-3 rounded-xl text-sm capitalize"
              style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-base)', color: 'var(--text-secondary)' }}
            >
              {user?.age_group || '—'}
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={loading}
            className="btn-primary"
            style={{ borderRadius: '14px', padding: '0.75rem 2rem' }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </motion.div>

      {/* ── THEME SELECTION ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-7 mb-6"
      >
        <div className="mb-6">
          <h3 className="font-black text-lg" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
            Appearance
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Choose a theme that fits your current mood.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeCards.map(t => {
            const selected = theme === t.value;
            return (
              <motion.button
                key={t.value}
                onClick={() => setTheme(t.value)}
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-2xl border-2 text-center cursor-pointer transition-all flex flex-col items-center gap-2 bg-transparent"
                style={{
                  borderColor: selected ? 'var(--accent-p-light)' : 'var(--border-base)',
                  background:  selected ? 'var(--accent-p-glow)' : 'var(--bg-surface-1)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: 'var(--bg-surface-2)',
                    border: `1px solid ${selected ? 'var(--accent-p-light)' : 'transparent'}`,
                  }}
                >
                  <t.icon className="w-5 h-5" style={{ color: selected ? 'var(--accent-p-light)' : 'var(--text-muted)' }} />
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: selected ? 'var(--text-primary)' : 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
                    {t.label}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── ACCESSIBILITY MODES ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-7"
      >
        <div className="mb-6">
          <h3 className="font-black text-lg" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
            Accessibility Mode
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Adapt the interface to your needs — changes apply instantly.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accessibilityModes.map(m => {
            const selected = mode === m.value;
            return (
              <motion.button
                key={m.value}
                onClick={() => setMode(m.value)}
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex items-start gap-4 bg-transparent"
                style={{
                  borderColor: selected ? m.color : 'rgba(255,255,255,0.07)',
                  background:  selected ? `${m.color}10` : 'rgba(255,255,255,0.03)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: `${m.color}18`,
                    border: `1px solid ${selected ? `${m.color}40` : 'transparent'}`,
                    boxShadow: selected ? `0 0 16px ${m.color}30` : 'none',
                  }}
                >
                  <m.icon className="w-5 h-5" style={{ color: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm" style={{ color: selected ? m.color : '#f0f2ff', fontFamily: 'Outfit, sans-serif' }}>
                    {m.label}
                  </div>
                  <div className="text-xs mt-0.5 leading-relaxed" style={{ color: '#596080' }}>
                    {m.desc}
                  </div>
                </div>
                {selected && (
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: m.color }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
