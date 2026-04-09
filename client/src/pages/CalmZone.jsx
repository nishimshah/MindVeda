import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, Pause, RotateCcw, Volume2, Leaf, Timer } from 'lucide-react';

const breathingPatterns = [
  { name: '4-7-8 Calm',    inhale: 4, hold: 7, exhale: 8,  color: '#7c3aed', label: 'Best for anxiety' },
  { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4,  color: '#06b6d4', label: 'Focus & calm' },
  { name: 'Deep Relax',    inhale: 5, hold: 3, exhale: 7,  color: '#10b981', label: 'Stress relief' },
];

const meditationSteps = [
  { time:  0, text: 'Close your eyes gently. Let your shoulders drop.' },
  { time: 10, text: 'Take a deep breath in through your nose...' },
  { time: 18, text: 'Slowly breathe out through your mouth.' },
  { time: 26, text: 'Notice the sensations in your body.' },
  { time: 36, text: 'Let any tension melt away with each breath.' },
  { time: 46, text: 'Your thoughts may wander — gently bring focus back.' },
  { time: 58, text: 'You are safe. You are calm. You are present.' },
  { time: 70, text: 'Take one final deep breath...' },
  { time: 80, text: 'When you\'re ready, slowly open your eyes. 🌟' },
];

const sounds = [
  { name: 'Rain',   emoji: '🌧️', color: '#06b6d4' },
  { name: 'Forest', emoji: '🌲', color: '#10b981' },
  { name: 'Ocean',  emoji: '🌊', color: '#7c3aed' },
  { name: 'Night',  emoji: '🌙', color: '#8b5cf6' },
];

const phaseColors = { idle: '#2d3352', inhale: '#7c3aed', hold: '#f59e0b', exhale: '#10b981' };
const phaseLabels = { idle: 'Ready', inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale' };

export default function CalmZone() {
  const [activeMode, setActiveMode] = useState('menu'); // 'menu', 'focus', 'sleep'
  const [breathActive, setBreathActive] = useState(false);
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [soundPlaying, setSoundPlaying] = useState(null);
  const audioRef = useRef(null);

  // Sound Engine
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (soundPlaying) {
      const soundUrls = {
        'Rain': 'https://assets.mixkit.co/active_storage/sfx/2458/2458-preview.mp3',
        'Forest': 'https://assets.mixkit.co/active_storage/sfx/2387/2387-preview.mp3',
        'Ocean': 'https://assets.mixkit.co/active_storage/sfx/1202/1202-preview.mp3',
        'Night': 'https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3',
      };
      audioRef.current = new Audio(soundUrls[soundPlaying]);
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {});
    }
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [soundPlaying]);

  // Breathing Loop
  useEffect(() => {
    if (!breathActive) return;
    const timer = setInterval(() => {
      setBreathTimer(t => {
        if (t <= 1) {
          if (breathPhase === 'inhale') { setBreathPhase('hold'); return 7; }
          if (breathPhase === 'hold') { setBreathPhase('exhale'); return 8; }
          if (breathPhase === 'exhale') { setBreathPhase('inhale'); return 4; }
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breathActive, breathPhase]);

  const renderMenu = () => (
    <div className="max-w-4xl mx-auto py-12">
      <div className="mb-12">
        <h1 className="section-title">Pause & Recharge</h1>
        <p className="text-secondary text-lg">Taking a break is a productive act.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.button
          whileHover={{ y: -5 }}
          onClick={() => setActiveMode('focus')}
          className="glass-card flex flex-col items-center text-center p-12 border-none bg-[#A7C7E720]"
        >
          <div className="w-20 h-20 rounded-[32px] bg-[#A7C7E7] flex items-center justify-center mb-6 shadow-lg shadow-[#A7C7E730]">
            <Timer className="w-10 h-10 text-slate-800" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Focus Mode</h2>
          <p className="text-secondary">A gentle space for concentration and breath.</p>
        </motion.button>

        <motion.button
          whileHover={{ y: -5 }}
          onClick={() => setActiveMode('sleep')}
          className="glass-card flex flex-col items-center text-center p-12 border-none bg-[#D6CDEA20]"
        >
          <div className="w-20 h-20 rounded-[32px] bg-[#D6CDEA] flex items-center justify-center mb-6 shadow-lg shadow-[#D6CDEA30]">
            <Wind className="w-10 h-10 text-slate-800" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Sleep Mode</h2>
          <p className="text-secondary">Drift away with soothing ambient sounds.</p>
        </motion.button>
      </div>
    </div>
  );

  const renderFocus = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-[#F5F1E8] dark:bg-[#1C1C1E] flex flex-col items-center justify-center p-6">
      <button onClick={() => {setActiveMode('menu'); setBreathActive(false);}} className="absolute top-10 right-10 text-muted hover:text-primary transition-colors">
        <RotateCcw className="w-8 h-8" />
      </button>

      <div className="text-center mb-20">
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{breathActive ? breathPhase.toUpperCase() : 'Breathe with me'}</h2>
        <p className="text-secondary">4-7-8 Breathing Pattern</p>
      </div>

      <div className="relative flex items-center justify-center mb-24">
        <motion.div
          animate={{ 
            scale: breathActive ? (breathPhase === 'inhale' ? 1.4 : breathPhase === 'hold' ? 1.4 : 1) : 1,
            opacity: breathActive ? 0.6 : 0.2
          }}
          transition={{ duration: breathPhase === 'inhale' ? 4 : breathPhase === 'exhale' ? 8 : 1, ease: "easeInOut" }}
          className="w-64 h-64 rounded-full bg-[#A7C7E7] absolute blur-3xl"
        />
        <motion.div
          animate={{ scale: breathActive ? (breathPhase === 'inhale' ? 1.4 : breathPhase === 'hold' ? 1.4 : 1) : 1 }}
          transition={{ duration: breathPhase === 'inhale' ? 4 : breathPhase === 'exhale' ? 8 : 1, ease: "easeInOut" }}
          className="w-48 h-48 rounded-full border-4 border-[#A7C7E7] flex items-center justify-center bg-white dark:bg-zinc-800 shadow-2xl z-10"
        >
          <div className="text-center">
            <div className="text-6xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{breathTimer}</div>
            <div className="text-[10px] uppercase font-black tracking-widest text-[#A7C7E7]">Seconds</div>
          </div>
        </motion.div>
      </div>

      <button
        onClick={() => setBreathActive(!breathActive)}
        className="btn-primary !px-16 !py-5 text-lg shadow-xl"
        style={{ background: 'var(--accent-blue)' }}
      >
        {breathActive ? 'Pause Session' : 'Start Focus Session'}
      </button>
      
      <p className="mt-8 text-muted text-sm italic">Focus mode minimizes distractions for total clarity</p>
    </motion.div>
  );

  const renderSleep = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-[#1C1C1E] flex flex-col items-center justify-center p-6 text-white">
      <button onClick={() => {setActiveMode('menu'); setSoundPlaying(null);}} className="absolute top-10 right-10 opacity-40 hover:opacity-100 transition-opacity">
        <RotateCcw className="w-8 h-8" />
      </button>

      <div className="text-center mb-16">
        <h2 className="text-4xl font-black mb-4">Dim the nights</h2>
        <p className="text-zinc-400">Select a sound to drift away...</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-20 w-full max-w-sm">
        {['Rain', 'Forest', 'Ocean', 'Night'].map(s => (
          <button
            key={s}
            onClick={() => setSoundPlaying(soundPlaying === s ? null : s)}
            className={`p-10 rounded-[32px] transition-all duration-500 border-none flex flex-col items-center gap-4 ${
              soundPlaying === s ? 'bg-[#A7C7E730] scale-105 ring-2 ring-[#A7C7E720]' : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            <div className="text-4xl">{s === 'Rain' ? '🌧️' : s === 'Forest' ? '🌲' : s === 'Ocean' ? '🌊' : '🌙'}</div>
            <span className={`text-xs font-black uppercase tracking-widest ${soundPlaying === s ? 'text-[#A7C7E7]' : 'text-zinc-500'}`}>{s}</span>
          </button>
        ))}
      </div>

      {soundPlaying && (
        <div className="flex flex-col items-center">
          <div className="w-1 h-1 rounded-full bg-[#A7C7E7] mb-8 breathing-animation" style={{ boxShadow: '0 0 40px 10px #A7C7E7' }} />
          <button 
            onClick={() => setSoundPlaying(null)}
            className="px-10 py-3 rounded-full border border-zinc-700 text-zinc-400 text-sm hover:text-[#A7C7E7] hover:border-[#A7C7E7] transition-all"
          >
            Turn Off Sound
          </button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="smooth-transition">
      {activeMode === 'menu' && renderMenu()}
      {activeMode === 'focus' && renderFocus()}
      {activeMode === 'sleep' && renderSleep()}
    </div>
  );
}
