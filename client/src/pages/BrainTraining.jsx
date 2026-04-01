import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Grid3X3, Zap, Eye, ArrowLeft, Trophy, RotateCcw, Star } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

/* ─────────────────────── MEMORY MATCH ─────────────────────── */
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
          api.post('/progress', { activity_type: 'brain_training', game_name: 'Memory Match', score: Math.max(100 - moves * 3, 10), difficulty: 4 }).catch(() => {});
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
        <h2 className="text-3xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>Memory Match</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Flip cards to find matching pairs. Test your memory!</p>
        <button onClick={startGame} className="btn-primary !px-10">
          Start Game
        </button>
        <button onClick={onBack} className="block mx-auto mt-4 text-sm cursor-pointer bg-transparent border-none flex items-center gap-1.5 justify-center" style={{ color: '#596080' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to games
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm cursor-pointer bg-transparent border-none" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-5 text-sm">
          <span style={{ color: 'var(--text-muted)' }}>Moves: <strong style={{ color: 'var(--text-primary)' }}>{moves}</strong></span>
          <span style={{ color: 'var(--text-muted)' }}>Pairs: <strong style={{ color: 'var(--accent-green)' }}>{matched.length / 2}/{cards.length / 2}</strong></span>
        </div>
        <button onClick={startGame} className="flex items-center gap-1.5 text-sm cursor-pointer bg-transparent border-none" style={{ color: '#a78bfa' }}>
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {gameWon && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-6 p-5 rounded-2xl"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: '#10b981' }} />
          <p className="font-black text-lg" style={{ fontFamily: 'Outfit, sans-serif', color: '#10b981' }}>
            Completed in {moves} moves! 🎉
          </p>
        </motion.div>
      )}

      {/* Card grid */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)', maxWidth: '420px', margin: '0 auto' }}>
        {cards.map(card => {
          const isFlipped  = flipped.includes(card.id);
          const isMatched  = matched.includes(card.id);
          const isRevealed = isFlipped || isMatched;
          return (
            <motion.button
              key={card.id}
              onClick={() => flipCard(card.id)}
              whileTap={{ scale: 0.93 }}
              className="aspect-square rounded-2xl text-3xl flex items-center justify-center cursor-pointer border-2 transition-all font-medium"
              style={{
                background:  isMatched ? 'rgba(16,185,129,0.12)' : isFlipped ? 'var(--accent-p-glow)' : 'var(--bg-surface-1)',
                borderColor: isMatched ? 'var(--accent-green)' : isFlipped ? 'var(--accent-primary)' : 'var(--border-base)',
                boxShadow:   isMatched ? '0 0 20px rgba(16,185,129,0.2)' : isFlipped ? '0 0 20px var(--accent-p-glow)' : 'none',
                fontSize:    isRevealed ? '1.75rem' : '1.2rem',
                color:       isRevealed ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {isRevealed ? card.emoji : '?'}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────── PATTERN GAME ─────────────────────── */
function PatternGame({ onBack }) {
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
      api.post('/progress', { activity_type: 'brain_training', game_name: 'Pattern Recognition', score: (level - 1) * 20, difficulty: level }).catch(() => {});
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
        <h2 className="text-3xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>Pattern Recognition</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Watch the sequence light up, then repeat it back.</p>
        <button onClick={() => startRound(1)} className="btn-primary !px-10">Start Game</button>
        <button onClick={onBack} className="block mx-auto mt-4 text-sm cursor-pointer bg-transparent border-none flex items-center gap-1.5 justify-center" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to games
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => { setGameState('idle'); setLevel(1); }} className="flex items-center gap-1.5 text-sm cursor-pointer bg-transparent border-none" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />
          <span className="font-black text-lg" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>Level {level}</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <span
          className="text-sm font-semibold px-4 py-1.5 rounded-full"
          style={{
            background: isShowing ? 'rgba(6,182,212,0.15)' : gameState === 'input' ? 'rgba(124,58,237,0.15)' : 'rgba(239,68,68,0.12)',
            color:      isShowing ? '#22d3ee' : gameState === 'input' ? '#a78bfa' : '#f87171',
            border:     '1px solid currentColor',
          }}
        >
          {isShowing ? '👀 Watch carefully...' : gameState === 'input' ? `Repeat the pattern (${userSequence.length}/${sequence.length})` : gameState === 'lost' ? '💔 Wrong! Try again' : '✅ Next level...'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-5 max-w-xs mx-auto">
        {colors.map((color, i) => (
          <motion.button
            key={i}
            onClick={() => handlePress(i)}
            whileTap={{ scale: 0.88 }}
            className="aspect-square rounded-3xl border-2 cursor-pointer transition-all"
            style={{
              background:  activeButton === i ? color : `${color}20`,
              borderColor: activeButton === i ? color : `${color}40`,
              boxShadow:   activeButton === i ? `0 0 40px ${color}60, 0 0 80px ${color}20` : 'none',
            }}
            disabled={isShowing || gameState === 'lost'}
          />
        ))}
      </div>

      {gameState === 'lost' && (
        <div className="text-center mt-8">
          <button onClick={() => { setLevel(1); startRound(1); }} className="btn-primary !px-8">
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── REACTION TEST ─────────────────────── */
function ReactionTest({ onBack }) {
  const [gameState, setGameState]     = useState('idle');
  const [startTime, setStartTime]     = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime]       = useState(Infinity);
  const [attempts, setAttempts]       = useState([]);

  const startTest = () => {
    setGameState('waiting');
    const delay = 1500 + Math.random() * 3000;
    setTimeout(() => { setStartTime(Date.now()); setGameState('ready'); }, delay);
  };

  const handleClick = () => {
    if (gameState === 'waiting') { setGameState('idle'); toast.error('Too early! Wait for the green signal.'); return; }
    if (gameState === 'ready') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setAttempts(p => [...p, time]);
      if (time < bestTime) setBestTime(time);
      setGameState('result');
      api.post('/progress', { activity_type: 'brain_training', game_name: 'Reaction Test', score: Math.max(500 - time, 10), difficulty: 1 }).catch(() => {});
    }
  };

  const getRatingText = (t) => {
    if (t < 200) return { label: 'Superhuman!', color: '#10b981' };
    if (t < 300) return { label: 'Lightning fast!', color: '#06b6d4' };
    if (t < 450) return { label: 'Great reflexes!', color: '#7c3aed' };
    return { label: 'Keep practicing!', color: '#f59e0b' };
  };

  if (gameState === 'idle') {
    return (
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <Zap className="w-10 h-10" style={{ color: '#fbbf24' }} />
        </div>
        <h2 className="text-3xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>Reaction Test</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Click the moment the screen turns green!</p>
        {attempts.length > 0 && (
          <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Your best: <strong style={{ color: 'var(--accent-amber)' }}>{bestTime}ms</strong> · {attempts.length} attempt{attempts.length > 1 ? 's' : ''}</p>
        )}
        <button onClick={startTest} className="btn-primary !px-10">Start Test</button>
        <button onClick={onBack} className="block mx-auto mt-4 text-sm cursor-pointer bg-transparent border-none flex items-center gap-1.5 justify-center" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to games
        </button>
      </div>
    );
  }

  const bgColors = {
    waiting: 'rgba(239,68,68,0.1)',
    ready:   'rgba(16,185,129,0.12)',
    result:  'rgba(124,58,237,0.08)',
  };
  const borderColors = { waiting: '#ef444430', ready: '#10b98130', result: '#7c3aed30' };
  const rating = gameState === 'result' ? getRatingText(reactionTime) : null;

  return (
    <div>
      <button onClick={() => setGameState('idle')} className="flex items-center gap-1.5 text-sm cursor-pointer bg-transparent border-none mb-6" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div
        onClick={handleClick}
        className="rounded-3xl flex items-center justify-center cursor-pointer text-center p-8 min-h-64 select-none transition-all duration-500"
        style={{ background: bgColors[gameState], border: `2px solid ${borderColors[gameState]}` }}
        whileTap={{ scale: 0.98 }}
      >
        {gameState === 'waiting' && (
          <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1, repeat: Infinity }}>
            <div className="text-5xl mb-3">🔴</div>
            <p className="text-xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: '#f87171' }}>Wait for it...</p>
            <p className="text-sm mt-2" style={{ color: '#ef4444' }}>Don't click yet!</p>
          </motion.div>
        )}
        {gameState === 'ready' && (
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
            <div className="text-5xl mb-3">🟢</div>
            <p className="text-3xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: '#10b981' }}>CLICK NOW!</p>
          </motion.div>
        )}
        {gameState === 'result' && (
          <div>
            <div className="text-6xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: rating.color }}>
              {reactionTime}ms
            </div>
            <p className="text-xl font-semibold mb-1" style={{ color: rating.color }}>{rating.label}</p>
            {bestTime < Infinity && (
              <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Best: {bestTime}ms · Attempts: {attempts.length}</p>
            )}
            <button onClick={startTest} className="btn-primary !px-8">
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ─────────────────────── MAIN PAGE ────────────────────────── */
const games = [
  { id: 'memory',   icon: Grid3X3, title: 'Memory Match',       desc: 'Find all matching card pairs', color: '#7c3aed', glow: 'rgba(124,58,237,0.25)', tag: 'Memory' },
  { id: 'pattern',  icon: Eye,     title: 'Pattern Recognition', desc: 'Watch & repeat the light sequence', color: '#06b6d4', glow: 'rgba(6,182,212,0.2)', tag: 'Attention' },
  { id: 'reaction', icon: Zap,     title: 'Reaction Test',       desc: 'How fast can you click?', color: '#f59e0b', glow: 'rgba(245,158,11,0.2)', tag: 'Speed' },
];

export default function BrainTraining() {
  const [activeGame, setActiveGame] = useState(null);

  const renderGame = () => {
    switch (activeGame) {
      case 'memory':   return <MemoryMatch  onBack={() => setActiveGame(null)} />;
      case 'pattern':  return <PatternGame  onBack={() => setActiveGame(null)} />;
      case 'reaction': return <ReactionTest onBack={() => setActiveGame(null)} />;
      default:         return null;
    }
  };

  return (
    <div className="page-container">
      <AnimatePresence mode="wait">
        {activeGame ? (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y:  0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-8 max-w-2xl mx-auto"
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
            <div className="mb-10">
              <h1 className="section-title">Brain Training</h1>
              <p className="section-subtitle">Choose a game to exercise your mind and track your progress</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {games.map((game, i) => (
                <motion.button
                  key={game.id}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y:  0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setActiveGame(game.id)}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.97 }}
                  className="glass-card p-7 text-left cursor-pointer group border-none relative overflow-hidden"
                  style={{ transition: 'box-shadow 0.3s, border-color 0.3s, transform 0.3s' }}
                >
                  {/* Top glow accent line */}
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${game.color}60, transparent)` }} />

                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${game.color}18`, border: `1px solid ${game.color}25`, boxShadow: `0 4px 20px ${game.glow}` }}
                  >
                    <game.icon className="w-7 h-7" style={{ color: game.color }} />
                  </div>

                  <div
                    className="badge text-xs mb-4"
                    style={{ background: `${game.color}12`, border: `1px solid ${game.color}30`, color: game.color }}
                  >
                    {game.tag}
                  </div>

                  <h3 className="font-black text-xl mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
                    {game.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {game.desc}
                  </p>

                  {/* Play arrow */}
                  <div className="mt-6 flex items-center gap-1.5" style={{ color: game.color }}>
                    <span className="text-xs font-semibold">Play now</span>
                    <motion.span className="text-base" animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
