import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Send, Loader2, Sparkles, Users, ArrowLeft
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl"
        style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-base)' }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--text-muted)' }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function SupportChat() {
  const { user } = useAuth();
  const { patientId } = useParams();
  const [activeMode, setActiveMode] = useState(patientId ? 'therapist' : 'ai');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [therapist, setTherapist] = useState(null);
  const [patients, setPatients] = useState([]); // List for therapists
  const [ws, setWs] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'error'
  const [inviteCode, setInviteCode] = useState('');
  const [connectingTherapist, setConnectingTherapist] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (patientId) {
      // Find patient name from list if available, or fetch
      fetchPatientName(patientId);
      setActiveMode('therapist');
    } else if (user?.role === 'therapist') {
      fetchPatientsList();
    } else {
      fetchTherapistInfo();
    }
  }, [patientId, user]);

  useEffect(() => {
    if (activeMode === 'ai') {
      fetchAiHistory();
      setConnectionStatus('connected');
    } else if (therapist) {
      initWebSocket();
    }
    return () => {
      if (ws) ws.close();
    };
  }, [activeMode, therapist]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchPatientName = async (id) => {
    try {
      const { data } = await api.get(`/therapist/patient/${id}/`);
      setTherapist({ id, name: data.patient.name });
    } catch {
      setTherapist({ id, name: 'Patient' });
    }
  };

  const fetchPatientsList = async () => {
    try {
      const { data } = await api.get('/therapist/dashboard/');
      setPatients(data.linked_patients || []);
      setLoadingHistory(false);
    } catch {
      setLoadingHistory(false);
    }
  };

  const fetchTherapistInfo = async () => {
    try {
      const { data } = await api.get('/user/dashboard/');
      if (data.therapist_connected) {
        setTherapist({ id: data.therapist_id, name: data.therapist_name });
      }
    } catch (err) {}
    finally { setLoadingHistory(false); }
  };

  const fetchAiHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get('/chat/history/');
      setMessages(data.map(m => ({ role: m.role, content: m.content })));
    } catch {}
    finally { setLoadingHistory(false); }
  };

  const handleConnectTherapist = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setConnectingTherapist(true);
    try {
      await api.post('/user/connect-therapist/', { invite_code: inviteCode });
      toast.success('Connected to therapist! 🏥');
      setInviteCode('');
      fetchTherapistInfo();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid invite code');
    } finally {
      setConnectingTherapist(false);
    }
  };

  const initWebSocket = () => {
    if (!therapist) return;
    setConnectionStatus('connecting');
    setLoadingHistory(true);
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws/chat/${therapist.id}/`);

    socket.onopen = () => {
      setLoadingHistory(false);
      setConnectionStatus('connected');
    };
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'history') {
        setMessages(data.messages.map(m => ({
          role: m.sender_id === user?.id ? 'user' : 'assistant',
          content: m.message,
        })));
      } else if (data.type === 'chat_message') {
        setMessages(prev => [...prev, {
          role: data.sender_id === user?.id ? 'user' : 'assistant',
          content: data.message,
        }]);
      }
    };
    socket.onerror = (err) => {
      console.error('WS Error:', err);
      setConnectionStatus('error');
    };
    socket.onclose = () => {
      setLoadingHistory(false);
      if (connectionStatus !== 'error') {
        setConnectionStatus('error');
      }
    };
    setWs(socket);
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg) return;
    setInput('');

    if (activeMode === 'ai') {
      setMessages(prev => [...prev, { role: 'user', content: msg }]);
      setLoading(true);
      try {
        const { data } = await api.post('/chat/', { message: msg });
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } catch { toast.error('Failed to get response'); }
      finally { setLoading(false); }
    } else {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ message: msg }));
      } else {
        toast.error('Connection lost. Please refresh.');
      }
    }
  };

  const activeTabStyle = {
    background: 'var(--accent-primary)',
    color: '#ffffff',
    boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
    borderRadius: '14px',
    padding: '0.5rem 1.5rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 250ms ease',
  };
  const inactiveTabStyle = {
    ...activeTabStyle,
    background: 'transparent',
    color: 'var(--text-secondary)',
    boxShadow: 'none',
  };

  return (
    <div className="page-container flex flex-col" style={{ height: 'calc(100vh - 5rem)' }}>

      {/* ── Mode Switcher ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        {patientId && (
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '0.5rem', borderRadius: '12px',
              background: 'var(--bg-surface-1)', border: '1px solid var(--border-base)',
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{
            display: 'flex', padding: '4px',
            borderRadius: '20px',
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-base)',
            gap: '4px',
          }}>
            {/* AI Companion hidden if linked with therapist or in therapist mode */}
            {!therapist && !patientId && (
              <button
                onClick={() => setActiveMode('ai')}
                style={activeMode === 'ai' ? activeTabStyle : inactiveTabStyle}
              >
                <Sparkles size={15} /> AI Companion
              </button>
            )}
            
            {/* If patient: show their connected therapist */}
            {user?.role === 'individual' && therapist && (
              <button
                onClick={() => setActiveMode('therapist')}
                style={activeMode === 'therapist' ? activeTabStyle : inactiveTabStyle}
              >
                <Users size={15} />
                {`Dr. ${therapist.name.split(' ')[0]}`}
              </button>
            )}

            {/* If therapist: show patient list as tabs */}
            {user?.role === 'therapist' && patients.map(p => (
              <button
                key={p.patient_id}
                onClick={() => {
                  setTherapist({ id: p.patient_id, name: p.name });
                  setActiveMode('therapist');
                }}
                style={(activeMode === 'therapist' && therapist?.id === p.patient_id) ? activeTabStyle : inactiveTabStyle}
              >
                <Users size={15} />
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-base, 14px)',
        padding: '1.25rem',
        marginBottom: '1rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        {loadingHistory ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Loader2 size={28} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : connectionStatus === 'error' ? (
          <div style={{ textAlign: 'center', paddingTop: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '5rem', height: '5rem', borderRadius: '24px',
              background: 'rgba(244, 63, 94, 0.1)',
              color: '#f43f5e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', marginBottom: '1.5rem',
            }}>📡</div>
            <h3 style={{
              fontSize: '1.25rem', fontWeight: 900,
              fontFamily: 'Outfit, sans-serif',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              Connection Lost
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '280px', marginBottom: '1.5rem' }}>
              We couldn't reach the chat server. Please check your internet or try again.
            </p>
            <button 
              onClick={() => initWebSocket()}
              style={{
                padding: '0.75rem 2rem', borderRadius: '14px',
                background: 'var(--accent-primary)', color: 'white',
                border: 'none', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Retry Connection
            </button>
          </div>
        ) : user?.role === 'individual' && !therapist ? (
          <div style={{ textAlign: 'center', paddingTop: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '6rem', height: '6rem', borderRadius: '32px',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem', marginBottom: '2rem',
            }}>🏥</div>
            <h3 style={{
              fontSize: '1.5rem', fontWeight: 900,
              fontFamily: 'Outfit, sans-serif',
              color: 'var(--text-primary)',
              marginBottom: '0.75rem',
            }}>
              Connect to Therapist
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '320px', marginBottom: '2.5rem' }}>
              Enter your doctor's unique invite code to unlock secure, 1-on-1 clinical sessions and professional guidance.
            </p>
            <form onSubmit={handleConnectTherapist} style={{ width: '100%', maxWidth: '300px' }}>
              <input
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="INVITE-CODE-123"
                className="input-field"
                style={{ textAlign: 'center', letterSpacing: '0.1em', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}
              />
              <button
                type="submit"
                disabled={connectingTherapist}
                className="btn-primary"
                style={{ width: '100%', borderRadius: '16px' }}
              >
                {connectingTherapist ? <Loader2 className="animate-spin" size={20} /> : 'Connect Securely'}
              </button>
            </form>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '5rem', height: '5rem', borderRadius: '24px',
              background: 'var(--bg-surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', marginBottom: '1.5rem',
            }}>💬</div>
            <h3 style={{
              fontSize: '1.25rem', fontWeight: 900,
              fontFamily: 'Outfit, sans-serif',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              No messages yet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '280px' }}>
              Start a supportive conversation. Your messages are private and secure.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '0.85rem 1.1rem',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-surface-2)',
                  color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border-base)',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                    {m.content}
                  </p>
                </div>
              </motion.div>
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-base, 14px)',
        padding: '0.6rem 0.75rem',
        boxShadow: 'var(--shadow-xl)',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder={activeMode === 'ai' ? 'Talk to AI…' : 'Message…'}
          rows={1}
          style={{
            flex: 1, background: 'transparent',
            border: 'none', outline: 'none',
            resize: 'none', fontSize: '0.9rem',
            padding: '0.4rem 0.5rem',
            color: 'var(--text-primary)',
            caretColor: 'var(--accent-primary)',
            fontFamily: 'Inter, sans-serif',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          style={{
            width: '48px', height: '48px',
            borderRadius: '14px',
            background: input.trim() ? 'var(--accent-primary)' : 'var(--bg-surface-2)',
            color: input.trim() ? '#ffffff' : 'var(--text-muted)',
            border: 'none',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 200ms ease',
            flexShrink: 0,
          }}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
