import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Save, Loader2, Flame, Star } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser }      = useAuth();
  const [name, setName]           = useState(user?.name || '');
  const [loading, setLoading]     = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/user/profile');
      setProfileData(data);
      setName(data.name);
    } catch {}
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/user/profile', { name });
      updateUser(data);
      toast.success('Profile updated! ✨');
    } catch { toast.error('Failed to save.'); }
    finally { setLoading(false); }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="page-container max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="section-title">Profile</h1>
        <p className="section-subtitle">Manage your personal account details</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-7 mb-6"
      >
        <div className="flex items-center gap-5 mb-7 pb-7" style={{ borderBottom: '1px solid var(--border-base)' }}>
          <div className="relative shrink-0">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-p-light))',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {initials}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {user?.name}
            </h2>
            <p className="text-sm truncate mt-0.5 text-secondary">{user?.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-amber-500">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">
                  {profileData?.streak?.current_streak || 0} day streak
                </span>
              </div>
              {user?.goals?.length > 0 && (
                <div className="flex items-center gap-1.5 text-muted">
                  <Star className="w-3.5 h-3.5" />
                  <span className="text-xs">
                    {user.goals.slice(0, 2).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-secondary">Display Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-secondary">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="input-field opacity-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-secondary">Age Group</label>
            <div className="input-field opacity-75 capitalize bg-surface-1">
              {user?.age_group || '—'}
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={loading}
            className="btn-primary w-full md:w-auto"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
