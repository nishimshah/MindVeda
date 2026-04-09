import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, ChevronRight, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const TEST_TYPES = [
  { id: 'anxiety', name: 'GAD-7 (Anxiety)', icon: '😰', desc: 'Screening for Generalized Anxiety Disorder' },
  { id: 'depression', name: 'PHQ-9 (Depression)', icon: '😔', desc: 'Patient Health Questionnaire for Depression' },
  { id: 'adhd', name: 'ADHD Screening', icon: '🧠', desc: 'Screening for Adult Attention-Deficit/Hyperactivity Disorder' },
  { id: 'stress', name: 'PSS-10 (Stress)', icon: '😫', desc: 'Perceived Stress Scale' },
];

export default function AssessmentsPage() {
  const [activeTest, setActiveTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const startTest = async (testId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/assessment/questions/${testId}/`);
      setQuestions(data.questions);
      setActiveTest(testId);
      setCurrentQuestionIndex(0);
      setResponses({});
      setResult(null);
    } catch (err) {
      toast.error('Failed to load assessment questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (val) => {
    const qKey = questions[currentQuestionIndex].question_key;
    setResponses({ ...responses, [qKey]: val });
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const submitTest = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/assessment/submit/', {
        condition: activeTest,
        responses: responses
      });
      setResult(data);
      toast.success('Assessment completed!');
    } catch (err) {
      toast.error('Failed to submit assessment');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="page-container max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center text-primary">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Results Completed</h2>
          <div className="mb-6 p-6 bg-surface-1 rounded-2xl inline-block px-10">
            <p className="text-muted text-sm uppercase font-bold tracking-widest mb-1">Severity Level</p>
            <p className="text-4xl font-black capitalize" style={{ color: result.severity === 'severe' ? '#ef4444' : '#10b981' }}>
              {result.severity.replace('_', ' ')}
            </p>
          </div>
          
          <p className="text-secondary max-w-md mx-auto mb-10">{result.message}</p>

          {result.crisis_alert && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl mb-10 text-left">
              <div className="flex items-center gap-3 mb-2 text-rose-500">
                <AlertTriangle size={24} />
                <h4 className="font-bold">Important Notice</h4>
              </div>
              <p className="text-rose-500 text-sm mb-4">{result.crisis_alert.message}</p>
              <div className="space-y-2">
                {result.crisis_alert.helplines.map(h => (
                  <div key={h.name} className="flex justify-between text-sm p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
                    <span className="font-bold">{h.name}</span>
                    <span className="font-mono">{h.number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            <button onClick={() => { setActiveTest(null); setResult(null); }} className="btn-primary">Back to Assessments</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (activeTest) {
    const q = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    
    const options = q?.scale === 'never-always' 
      ? [ { l: 'Never', v: 0 }, { l: 'Rarely', v: 1 }, { l: 'Sometimes', v: 2 }, { l: 'Often', v: 3 }, { l: 'Always', v: 4 } ]
      : q?.scale === '0-4'
      ? [ { l: 'Not at all', v: 0 }, { l: 'A little bit', v: 1 }, { l: 'Moderately', v: 2 }, { l: 'Quite a bit', v: 3 }, { l: 'Extremely', v: 4 } ]
      : [ { l: 'Not at all', v: 0 }, { l: 'Several days', v: 1 }, { l: 'More than half the days', v: 2 }, { l: 'Nearly every day', v: 3 } ];

    return (
      <div className="page-container max-w-3xl mx-auto">
        <button onClick={() => setActiveTest(null)} className="flex items-center gap-2 text-muted mb-8 hover:text-primary transition-colors">
          <ArrowLeft size={18} /> Exit Assessment
        </button>

        <div className="mb-10">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-primary" />
          </div>
        </div>

        <motion.div 
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-10 mt-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-primary" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {q?.question_text}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {options.map((opt) => (
              <button
                key={opt.v}
                onClick={() => handleAnswer(opt.v)}
                className="w-full p-6 text-left rounded-2xl border-2 border-transparent bg-surface-1 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between group"
              >
                <span className="font-bold text-lg text-primary">{opt.l}</span>
                <ChevronRight className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
              </button>
            ))}
          </div>

          {currentQuestionIndex > 0 && (
            <button 
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              className="mt-10 text-muted uppercase text-xs font-black tracking-widest hover:text-primary"
            >
              Previous Question
            </button>
          )}

          {currentQuestionIndex === questions.length - 1 && responses[q?.question_key] !== undefined && (
            <button onClick={submitTest} className="btn-primary w-full mt-10">Submit Assessment</button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Clinical Assessments</h1>
        <p className="text-muted text-lg">Standardized screenings used by mental health professionals worldwide.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEST_TYPES.map((test) => (
          <motion.button
            key={test.id}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => startTest(test.id)}
            className="glass-card p-8 flex text-left gap-6 group border-2 border-transparent hover:border-primary/20 transition-all"
          >
            <div className="w-16 h-16 rounded-3xl bg-surface-2 flex items-center justify-center text-4xl shadow-inner group-hover:bg-primary/10 transition-colors">
              {test.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 text-primary" style={{ fontFamily: 'Outfit, sans-serif' }}>{test.name}</h3>
              <p className="text-sm text-muted">{test.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-primary text-xs font-bold uppercase tracking-widest">
                Start Screening <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-20 p-8 glass-card bg-amber-500/5 border-amber-500/10 border flex gap-6 items-center">
        <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
          <ClipboardList size={24} />
        </div>
        <p className="text-amber-500/80 text-sm">
          <strong>Note:</strong> These tests are for screening purposes only. They are not a clinical diagnosis. 
          Please consult with a qualified mental health professional for a formal evaluation.
        </p>
      </div>
    </div>
  );
}
