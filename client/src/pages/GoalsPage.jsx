import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, Circle, Plus, Trash2, Calendar, Tag } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', category: 'mental', target_date: '' });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await api.get('/user/goals-list/');
      setGoals(data);
    } catch (err) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.title) {
      toast.error('Title is required');
      return;
    }
    try {
      await api.post('/user/goals-list/', newGoal);
      toast.success('Goal added! 🎯');
      setShowAdd(false);
      setNewGoal({ title: '', description: '', category: 'mental', target_date: '' });
      fetchGoals();
    } catch (err) {
      toast.error('Failed to add goal');
    }
  };

  const toggleGoal = async (id, currentStatus) => {
    try {
      await api.patch(`/user/goals-list/${id}/`, { is_completed: !currentStatus });
      toast.success('Progress updated!');
      fetchGoals();
    } catch (err) {
      toast.error('Failed to update goal');
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.delete(`/user/goals-list/${id}/`);
      toast.success('Goal deleted');
      fetchGoals();
    } catch (err) {
      toast.error('Failed to delete goal');
    }
  };

  return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="section-title">Small Steps</h1>
        <p className="text-secondary text-lg">Focus on what's right in front of you. You're doing great.</p>
      </div>

      <div className="flex justify-between items-center mb-10">
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="btn-primary"
            style={{ background: 'var(--accent-green)' }}
          >
            <Plus size={20} className="mr-2" /> Add a new step
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-12"
          >
            <div className="glass-card bg-surface-1 border-none">
              <div className="grid grid-cols-1 gap-6 mb-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2 block">What would you like to achieve?</label>
                  <input
                    className="input-field border-none bg-page"
                    placeholder="e.g., Drink a glass of water, Read 5 pages..."
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2 block">Category</label>
                    <select
                      className="input-field border-none bg-page"
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    >
                      <option value="mental">Self Care</option>
                      <option value="physical">Body</option>
                      <option value="social">Connection</option>
                      <option value="career">Work/Study</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2 block">When?</label>
                    <input
                      type="date"
                      className="input-field border-none bg-page"
                      value={newGoal.target_date}
                      onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={handleAddGoal} className="btn-primary flex-1 shadow-md">Create Step</button>
                <button onClick={() => setShowAdd(false)} className="px-8 py-3 rounded-full text-secondary font-bold">Nevermind</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20 opacity-20"><div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
      ) : goals.length === 0 ? (
        <div className="text-center py-24 glass-card border-dashed">
          <Target className="w-16 h-16 text-muted mx-auto mb-6 opacity-10" />
          <p className="text-secondary italic">No steps for now. Take a deep breath.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6 opacity-40">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Active Steps</h3>
          </div>
          {goals.filter(g => !g.is_completed).slice(0, 5).map((g) => (
            <motion.div 
              key={g.id}
              layout
              className="glass-card !p-8 flex flex-col md:flex-row md:items-center gap-6 group relative"
            >
              <button 
                onClick={() => toggleGoal(g.id, g.is_completed)}
                className="w-12 h-12 rounded-[20px] bg-page flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
              >
                <Circle size={28} className="text-muted opacity-30" />
              </button>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{g.title}</h3>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">
                  <span className="flex items-center gap-1.5"><Tag size={12} /> {g.category}</span>
                  {g.target_date && <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(g.target_date).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 md:pt-0">
                <button className="px-4 py-2 rounded-full bg-[#C1DDB320] text-[#5a826a] text-[10px] font-black uppercase tracking-wider hover:bg-[#C1DDB340] transition-colors">
                  Break into easier steps
                </button>
                <button className="px-4 py-2 rounded-full bg-[#F2C6B420] text-[#d97706] text-[10px] font-black uppercase tracking-wider hover:bg-[#F2C6B440] transition-colors">
                  Too hard? Adjust
                </button>
                <button onClick={() => deleteGoal(g.id)} className="p-2 text-[#9CA3AF] hover:text-rose-400 transition-colors ml-2">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}

          {goals.some(g => g.is_completed) && (
            <div className="mt-16 pt-16 border-t border-dashed border-gray-200 dark:border-zinc-800">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-8 text-center">Completed Moments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50">
                {goals.filter(g => g.is_completed).map((g) => (
                  <div key={g.id} className="glass-card !p-5 flex items-center gap-4 bg-surface-1 border-none">
                    <CheckCircle2 size={24} className="text-[#C1DDB3]" />
                    <span className="font-bold text-sm line-through text-secondary">{g.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
