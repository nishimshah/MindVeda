import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, BarChart3, Wind, Sparkles, 
  Shield, Users, Zap, ArrowRight, Star, Heart
} from 'lucide-react';
import Logo from '../components/Logo';

const features = [
  { icon: Heart,          title: 'Emotional Support', desc: 'A compassionate space designed for your mental wellbeing.', color: '#7A8F7B' },
  { icon: MessageCircle,  title: 'AI Companion',      desc: 'An empathetic assistant that listens and understands.', color: '#A89F91' },
  { icon: BarChart3,      title: 'Progress Insights', desc: 'Gentle visualizations of your wellness journey.', color: '#7A8F7B' },
  { icon: Wind,           title: 'Guided Calm',       desc: 'Breathwork and meditations to anchor your day.', color: '#A89F91' },
  { icon: Shield,         title: 'Secure & Private',  desc: 'Your data is encrypted and stays with you.', color: '#7A8F7B' },
  { icon: Users,          title: 'Inclusive Design',  desc: 'Modes for ADHD, Autism, and neurodiversity.', color: '#A89F91' },
];

export default function LandingPage() {
  const [stage, setStage] = useState(0); // 0: Logo, 1: Tagline, 2: Final

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 1800);
    const timer2 = setTimeout(() => setStage(2), 4800);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  return (
    <div className="min-h-screen relative grainy" style={{ background: 'var(--bg-page)' }}>
      <AnimatePresence>
        {stage < 2 && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1A1A1A]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="mb-8"
            >
              <Logo className="w-44 h-44 brightness-[2]" />
            </motion.div>

            <AnimatePresence>
              {stage === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center px-6"
                >
                  <h2 className="text-3xl md:text-5xl font-serif text-white/90 italic tracking-tight">
                    "Your mind deserves peace."
                  </h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="mt-4 text-white/50 font-medium uppercase tracking-[0.2em] text-xs"
                  >
                    Not just tracking. Understanding.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === 2 ? 1 : 0 }}
        transition={{ duration: 1.5 }}
      >
        {/* ── NAVBAR ─────────────────────────────────────────── */}
        <header className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo className="w-16 h-16" />
              <span className="font-serif font-black text-2xl tracking-tight">
                MindVeda
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-sm font-semibold text-secondary hover:text-primary transition-colors no-underline">
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary no-underline">
                Begin Journey
              </Link>
            </div>
          </nav>
        </header>

        {/* ── HERO ───────────────────────────────────────────── */}
        <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 badge badge-primary mb-10 px-6 py-2">
              <Sparkles className="w-4 h-4 text-accent-green" />
              <span className="text-[10px] tracking-[0.15em]">Clinical Grade AI Sanctuary</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-serif font-black leading-[1.1] mb-8">
              A gentler way to <br />
              <span className="italic font-normal opacity-70">restore your focus.</span>
            </h1>

            <p className="text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto mb-12 opacity-70 font-light">
              We blended adaptive neuroscience with empathetic AI to build a space that doesn’t just record your day—it helps you navigate it.
            </p>

            <div className="flex items-center justify-center gap-6 flex-wrap">
              <Link to="/signup" className="btn-primary text-lg !px-10 !py-4 no-underline group">
                Join MindVeda <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ── FEATURES ────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass-card"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: `${f.color}15` }}
                >
                  <f.icon className="w-7 h-7" style={{ color: f.color }} />
                </div>
                <h3 className="text-2xl font-serif mb-3">{f.title}</h3>
                <p className="opacity-60 leading-relaxed font-light">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIAL ────────────────────────────────────── */}
        <section className="bg-white/40 border-y border-border-base py-32">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex justify-center gap-1 mb-10">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-[#7A8F7B] text-[#7A8F7B]" />)}
            </div>
            <h2 className="text-3xl md:text-5xl font-serif leading-tight mb-12">
              "The most peaceful corner of my phone. It doesn't feel like an app; it feels like a sanctuary."
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-primary flex items-center justify-center text-white font-serif">
                P
              </div>
              <div className="text-left">
                <div className="font-bold">Priya Sharma</div>
                <div className="text-sm opacity-50">Cognitive Wellness User</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <footer className="py-20 border-t border-border-base">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <Logo className="w-10 h-10" />
              <span className="font-serif font-black text-xl">MindVeda</span>
            </div>
            <div className="text-sm text-center md:text-right opacity-40 font-medium uppercase tracking-widest">
              © 2026 Crafted with intention — Your Mind Reimagined.
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
