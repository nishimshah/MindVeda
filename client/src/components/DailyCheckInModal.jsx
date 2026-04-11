import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Heart, Zap, Wind } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function DailyCheckInModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const { data } = await api.get('/checkin/status/');
      if (data.status === 'pending') {
        setQuestions(data.questions);
        setIsOpen(true);
      }
    } catch (err) {
      console.error('Checkin status error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (optionId) => {
    if (saving) return;
    setSaving(true);
    const question = questions[currentIndex];
    try {
      await api.post('/checkin/answer/', {
        question_id: question.id,
        option_id: optionId
      });
      
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        toast.success('Check-in complete! Have a great day.');
        setIsOpen(false);
      }
    } catch (err) {
      toast.error('Failed to save check-in');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-[#1A1A1A]/10 backdrop-blur-3xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="glass-card max-w-md w-full !p-12 text-center relative overflow-hidden border-none shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-border-base/30">
            <motion.div 
              className="h-full bg-accent-green"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 rounded-[24px] bg-accent-tan/10 flex items-center justify-center">
               {currentQ?.category === 'mood' ? <Heart className="w-8 h-8 text-accent-tan" /> :
                currentQ?.category === 'energy' ? <Zap className="w-8 h-8 text-accent-tan" /> :
                <Wind className="w-8 h-8 text-accent-tan" />}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-2">Internal Compass</h2>
            <h3 className="text-3xl font-serif font-black leading-tight italic">{currentQ?.text}</h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentQ?.options.map((opt) => (
              <button
                key={opt.id}
                disabled={saving}
                onClick={() => handleSelect(opt.id)}
                className="w-full py-4 px-8 rounded-full bg-bg-page border border-border-base hover:border-accent-green transition-all font-bold text-sm hover:bg-white hover:text-black hover:shadow-lg disabled:opacity-50"
              >
                {opt.text}
              </button>
            ))}
          </div>
          
          <div className="mt-10 pt-6 border-t border-border-base/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted/40">
              Session Clarity • Step {currentIndex + 1} of {questions.length}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
