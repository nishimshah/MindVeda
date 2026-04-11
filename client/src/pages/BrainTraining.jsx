import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Grid3X3, Zap, Eye, ArrowLeft, Trophy, 
  RotateCcw, Star, Loader2, Sparkles, Activity, Clock, ArrowRight
} from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

/* ─────────────────────── MINI-GAME COMPONENTS ─────────────────────── */
// (Keeping existing mini-game components but will only show them for matching IDs)

function MemoryMatch({ onBack }) {
  const emojis = ['🧠', '💡', '⭐', '🎯', '🔥', '💎', '🌟', '🎨'];
  const [cards, setCards]         = useState([]);
  const [flipped, setFlipped]     = useState([]);
  const [matched, setMatched]     = useState([]);
  const [moves, setMoves]         = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon]     = useState(false);

  const startGame = () => {
    const pairCount = 8;
    const selected  = emojis.slice(0, pairCount);
    const deck      = [...selected, ...selected]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji }));
    setCards(deck);
    setFlipped([]); setMatched([]); setMoves(0);
    setGameStarted(true); setGameWon(false);
  };

  const flipCard = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (cards[a].emoji === cards[b].emoji) {
        const newMatched = [...matched, a, b];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === cards.length) {
          setGameWon(true);
          api.post('/games/session/', { game_name: 'Memory Match', score: Math.max(100 - moves * 3, 10) }).catch(() => {});
          toast.success('🎉 Excellent! You matched all pairs!');
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  if (!gameStarted) {
    return (
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
          <Grid3X3 className="w-10 h-10" style={{ color: '#a78bfa' }} />
        </div>
        <h2 className="text-3xl font-black mb-2">Memory Match</h2>
        <p className="text-sm mb-8 text-muted">Flip cards to find matching pairs. Test your memory!</p>
        <button onClick={startGame} className="btn-primary !px-10">Start Game</button>
        <button onClick={onBack} className="block mx-auto mt-4 text-sm text-muted">Back to gallery</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted"><ArrowLeft size={16} /> Back</button>
        <div className="flex items-center gap-5 text-sm">
          <span>Moves: <strong>{moves}</strong></span>
          <span>Matched: <strong>{matched.length / 2}</strong></span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => flipCard(card.id)}
            className={`aspect-square rounded-2xl text-2xl flex items-center justify-center transition-all ${matched.includes(card.id) || flipped.includes(card.id) ? 'bg-primary text-white' : 'bg-surface-2'}`}
          >
            {matched.includes(card.id) || flipped.includes(card.id) ? card.emoji : '?'}
          </button>
        ))}
      </div>
    </div>
  );
}

function PatternGame({ onBack, title }) {
  const [sequence, setSequence]       = useState([]);
  const [userSequence, setUserSeq]    = useState([]);
  const [activeButton, setActiveBtn]  = useState(null);
  const [isShowing, setIsShowing]     = useState(false);
  const [level, setLevel]             = useState(1);
  const [gameState, setGameState]     = useState('idle');
  const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b'];

  const startRound = async (lvl = level) => {
    const newSeq = Array.from({ length: lvl + 2 }, () => Math.floor(Math.random() * 4));
    setSequence(newSeq); setUserSeq([]); setGameState('showing');
    setIsShowing(true);
    for (let i = 0; i < newSeq.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setActiveBtn(newSeq[i]);
      await new Promise(r => setTimeout(r, 400));
      setActiveBtn(null);
    }
    setIsShowing(false); setGameState('input');
  };

  const handlePress = (idx) => {
    if (gameState !== 'input') return;
    const newSeq = [...userSequence, idx];
    setUserSeq(newSeq); setActiveBtn(idx);
    setTimeout(() => setActiveBtn(null), 200);
    if (newSeq[newSeq.length - 1] !== sequence[newSeq.length - 1]) {
      setGameState('lost');
      api.post('/games/session/', { game_name: title, score: (level - 1) * 20 }).catch(() => {});
      toast.error(`Game over! You reached level ${level}`);
      return;
    }
    if (newSeq.length === sequence.length) {
      setGameState('won');
      toast.success(`Level ${level} complete! ✨`);
      setTimeout(() => { setLevel(l => l + 1); startRound(level + 1); }, 1000);
    }
  };

  if (gameState === 'idle') {
    return (
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.25)' }}>
          <Eye className="w-10 h-10" style={{ color: '#22d3ee' }} />
        </div>
        <h2 className="text-3xl font-black mb-2">{title}</h2>
        <p className="text-sm mb-8 text-muted">Watch the sequence, then repeat it back.</p>
        <button onClick={() => startRound(1)} className="btn-primary !px-10">Start Game</button>
        <button onClick={onBack} className="block mx-auto mt-4 text-sm text-muted">Back</button>
      </div>
    );
  }

  return (
    <div className="text-center">
        <h3 className="text-xl font-black mb-8">Level {level}</h3>
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {colors.map((c, i) => (
                <button 
                    key={i} 
                    onClick={() => handlePress(i)}
                    disabled={isShowing}
                    className="aspect-square rounded-3xl border-4 transition-all"
                    style={{ background: activeButton === i ? c : 'transparent', borderColor: c }}
                />
            ))}
        </div>
    </div>
  );
}

function SlidingPuzzle({ onBack, title }) {
    const [tiles, setTiles] = useState([]); // Array of 0-8, 8 is the empty slot
    const [gameState, setGameState] = useState('idle');
    const [moves, setMoves] = useState(0);
    const imgUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80";

    const shuffle = () => {
        let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        let currentTiles = [...arr];
        let emptyIdx = 8;
        
        // Perfrom 200 random valid moves to shuffle thoroughly
        for (let i = 0; i < 200; i++) {
            const neighbors = getNeighbors(emptyIdx);
            const moveIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            // Swap empty slot with neighbor
            [currentTiles[emptyIdx], currentTiles[moveIdx]] = [currentTiles[moveIdx], currentTiles[emptyIdx]];
            emptyIdx = moveIdx;
        }

        setTiles(currentTiles);
        setMoves(0);
        setGameState('playing');
    };

    const getNeighbors = (idx) => {
        const neighbors = [];
        if (idx % 3 > 0) neighbors.push(idx - 1); // Left
        if (idx % 3 < 2) neighbors.push(idx + 1); // Right
        if (idx >= 3) neighbors.push(idx - 3);    // Up
        if (idx < 6) neighbors.push(idx + 3);     // Down
        return neighbors;
    };

    const handleTileClick = (idx) => {
        if (gameState !== 'playing') return;
        const emptyIdx = tiles.indexOf(8);
        const neighbors = getNeighbors(idx);
        if (neighbors.includes(emptyIdx)) {
            const newTiles = [...tiles];
            [newTiles[idx], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[idx]];
            setTiles(newTiles);
            setMoves(m => m + 1);
            if (checkWin(newTiles)) {
                setGameState('won');
                api.post('/games/session/', { game_name: title, score: Math.max(100 - moves, 20) }).catch(() => {});
            }
        }
    };

    const checkWin = (current) => {
        return current.every((val, i) => val === i);
    };

    if (gameState === 'idle') {
        return (
            <div className="text-center py-8">
                <div className="w-24 h-24 rounded-3xl overflow-hidden mx-auto mb-6 shadow-xl border-4 border-white">
                    <img src={imgUrl} className="w-full h-full object-cover" alt="Puzzle Preview" />
                </div>
                <h2 className="text-3xl font-black mb-4">Visual Reconstruction</h2>
                <p className="text-muted mb-8">Arrange the scattered pieces to restore the peaceful landscape. Trains spatial reasoning.</p>
                <button onClick={shuffle} className="btn-primary !px-12">Start Puzzle</button>
                <button onClick={onBack} className="block mx-auto mt-4 text-xs font-bold text-muted">Back</button>
            </div>
        );
    }

    return (
        <div className="text-center">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-lg font-bold tracking-tight">Restoration</h3>
                    <p className="text-[10px] text-muted font-black uppercase tracking-widest">{moves} Moves</p>
                 </div>
                 <button onClick={onBack} className="text-muted text-xs">Exit</button>
            </div>

            <div className="grid grid-cols-3 gap-1 relative mx-auto" style={{ width: '300px', height: '300px' }}>
                {tiles.map((tile, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleTileClick(idx)}
                        className={`w-full h-full cursor-pointer transition-all duration-300 rounded-sm ${tile === 8 ? 'bg-transparent' : 'shadow-md border border-white/20'}`}
                        style={tile === 8 ? {} : {
                            backgroundImage: `url(${imgUrl})`,
                            backgroundSize: '300px 300px',
                            backgroundPosition: `${-(tile % 3) * 100}px ${-Math.floor(tile / 3) * 100}px`
                        }}
                    >
                        {gameState === 'won' && tile === 8 && (
                             <div className="w-full h-full" style={{ backgroundImage: `url(${imgUrl})`, backgroundSize: '300px 300px', backgroundPosition: '-200px -200px' }} />
                        )}
                    </div>
                ))}
            </div>

            {gameState === 'won' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                    <h2 className="text-2xl font-black text-green-600 mb-4">Landscape Restored! ✨</h2>
                    <button onClick={onBack} className="btn-primary !px-10">Done</button>
                </motion.div>
            )}
        </div>
    );
}

function LogicPuzzle({ onBack, title }) {
    const [numbers, setNumbers] = useState([]);
    const [nextExpected, setNextExpected] = useState(1);
    const [gameState, setGameState] = useState('idle');
    const [startTime, setStartTime] = useState(null);

    const start = () => {
        const arr = Array.from({ length: 12 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
        setNumbers(arr);
        setNextExpected(1);
        setGameState('playing');
        setStartTime(Date.now());
    };

    const handleClick = (n) => {
        if (n === nextExpected) {
            setNextExpected(n + 1);
            if (n === 12) {
                const time = (Date.now() - startTime) / 1000;
                setGameState('won');
                api.post('/games/session/', { game_name: title, score: Math.max(100 - time, 10) }).catch(() => {});
            }
        } else {
            toast.error("Find the next number in order!");
        }
    };

    if (gameState === 'idle') {
        return (
            <div className="text-center py-8">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Grid3X3 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-black mb-4">{title}</h2>
                <p className="text-muted mb-8">Tap all numbers from 1 to 12 as fast as you can. Train your visual logic.</p>
                <button onClick={start} className="btn-primary !px-12">Start Training</button>
                <button onClick={onBack} className="block mx-auto mt-4 text-xs font-bold text-muted">Back</button>
            </div>
        );
    }

    return (
        <div className="text-center">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold">Target: <span className="text-primary text-2xl">{nextExpected}</span></h3>
                <button onClick={onBack} className="text-muted text-xs hover:text-primary">Exit</button>
            </div>
            
            {gameState === 'won' ? (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <Star className="text-green-600 w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black mb-6">Training Complete!</h2>
                    <button onClick={onBack} className="btn-primary !px-10">Done</button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-4 gap-3">
                    {numbers.map(n => (
                        <button
                            key={n}
                            onClick={() => handleClick(n)}
                            disabled={n < nextExpected}
                            className={`aspect-square rounded-2xl font-black text-xl transition-all border-2 ${n < nextExpected ? 'bg-green-50 border-green-200 text-green-200 opacity-50' : 'bg-white border-primary/10 text-primary hover:border-primary shadow-sm'}`}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ZenBreath({ onBack, title }) {
    const [phase, setPhase] = useState('Breathe In');
    const [timer, setTimer] = useState(4);
    const [isActive, setIsActive] = useState(false);
    const [rounds, setRounds] = useState(0);

    useEffect(() => {
        let interval;
        if (isActive) {
            interval = setInterval(() => {
                setTimer(t => {
                    if (t === 1) {
                        if (phase === 'Breathe In') { setPhase('Hold'); return 4; }
                        if (phase === 'Hold') { setPhase('Breathe Out'); return 4; }
                        if (phase === 'Breathe Out') { 
                            setRounds(r => r + 1);
                            if (rounds >= 3) {
                                setIsActive(false);
                                api.post('/games/session/', { game_name: title, score: 95 }).catch(() => {});
                                toast.success("Calmness Restored.");
                                return 0;
                            }
                            setPhase('Breathe In'); 
                            return 4; 
                        }
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, phase, rounds]);

    if (!isActive && rounds < 4) {
        return (
            <div className="text-center py-8">
                 <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-black mb-4">{title}</h2>
                <p className="text-muted mb-8">Four rounds of boxed breathing to regulate your nervous system.</p>
                <button onClick={() => setIsActive(true)} className="btn-primary !px-12">Begin Inhale</button>
                <button onClick={onBack} className="block mx-auto mt-4 text-xs font-bold text-muted">Back</button>
            </div>
        );
    }

    return (
        <div className="text-center py-12">
            {rounds >= 4 ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <Activity className="text-green-600 w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black mb-6">Nervous System Regulated</h2>
                    <button onClick={onBack} className="btn-primary !px-10">Return home</button>
                </motion.div>
            ) : (
                <>
                    <motion.div 
                        animate={{ scale: phase === 'Breathe In' ? 1.5 : phase === 'Breathe Out' ? 1 : 1.5 }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                        className="w-48 h-48 rounded-full bg-primary/5 border-4 border-primary/20 flex items-center justify-center mx-auto mb-10 relative"
                    >
                        <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-ping opacity-20" />
                        <span className="text-4xl font-black text-primary">{timer}</span>
                    </motion.div>
                    <h2 className="text-3xl font-black tracking-tight mb-2">{phase}</h2>
                    <p className="text-muted font-bold tracking-widest uppercase text-[10px]">Round {rounds + 1} of 4</p>
                </>
            )}
        </div>
    );
}

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */

export default function BrainTraining() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data } = await api.get('/games/recommended/');
      setGames(data);
    } catch (err) {
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
        case 'memory': return <Grid3X3 className="w-8 h-8" />;
        case 'focus': return <Brain className="w-8 h-8" />;
        case 'reaction': return <Zap className="w-8 h-8" />;
        case 'calming': return <Activity className="w-8 h-8" />;
        default: return <Sparkles className="w-8 h-8" />;
    }
  };

  const getColorForGame = (index) => {
    const colors = ['#f5f1e8', '#e7f0fd', '#f0f7ed', '#f2eff8', '#fdf2ed'];
    return colors[index % colors.length];
  };

  const renderGame = () => {
    if (!activeGame) return null;
    const g = activeGame;
    if (g.name.includes('Memory') || g.name.includes('Sequence')) return <MemoryMatch onBack={() => setActiveGame(null)} />;
    if (g.name.includes('Pattern') || g.name.includes('Chaos')) return <PatternGame title={g.name} onBack={() => setActiveGame(null)} />;
    // User specifically wants the picture puzzle to show up for "Logic Puzzle"
    if (g.name.includes('Puzzle') || g.name.includes('Visual')) return <SlidingPuzzle title={g.name} onBack={() => setActiveGame(null)} />;
    if (g.name.includes('Logic')) return <LogicPuzzle title={g.name} onBack={() => setActiveGame(null)} />;
    if (g.name.includes('Zen') || g.name.includes('Breath') || g.name.includes('Flow')) return <ZenBreath title={g.name} onBack={() => setActiveGame(null)} />;
    
    // Fallback
    return <SlidingPuzzle title={g.name} onBack={() => setActiveGame(null)} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-7xl mx-auto px-6 py-12">
      <AnimatePresence mode="wait">
        {activeGame ? (
          <motion.div
            key="active-game"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card !p-12 max-w-3xl mx-auto shadow-2xl border-none"
          >
            {renderGame()}
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <header className="mb-20 text-center">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 badge badge-primary mb-6 px-4 py-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent-green" />
                  <span className="text-[10px] tracking-[0.15em] font-black">Cognitive Sanctuary</span>
                </motion.div>
                <h1 className="text-6xl md:text-7xl font-serif font-black mb-6">
                  Precision <span className="italic font-normal opacity-60">Training.</span>
                </h1>
                <p className="text-lg opacity-60 max-w-2xl mx-auto font-light leading-relaxed mb-8">
                  AI-curated exercises designed specifically for your neuro-profile. 
                  Gentle daily practice strengthens neuroplastic paths.
                </p>
                <div className="flex justify-center gap-12 border-y border-border-base py-6 max-w-xl mx-auto">
                   <div className="text-center">
                      <div className="text-2xl font-black">12</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted">Sessions</div>
                   </div>
                   <div className="text-center">
                      <div className="text-2xl font-black text-accent-green">89.4</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted">Focus Score</div>
                   </div>
                   <div className="text-center">
                      <div className="text-2xl font-black text-accent-primary">92%</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted">Recall Rate</div>
                   </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {games.map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative cursor-pointer"
                  onClick={() => setActiveGame(game)}
                >
                    <div className="glass-card !p-10 h-full flex flex-col items-start transition-all duration-500 group-hover:shadow-2xl border-none">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-tan/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent-tan/10 transition-colors" />
                        
                        <div 
                            className="w-16 h-16 rounded-[22px] flex items-center justify-center mb-10 transition-transform duration-500 group-hover:scale-110 relative z-10"
                            style={{ background: i % 2 === 0 ? 'var(--accent-tan)' : 'var(--accent-green-light)' }}
                        >
                            <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                              {getIconForType(game.type)}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary">{game.type}</span>
                            <div className="w-1 h-1 rounded-full bg-border-base" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary">Lvl {game.difficulty_level}</span>
                        </div>

                        <h3 className="text-2xl font-serif font-black mb-4 group-hover:translate-x-1 transition-transform relative z-10">
                            {game.name}
                        </h3>
                        <p className="text-sm opacity-60 leading-relaxed mb-10 font-light relative z-10">
                            {game.description || "A targeted cognitive exercise tailored by AI for your condition."}
                        </p>

                        <div className="mt-auto w-full pt-8 border-t border-border-base flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-2 text-accent-primary">
                                <Clock size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">~4 MIN</span>
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                                Begin <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
