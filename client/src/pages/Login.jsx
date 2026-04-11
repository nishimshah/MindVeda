import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedBackground from '../components/AnimatedBackground';
import Logo from '../components/Logo';

const brandPoints = [
  { icon: '🧠', text: 'Adaptive brain training games' },
  { icon: '💬', text: 'AI-powered wellness companion' },
  { icon: '📊', text: 'Real-time progress tracking' },
  { icon: '🍃', text: 'Guided calm & breathwork' },
];

export default function Login() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const { login }                       = useAuth();
  const navigate                        = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate(user.onboarding_complete ? '/dashboard' : '/onboarding');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch relative" style={{ overflowX: 'hidden', background: 'var(--bg-page)' }}>
      <AnimatedBackground variant="auth" />

      {/* ── LEFT BRAND PANEL ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] p-16 relative z-10">
        {/* Simple Brand Header -- No Gradient Bg */}
        <Link to="/" className="flex items-center gap-3 no-underline group w-max">
          <Logo className="w-18 h-18 group-hover:scale-105 transition-transform duration-300" />
          <span className="font-serif font-black text-2xl tracking-tight">
            MindVeda
          </span>
        </Link>

        {/* Center content */}
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent-green mb-8 py-2 px-5 rounded-full bg-accent-green/10">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            Clinical AI Companion
          </div>
          
          <h2 className="text-7xl font-serif font-black leading-[1.1] mb-8">
            Return to your <br />
            <span className="italic font-normal opacity-60">center.</span>
          </h2>
          
          <p className="text-xl max-w-md font-light leading-relaxed mb-16 text-[#5C5C5C]">
            A private Sanctuary designed for cognitive growth and neural regulation.
          </p>

          <div className="grid grid-cols-1 gap-6">
            {brandPoints.map(p => (
              <div key={p.text} className="flex items-center gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#EBE7E0] flex items-center justify-center text-xl shadow-soft group-hover:scale-105 transition-transform duration-500">
                  {p.icon}
                </div>
                <span className="text-sm font-medium text-[#5C5C5C]">{p.text}</span>
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
          {/* Mobile logo only */}
          <div className="flex flex-col items-center gap-4 mb-10 lg:hidden text-center">
            <Logo className="w-16 h-16" />
            <div>
              <h3 className="font-serif font-black text-2xl tracking-tight">MindVeda</h3>
              <p className="text-sm opacity-50">Matured mental wellness AI</p>
            </div>
          </div>

          <div className="glass-card !p-12 shadow-2xl relative overflow-hidden border-none">
            <div className="mb-10">
              <h1 className="text-4xl font-serif font-black mb-3">
                Sign in
              </h1>
              <p className="text-sm font-light opacity-60">
                Continue your focus and growth journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 text-[#A89F91]">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A89F91] group-focus-within:text-accent-green transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field !pl-14 !h-14 !rounded-full !bg-[#F8F6F4] !border-[#EBE7E0] focus:!border-accent-green"
                    placeholder="you@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 text-[#A89F91]">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A89F91] group-focus-within:text-accent-green transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field !pl-14 !pr-14 !h-14 !rounded-full !bg-[#F8F6F4] !border-[#EBE7E0] focus:!border-accent-green"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer p-1 text-[#A89F91] hover:text-accent-green transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                <div className="flex justify-end mt-3">
                  <Link to="#" className="text-xs font-bold text-accent-green hover:underline decoration-2 underline-offset-4 transition-all no-underline">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !h-14 !text-xs !rounded-full !shadow-lg !shadow-accent-green/10 mt-4 font-black uppercase tracking-widest"
              >
                {loading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating…</>
                  : <span className="flex items-center justify-center gap-2">Sign in <ArrowRight className="w-4 h-4" /></span>
                }
              </button>
            </form>

            <div className="mt-12 pt-10 border-t border-[#EBE7E0]/50 text-center">
              <p className="text-sm font-light text-[#5C5C5C]">
                New here?{' '}
                <Link to="/signup" className="text-[#1A1A1A] font-black hover:text-accent-green transition-colors no-underline ml-1">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
