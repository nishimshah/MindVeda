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
  const [breathPattern, setBreathPattern]   = useState(breathingPatterns[0]);
  const [breathPhase, setBreathPhase]       = useState('idle');
  const [breathActive, setBreathActive]     = useState(false);
  const [breathTimer, setBreathTimer]       = useState(0);
  const breathRef                           = useRef(null);

  const [meditating, setMeditating]         = useState(false);
  const [medTime, setMedTime]               = useState(0);
  const [currentStep, setCurrentStep]       = useState(0);
  const medRef                              = useRef(null);

  const [soundPlaying, setSoundPlaying]     = useState(null);
  const audioRef = useRef(null);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a calming voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Female') || v.name.includes('Google US English') || v.name.includes('Samantha')
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 0.8; // Slower for meditation
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Breathing engine ... unchanged ...
  useEffect(() => {
    if (!breathActive) {
      clearInterval(breathRef.current);
      setBreathPhase('idle'); setBreathTimer(0); return;
    }
    let timer = 0;
    const { inhale, hold, exhale } = breathPattern;
    const total = inhale + hold + exhale;
    setBreathPhase('inhale'); setBreathTimer(inhale);
    breathRef.current = setInterval(() => {
      timer++;
      const pos = timer % total;
      if (pos < inhale)         { setBreathPhase('inhale'); setBreathTimer(inhale - pos); }
      else if (pos < inhale + hold) { setBreathPhase('hold');   setBreathTimer(inhale + hold - pos); }
      else                      { setBreathPhase('exhale'); setBreathTimer(total - pos); }
    }, 1000);
    return () => clearInterval(breathRef.current);
  }, [breathActive, breathPattern]);

  // Meditation timer + Voice
  useEffect(() => {
    if (!meditating) { 
      clearInterval(medRef.current); 
      window.speechSynthesis.cancel();
      return; 
    }
    
    // Small delay to ensure voices are loaded on some browsers
    const startMeditation = () => {
      speak(meditationSteps[0].text);
      medRef.current = setInterval(() => {
        setMedTime(t => {
          const n = t + 1;
          const idx = meditationSteps.findLastIndex(s => s.time <= n);
          if (idx >= 0 && idx !== currentStep) {
            setCurrentStep(idx);
            speak(meditationSteps[idx].text);
          }
          if (n >= 90) { setMeditating(false); return 0; }
          return n;
        });
      }, 1000);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        startMeditation();
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      startMeditation();
    }

    return () => {
      clearInterval(medRef.current);
      window.speechSynthesis.cancel();
    };
  }, [meditating]);

  // Sound Engine
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (soundPlaying) {
      const soundUrls = {
        Rain:   'https://assets.mixkit.co/active_storage/sfx/2458/2458-preview.mp3',
        Forest: 'https://assets.mixkit.co/active_storage/sfx/2387/2387-preview.mp3',
        Ocean:  'https://assets.mixkit.co/active_storage/sfx/1202/1202-preview.mp3',
        Night:  'https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3',
      };
      audioRef.current = new Audio(soundUrls[soundPlaying]);
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [soundPlaying]);

  const scale = breathPhase === 'inhale' || breathPhase === 'hold' ? 1.55 : 1;
  const activeColor = phaseColors[breathPhase];

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="section-title">Calm Zone</h1>
        <p className="section-subtitle">Breathe, relax, and find your peace</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* ── BREATHING EXERCISE ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x:  0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-7"
        >
          <div className="flex items-center gap-2 mb-6">
            <Wind className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="font-black text-lg" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
              Breathing Exercise
            </h3>
          </div>

          {/* Pattern selector */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {breathingPatterns.map(p => (
              <button
                key={p.name}
                onClick={() => { setBreathPattern(p); setBreathActive(false); }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border-none transition-all"
                style={{
                  background: breathPattern.name === p.name ? `${p.color}20` : 'var(--bg-surface-1)',
                  color:      breathPattern.name === p.name ? p.color : 'var(--text-muted)',
                  border:     `1px solid ${breathPattern.name === p.name ? `${p.color}40` : 'var(--border-base)'}`,
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Breathing circle */}
          <div className="flex items-center justify-center py-6">
            <div className="relative flex items-center justify-center">
              {/* Outer glow ring */}
              <motion.div
                animate={{ scale: breathActive ? (scale * 1.1) : 1, opacity: breathActive ? 0.5 : 0.15 }}
                transition={{ duration: breathPhase === 'inhale' ? breathPattern.inhale : breathPhase === 'exhale' ? breathPattern.exhale : 0.4, ease: 'easeInOut' }}
                className="absolute rounded-full"
                style={{
                  width: '240px', height: '240px',
                  background: `radial-gradient(circle, ${activeColor}30, transparent 70%)`,
                  boxShadow:  `0 0 80px ${activeColor}40`,
                }}
              />
              {/* Main circle */}
              <motion.div
                animate={{ scale }}
                transition={{ duration: breathPhase === 'inhale' ? breathPattern.inhale : breathPhase === 'exhale' ? breathPattern.exhale : 0.4, ease: 'easeInOut' }}
                className="w-40 h-40 rounded-full flex items-center justify-center relative"
                style={{
                  background: `radial-gradient(circle, ${activeColor}25, ${activeColor}08)`,
                  border:     `2px solid ${activeColor}60`,
                  boxShadow:  breathActive ? `0 0 40px ${activeColor}40, inset 0 0 30px ${activeColor}15` : 'none',
                }}
              >
                <div className="text-center">
                  <div className="text-4xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: activeColor }}>
                    {breathActive ? breathTimer : '—'}
                  </div>
                  <div className="text-sm font-semibold capitalize" style={{ color: activeColor }}>
                    {phaseLabels[breathPhase]}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="text-center text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            {breathingPatterns.find(p => p.name === breathPattern.name)?.label}
            {' — '}↑{breathPattern.inhale}s hold {breathPattern.hold}s ↓{breathPattern.exhale}s
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setBreathActive(!breathActive)}
              className="btn-primary !px-8"
              style={{ background: breathActive ? 'linear-gradient(135deg, #f59e0b, #d97706)' : undefined }}
            >
              {breathActive ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}
            </button>
            <button
              onClick={() => setBreathActive(false)}
              className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all"
              style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-base)', color: 'var(--text-muted)' }}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* ── GUIDED MEDITATION ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x:  0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-7"
        >
          <div className="flex items-center gap-2 mb-6">
            <Leaf className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
            <h3 className="font-black text-lg" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
              Guided Meditation
            </h3>
          </div>

          <div className="flex items-center justify-center py-8 min-h-56">
            <div className="text-center max-w-sm w-full">
              {meditating ? (
                <>
                  {/* Progress ring */}
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border-base)" strokeWidth="5" />
                        <circle
                          cx="40" cy="40" r="34" fill="none"
                          stroke="var(--accent-green)" strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 34}`}
                        strokeDashoffset={`${2 * Math.PI * 34 * (1 - medTime / 90)}`}
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                      />
                    </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold" style={{ color: 'var(--accent-green)', fontFamily: 'Outfit, sans-serif' }}>
                          {Math.floor(medTime / 60)}:{String(medTime % 60).padStart(2, '0')}
                        </span>
                      </div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentStep}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.5 }}
                      className="text-lg leading-relaxed mb-6"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {meditationSteps[currentStep]?.text}
                    </motion.p>
                  </AnimatePresence>
                </>
              ) : (
                <div>
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 float-animation" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <Leaf className="w-8 h-8" style={{ color: '#10b981' }} />
                  </div>
                  <h4 className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
                    90-Second Session
                  </h4>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Find a quiet spot.</p>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Let me guide you through a calming reset.</p>
                </div>
              )}

              <button
                onClick={() => { setMeditating(!meditating); setMedTime(0); setCurrentStep(0); }}
                className="btn-primary !px-8"
                style={{
                  background: meditating
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: meditating ? '0 4px 20px rgba(239,68,68,0.3)' : '0 4px 20px rgba(16,185,129,0.3)',
                }}
              >
                {meditating ? <><Pause className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Begin</>}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── AMBIENT SOUNDS ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y:  0 }}
        transition={{ delay: 0.18 }}
        className="glass-card p-7"
      >
        <div className="flex items-center gap-2 mb-6">
          <Volume2 className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
          <h3 className="font-black text-lg" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
            Ambient Sounds
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {sounds.map(s => {
            const playing = soundPlaying === s.name;
            return (
              <motion.button
                key={s.name}
                onClick={() => setSoundPlaying(playing ? null : s.name)}
                whileTap={{ scale: 0.96 }}
                className="p-5 rounded-2xl border-2 text-center cursor-pointer transition-all bg-transparent relative overflow-hidden"
                style={{
                  borderColor: playing ? s.color : 'var(--border-base)',
                  background:  playing ? `${s.color}12` : 'var(--bg-surface-1)',
                }}
              >
                {playing && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{ opacity: [0.1, 0.25, 0.1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ background: `radial-gradient(circle, ${s.color}30, transparent)` }}
                  />
                )}
                <div className="text-4xl mb-2">{s.emoji}</div>
                <div className="font-bold text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: playing ? s.color : 'var(--text-primary)' }}>
                  {s.name}
                </div>
                <div className="text-xs" style={{ color: playing ? s.color : 'var(--text-muted)' }}>
                  {playing ? '🔊 Playing' : 'Tap to play'}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
