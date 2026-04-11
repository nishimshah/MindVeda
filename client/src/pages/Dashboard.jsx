import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, MessageCircle, BarChart3, Wind, User,
  Flame, Sparkles, ChevronRight, Clock, Users,
  Stethoscope, Plus, AlertCircle, Activity, Heart,
  X, Calendar, TrendingUp, Shield, Target, Loader2,
  MessageSquare, Check, Star, ArrowRight,
} from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import DailyCheckInModal from '../components/DailyCheckInModal';

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
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', due_date: null });
  const [noteForm, setNoteForm] = useState({ title: '', content: '', session_date: new Date().toISOString().split('T')[0] });

  const loadDetail = () => {
    setLoading(true);
    api.get(`/therapist/patient/${patient?.patient_id}/`)
      .then(r => setDetail(r.data))
      .catch(() => toast.error('Could not load patient details'))
      .finally(() => setLoading(false));
  };

  const handleSaveNote = async () => {
    if (!noteForm.title || !noteForm.content) return;
    try {
      await api.post(`/therapist/notes/${patient.patient_id}/`, noteForm);
      toast.success('Clinical note saved.');
      setShowNoteForm(false);
      setNoteForm({ title: '', content: '', session_date: new Date().toISOString().split('T')[0] });
      loadDetail();
    } catch { toast.error('Failed to save note.'); }
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
              <div className="lg:col-span-2 space-y-8">
                <div className="flex gap-4">
                  <Link 
                    to={`/chat/therapist/${patient.patient_id}`}
                    className="flex-1 py-4 rounded-[20px] bg-primary text-slate-800 font-bold text-base flex items-center justify-center gap-2 no-underline shadow-lg hover:shadow-primary/20 transition-all border-none"
                  >
                    <MessageSquare size={20} /> Secure Session
                  </Link>
                  <div className="flex-1 p-1 rounded-[20px] bg-page border border-border-base flex items-center px-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mr-3">Mode</p>
                    <select 
                      className="bg-transparent border-none font-bold text-sm text-primary focus:ring-0 cursor-pointer flex-1 outline-none"
                      value={detail?.patient?.primary_condition || 'general'}
                      onChange={async (e) => {
                        try {
                          await api.post('/therapist/update-condition/', { 
                            patient_id: patient.patient_id, 
                            condition: e.target.value 
                          });
                          toast.success('Condition updated');
                          loadDetail();
                        } catch { toast.error('Update failed'); }
                      }}
                    >
                      <option value="general">General</option>
                      <option value="adhd">ADHD</option>
                      <option value="anxiety">Anxiety</option>
                      <option value="autism">Autism</option>
                      <option value="depression">Depression</option>
                      <option value="dyslexia">Dyslexia</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Condition', value: detail?.patient?.primary_condition || 'Stable', color: 'var(--accent-blue)' },
                    { label: 'Focus Score', value: `${Math.round(detail?.cognitive_profile?.focus_score || 0)}%`, color: 'var(--accent-lavender)' },
                    { label: 'Stress Level', value: `${Math.round(detail?.cognitive_profile?.stress_score || 0)}%`, color: 'var(--accent-peach)' },
                  ].map(item => (
                    <div key={item.label} className="p-5 rounded-[20px] bg-page border border-border-base shadow-sm text-center">
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted mb-1.5">{item.label}</div>
                      <div className="font-black text-lg text-primary">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Patient Journaling — RECENT HISTORY */}
                <div>
                   <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted mb-4">Patient Diary History</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {detail.mood_logs?.length === 0 ? (
                        <div className="col-span-2 p-8 rounded-[24px] bg-page border border-dashed text-center text-xs text-muted">No journal entries found.</div>
                      ) : (
                        detail.mood_logs.map((log, i) => (
                          <div key={i} className="p-4 rounded-[20px] bg-page border border-border-base group">
                            <div className="flex justify-between items-center mb-2">
                               <span className="badge badge-primary !text-[8px] !px-2 !py-0.5">Mood: {log.score}/5</span>
                               <span className="text-[9px] font-bold text-muted">{new Date(log.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-secondary leading-relaxed line-clamp-3 italic">"{log.note}"</p>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                {/* Session Notes Section */}
                <div>
                   <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">Therapist Clinical Notes</h4>
                      <button 
                        onClick={() => setShowNoteForm(!showNoteForm)}
                        className="text-[10px] font-black underline uppercase tracking-widest text-primary hover:text-primary-hover border-none bg-transparent cursor-pointer"
                      >
                        {showNoteForm ? 'Cancel' : 'Add Note'}
                      </button>
                   </div>

                   {showNoteForm && (
                     <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-[24px] bg-page border border-primary/20 mb-6 space-y-4 shadow-xl">
                        <input 
                          type="text" 
                          placeholder="Note Title (e.g. Session Review)" 
                          className="input-field !py-3 text-sm !bg-surface"
                          value={noteForm.title}
                          onChange={e => setNoteForm({...noteForm, title: e.target.value})}
                        />
                        <textarea 
                          placeholder="Confidential observations..." 
                          className="input-field !py-3 text-sm min-h-[100px] resize-none !bg-surface"
                          value={noteForm.content}
                          onChange={e => setNoteForm({...noteForm, content: e.target.value})}
                        />
                        <div className="flex justify-between items-center">
                           <input 
                            type="date" 
                            className="bg-transparent text-xs font-bold text-muted border-none p-0 outline-none"
                            value={noteForm.session_date}
                            onChange={e => setNoteForm({...noteForm, session_date: e.target.value})}
                           />
                           <button 
                            onClick={handleSaveNote}
                            className="btn-primary !py-2 !px-6 text-[10px] font-black uppercase tracking-widest"
                           >
                            Save Note
                           </button>
                        </div>
                     </motion.div>
                   )}

                   <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {detail.notes?.length === 0 ? (
                        <div className="p-8 rounded-[24px] bg-page border border-dashed text-center text-xs text-muted">No clinical notes entries.</div>
                      ) : (
                        detail.notes.map((n, i) => (
                          <div key={i} className="p-5 rounded-[24px] bg-page border border-border-base hover:border-primary/20 transition-all">
                            <div className="flex justify-between mb-2">
                              <h5 className="font-bold text-sm text-primary">{n.title}</h5>
                              <span className="text-[10px] font-bold text-muted">{new Date(n.session_date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-secondary leading-relaxed">{n.content}</p>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                {/* Game Performance */}
                <div>
                   <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted mb-4 text-center">Sync Progress: Game Activity</h4>
                   {!detail?.game_activity || detail.game_activity.length === 0 ? (
                     <div className="p-8 rounded-[24px] bg-page border border-dashed text-center italic text-xs text-muted">Waiting for game data sync...</div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {detail.game_activity.map((game, i) => (
                          <div key={i} className="p-4 rounded-[20px] bg-page border border-border-base flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-black text-xs text-primary">{game.game[0]}</div>
                                <div>
                                  <p className="text-xs font-bold text-primary">{game.game}</p>
                                  <p className="text-[9px] text-muted uppercase tracking-widest font-black">Score: {game.score}</p>
                                </div>
                             </div>
                             <div className="text-[9px] font-bold text-muted text-right">
                                {new Date(game.date).toLocaleDateString()}
                             </div>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              </div>

              {/* Right Column: Actions & Tasks */}
              <div className="space-y-10">
                <div className="glass-card !bg-page !p-8 !border-none !shadow-none">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">Active Directives</h4>
                    <button
                      onClick={() => setShowAssignTask(!showAssignTask)}
                      className={`p-2 rounded-xl transition-all ${showAssignTask ? 'bg-red-500 text-white' : 'bg-primary text-slate-800'}`}
                    >
                      {showAssignTask ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>

                  {showAssignTask && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-[24px] bg-surface border border-primary/20 mb-8 space-y-4 shadow-xl">
                       <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">New Task</h5>
                       <input 
                         type="text" 
                         placeholder="Directive Title..." 
                         className="input-field !py-3 !bg-page text-sm"
                         value={taskForm.title}
                         onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                       />
                       <textarea 
                         placeholder="Description..." 
                         className="input-field !py-3 !bg-page text-sm min-h-[80px] resize-none"
                         value={taskForm.description}
                         onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                       />
                       <input 
                         type="date" 
                         className="input-field !py-3 !bg-page text-xs font-bold"
                         value={taskForm.due_date}
                         onChange={e => setTaskForm({...taskForm, due_date: e.target.value})}
                       />
                       <button 
                         onClick={handleAssignTask}
                         className="btn-primary w-full !py-3 text-[10px] font-black uppercase tracking-widest"
                       >
                         Allot Directive
                       </button>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    {detail.tasks?.length === 0 ? (
                      <p className="text-xs text-muted italic text-center py-4">No active directives allot one above.</p>
                    ) : (
                      detail.tasks.map((t, i) => (
                        <div key={i} className="p-5 rounded-[24px] bg-surface border border-border-base">
                          <div className="flex justify-between items-center mb-1">
                             <div className="text-xs font-bold text-primary">{t.title}</div>
                             <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${t.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>{t.status}</span>
                          </div>
                          <p className="text-[10px] text-muted line-clamp-1">{t.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-8 border-t border-border-base text-center">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted mb-4 italic">Security Standard</h4>
                  <div className="flex justify-center mb-4">
                     <Shield className="text-primary w-10 h-10 opacity-20" />
                  </div>
                  <p className="text-[9px] text-muted leading-relaxed uppercase font-black tracking-widest opacity-60">
                    MindVeda Clinical Portal<br/>v2.0 HIPAA Compliant
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
  const [recommendedGames, setRecommendedGames] = useState([]);
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

    // Fetch recommended games
    api.get('/games/recommended/')
      .then(r => setRecommendedGames(Array.isArray(r.data) ? r.data : []))
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
      <DailyCheckInModal />
      {/* ── TOP SECTION: GREETING & MOOD ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-2 opacity-60">
            <span className="text-lg">{timeEmoji}</span>
            <span className="text-sm font-medium uppercase tracking-widest">{timeText}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-black leading-tight mb-4">
            {user?.name?.split(' ')[0]}, <br />
            <span className="italic font-normal opacity-60">let's grow today.</span>
          </h1>
          <p className="text-lg opacity-60 font-light max-w-lg">
            A gentle space to sharpen your mind and restore your emotional balance.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.1 }}
          className="glass-card flex flex-col justify-center"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-accent-green" />
            </div>
            <h3 className="text-xl font-serif">Today's Pulse</h3>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-end border-b border-border-base pb-3">
                <span className="text-sm text-muted">Recent Mood</span>
                <span className="text-2xl font-black">😊 Good</span>
             </div>
             <div className="flex justify-between items-end">
                <span className="text-sm text-muted">Mindfulness Goal</span>
                <span className="text-sm font-bold text-accent-green">75% Complete</span>
             </div>
          </div>
        </motion.div>
      </div>

      {/* ── MIDDLE SECTION: AI ASSISTANT & TASKS ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.2 }}
          className="glass-card !bg-accent-tan border-none group cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="relative z-10">
            <h3 className="text-3xl font-serif mb-4 text-[var(--text-primary)]">Therapeutic Companion</h3>
            <p className="text-[var(--text-primary)] opacity-80 mb-8 max-w-sm leading-relaxed">
              "You've stayed focused for 3 days. Shall we try a calm breathing session to anchor your progress?"
            </p>
            <Link to="/chat" className="btn-primary !bg-[var(--text-primary)] !text-[var(--bg-surface)] no-underline">
              Enter Sanctuary
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-accent-primary" />
              <h3 className="text-xl font-serif">Active Directives</h3>
            </div>
            {tasks?.length > 0 && <span className="badge badge-primary">{tasks.length} New</span>}
          </div>
          
          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            {tasks?.length === 0 ? (
              <div className="py-10 text-center opacity-40 italic">No directives assigned.</div>
            ) : (
              tasks.map((t, i) => (
                <div key={i} className="p-4 rounded-2xl bg-bg-page border border-border-base flex items-center justify-between group" style={{ opacity: t.status === 'completed' ? 0.6 : 1 }}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.status === 'completed' ? 'bg-green-500/10' : 'bg-accent-primary/10'}`}>
                      {t.status === 'completed' ? <Check className="w-5 h-5 text-green-600" /> : <Shield className="w-5 h-5 text-accent-primary" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{t.title}</h4>
                      <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Clinical Directive</p>
                    </div>
                  </div>
                  {t.status !== 'completed' && (
                    <button 
                      onClick={async () => {
                        try {
                          await api.patch(`/user/tasks/${t.id}/`, { status: 'completed' });
                          toast.success('Fulfilled! ✨');
                          const r = await api.get('/user/tasks/');
                          setTasks(r.data);
                        } catch { toast.error('Failed to update.'); }
                      }}
                      className="btn-primary !p-2 !px-4 !rounded-lg text-[10px] font-black uppercase tracking-widest !bg-transparent !text-[var(--text-primary)] border border-[var(--text-primary)]/20 hover:!bg-[var(--text-primary)]/5"
                    >
                      Fulfill
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* ── GAMES SECTION: THE GRID ────────────────────────── */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <Brain className="w-5 h-5 text-accent-green" />
          <h3 className="text-2xl font-serif">Cognitive Training</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {getIndividualCards(user).map((card, i) => (
            <motion.div 
              key={card.path} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Link to={card.path} className="no-underline block h-full group">
                <div className="glass-card !p-8 flex flex-col h-full relative overflow-hidden">
                  <div className="w-14 h-14 rounded-2xl bg-bg-page flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <card.icon className="w-7 h-7" style={{ color: card.color }} />
                  </div>
                  <h3 className="text-xl font-serif mb-2">{card.title}</h3>
                  <p className="text-sm opacity-60 leading-relaxed mb-6 font-light">{card.desc}</p>
                  <div className="mt-auto flex items-center text-[11px] font-black uppercase tracking-widest text-accent-green opacity-0 group-hover:opacity-100 transition-opacity">
                    Launch Session <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM SECTION: PROGRESS ─────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-5 h-5 text-accent-primary" />
          <h3 className="text-2xl font-serif">Wellness Trajectory</h3>
        </div>
        <div className="glass-card min-h-[400px] flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-16 h-16 text-accent-tan mb-6 opacity-20" />
          <h4 className="text-xl font-serif mb-2">Syncing with Clinical Data...</h4>
          <p className="text-sm text-muted max-w-sm">
            Your cognitive charts are being updated based on your recent sessions. Continue training to see deeper insights.
          </p>
        </div>
      </motion.div>

      {/* ── CLINICAL CONNECTION ──────────────────────────── */}
      <div className="mt-16 pt-16 border-t border-border-base">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-serif mb-4">Clinical Support</h3>
            <p className="opacity-60 mb-8 max-w-lg font-light leading-relaxed">
              If you are working with a therapist, you can link your MindVeda account to share progress and receive direct clinical guidance.
            </p>
          </div>

          <div className="lg:col-span-1">
            {therapistInfo ? (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card !p-8 shadow-xl bg-surface border-none">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-accent-green/10 flex items-center justify-center text-2xl">
                    👨‍⚕️
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#1A1A1A]">Active Link</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">Dr. {therapistInfo}</p>
                  </div>
                </div>
                <Link to="/chat" className="btn-primary w-full !py-4 flex items-center justify-center gap-3 no-underline text-xs font-black uppercase tracking-widest">
                  <MessageSquare size={18} /> Open Session
                </Link>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card !p-8 border-dashed border-2 bg-white/40">
                <h3 className="font-bold text-sm mb-2 text-[#1A1A1A]">Clinical Link</h3>
                <p className="text-xs text-muted leading-relaxed mb-6 font-light">Enter your provider's code to begin sharing progress.</p>
                <div className="space-y-4">
                  <input 
                    className="input-field !py-3 text-sm" 
                    placeholder="Invite Code" 
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value)}
                  />
                  <button 
                    disabled={connecting}
                    onClick={connectTherapist}
                    className="btn-primary w-full !py-3 text-[10px] font-black uppercase tracking-widest"
                  >
                    {connecting ? 'Checking...' : 'Apply Code'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
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
