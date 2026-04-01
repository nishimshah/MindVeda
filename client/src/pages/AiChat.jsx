import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles,
  MessageSquare, Smile, Meh, Frown,
} from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const STARTERS = [
  "I've been feeling stressed lately...",
  "Help me with a breathing exercise",
  "I want to improve my focus",
  "I'm feeling anxious today",
];

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl rounded-bl-sm" style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-base)' }}>
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

function SentimentIcon({ sentiment }) {
  if (sentiment === 'positive') return <Smile className="w-3 h-3" style={{ color: '#10b981' }} />;
  if (sentiment === 'negative') return <Frown className="w-3 h-3" style={{ color: '#f59e0b' }} />;
  return <Meh className="w-3 h-3" style={{ color: '#7c3aed' }} />;
}

export default function AiChat() {
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isListening, setIsListening]   = useState(false);
  const [ttsEnabled, setTtsEnabled]     = useState(false);
  const messagesEndRef                  = useRef(null);
  const recognitionRef                  = useRef(null);
  const textareaRef                     = useRef(null);

  useEffect(() => { fetchHistory(); initSpeechRecognition(); return () => recognitionRef.current?.abort(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/chat/history');
      setMessages(data.map(m => ({ role: m.role, content: m.content, sentiment: m.sentiment })));
    } catch { /**/ }
    finally { setLoadingHistory(false); }
  };

  const initSpeechRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false; r.interimResults = false; r.lang = 'en-US';
    r.onresult  = e => { setInput(p => p + e.results[0][0].transcript); setIsListening(false); };
    r.onerror   = () => setIsListening(false);
    r.onend     = () => setIsListening(false);
    recognitionRef.current = r;
  };

  const toggleListening = () => {
    if (!recognitionRef.current) { toast.error('Speech recognition not supported.'); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else             { recognitionRef.current.start(); setIsListening(true); }
  };

  const speak = text => {
    if (!ttsEnabled) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9; u.pitch = 1;
    speechSynthesis.speak(u);
  };

  const sendMessage = async (msg = input.trim()) => {
    if (!msg || loading) return;
    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: msg });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, sentiment: data.sentiment }]);
      speak(data.response);
    } catch { toast.error('Failed to get response. Please try again.'); }
    finally   { setLoading(false); }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="page-container flex flex-col" style={{ height: 'calc(100vh - 4rem)', paddingBottom: '1rem' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center pulse-glow"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg leading-none" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
              AI Companion
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Your calm, supportive wellness partner</p>
          </div>
        </div>
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all"
          style={{
            background: ttsEnabled ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${ttsEnabled ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.08)'}`,
          }}
          title={ttsEnabled ? 'Disable voice' : 'Enable voice'}
        >
          {ttsEnabled
            ? <Volume2 className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
            : <VolumeX  className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
        </button>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto rounded-2xl mb-4 p-5"
        style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-base)', boxShadow: 'var(--shadow-sm)' }}
      >
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#7c3aed' }} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 pulse-glow"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.15))', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              <MessageSquare className="w-8 h-8" style={{ color: '#a78bfa' }} />
            </div>
            <h3 className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
              Start a conversation
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              I'm here to listen, support, and help you grow. ❤️
            </p>
            {/* Suggested starters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {STARTERS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-2.5 rounded-xl text-xs text-left cursor-pointer border-none transition-all"
                  style={{ background: 'var(--accent-p-glow)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: 600 }}
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1,  y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div style={{ maxWidth: '75%' }}>
                    <div
                      className="px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm"
                      style={msg.role === 'user'
                        ? { background: 'var(--accent-primary)', color: '#fff', borderBottomRightRadius: '4px' }
                        : { background: 'var(--bg-surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border-base)', borderBottomLeftRadius: '4px' }
                      }
                    >
                      {msg.content}
                    </div>
                    {msg.sentiment && msg.role === 'user' && (
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <SentimentIcon sentiment={msg.sentiment} />
                        <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{msg.sentiment}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 flex items-end gap-2 p-3 rounded-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-base)', boxShadow: 'var(--shadow-md)' }}
      >
        <button
          onClick={toggleListening}
          className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none shrink-0 transition-all"
          style={{
            background: isListening ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isListening ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {isListening
            ? <MicOff className="w-4.5 h-4.5" style={{ color: '#ef4444' }} />
            : <Mic    className="w-4.5 h-4.5" style={{ color: '#596080' }} />}
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message your AI companion..."
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none text-sm py-2.5"
          style={{ color: 'var(--text-primary)', minHeight: '40px', maxHeight: '120px', caretColor: 'var(--accent-primary)' }}
        />

        <motion.button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          whileTap={{ scale: 0.92 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none shrink-0 transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 14px rgba(124,58,237,0.4)' }}
        >
          {loading
            ? <Loader2 className="w-4 h-4 text-white animate-spin" />
            : <Send    className="w-4 h-4 text-white" />}
        </motion.button>
      </div>
    </div>
  );
}
