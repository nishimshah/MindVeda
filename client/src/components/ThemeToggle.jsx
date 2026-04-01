import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const THEME_CONFIG = {
  light: { label: 'Light', icon: Sun,  emoji: null, offset: 4 },
  dark:  { label: 'Dark',  icon: Moon, emoji: null, offset: 28 },
  calm:  { label: 'Calm',  icon: null, emoji: '🍃',  offset: 52 },
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      title="Switch theme"
      className="relative flex items-center"
      style={{
        padding: '4px',
        borderRadius: '100px',
        border: '1px solid var(--border-base)',
        background: 'var(--bg-surface-1)',
        gap: 0,
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {/* Sliding indicator pill */}
      <motion.div
        className="absolute top-1"
        style={{
          height: '24px',
          width: '24px',
          borderRadius: '100px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-active)',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 0,
        }}
        animate={{ left: THEME_CONFIG[theme].offset }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />

      {/* Buttons */}
      {Object.entries(THEME_CONFIG).map(([key, cfg]) => {
        const active = theme === key;
        return (
          <motion.button
            key={key}
            onClick={() => setTheme(key)}
            whileTap={{ scale: 0.9 }}
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '100px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              opacity: active ? 1 : 0.5,
              fontSize: '0.8rem',
            }}
            title={cfg.label}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`${key}-${active}`}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {cfg.emoji ? (
                  <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>{cfg.emoji}</span>
                ) : (
                  <cfg.icon
                    style={{
                      width: '12px',
                      height: '12px',
                      color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                      strokeWidth: 2.5,
                    }}
                  />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
