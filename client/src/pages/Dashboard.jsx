import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, MessageCircle, BarChart3, Wind, User,
  Flame, Sparkles, ChevronRight, Clock, Users,
  Stethoscope, Plus, AlertCircle, Activity, Heart,
  X, Calendar, TrendingUp, Shield, Target, Loader2,
  MessageSquare, Check,
} from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  return { text: 'Good evening', emoji: '🌙' };
}

// ─── Shared components ─────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, glow }) {
  return (
    <div className="glass-card p-5">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: glow, border: `1px solid ${color}25` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="text-3xl font-black mb-0.5" style={{ fontFamily: 'Outfit, sans-serif', color }}>{value}</div>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

// ─── THERAPIST DASHBOARD ───────────────────────────────────────────────────────

function PatientDetailModal({ patient, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', due_date: null });

  const loadDetail = () => {
    setLoading(true);
    api.get(`/therapist/patient/${patient?.patient_id}/`)
      .then(r => setDetail(r.data))
      .catch(() => toast.error('Could not load patient details'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (patient?.patient_id) loadDetail();
  }, [patient?.patient_id]);

  const handleAssignTask = async () => {
    if (!taskForm.title) return;
    try {
      await api.post('/therapist/assign-task/', { ...taskForm, patient_id: patient.patient_id });
      toast.success('Task assigned! 📝');
      setShowAssignTask(false);
      setTaskForm({ title: '', description: '', due_date: null });
      loadDetail();
    } catch {
      toast.error('Failed to assign task.');
    }
  };

  const moodColor = (score) => {
    if (score >= 4) return '#10b981';
    if (score >= 3) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12"
      style={{ background: 'rgba(28,28,30,0.85)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto !p-0 border-none shadow-2xl bg-surface"
        initial={{ scale: 0.98, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 30 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header - Professional Header */}
        <div className="p-8 border-b border-border-base flex items-center justify-between sticky top-0 bg-surface z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[24px] flex items-center justify-center text-3xl shadow-inner bg-page">
              {patient.name?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-black text-2xl tracking-tight text-primary">
                  {patient.name}
                </h2>
                <span className="badge badge-primary">Patient Profile</span>
              </div>
              <p className="text-sm text-muted font-medium mt-1">{patient.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-page transition-colors border-none cursor-pointer">
            <X className="w-6 h-6 text-muted" />
          </button>
        </div>

        <div className="p-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary opacity-40" />
              <p className="text-xs font-black uppercase tracking-widest text-muted">Retrieving Records...</p>
            </div>
          ) : detail ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Left Column: Metrics & Clinical Data */}
              <div className="lg:col-span-2 space-y-10">
                <Link 
                  to={`/chat/therapist/${patient.patient_id}`}
                  className="w-full py-5 rounded-[24px] bg-primary text-slate-800 font-bold text-lg flex items-center justify-center gap-3 no-underline shadow-xl shadow-primary/10 hover:shadow-2xl transition-all"
                >
                  <MessageSquare size={24} /> Secure Message Session
                </Link>

                <div className="grid grid-cols-3 gap-5">
                  {[
                    { label: 'Condition', value: detail?.patient?.primary_condition || 'Stable', color: 'var(--accent-blue)' },
                    { label: 'Activity Streak', value: `${detail?.streak?.current || 0} days`, color: 'var(--accent-green)' },
                    { label: 'Active Goals', value: (detail?.patient?.goals || []).length, color: 'var(--accent-peach)' },
                  ].map(item => (
                    <div key={item.label} className="p-6 rounded-[24px] bg-page border border-border-base">
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">{item.label}</div>
                      <div className="font-black text-xl text-primary">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Mood Chart Placeholder / List */}
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted mb-6">Longitudinal Mood Trends</h4>
                  {detail?.mood_logs?.length === 0 ? (
                    <div className="p-8 rounded-[32px] bg-page border border-dashed text-center italic text-sm text-muted">No entries recorded yet</div>
                  ) : (
                    <div className="space-y-3">
                      {detail?.mood_logs?.slice(0, 5).map((m, i) => (
                        <div key={i} className="flex items-center gap-5 p-5 rounded-[24px] bg-surface border border-border-base">
                          <div className="w-12 h-12 rounded-[20px] flex items-center justify-center font-black text-xl"
                            style={{ background: `${moodColor(m.score)}20`, color: moodColor(m.score) }}>
                            {m.score}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-primary">{m.note || 'Observation with no notes'}</p>
                            <p className="text-[10px] font-bold text-muted mt-1 uppercase tracking-wider">
                              {new Date(m.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Actions & Tasks */}
              <div className="space-y-10">
                <div className="glass-card !bg-page !p-8 !border-none">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">Active Directives</h4>
                    <button
                      onClick={() => setShowAssignTask(true)}
                      className="p-2 rounded-xl bg-primary text-slate-800 hover:scale-105 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {detail.tasks?.length === 0 ? (
                      <p className="text-xs text-muted italic text-center py-4">No active directives</p>
                    ) : (
                      detail.tasks.slice(0, 4).map((t, i) => (
                        <div key={i} className="p-4 rounded-[20px] bg-surface border border-border-base">
                          <div className="text-xs font-bold text-primary mb-1">{t.title}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted">{t.status}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-8 border-t border-border-base">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted mb-4 text-center">Security Policy</h4>
                  <p className="text-[10px] text-muted text-center leading-relaxed">
                    This portal is HIPAA compliant. All session notes are end-to-end encrypted. Use the private notes feature for confidential observations.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <p className="text-center py-20 text-muted">Error synchronizing with clinical server.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function TherapistDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [inviteCode, setInviteCode] = useState(null);
  const { text: timeText, emoji: timeEmoji } = getTimeGreeting();

  useEffect(() => {
    api.get('/therapist/dashboard/')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const generateInvite = async () => {
    try {
      const { data: res } = await api.post('/therapist/generate-invite/');
      setInviteCode(res.invite_code);
      toast.success('Invite code generated!');
    } catch {
      toast.error('Failed to generate invite.');
    }
  };

  if (loading) return <div className="page-container flex items-center justify-center"><div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>;

  return (
    <div className="page-container">
      <AnimatePresence>
        {selectedPatient && (
          <PatientDetailModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{timeEmoji} {timeText}</p>
        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-2"
          style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
          {user?.name?.split(' ')[0]}, your practice.
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Manage your patients and clinical tools</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Patients" value={data?.total_patients || 0} icon={Users} color="#7c3aed" glow="rgba(124,58,237,0.12)" />
        <StatCard label="Pending Invites" value={data?.active_invites_pending || 0} icon={Clock} color="#f59e0b" glow="rgba(245,158,11,0.12)" />
        <StatCard label="Active Links" value={data?.total_patients || 0} icon={Shield} color="#10b981" glow="rgba(16,185,129,0.12)" />
        <StatCard label="Specialization" value="CBT" icon={Stethoscope} color="#06b6d4" glow="rgba(6,182,212,0.12)" />
      </div>

      {/* Invite Code */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>Patient Invite Code</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Generate a secure code for a new patient to connect</p>
        </div>
        {inviteCode ? (
          <div className="flex items-center gap-3">
            <code className="px-4 py-2 rounded-xl font-mono font-bold text-lg" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
              {inviteCode}
            </code>
            <button onClick={() => { navigator.clipboard.writeText(inviteCode); toast.success('Copied!'); }}
              className="btn-primary !py-2 !px-4 text-sm">Copy</button>
          </div>
        ) : (
          <button onClick={generateInvite} className="btn-primary !py-2 !px-5 flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Generate Invite
          </button>
        )}
      </motion.div>

      {/* Patient List */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-lg" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
            Linked Patients
          </h2>
          <span className="badge badge-primary">{data?.total_patients || 0} active</span>
        </div>

        {!data?.linked_patients?.length ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🩺</div>
            <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No patients linked yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Generate an invite code above to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.linked_patients.map((patient, i) => {
              const moodScore = patient.last_mood_score;
              const moodColor = moodScore >= 4 ? '#10b981' : moodScore >= 3 ? '#f59e0b' : '#ef4444';
              return (
                <motion.button
                  key={patient.patient_id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedPatient(patient)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border cursor-pointer text-left transition-all group"
                  style={{ background: 'var(--bg-surface-1)', borderColor: 'var(--border-base)' }}
                >
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg"
                    style={{ background: 'rgba(124,58,237,0.12)', color: '#7c3aed' }}>
                    {patient.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>{patient.name}</p>
                      {patient.primary_condition && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                          style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4' }}>
                          {patient.primary_condition}
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{patient.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {moodScore && (
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" style={{ color: moodColor }} />
                        <span className="text-sm font-bold" style={{ color: moodColor }}>{moodScore}/5</span>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}


// ─── INDIVIDUAL DASHBOARD ──────────────────────────────────────────────────────

function getIndividualCards(user) {
  const cards = [
    { path: '/calm', icon: Wind, title: 'Focus Session', desc: 'Breathe, relax & meditate', color: 'var(--accent-blue)', tag: 'Focus' },
    { path: '/mood', icon: Activity, title: 'Mood Check-in', desc: 'Sync with your emotions', color: 'var(--accent-lavender)', tag: 'Log' },
    { path: '/train', icon: Brain, title: 'Daily Training', desc: 'Memory & focus games', color: 'var(--accent-green)', tag: 'Play' },
    { path: '/goals', icon: Target, title: 'My Goals', desc: 'Personal progress', color: 'var(--accent-peach)', tag: 'Plan' },
  ];
  return cards;
}

function IndividualDashboard({ user }) {
  const [plan, setPlan] = useState(null);
  const [streak, setStreak] = useState(0);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [therapistInfo, setTherapistInfo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [connecting, setConnecting] = useState(false);
  const { updateUser } = useAuth();
  const { text: timeText, emoji: timeEmoji } = getTimeGreeting();
  const planRouteMap = { training: '/train', chat: '/chat', calm: '/calm', mood: '/progress' };

  useEffect(() => {
    if (user?.role !== 'individual') return;
    
    api.get('/plan/today/').then(r => { setPlan(r.data.plan); setStreak(r.data.streak); }).catch(() => {}).finally(() => setLoadingPlan(false));
    api.post('/streak/update/').then(r => setStreak(r.data.current_streak)).catch(() => {});
    
    // Fetch tasks
    api.get('/user/tasks/')
      .then(r => setTasks(Array.isArray(r.data) ? r.data : []))
      .catch(() => setTasks([]));
    
    // Fetch therapist info from dashboard
    api.get('/user/dashboard/')
      .then(r => {
        if (r.data.therapist_connected) {
          setTherapistInfo(r.data.therapist_name);
        }
      })
      .catch(() => {});
  }, [user?.role]);

  const connectTherapist = async () => {
    if (!inviteCode.trim()) return;
    setConnecting(true);
    try {
      const { data } = await api.post('/user/connect-therapist/', { invite_code: inviteCode });
      toast.success('Connected to your therapist! 🩺');
      setInviteCode('');
      if (data.user) updateUser(data.user);
      // Re-fetch therapist info
      const r = await api.get('/user/dashboard/');
      if (r.data.therapist_connected) setTherapistInfo(r.data.therapist_name);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired code.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{timeEmoji} {timeText}</p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight"
              style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
              {user?.name?.split(' ')[0]}, let's grow.
            </h1>
            <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>What would you like to work on today?</p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
            className="glass-card px-5 py-4 flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid var(--accent-amber)' }}>
              <Flame className="w-5 h-5" style={{ color: 'var(--accent-amber)' }} />
            </div>
            <div>
              <div className="text-2xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--accent-amber)' }}>{streak}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Day Streak</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Today's Plan */}
      {!loadingPlan && plan?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Your Gentle Plan</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plan.map((item, i) => (
              <Link key={i} to={planRouteMap[item.type] || '/dashboard'}
                className="group p-5 rounded-[20px] no-underline transition-all border-none bg-page"
                style={{ background: 'var(--bg-surface-1)' }}>
                <div className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                <div className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{item.description}</div>
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-3.5 h-3.5" /> {item.duration}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Continue Task (Assigned Tasks) */}
      {tasks?.length > 0 && (
        <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass-card mb-10 overflow-hidden !p-0">
          <div className="p-8 border-b border-border-base bg-surface-1/30 flex items-center gap-3">
             <Calendar className="w-5 h-5 text-primary" />
             <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Active Directives</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(tasks) && tasks.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-[24px] bg-page border border-border-base transition-all hover:bg-surface-1" style={{ opacity: t.status === 'completed' ? 0.6 : 1 }}>
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.status === 'completed' ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                    {t.status === 'completed' ? <Check className="w-6 h-6 text-green-600" /> : <Shield className="w-6 h-6 text-primary" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{t.title}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">Directed by Therapist</p>
                  </div>
                </div>
                {t.status !== 'completed' && (
                  <button 
                    onClick={async () => {
                      try {
                        await api.patch(`/user/tasks/${t.id}/`, { status: 'completed' });
                        toast.success('Directive fulfilled! 🌟');
                        const r = await api.get('/user/tasks/');
                        setTasks(r.data);
                      } catch { toast.error('Failed to update task.'); }
                    }}
                    className="btn-primary !py-2 !px-5 text-[10px] font-black uppercase tracking-widest"
                  >
                    Fulfill
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
      {/* Main Grid Actions + Therapist Column */}
      <div className={`grid grid-cols-1 ${therapistInfo ? 'lg:grid-cols-4' : ''} gap-8`}>
        <div className={therapistInfo ? 'lg:col-span-3' : ''}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {getIndividualCards(user).map((card, i) => (
              <motion.div key={card.path} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}>
                <Link to={card.path} className="no-underline block h-full">
                  <div className="glass-card card-hover p-8 flex flex-col h-full group relative overflow-hidden cursor-pointer" style={{ minHeight: '180px' }}>
                    <div className="w-14 h-14 rounded-[20px] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${card.color}20`, border: `1px solid ${card.color}30` }}>
                      <card.icon className="w-7 h-7" style={{ color: card.color }} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{card.title}</h3>
                    <p className="text-base" style={{ color: 'var(--text-secondary)' }}>{card.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {therapistInfo && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="glass-card p-8 sticky top-24 border-none shadow-xl bg-surface">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl">
                  👨‍⚕️
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight">Active Care</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted">Verified Link</p>
                </div>
              </div>

              <div className="p-5 rounded-[20px] bg-page border border-border-base mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Physician</p>
                <p className="font-black text-base text-primary">Dr. {therapistInfo}</p>
              </div>

              <Link to="/chat" className="btn-primary w-full !py-4 flex items-center justify-center gap-3 no-underline text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                <MessageSquare size={18} /> Open Session
              </Link>
              
              <div className="mt-8 pt-8 border-t border-border-base">
                <p className="text-[10px] text-muted font-medium text-center leading-relaxed">
                  Your data is protected by hospital-grade encryption.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!therapistInfo && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
             <div className="glass-card p-8 border-dashed border-2 bg-page/50">
                <h3 className="font-black text-sm mb-2">Clinical Link</h3>
                <p className="text-xs text-muted leading-relaxed mb-6">Connect to your healthcare provider using a secure invite code.</p>
                <div className="space-y-4">
                  <input 
                    className="input-field !py-3 text-sm shadow-sm" 
                    placeholder="Enter Invite Code" 
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value)}
                  />
                  <button 
                    disabled={connecting}
                    onClick={connectTherapist}
                    className="btn-primary w-full !py-3 text-[10px] font-black uppercase tracking-widest"
                  >
                    {connecting ? 'Validating...' : 'Secure Link'}
                  </button>
                </div>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard — role router ─────────────────────────────────────────────

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && !user.onboarding_complete) {
      navigate('/onboarding');
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  switch (user.role) {
    case 'therapist':
      return <TherapistDashboard user={user} />;
    case 'individual':
    default:
      return <IndividualDashboard user={user} />;
  }
}
