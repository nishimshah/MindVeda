import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, Eye, EyeOff, User, Loader2, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedBackground from '../components/AnimatedBackground';

const brandPoints = [
  { icon: '🎯', text: 'Personalized to your goals' },
  { icon: '🧠', text: '3 adaptive brain games' },
  { icon: '💬', text: 'GPT-4 powered AI therapist' },
  { icon: '♿', text: 'ADHD, Dyslexia & Autism modes' },
];

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ chars', ok: password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
  ];
  if (!password) return null;
  const score = checks.filter(c => c.ok).length;
  const colors = ['#f87171', '#fbbf24', '#34d399'];
  const labels = ['Weak', 'Fair', 'Strong'];

  return (
    <div className="mt-3">
      <div className="flex gap-1.5 mb-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score - 1] : 'var(--bg-surface-2)' }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: score > 0 ? colors[score - 1] : 'var(--text-muted)' }}>
          {score > 0 ? labels[score - 1] : 'Strength'}
        </span>
        <div className="flex gap-2.5 ml-auto">
          {checks.map(c => (
            <span key={c.label} className="flex items-center gap-1 text-[10px] font-medium" style={{ color: c.ok ? 'var(--accent-green)' : 'var(--text-muted)' }}>
              <Check className="w-2.5 h-2.5" /> {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Signup() {
  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const { signup }                      = useAuth();
  const navigate                        = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success("Account created! Let's personalize your experience. ✨");
      navigate('/onboarding');
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch relative" style={{ overflowX: 'hidden', background: 'var(--bg-page)' }}>
      <AnimatedBackground variant="auth" />

      {/* ── LEFT BRAND PANEL ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] p-16 relative z-10">
        <Link to="/" className="flex items-center gap-3 no-underline group w-max">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-600 shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading font-black text-xl text-slate-800 dark:text-slate-100">
            MindVeda
          </span>
        </Link>

        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-6 py-1.5 px-4 rounded-full bg-indigo-50 dark:bg-indigo-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Start Your Journey
          </div>
          <h2 className="text-6xl md:text-7xl font-black leading-[1.05] mb-8" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
            Train your<br />
            <span className="text-indigo-600">mind. Find peace.</span>
          </h2>
          <p className="text-lg max-w-md leading-relaxed mb-12" style={{ color: 'var(--text-secondary)' }}>
            A space built just for you — adaptive, accessible, and always on your side.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
            {brandPoints.map(p => (
              <div key={p.text} className="flex items-center gap-3.5 group">
                <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl shadow-sm">
                  {p.icon}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            © 2026 MindVeda — Your wellness, reimagined
          </p>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-4 mb-10 lg:hidden text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-600 shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-black text-2xl tracking-tight" style={{ color: 'var(--text-primary)' }}>MindVeda</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Adaptive wellness platform</p>
            </div>
          </div>

          <div className="glass-card p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />

            <div className="mb-10">
              <h1 className="text-4xl font-black mb-3" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                Sign up
              </h1>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Start your mental wellness journey — free forever
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2.5 ml-1" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors group-focus-within:text-indigo-600" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-field !pl-12 !h-14 !rounded-2xl !bg-slate-50 dark:!bg-slate-900/40 !border-slate-200 dark:!border-slate-800 focus:!border-indigo-600"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2.5 ml-1" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors group-focus-within:text-indigo-600" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field !pl-12 !h-14 !rounded-2xl !bg-slate-50 dark:!bg-slate-900/40 !border-slate-200 dark:!border-slate-800 focus:!border-indigo-600"
                    placeholder="you@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2.5 ml-1" style={{ color: 'var(--text-muted)' }}>Create Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors group-focus-within:text-indigo-600" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field !pl-12 !pr-12 !h-14 !rounded-2xl !bg-slate-50 dark:!bg-slate-900/40 !border-slate-200 dark:!border-slate-800 focus:!border-indigo-600"
                    placeholder="At least 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !h-14 !text-base !rounded-2xl !shadow-indigo-200/50 dark:!shadow-none mt-2"
              >
                {loading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account…</>
                  : <span className="flex items-center gap-2">Create account <ArrowRight className="w-4 h-4" /></span>
                }
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors no-underline ml-1">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
