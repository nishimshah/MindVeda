import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Zap, Cloud, Activity } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function QuestionnaireFlow() {
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
      const { data } = await api.get('/questionnaire/next/');
      if (data.status === 'flow_complete') {
        setCompleted(true);
        // Mark user onboarding as complete
        const { data: response } = await api.post('/user/profile/', { onboarding_complete: true });
        updateUser(response.user);
        setTimeout(() => navigate('/dashboard'), 2500);
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
      await api.post('/questionnaire/answer/', {
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
      <div className="min-h-screen bg-page flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-page via-surface-1 to-primary/5">
      <motion.div 
        key={question?.id || 'completed'}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-xl w-full"
      >
        {!completed ? (
          <div className="glass-card p-10 relative">
             <div className="absolute top-8 left-8">
               <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">
                 {question?.type} Analysis
               </span>
             </div>
             
             <div className="mt-12 text-center">
                <h1 className="text-2xl font-black mb-10 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {question?.text}
                </h1>
                
                <div className="space-y-4">
                  {question?.options.map((opt) => (
                    <button
                      key={opt.id}
                      disabled={saving}
                      onClick={() => handleSelect(opt.id)}
                      className="w-full text-left p-6 rounded-[24px] bg-surface-1 border border-border-base hover:border-primary transition-all font-bold text-lg"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
             </div>
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-black mb-4">You're all set!</h1>
            <p className="text-lg text-muted mb-8">Your cognitive profile has been calculated and your dashboard is ready.</p>
            <div className="w-full bg-border-base h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                  className="bg-primary h-full"
                />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
