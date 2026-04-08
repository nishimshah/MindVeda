import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, BarChart3, Wind, Sparkles, Shield, Users, Zap, ArrowRight, Star } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Logo from '../components/Logo';

const features = [
  { icon: Logo,           title: 'Brain Training',   desc: 'Adaptive cognitive games that learn and scale with your progress.', color: '#7c3aed', glow: 'rgba(124,58,237,0.25)' },
  { icon: MessageCircle,  title: 'AI Companion',     desc: 'A calm, empathetic AI trained to support your mental wellness.', color: '#06b6d4', glow: 'rgba(6,182,212,0.2)' },
  { icon: BarChart3,      title: 'Progress Insights',desc: 'Beautiful charts that show your cognitive journey over time.', color: '#10b981', glow: 'rgba(16,185,129,0.2)' },
  { icon: Wind,           title: 'Calm Zone',        desc: 'Breathe, meditate, and unwind with guided relaxation sessions.', color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
  { icon: Shield,         title: 'Neurodiverse-Ready',desc: 'ADHD, Dyslexia, and Autism modes built in — no workarounds.', color: '#ec4899', glow: 'rgba(236,72,153,0.2)' },
  { icon: Users,          title: 'For Every Age',    desc: 'Personalized experiences from age 6 to 100+.', color: '#8b5cf6', glow: 'rgba(139,92,246,0.2)' },
];

const testimonials = [
  { name: 'Arjun M.', role: 'Student, 19',   text: 'MindVeda helped me focus during exam prep. The brain games are genuinely fun and effective.', stars: 5 },
  { name: 'Priya S.', role: 'Working Mom',    text: 'The calm zone is my 5-minute escape every evening. The AI therapist actually listens.', stars: 5 },
  { name: 'Dev R.',   role: 'ADHD, 14',       text: 'The ADHD mode removes all the noise. Finally an app that understands how I think.', stars: 5 },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen relative" style={{ overflowX: 'hidden', background: 'var(--bg-page)' }}>
      <AnimatedBackground variant="hero" />

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'var(--accent-primary)' }}
            >
              <Logo className="w-5 h-5 text-white" color="#fff" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
              MindVeda
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm !px-5 !py-2 no-underline" style={{ borderRadius: '100px' }}>
              Log In
            </Link>
            <Link to="/signup" className="btn-primary text-sm !px-5 !py-2 no-underline">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1,  y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 badge badge-primary mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Mental Wellness Platform
          </div>

          <h1
            className="text-6xl md:text-8xl font-black leading-[1.05] mb-6"
            style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}
          >
            Your Mind,{' '}
            <br />
            <span className="gradient-text-hero">Reimagined.</span>
          </h1>

          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
            MindVeda blends adaptive brain training, empathetic AI therapy, and guided calm — all
            in one beautifully crafted space. Personalized for every kind of mind.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/signup" className="btn-primary text-base no-underline">
              <Zap className="w-5 h-5" /> Start Free Today
            </Link>
            <Link to="/login" className="btn-ghost text-base no-underline">
              I Have an Account
            </Link>
          </div>
        </motion.div>

        {/* Hero dashboard preview card */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div
            className="rounded-3xl p-1 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--accent-p-glow), var(--accent-s-light)15, var(--accent-rose)15)',
              boxShadow: 'var(--shadow-xl), 0 0 0 1px var(--glass-border)',
            }}
          >
            <div
              className="rounded-[22px] p-8 relative"
              style={{ background: 'var(--bg-surface)', backdropFilter: 'blur(20px)' }}
            >
              {/* Window chrome dots */}
              <div className="flex items-center gap-1.5 mb-6">
                <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} />
                <div className="ml-4 text-xs px-4 py-1 rounded-full" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  mindveda.app/dashboard
                </div>
              </div>

              {/* Mini dashboard preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Sessions', value: '24', color: '#7c3aed' },
                  { label: 'Streak',   value: '7🔥', color: '#f59e0b' },
                  { label: 'Avg Score',value: '86',  color: '#06b6d4' },
                  { label: 'Mood',     value: '😊 Good', color: '#10b981' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-left" style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-base)' }}>
                    <div className="text-xl font-bold mb-0.5" style={{ fontFamily: 'Outfit, sans-serif', color: s.color }}>{s.value}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { icon: '🧠', label: 'Brain Training', tag: 'Play now' },
                  { icon: '💬', label: 'AI Companion',   tag: 'Chat' },
                  { icon: '🌿', label: 'Calm Zone',      tag: 'Breathe' },
                ].map(c => (
                  <div key={c.label} className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-base)' }}>
                    <div className="text-2xl">{c.icon}</div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>{c.label}</div>
                      <div className="text-xs" style={{ color: 'var(--accent-primary)' }}>{c.tag} →</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#7c3aed' }}>
            Everything you need
          </p>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
            Built for every mind
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            A complete cognitive wellness platform, meticulously designed and AI-powered.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map(f => (
            <motion.div
              key={f.title}
              variants={item}
              className="glass-card card-hover p-7 group cursor-default"
            >
              <div
                className="w-13 h-13 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${f.color}15`, boxShadow: `0 0 20px ${f.glow}`, width: '52px', height: '52px' }}
              >
                <f.icon className="w-6 h-6" style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
            Loved by real users
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Real stories from our community</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-current" style={{ color: '#f59e0b' }} />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                  style={{ background: 'var(--accent-primary)', color: '#fff', fontFamily: 'Outfit, sans-serif' }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--page-gradient-1) 0%, var(--page-gradient-2) 100%)',
            border: '1px solid var(--border-base)',
            boxShadow: 'var(--shadow-xl), 0 0 60px var(--accent-p-glow)',
          }}
        >
          {/* Background glow */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, var(--accent-p-glow) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <div className="text-5xl mb-4">🧠</div>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Your journey starts<br />
              <span className="gradient-text-hero">right here.</span>
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              Join thousands finding clarity, focus, and peace with MindVeda.
            </p>
            <Link to="/signup" className="btn-primary text-base no-underline">
              <Sparkles className="w-5 h-5" /> Start Free — No Credit Card
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="relative z-10 border-t py-8" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm" style={{ background: 'var(--accent-primary)' }}>
              <Logo className="w-4 h-4 text-white" color="#fff" />
            </div>
            <span className="font-semibold text-sm" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-muted)' }}>MindVeda</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
            © 2026 MindVeda — Built with ❤️ for every mind
          </p>
          <div />
        </div>
      </footer>
    </div>
  );
}
