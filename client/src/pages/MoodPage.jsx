import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Smile, Meh, Frown, MessageSquare, Plus, Trash2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function MoodPage() {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newMood, setNewMood] = useState({ score: 3, note: '' });

  useEffect(() => {
    fetchMoods();
  }, []);

  const fetchMoods = async () => {
    try {
      const { data } = await api.get('/mood/');
      setMoods(data);
    } catch (err) {
      toast.error('Failed to load mood history');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMood = async () => {
    try {
      await api.post('/mood/', newMood);
      toast.success('Mood logged successfully! 🌟');
      setShowAdd(false);
      setNewMood({ score: 3, note: '' });
      fetchMoods();
    } catch (err) {
      toast.error('Failed to log mood');
    }
  };

  const getMoodConfig = (score) => {
    switch(score) {
      case 5: return { emoji: '😌', label: 'Balanced', color: 'var(--accent-blue)', bg: '#A7C7E725' };
      case 4: return { emoji: '😊', label: 'Good', color: 'var(--accent-green)', bg: '#C1DDB325' };
      case 3: return { emoji: '😐', label: 'Neutral', color: 'var(--accent-peach)', bg: '#F2C6B425' };
      case 2: return { emoji: '😕', label: 'A Bit Off', color: 'var(--accent-lavender)', bg: '#D6CDEA25' };
      case 1: return { emoji: '😢', label: 'Difficult', color: '#9CA3AF', bg: '#9CA3AF25' };
      default: return { emoji: '😐', label: 'Neutral', color: 'var(--accent-peach)', bg: '#F2C6B425' };
    }
  };

  return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="section-title">Daily Reflection</h1>
        <p className="text-[var(--text-secondary)] text-lg">How is your heart today?</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card mb-12">
        <h2 className="text-xl font-bold mb-10 text-center" style={{ color: 'var(--text-primary)' }}>Select the emoji that matches your mood</h2>
        
        <div className="flex gap-4 md:gap-8 mb-12 justify-center flex-wrap">
          {[1, 2, 3, 4, 5].map((s) => {
            const config = getMoodConfig(s);
            const isSelected = newMood.score === s;
            return (
              <button
                key={s}
                onClick={() => setNewMood({ ...newMood, score: s })}
                className="flex flex-col items-center gap-3 group"
              >
                <div 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-[32px] flex items-center justify-center text-3xl md:text-4xl shadow-sm transition-all duration-500 ease-out"
                  style={{ 
                    background: isSelected ? config.color : config.bg,
                    transform: isSelected ? 'scale(1.1) translateY(-8px)' : 'scale(1)',
                    boxShadow: isSelected ? `0 20px 40px -10px ${config.color}40` : 'none'
                  }}
                >
                  {config.emoji}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'}`} style={{ color: isSelected ? config.color : 'var(--text-primary)' }}>
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="max-w-md mx-auto">
          <textarea
            className="input-field mb-6 bg-[var(--bg-page)] border-none placeholder:text-[var(--text-muted)]"
            placeholder="Anything you'd like to note down? (It's okay to skip this)"
            rows="2"
            value={newMood.note}
            onChange={(e) => setNewMood({ ...newMood, note: e.target.value })}
          />
          <button 
            onClick={handleAddMood} 
            className="btn-primary w-full !py-4 shadow-lg active:scale-95"
            style={{ background: getMoodConfig(newMood.score).color }}
          >
            Complete Daily Entry
          </button>
        </div>
      </motion.div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Calendar size={18} className="text-[var(--text-muted)]" />
          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">Your Journey</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin opacity-20" /></div>
        ) : moods.length === 0 ? (
          <div className="text-center py-20 glass-card bg-[var(--bg-surface-1)] border-dashed">
            <p className="text-[var(--text-secondary)] opacity-60">Your journey will be logged here, one step at a time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moods.map((m) => {
              const config = getMoodConfig(m.mood_score);
              return (
                  <motion.div 
                    key={m.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="glass-card !p-6 flex items-center gap-5 bg-[var(--bg-surface-1)] border-none shadow-none"
                  >
                  <div className="w-14 h-14 rounded-3xl flex items-center justify-center text-3xl" style={{ background: config.bg }}>
                    {config.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{config.label}</span>
                      <span className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)]">
                        {new Date(m.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {m.note && <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">"{m.note}"</p>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
