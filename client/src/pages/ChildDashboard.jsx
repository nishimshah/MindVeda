import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Sparkles, Smile, Trophy, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ChildDashboard() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      // For simplified child mode, we fetch activities for the *profile*
      // This is a special view for the child interface
      const { data } = await api.get('/user/dashboard/');
      // Assuming individual dashboard for child if they login, 
      // but if parent-controlled, we need a special logic.
      // For now, let's assume this is the 'Individual' view for children.
      setActivities(data.tasks || []);
    } catch (err) {
      toast.error('Could not load your stars');
    } finally {
      setLoading(false);
    }
  };

  const completeActivity = async (id) => {
    try {
      await api.patch(`/user/tasks/${id}/`, { status: 'completed' });
      toast.success('Awesome job! You earned a star! ⭐');
      fetchActivities();
    } catch (err) {
      toast.error('Oops, try again!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] dark:bg-[#0A0D14] p-6 pb-20">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-3xl border-4 border-white dark:border-slate-800">
              🌈
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Hi, {user?.name.split(' ')[0]}!
              </h1>
              <p className="text-slate-500 font-bold">Ready for some fun today?</p>
            </div>
          </div>
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center shadow-lg cursor-pointer"
          >
            <Trophy className="text-white" size={24} />
          </motion.div>
        </div>

        {/* Big Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <button className="h-32 rounded-[2rem] bg-indigo-500 text-white flex flex-col items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
            <Sparkles size={32} />
            <span className="font-bold">Play Games</span>
          </button>
          <button className="h-32 rounded-[2rem] bg-rose-500 text-white flex flex-col items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-all">
            <Heart size={32} />
            <span className="font-bold">Be Calm</span>
          </button>
        </div>

        {/* Your Stars (Tasks) */}
        <div className="bg-white dark:bg-slate-800/50 rounded-[2.5rem] p-8 shadow-xl border-4 border-white dark:border-slate-800/50">
          <div className="flex items-center gap-3 mb-6">
            <Star className="text-amber-400 fill-amber-400" size={28} />
            <h2 className="text-xl font-black text-slate-800 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Your Star Chores
            </h2>
          </div>

          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-10">
                <Smile className="text-slate-300 mx-auto mb-2" size={48} />
                <p className="text-slate-400 font-bold">All done for now! Go play!</p>
              </div>
            ) : (
              activities.map(act => (
                <motion.div 
                  key={act.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => act.status !== 'completed' && completeActivity(act.id)}
                  className={`p-5 rounded-[2rem] flex items-center justify-between cursor-pointer transition-all ${
                    act.status === 'completed' 
                      ? 'bg-slate-50 dark:bg-slate-900/40 opacity-50 grayscale' 
                      : 'bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border-2 border-transparent hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                      act.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-indigo-500'
                    }`}>
                      {act.status === 'completed' ? <CheckCircle className="text-white" /> : '⭐'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">{act.title}</h3>
                      <p className="text-xs text-slate-500">Earn 10 points!</p>
                    </div>
                  </div>
                  {act.status !== 'completed' && <ArrowLeft className="rotate-180 text-indigo-300" size={18} />}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Tip of the day */}
        <div className="mt-8 p-6 bg-amber-100 dark:bg-amber-900/20 rounded-[2rem] flex items-center gap-4 border-2 border-amber-200 dark:border-amber-900/40">
           <div className="text-3xl">💡</div>
           <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
             Tip: Taking 3 big breaths makes your brain feel happy!
           </p>
        </div>
      </div>
    </div>
  );
}

function CheckCircle({ className }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
