import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Brain, Heart, Wind, Target } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Onboarding() {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNext();
  }, []);

  const fetchNext = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/onboarding/next-question/');
      if (data.status === 'onboarding_complete') {
        setCompleted(true);
        setTimeout(() => navigate('/questionnaire'), 2000);
      } else {
        setQuestion(data);
      }
    } catch (err) {
      toast.error('Failed to load next question');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (optionId) => {
    if (saving) return;
    setSaving(true);
    try {
      await api.post('/onboarding/answer/', {
        question_id: question.id,
        option_id: optionId
      });
      fetchNext();
    } catch (err) {
      toast.error('Failed to save answer');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center p-6 bg-gradient-to-br from-surface-1 to-page relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-lavender/5 rounded-full blur-[120px]" />

      <motion.div 
        key={question?.id || 'completed'}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.05, y: -20 }}
        className="max-w-2xl w-full"
      >
        {!completed ? (
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
                {question?.category === 'focus' ? <Target className="w-8 h-8 text-primary" /> :
                 question?.category === 'stress' ? <Wind className="w-8 h-8 text-primary" /> :
                 <Brain className="w-8 h-8 text-primary" />}
              </div>
            </div>

            <h1 className="text-3xl font-black mb-4 tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
              {question?.text}
            </h1>
            <p className="text-muted mb-12 text-lg">Step into your personalized journey.</p>

            <div className="grid grid-cols-1 gap-4">
              {question?.options.map((opt) => (
                <button
                  key={opt.id}
                  disabled={saving}
                  onClick={() => handleSelect(opt.id)}
                  className="group relative flex items-center justify-between p-6 rounded-[24px] bg-page border border-border-base transition-all hover:border-primary hover:bg-surface-1 text-left"
                >
                  <span className="font-bold text-lg group-hover:text-primary transition-colors">{opt.text}</span>
                  <div className="w-8 h-8 rounded-full border-2 border-border-base group-hover:border-primary flex items-center justify-center transition-all">
                    <div className="w-4 h-4 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-center gap-2">
              <div className="h-1.5 w-12 rounded-full bg-primary" />
              <div className="h-1.5 w-1.5 rounded-full bg-border-base" />
              <div className="h-1.5 w-1.5 rounded-full bg-border-base" />
            </div>
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-4xl">
                🌟
              </div>
            </div>
            <h1 className="text-4xl font-black mb-4 text-primary">Brilliant!</h1>
            <p className="text-lg text-muted mb-8">We've gathered the essentials. Now, let's tailor your experience deeper.</p>
            <div className="flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest text-primary">
              <Loader2 className="w-5 h-5 animate-spin" /> Moving to next phase
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
