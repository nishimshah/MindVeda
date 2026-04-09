import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Loader2, Check,
  User, Briefcase, Heart, Users, Stethoscope,
  BookOpen, Brain, Sparkles, Shield, Clock,
} from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

// ─── Role selection data ───────────────────────────────────────────────────────
const roles = [
  { value: 'individual', emoji: '🧘', label: 'Individual', desc: 'Personal mental wellness & self-growth', color: '#7c3aed', icon: User },
  { value: 'therapist',  emoji: '🩺', label: 'Therapist / Professional', desc: 'Managing patients & clinical practice', color: '#10b981', icon: Stethoscope },
];

// ─── INDIVIDUAL questionnaire steps ───────────────────────────────────────────
const INDIVIDUAL_STEPS = [
  {
    id: 'age', label: 'General details', desc: 'Basic information to personalise your experience', icon: User,
    questions: [
      {
        id: 'age_group', title: 'What is your age group?', type: 'grid',
        options: [
          { value: 'teen',    label: '13–19', color: '#06b6d4' },
          { value: 'adult',   label: '20–35', color: '#7c3aed' },
          { value: 'midlife', label: '36–55', color: '#10b981' },
          { value: 'senior',  label: '56–70', color: '#8b5cf6' },
          { value: 'elderly', label: '70+',   color: '#ec4899' },
        ],
      },
      {
        id: 'gender', title: 'What is your gender?', type: 'grid',
        options: [
          { value: 'male',   label: 'Male',   emoji: '♂' },
          { value: 'female', label: 'Female', emoji: '♀' },
          { value: 'other',  label: 'Other',  emoji: '⚧' },
        ],
      },
    ],
  },
  {
    id: 'health', label: 'Mental health status', desc: 'Your current mental wellbeing', icon: Heart,
    questions: [
      {
        id: 'current_feeling', title: 'How are you feeling lately?', type: 'grid',
        options: [
          { value: 'great',    label: 'Great 😄',    color: '#10b981' },
          { value: 'good',     label: 'Good 🙂',     color: '#06b6d4' },
          { value: 'neutral',  label: 'Neutral 😐',  color: '#f59e0b' },
          { value: 'low',      label: 'Low 😟',      color: '#f97316' },
          { value: 'very_low', label: 'Very low 😢', color: '#ef4444' },
        ],
      },
      {
        id: 'special_needs', title: 'Any considerations we should know?', type: 'multi',
        options: [
          { value: 'adhd',     label: 'ADHD',          desc: 'Attention & focus challenges', color: '#f59e0b' },
          { value: 'autism',   label: 'Autism',         desc: 'Structured environment preference', color: '#06b6d4' },
          { value: 'dyslexia', label: 'Dyslexia',       desc: 'Reading & processing challenges', color: '#7c3aed' },
          { value: 'anxiety',  label: 'Anxiety',        desc: 'Frequent worry or nervousness', color: '#ec4899' },
          { value: 'none',     label: 'None of these',  desc: 'No specific needs', color: '#10b981' },
        ],
      },
    ],
  },
  {
    id: 'goals', label: 'Your goals', desc: 'What would you like to achieve?', icon: Brain,
    questions: [
      {
        id: 'goals', title: 'What are your wellness goals?', type: 'multi',
        options: [
          { value: 'focus',        label: 'Improve Focus',      icon: '🎯', color: '#7c3aed', desc: 'Attention & concentration' },
          { value: 'memory',       label: 'Boost Memory',       icon: '🧠', color: '#06b6d4', desc: 'Recall & learning' },
          { value: 'stress',       label: 'Reduce Stress',      icon: '😌', color: '#10b981', desc: 'Calm & relaxation' },
          { value: 'productivity', label: 'Productivity',       icon: '⚡', color: '#f59e0b', desc: 'Do more, better' },
          { value: 'sleep',        label: 'Better Sleep',       icon: '😴', color: '#8b5cf6', desc: 'Rest & recovery' },
          { value: 'confidence',   label: 'Build Confidence',   icon: '💪', color: '#ec4899', desc: 'Self-esteem & growth' },
        ],
      },
    ],
  },
  {
    id: 'clinical', label: 'Clinical Assessment', desc: 'Helping us understand your mental state', icon: Stethoscope,
    questions: [
      {
        id: 'distress_level', title: 'How much has your mood affected your daily life this week?', type: 'single',
        options: [
          { value: 'none', label: 'Not at all', color: '#10b981' },
          { value: 'mild', label: 'Mildly', color: '#06b6d4' },
          { value: 'moderate', label: 'Moderately', color: '#f59e0b' },
          { value: 'severe', label: 'Severely', color: '#ef4444' },
        ],
      },
      {
        id: 'sleep_quality', title: 'How has your sleep been lately?', type: 'grid',
        options: [
          { value: 'excellent', label: 'Excellent', emoji: '🌟' },
          { value: 'good', label: 'Good', emoji: '🌙' },
          { value: 'fair', label: 'Fair', emoji: '😴' },
          { value: 'poor', label: 'Poor', emoji: '😫' },
        ],
      },
      {
        id: 'physical_symptoms', title: 'Any physical symptoms of stress?', type: 'multi',
        options: [
          { value: 'headaches', label: 'Headaches', icon: '🤕' },
          { value: 'fatigue', label: 'Constant Fatigue', icon: '😴' },
          { value: 'appetite', label: 'Appetite Changes', icon: '🍽️' },
          { value: 'tension', label: 'Muscle Tension', icon: '🧘' },
          { value: 'none', label: 'No physical symptoms', icon: '✅' },
        ],
      },
    ],
  },
  {
    id: 'self_analysis', label: 'Self-analysis', desc: 'Your experience with mental wellness', icon: BookOpen,
    questions: [
      {
        id: 'therapy_history', title: 'Have you seen a therapist before?', type: 'single',
        options: [
          { value: 'yes',     label: 'Yes, currently seeing one', color: '#10b981' },
          { value: 'past',    label: 'Yes, in the past',          color: '#06b6d4' },
          { value: 'no',      label: 'No, never',                 color: '#7c3aed' },
          { value: 'unsure',  label: 'Unsure / Prefer not to say', color: '#8b5cf6' },
        ],
      },
      {
        id: 'session_preference', title: 'How would you prefer to use MindVeda?', type: 'single',
        options: [
          { value: 'self_guided', label: 'Self-guided independently', color: '#7c3aed', desc: 'I prefer to use the app on my own' },
          { value: 'with_therapist', label: 'With a therapist', color: '#10b981', desc: 'Securely link with my therapist' },
          { value: 'hybrid', label: 'Both — flexible', color: '#06b6d4', desc: 'Use AI and link with therapist' },
        ],
      },
    ],
  },
];

// ─── THERAPIST questionnaire steps ────────────────────────────────────────────
const THERAPIST_STEPS = [
  {
    id: 'credentials', label: 'Professional details', desc: 'Your clinical background', icon: Shield,
    questions: [
      {
        id: 'specialization', title: 'What is your primary specialization?', type: 'grid',
        options: [
          { value: 'cbt',        label: 'CBT',           emoji: '🧠' },
          { value: 'child',      label: 'Child & Adolescent', emoji: '👶' },
          { value: 'trauma',     label: 'Trauma / PTSD', emoji: '💙' },
          { value: 'anxiety',    label: 'Anxiety & OCD', emoji: '😟' },
          { value: 'couples',    label: 'Couples',        emoji: '👫' },
          { value: 'other',      label: 'Other',          emoji: '📋' },
        ],
      },
      {
        id: 'years_experience', title: 'Years of practice?', type: 'single',
        options: [
          { value: '0-2',   label: '0–2 years (Trainee / Junior)', color: '#f59e0b' },
          { value: '3-5',   label: '3–5 years',                    color: '#06b6d4' },
          { value: '6-10',  label: '6–10 years',                   color: '#7c3aed' },
          { value: '10+',   label: '10+ years',                    color: '#10b981' },
        ],
      },
    ],
  },
  {
    id: 'practice', label: 'Practice details', desc: 'How you work with patients', icon: Briefcase,
    questions: [
      {
        id: 'patient_types', title: 'What patient groups do you typically work with?', type: 'multi',
        options: [
          { value: 'children',    label: 'Children (6–12)',    icon: '👧', color: '#f59e0b', desc: 'Paediatric mental health' },
          { value: 'teens',       label: 'Teenagers',          icon: '🧑', color: '#06b6d4', desc: 'Adolescent wellbeing' },
          { value: 'adults',      label: 'Adults',             icon: '👤', color: '#7c3aed', desc: 'Adult mental health' },
          { value: 'seniors',     label: 'Seniors',            icon: '🧓', color: '#8b5cf6', desc: 'Geriatric care' },
        ],
      },
      {
        id: 'session_mode', title: 'How do you primarily conduct sessions?', type: 'single',
        options: [
          { value: 'in_person', label: 'In-person only',       color: '#10b981' },
          { value: 'online',    label: 'Online / Teletherapy', color: '#7c3aed' },
          { value: 'hybrid',    label: 'Hybrid (both)',        color: '#06b6d4' },
        ],
      },
    ],
  },
  {
    id: 'platform_use', label: 'Platform use', desc: 'How you\'ll use MindVeda', icon: Clock,
    questions: [
      {
        id: 'platform_goals', title: 'What will you use MindVeda for?', type: 'multi',
        options: [
          { value: 'monitor',    label: 'Monitor patient mood',   icon: '📈', color: '#7c3aed', desc: 'Track progress over time' },
          { value: 'assessments', label: 'Run assessments',       icon: '📋', color: '#06b6d4', desc: 'GAD-7, PHQ-9, ADHD' },
          { value: 'link',       label: 'Link patients securely', icon: '🔗', color: '#10b981', desc: 'Invite & manage clients' },
          { value: 'notes',      label: 'Session notes',          icon: '📝', color: '#f59e0b', desc: 'Documentation support' },
        ],
      },
    ],
  },
];

// ─── Helper: flatten all questions across steps for a given role ───────────────
function getStepsForRole(role) {
  if (role === 'individual') return INDIVIDUAL_STEPS;
  if (role === 'therapist') return THERAPIST_STEPS;
  return [];
}

// ─── OptionCard component ──────────────────────────────────────────────────────
function OptionCard({ option, selected, onSelect, multi = false }) {
  const color = option.color || '#7c3aed';
  return (
    <motion.button
      onClick={() => onSelect(option.value)}
      whileTap={{ scale: 0.97 }}
      className="relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all text-center"
      style={{
        borderColor: selected ? color : 'var(--border-base)',
        background: selected ? `${color}15` : '#fafaf9',
        minHeight: '72px',
      }}
    >
      {option.emoji && <div className="text-2xl mb-1">{option.emoji}</div>}
      {option.icon && !option.emoji && <div className="text-2xl mb-1">{option.icon}</div>}
      <div className="font-semibold text-sm leading-tight" style={{ color: selected ? color : '#3a3a3a' }}>
        {option.label}
      </div>
      {option.desc && (
        <div className="text-[10px] mt-0.5" style={{ color: '#888' }}>{option.desc}</div>
      )}
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: color }}>
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </motion.button>
  );
}

// ─── Main Onboarding component ─────────────────────────────────────────────────
export default function Onboarding() {
  const [phase, setPhase] = useState('role'); // 'role' | 'questions'
  const [role, setRole] = useState('');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.onboarding_complete) {
        navigate('/dashboard', { replace: true });
      } else if (user.role_selected) {
        setRole(user.role);
        setPhase('questions');
      }
    }
  }, [user, navigate]);

  const steps = getStepsForRole(role);
  const currentStep = steps[step];

  // ── Gather all questions for the current step ──
  const allQuestionsAnswered = () => {
    if (!currentStep) return false;
    return currentStep.questions.every(q => {
      const val = answers[q.id];
      if (q.type === 'multi') return val && val.length > 0;
      return !!val;
    });
  };

  const handleSelect = (questionId, value, isMulti) => {
    setAnswers(prev => {
      if (isMulti) {
        const current = prev[questionId] || [];
        if (value === 'none') return { ...prev, [questionId]: ['none'] };
        const filtered = current.filter(v => v !== 'none');
        const updated = filtered.includes(value) ? filtered.filter(v => v !== value) : [...filtered, value];
        return { ...prev, [questionId]: updated };
      }
      return { ...prev, [questionId]: value };
    });
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Set Role (Only if not already selected)
      if (!user.role_selected) {
        await api.post('/auth/select-role/', { role });
      }
      
      // 2. Build payload based on role
      const profilePayload = { onboarding_complete: true };

      if (role === 'individual') {
        profilePayload.age_group = answers.age_group;
        profilePayload.goals = answers.goals || [];
        profilePayload.special_needs = (answers.special_needs || []).filter(n => n !== 'none');
        profilePayload.session_preference = answers.session_preference;
        profilePayload.clinical_data = {
          distress_level: answers.distress_level,
          sleep_quality: answers.sleep_quality,
          physical_symptoms: answers.physical_symptoms,
        };
      } else if (role === 'therapist') {
        profilePayload.specialization = answers.specialization;
        profilePayload.years_experience = answers.years_experience;
      }

      const profileEndpoint = role === 'therapist' ? '/therapist/profile/' : '/user/profile/';
      const { data } = await api.post(profileEndpoint, profilePayload);

      updateUser({ ...data.user || {}, role, role_selected: true, onboarding_complete: true });
      toast.success("Profile personalized! Let's begin. 🚀");
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      const errMsg = error?.response?.data?.error || 'Failed to save. Please try again.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Role selection screen ─────────────────────────────────────────────────
  if (phase === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{ background: 'linear-gradient(135deg, #f5f0eb 0%, #ede8e0 100%)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">MindVeda</span>
            </div>
            <h1 className="text-4xl font-black mb-3" style={{ fontFamily: 'Outfit, sans-serif', color: '#1a1a1a', letterSpacing: '-0.03em' }}>
              Who are you joining as?
            </h1>
            <p className="text-base" style={{ color: '#666' }}>
              Select your role so we can tailor your experience
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {roles.map(r => {
              const selected = role === r.value;
              const Icon = r.icon;
              return (
                <motion.button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-5 p-5 rounded-2xl border-2 cursor-pointer transition-all text-left"
                  style={{
                    borderColor: selected ? r.color : 'rgba(0,0,0,0.1)',
                    background: selected ? `${r.color}10` : 'white',
                    boxShadow: selected ? `0 0 0 1px ${r.color}` : '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
                    style={{ background: `${r.color}15`, border: `1px solid ${r.color}30` }}>
                    {r.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-base mb-0.5" style={{ color: selected ? r.color : '#1a1a1a', fontFamily: 'Outfit, sans-serif' }}>
                      {r.label}
                    </div>
                    <div className="text-sm" style={{ color: '#888' }}>{r.desc}</div>
                  </div>
                  {selected && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: r.color }}>
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <motion.button
            onClick={() => role && setPhase('questions')}
            disabled={!role}
            whileTap={{ scale: 0.97 }}
            className="w-full mt-6 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all"
            style={{
              background: role ? '#1a1a1a' : '#ccc',
              color: 'white',
              cursor: role ? 'pointer' : 'not-allowed',
            }}
          >
            Continue <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ─── Question steps screen ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f5f0eb 0%, #ede8e0 100%)' }}>
      {/* LEFT SIDEBAR */}
      <div className="hidden lg:flex flex-col w-72 p-8 shrink-0" style={{ background: '#1a1a1a' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>MindVeda</span>
        </div>

        <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>
          Let's personalise your experience
        </h2>
        <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Follow the {steps.length} steps below to set up your profile
        </p>

        {/* Step indicators */}
        <div className="flex flex-col gap-5">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.id} className="flex items-start gap-3.5">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: isActive ? '#f59e0b' : isDone ? '#10b981' : 'rgba(255,255,255,0.1)',
                      border: isActive ? '2px solid #f59e0b' : 'none',
                    }}
                  >
                    {isDone
                      ? <Check className="w-4 h-4 text-white" />
                      : <Icon className="w-4 h-4" style={{ color: isActive ? '#1a1a1a' : 'rgba(255,255,255,0.5)' }} />
                    }
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 mt-1" style={{ height: '24px', background: isDone ? '#10b98150' : 'rgba(255,255,255,0.1)' }} />
                  )}
                </div>
                <div className="pb-4">
                  <div className="text-sm font-semibold" style={{ color: isActive ? 'white' : isDone ? '#10b981' : 'rgba(255,255,255,0.4)' }}>
                    {s.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          © 2026 MindVeda
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 flex flex-col p-6 lg:p-12 overflow-y-auto">
        {/* Mobile step indicator */}
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          {steps.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
              <div className="h-full rounded-full transition-all" style={{
                width: i < step ? '100%' : i === step ? '50%' : '0%',
                background: '#f59e0b'
              }} />
            </div>
          ))}
          <span className="text-xs font-medium shrink-0" style={{ color: '#888' }}>{step + 1} / {steps.length}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex-1"
          >
            {currentStep.questions.map((question, qi) => (
              <div key={question.id} className="mb-10">
                {/* Question header: number + title */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{ background: 'rgba(0,0,0,0.08)', color: '#888' }}>
                    {String(qi + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl font-bold pt-1" style={{ fontFamily: 'Outfit, sans-serif', color: '#1a1a1a' }}>
                    {question.title}
                  </h3>
                </div>

                {/* Options grid */}
                <div className={`grid gap-3 ${question.options.length <= 3 ? 'grid-cols-3' : question.type === 'multi' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 lg:grid-cols-3'}`}>
                  {question.options.map(option => {
                    const val = answers[question.id];
                    const isMulti = question.type === 'multi';
                    const selected = isMulti ? (val || []).includes(option.value) : val === option.value;
                    return (
                      <OptionCard
                        key={option.value}
                        option={option}
                        selected={selected}
                        multi={isMulti}
                        onSelect={(v) => handleSelect(question.id, v, isMulti)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 mt-auto" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <button
            onClick={() => step === 0 ? setPhase('role') : setStep(s => s - 1)}
            className="flex items-center gap-1.5 text-sm font-medium cursor-pointer bg-transparent border-none transition-colors"
            style={{ color: '#888' }}
          >
            ← Back
          </button>

          {step < steps.length - 1 ? (
            <motion.button
              onClick={() => setStep(s => s + 1)}
              disabled={!allQuestionsAnswered()}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: allQuestionsAnswered() ? '#1a1a1a' : '#ccc',
                color: 'white',
                cursor: allQuestionsAnswered() ? 'pointer' : 'not-allowed',
              }}
            >
              Next <ChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleFinish}
              disabled={!allQuestionsAnswered() || loading}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: allQuestionsAnswered() && !loading ? '#10b981' : '#ccc',
                color: 'white',
                cursor: allQuestionsAnswered() && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <>Get Started <Sparkles className="w-4 h-4" /></>}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
