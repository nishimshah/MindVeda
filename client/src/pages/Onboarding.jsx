import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronRight, ChevronLeft, Target, Heart, Sparkles, Loader2, Check } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import AnimatedBackground from '../components/AnimatedBackground';

const ageGroups = [
  { value: 'child',   emoji: '🧒', label: 'Child',   desc: 'Ages 6–12',  color: '#f59e0b' },
  { value: 'teen',    emoji: '🧑', label: 'Teen',    desc: 'Ages 13–17', color: '#06b6d4' },
  { value: 'adult',   emoji: '🧑‍💼', label: 'Adult',   desc: 'Ages 18–59', color: '#7c3aed' },
  { value: 'elderly', emoji: '🧓', label: 'Elderly', desc: 'Ages 60+',   color: '#8b5cf6' },
];

const goalOptions = [
  { value: 'focus',        label: 'Improve Focus',      icon: '🎯', color: '#7c3aed' },
  { value: 'memory',       label: 'Boost Memory',       icon: '🧠', color: '#06b6d4' },
  { value: 'stress',       label: 'Reduce Stress',      icon: '😌', color: '#10b981' },
  { value: 'productivity', label: 'Boost Productivity', icon: '⚡', color: '#f59e0b' },
  { value: 'sleep',        label: 'Better Sleep',       icon: '😴', color: '#8b5cf6' },
  { value: 'confidence',   label: 'Build Confidence',   icon: '💪', color: '#ec4899' },
];

const specialNeedsOptions = [
  { value: 'adhd',     label: 'ADHD',           desc: 'Difficulty with focus & attention', color: '#f59e0b' },
  { value: 'autism',   label: 'Autism',          desc: 'Preference for structured environments', color: '#06b6d4' },
  { value: 'dyslexia', label: 'Dyslexia',        desc: 'Reading & processing challenges', color: '#7c3aed' },
  { value: 'anxiety',  label: 'Anxiety',         desc: 'Frequent worry or nervousness', color: '#ec4899' },
  { value: 'none',     label: 'None of these',   desc: 'No specific needs', color: '#10b981' },
];

const stepsMeta = [
  { title: "What's your age group?", subtitle: "We'll personalize your experience accordingly", icon: Heart, iconColor: '#ec4899' },
  { title: "What are your goals?",   subtitle: "Select all that apply — you can change these anytime", icon: Target, iconColor: '#06b6d4' },
  { title: "Any special considerations?", subtitle: "This helps us adapt the experience for you", icon: Sparkles, iconColor: '#7c3aed' },
];

export default function Onboarding() {
  const [step, setStep]               = useState(0);
  const [ageGroup, setAgeGroup]       = useState('');
  const [goals, setGoals]             = useState([]);
  const [specialNeeds, setSpecialNeeds] = useState([]);
  const [loading, setLoading]         = useState(false);
  const { updateUser }                = useAuth();
  const navigate                      = useNavigate();

  const toggleGoal = g => setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const toggleNeed = n => {
    if (n === 'none') {
      setSpecialNeeds(['none']);
    } else {
      setSpecialNeeds(prev => {
        const filtered = prev.filter(x => x !== 'none');
        return filtered.includes(n) ? filtered.filter(x => x !== n) : [...filtered, n];
      });
    }
  };

  const canNext = () => {
    if (step === 0) return ageGroup !== '';
    if (step === 1) return goals.length > 0;
    if (step === 2) return specialNeeds.length > 0;
    return true;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/user/preferences', {
        age_group: ageGroup,
        goals,
        special_needs: specialNeeds.filter(n => n !== 'none'),
      });
      updateUser(data);
      toast.success("Profile personalized! Let's begin. 🚀");
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save preferences.');
    } finally {
      setLoading(false);
    }
  };

  const StepIcon = stepsMeta[step].icon;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <AnimatedBackground variant="auth" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className="relative flex-1">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border-base)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'var(--accent-primary)' }}
                  initial={{ width: i < step ? '100%' : '0%' }}
                  animate={{ width: i === step ? '50%' : i < step ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          ))}
          <span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>
            {step + 1} / 3
          </span>
        </div>

        <div className="glass-card p-8 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Step header */}
              <div className="text-center mb-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${stepsMeta[step].iconColor}18`, border: `1px solid ${stepsMeta[step].iconColor}30` }}
                >
                  <StepIcon className="w-7 h-7" style={{ color: stepsMeta[step].iconColor }} />
                </div>
                <h2 className="text-2xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  {stepsMeta[step].title}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {stepsMeta[step].subtitle}
                </p>
              </div>

              {/* Step 0: Age Group */}
              {step === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {ageGroups.map(ag => {
                    const selected = ageGroup === ag.value;
                    return (
                      <motion.button
                        key={ag.value}
                        onClick={() => setAgeGroup(ag.value)}
                        whileTap={{ scale: 0.97 }}
                        className="p-5 rounded-2xl border-2 text-left cursor-pointer transition-all relative overflow-hidden"
                        style={{
                          borderColor: selected ? ag.color : 'var(--border-base)',
                          background: selected ? `${ag.color}12` : 'var(--bg-surface-1)',
                        }}
                      >
                        {selected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: ag.color }}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className="text-3xl mb-2">{ag.emoji}</div>
                        <div className="font-bold text-sm mb-0.5" style={{ fontFamily: 'Outfit, sans-serif', color: selected ? ag.color : 'var(--text-primary)' }}>
                          {ag.label}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{ag.desc}</div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Step 1: Goals */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  {goalOptions.map(goal => {
                    const selected = goals.includes(goal.value);
                    return (
                      <motion.button
                        key={goal.value}
                        onClick={() => toggleGoal(goal.value)}
                        whileTap={{ scale: 0.97 }}
                        className="p-4 rounded-xl border-2 text-left cursor-pointer transition-all flex items-center gap-3 relative"
                        style={{
                          borderColor: selected ? goal.color : 'var(--border-base)',
                          background: selected ? `${goal.color}12` : 'var(--bg-surface-1)',
                        }}
                      >
                        <span className="text-xl">{goal.icon}</span>
                        <span className="font-semibold text-sm" style={{ color: selected ? goal.color : 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
                          {goal.label}
                        </span>
                        {selected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: goal.color }}>
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Step 2: Special Needs */}
              {step === 2 && (
                <div className="space-y-3">
                  {specialNeedsOptions.map(need => {
                    const selected = specialNeeds.includes(need.value);
                    return (
                      <motion.button
                        key={need.value}
                        onClick={() => toggleNeed(need.value)}
                        whileTap={{ scale: 0.99 }}
                        className="w-full p-4 rounded-xl border-2 text-left cursor-pointer transition-all flex items-center gap-4"
                        style={{
                          borderColor: selected ? need.color : 'var(--border-base)',
                          background: selected ? `${need.color}10` : 'var(--bg-surface-1)',
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                          style={{ background: selected ? `${need.color}20` : 'rgba(255,255,255,0.05)', border: `1px solid ${selected ? need.color + '40' : 'transparent'}` }}
                        >
                          {selected
                            ? <Check className="w-5 h-5" style={{ color: need.color }} />
                            : <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
                          }
                        </div>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: selected ? need.color : 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                            {need.label}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{need.desc}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1.5 text-sm font-medium cursor-pointer bg-transparent border-none transition-colors disabled:opacity-30"
              style={{ color: 'var(--text-muted)' }}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 2 ? (
              <motion.button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                whileTap={{ scale: 0.97 }}
                className="btn-primary !py-2.5 !px-6 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleFinish}
                disabled={!canNext() || loading}
                whileTap={{ scale: 0.97 }}
                className="btn-primary !py-2.5 !px-6 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <>Get Started <Sparkles className="w-4 h-4" /></>}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
