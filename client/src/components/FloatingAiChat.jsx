import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Sparkles, X, Send, Loader2, MessageCircle, 
  ChevronDown, Brain, ListChecks, ArrowRight
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function FloatingAiChat() {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Suggested starter tasks
  const DEFAULT_SUGGESTIONS = [
    { text: "Suggest a focus exercise", type: "task" },
    { text: "Help me plan my day", type: "plan" },
    { text: "I'm feeling overwhelmed", type: "support" },
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm here to support you. We can chat or I can help you plan a gentle day. What's on your mind?`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Only show for individual users (not therapists)
  // AND hide when already on a chat page
  const isChatPage = location.pathname.startsWith('/chat');
  
  if (!user || user.role !== 'individual' || isChatPage) return null;

  const handleSend = async (msg = input) => {
    if (!msg.trim() || loading) return;

    const userMsg = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat/', { message: msg });
      const assistantMsg = { 
        role: 'assistant', 
        content: data.response, 
        timestamp: new Date(),
        type: data.type || 'chat'
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having a quiet moment. Let's try again in a bit.", 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="w-[360px] sm:w-[420px] h-[600px] mb-6 flex flex-col rounded-[40px] overflow-hidden shadow-2xl"
            style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-base)',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.1)'
            }}
          >
            {/* Header */}
            <div className="p-8 pb-6 flex items-center justify-between bg-page">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3xl bg-[#A7C7E740] flex items-center justify-center">
                  <Sparkles className="w-7 h-7" style={{ color: 'var(--accent-blue)' }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>Companion</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C1DDB3]" />
                    <span className="text-[10px] text-muted font-black uppercase tracking-widest">Listening</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-[#9CA3AF15] text-muted flex items-center justify-center hover:bg-[#9CA3AF25] transition-colors border-none cursor-pointer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-8 py-2 space-y-6 scroll-smooth">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[90%] p-4 rounded-3xl text-[13px] leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-[#A7C7E7] text-slate-900 rounded-br-none' 
                        : 'bg-[#C1DDB325] text-slate-800 rounded-bl-none border-none'
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#9CA3AF15] p-4 rounded-3xl rounded-bl-none flex items-center gap-3">
                    <Loader2 className="w-3 h-3 animate-spin text-muted" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted">Reflecting...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length < 5 && !loading && (
              <div className="px-8 py-4 flex flex-wrap gap-2">
                {DEFAULT_SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.text)}
                    className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer border-none bg-page hover:bg-surface-1 text-secondary shadow-sm"
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-8 pt-4">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Share what's on your mind..."
                  className="w-full bg-page border-none rounded-2xl py-4 px-6 pr-14 text-sm outline-none focus:ring-2 ring-[#A7C7E740] transition-all shadow-inner"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-2xl flex items-center justify-center transition-all border-none cursor-pointer shadow-lg"
                  style={{ background: 'var(--accent-blue)', color: '#fff' }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-[24px] shadow-xl flex items-center justify-center relative border-none cursor-pointer"
        style={{ 
          background: 'var(--accent-blue)',
          boxShadow: '0 15px 35px -5px rgba(167,199,231,0.5)'
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-8 h-8 text-white" />
            </motion.div>
          ) : (
            <motion.div key="sparkle" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
