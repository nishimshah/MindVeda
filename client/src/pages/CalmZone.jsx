import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, RotateCcw, Timer, PenTool, Music, Sparkles, BookOpen, Volume2, Plus, ChevronRight, Calendar, Moon, Sun, Coffee } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const sounds = [
  { name: 'Rainfall',   emoji: '🌧️', url: 'https://actions.google.com/sounds/v1/water/rain_heavy_loud.ogg' },
  { name: 'Zen Forest', emoji: '🌲', url: 'https://actions.google.com/sounds/v1/ambient/forest_ambience.ogg' },
  { name: 'Ocean Waves',emoji: '🌊', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg' },
  { name: 'Soft Wind',  emoji: '🍃', url: 'https://actions.google.com/sounds/v1/weather/wind_breeze.ogg' },
  { name: 'Pure White', emoji: '☁️', url: 'https://actions.google.com/sounds/v1/ambient/white_noise.ogg' },
  { name: 'Night Cafe', emoji: '☕', url: 'https://actions.google.com/sounds/v1/ambient/coffee_shop.ogg' },
];

export default function CalmZone() {
  const { theme } = useTheme();
  const [activeMode, setActiveMode] = useState('menu'); 
  const [journalView, setJournalView] = useState('list');
  const [breathActive, setBreathActive] = useState(false);
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [soundPlaying, setSoundPlaying] = useState(null);
  const [journalContent, setJournalContent] = useState('');
  const [journalHistory, setJournalHistory] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [savingJournal, setSavingJournal] = useState(false);
  
  const audioRefs = useRef({});
  const currentAudio = useRef(null);

  const themes = {
    light: { bg: 'bg-[#F8F6F4]', text: 'text-[#1A1A1A]', second: 'text-[#5C5C5C]', glass: 'bg-white', border: 'border-[#EBE7E0]', accent: '#7A8F7B' },
    dark: { bg: 'bg-[#121212]', text: 'text-[#F8F6F4]', second: 'text-[#BABABA]', glass: 'bg-[#1E1E1E]', border: 'border-[#2E2E2E]', accent: '#A89F91' },
  };

  const t = themes[theme] || themes.light;

  useEffect(() => {
    sounds.forEach(s => {
      const audio = new Audio();
      audio.src = s.url;
      audio.loop = true;
      audio.preload = 'auto';
      audio.crossOrigin = "anonymous"; 
      audioRefs.current[s.name] = audio;
    });
    return () => {
      Object.values(audioRefs.current).forEach(a => a.pause());
    };
  }, []);

  useEffect(() => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
    }
    if (soundPlaying) {
      const p = audioRefs.current[soundPlaying];
      if (p) {
        currentAudio.current = p;
        p.play().catch(e => {
          p.load();
          p.play().catch(err => console.error(err));
        });
      }
    }
  }, [soundPlaying]);

  useEffect(() => {
    if (activeMode === 'journal') fetchJournalHistory();
  }, [activeMode]);

  const fetchJournalHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/mood/');
      setJournalHistory(res.data);
    } catch { toast.error('History unavailable.'); }
    finally { setLoadingHistory(false); }
  };

  useEffect(() => {
    if (!breathActive) return;
    const timer = setInterval(() => {
      setBreathTimer(bt => {
        if (bt <= 1) {
          if (breathPhase === 'inhale') { setBreathPhase('hold'); return 7; }
          if (breathPhase === 'hold') { setBreathPhase('exhale'); return 8; }
          if (breathPhase === 'exhale') { setBreathPhase('inhale'); return 4; }
        }
        return bt - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breathActive, breathPhase]);

  const saveJournal = async () => {
    if (!journalContent.trim()) return;
    setSavingJournal(true);
    try {
      await api.post('/mood/', { note: journalContent, mood_score: 3 });
      toast.success('Reflection saved.');
      setJournalContent('');
      setJournalView('list');
      fetchJournalHistory();
    } catch { toast.error('Save failed.'); }
    finally { setSavingJournal(false); }
  };


  const renderMenu = () => (
    <div className="max-w-6xl mx-auto py-24 px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
        <div className="inline-flex items-center gap-2 mb-6 opacity-60">
           <span className="text-sm font-medium uppercase tracking-[0.2em]">Private Sanctuary</span>
        </div>
        <h1 className={`text-6xl md:text-8xl font-serif font-black mb-6 tracking-tight ${t.text}`}>
          Reset your <br />
          <span className="italic font-normal opacity-60 text-accent-green">rhythm.</span>
        </h1>
        <p className={`${t.second} text-xl font-light max-w-2xl leading-relaxed`}>
          A minimal space designed to lower cortisol and increase focus through boxed breathing and sonic regulation.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { id: 'focus', title: 'Focus Flow', desc: 'Boxed Breathing', icon: Timer, accent: 'var(--accent-blue)' },
          { id: 'journal', title: 'The Diary', desc: 'Secured Narrative', icon: BookOpen, accent: 'var(--accent-tan)' },
          { id: 'sleep', title: 'Sonic Rest', desc: 'Stable Ambient', icon: Music, accent: 'var(--accent-green)' },
        ].map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setActiveMode(item.id)}
            className={`flex flex-col items-start p-12 border ${t.border} rounded-[32px] ${t.glass} group cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 opacity-60`} style={{ background: item.accent + '15', color: item.accent }}>
              <item.icon className="w-8 h-8" />
            </div>
            <h2 className={`text-2xl font-serif font-black mb-2 ${t.text}`}>{item.title}</h2>
            <p className={`${t.second} text-[10px] font-black uppercase tracking-[0.2em]`}>{item.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderFocus = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-[#1A1A1A] flex flex-col items-center justify-center p-8 select-none">
      <button onClick={() => {setActiveMode('menu'); setBreathActive(false);}} className="absolute top-12 left-12 text-white/40 hover:text-white transition-all bg-white/5 p-4 rounded-full border-none cursor-pointer">
        <RotateCcw className="w-6 h-6" />
      </button>

      <div className="text-center mb-20">
        <motion.p key={breathPhase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] font-black uppercase tracking-[0.4em] text-white/40 mb-4">
           {breathActive ? 'Regulating...' : 'Ready?'}
        </motion.p>
        <h2 className="text-5xl md:text-7xl font-serif font-black text-white/90 italic">
           {breathActive ? breathPhase.charAt(0).toUpperCase() + breathPhase.slice(1) : 'Breathe Softly'}
        </h2>
      </div>

      <div className="relative flex items-center justify-center mb-24">
        <motion.div
          animate={{ scale: breathActive ? (breathPhase === 'inhale' ? 1.5 : breathPhase === 'hold' ? 1.5 : 0.8) : 1 }}
          transition={{ duration: breathPhase === 'inhale' ? 4 : breathPhase === 'exhale' ? 8 : 1.5, ease: "easeInOut" }}
          className="w-72 h-72 rounded-full border border-white/10 flex items-center justify-center relative bg-white/5 backdrop-blur-3xl shadow-[0_0_120px_rgba(255,255,255,0.05)]"
        >
           <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-10" />
           <div className="text-center">
             <div className="text-8xl font-black text-white leading-none tabular-nums">{breathTimer}</div>
           </div>
        </motion.div>
      </div>

      <button onClick={() => setBreathActive(!breathActive)} className="px-16 py-5 rounded-full bg-white text-black font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 border-none cursor-pointer shadow-2xl">
        {breathActive ? 'Pause Session' : 'Begin Inhale'}
      </button>
    </motion.div>
  );

  const renderJournal = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto py-24 px-8">
       <div className="flex justify-between items-center mb-16">
          <button onClick={() => {setActiveMode('menu'); setJournalView('list');}} className={`flex items-center gap-3 ${t.second} font-black uppercase tracking-widest text-[11px] hover:${t.text} transition-colors border-none bg-transparent cursor-pointer`}>
             <RotateCcw size={16} /> Sanctuary
          </button>
          {journalView === 'list' && (
             <button onClick={() => {setJournalView('write'); setSelectedJournal(null); setJournalContent('');}} className="btn-primary !px-8 !py-4 flex items-center gap-2">
                <Plus size={18} /> New Entry
             </button>
          )}
       </div>

       {journalView === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {loadingHistory ? (
                <div className={`col-span-2 py-32 text-center ${t.second} font-serif italic text-2xl opacity-40`}>Gathering your reflections...</div>
             ) : journalHistory.length === 0 ? (
                <div className={`col-span-2 py-32 text-center ${t.second} font-serif italic text-2xl opacity-40`}>Your mind is quiet. Take a moment to write.</div>
             ) : (
                journalHistory.map((item) => (
                   <motion.button key={item.id} whileHover={{ x: 6 }} onClick={() => {setSelectedJournal(item); setJournalContent(item.note); setJournalView('write');}} className={`${t.glass} p-10 rounded-[32px] border ${t.border} text-left flex items-start justify-between group cursor-pointer shadow-soft`}>
                      <div className="flex gap-6">
                         <div className={`w-14 h-14 rounded-2xl bg-accent-tan/10 flex items-center justify-center text-accent-tan shrink-0`}><Calendar size={22} /></div>
                         <div>
                            <h3 className={`font-serif text-2xl font-black ${t.text} mb-2 line-clamp-1`}>{item.note?.substring(0, 40) || "Untitled Narrative"}...</h3>
                            <p className={`${t.second} text-[10px] font-black uppercase tracking-[0.2em]`}>{new Date(item.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                         </div>
                      </div>
                      <ChevronRight className={`${t.second} group-hover:${t.text} transition-colors mt-2`} />
                   </motion.button>
                ))
             )}
          </div>
       ) : (
          <div className={`${t.glass} rounded-[40px] shadow-2xl border ${t.border} overflow-hidden`}>
             <div className={`px-12 py-10 border-b ${t.border} flex justify-between items-center bg-transparent`}>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center"><BookOpen className={`${t.second} w-6 h-6`} /></div>
                   <h2 className={`text-3xl font-serif font-black ${t.text}`}>{selectedJournal ? 'Review' : 'Reflect'}</h2>
                </div>
                {selectedJournal ? <div className={`${t.text} font-black text-[11px] uppercase opacity-40 tracking-widest`}>{new Date(selectedJournal.created_at).toLocaleDateString()}</div> : <button onClick={() => setJournalView('list')} className={`${t.second} font-black text-[11px] uppercase tracking-widest hover:${t.text} transition-colors bg-transparent border-none cursor-pointer`}>Discard Entry</button>}
             </div>

             <div className="p-12">
                <textarea 
                  value={journalContent} 
                  onChange={e => setJournalContent(e.target.value)} 
                  readOnly={!!selectedJournal} 
                  placeholder="What is occupying your mind today?" 
                  className={`w-full min-h-[450px] bg-transparent border-none ${t.text} text-2xl leading-relaxed font-serif italic outline-none resize-none transition-colors opacity-80`} 
                />
                <div className="mt-12 flex justify-end">
                   {selectedJournal ? (
                     <button onClick={() => setJournalView('list')} className="btn-primary !bg-black/5 !text-black border border-black/10 !px-12">Back to List</button>
                   ) : (
                     <button disabled={savingJournal || !journalContent.trim()} onClick={saveJournal} className="btn-primary !px-12 !py-5">
                       {savingJournal ? 'Securing...' : 'Secure & Save'}
                     </button>
                   )}
                </div>
             </div>
          </div>
       )}
    </motion.div>
  );

  const renderSleep = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-[#1A1A1A] flex flex-col items-center justify-center p-8 text-white select-none">
      <button onClick={() => {setActiveMode('menu'); setSoundPlaying(null);}} className="absolute top-12 right-12 text-white/40 hover:text-white transition-all bg-white/5 p-4 rounded-full border-none cursor-pointer">
        <RotateCcw className="w-6 h-6" />
      </button>
      
      <div className="mb-20 text-center">
        <h2 className="text-5xl md:text-7xl font-serif font-black text-white mb-4 italic">Sonic Sanctuary</h2>
        <p className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">High-stability ambient environment</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl">
        {sounds.map(s => (
          <button 
            key={s.name} 
            onClick={() => setSoundPlaying(soundPlaying === s.name ? null : s.name)} 
            className={`p-10 rounded-[32px] transition-all border-none flex flex-col items-start gap-8 cursor-pointer relative overflow-hidden ${soundPlaying === s.name ? 'bg-white text-black scale-105 shadow-[0_0_60px_rgba(255,255,255,0.15)]' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
          >
            <div className="text-5xl">{s.emoji}</div>
            <div className="text-left">
              <span className={`text-[12px] font-black uppercase tracking-[0.2em] ${soundPlaying === s.name ? 'text-black/40' : 'text-white/40'}`}>Environment</span>
              <h4 className={`text-xl font-black ${soundPlaying === s.name ? 'text-black' : 'text-white'}`}>{s.name}</h4>
            </div>
            {soundPlaying === s.name && (
              <motion.div layoutId="active-glow" className="absolute bottom-0 left-0 w-full h-1 bg-black" />
            )}
          </button>
        ))}
      </div>

      {soundPlaying && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-20 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-1.5 h-1.5 rounded-full bg-white breathing-animation" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live Ambiance Active</span>
          </div>
          <button onClick={() => setSoundPlaying(null)} className="px-12 py-4 rounded-full border border-white/20 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-white/50 transition-all bg-transparent cursor-pointer">
            Silence Sanctuary
          </button>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div className={`smooth-transition min-h-screen ${t.bg} transition-colors duration-700`}>
      {activeMode === 'menu' && renderMenu()}
      <AnimatePresence mode="wait">
        {activeMode === 'focus' && renderFocus()}
        {activeMode === 'journal' && renderJournal()}
        {activeMode === 'sleep' && renderSleep()}
      </AnimatePresence>
    </div>
  );
}
