import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, BarChart3, Loader2, Activity } from 'lucide-react';
import api from '../lib/api';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats'),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError('Admin access required. You must be an admin to view this page.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-container flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (error) return (
    <div className="page-container">
      <div className="glass-card p-8 text-center max-w-md mx-auto">
        <Shield className="w-12 h-12 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-text-secondary text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="section-title">🛡️ Admin Panel</h1>
        <p className="section-subtitle">Platform overview and user management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: '#6366f1' },
          { label: 'Total Sessions', value: stats?.total_sessions || 0, icon: Activity, color: '#06b6d4' },
          { label: 'Active Today', value: stats?.today_active || 0, icon: BarChart3, color: '#10b981' },
          { label: 'Avg Mood (7d)', value: stats?.avg_mood_7d || '—', icon: Activity, color: '#f59e0b' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-4">
            <s.icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-text-muted">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Users Table */}
      <div className="glass-card p-6 overflow-x-auto">
        <h3 className="font-semibold mb-4">Registered Users</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-muted">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">Age Group</th>
              <th className="pb-3 font-medium">Goals</th>
              <th className="pb-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-border/50">
                <td className="py-3">{u.name}</td>
                <td className="py-3 text-text-secondary">{u.email}</td>
                <td className="py-3 capitalize">{u.age_group}</td>
                <td className="py-3 text-text-secondary">{u.goals?.join(', ') || '—'}</td>
                <td className="py-3 text-text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
