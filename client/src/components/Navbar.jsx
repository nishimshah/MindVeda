import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

const navLinks = [
  { path: '/dashboard',  label: 'Home' },
  { path: '/train',      label: 'Training' },
  { path: '/chat',       label: 'AI Chat' },
  { path: '/progress',   label: 'Progress' },
  { path: '/calm',       label: 'Calm Zone' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); setShowUserMenu(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return null;

  // Initials avatar
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(28px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
          borderBottom: '1px solid var(--nav-border)',
          boxShadow: scrolled ? 'var(--shadow-lg)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-[62px]">

            {/* ── Logo ── */}
            <Link to="/dashboard" className="flex items-center gap-2.5 no-underline group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center relative shadow-sm"
                style={{
                  background: 'var(--accent-primary)',
                }}
              >
                <Logo className="w-5 h-5 text-white" color="#fff" />
              </div>
              <span
                className="font-heading font-bold text-lg hidden sm:block"
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  color: 'var(--text-primary)',
                }}
              >
                MindVeda
              </span>
            </Link>

            {/* ── Desktop Nav Pills ── */}
            <div
              className="hidden md:flex items-center gap-1 px-1.5 py-1.5 rounded-2xl"
              style={{
                background: 'var(--bg-surface-1)',
                border: '1px solid var(--border-base)',
              }}
            >
              {navLinks.map(link => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="relative px-4 py-1.5 rounded-xl text-sm font-medium no-underline transition-colors duration-200"
                    style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: 'var(--accent-p-glow)', border: '1px solid var(--accent-primary)' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* ── Right Side ── */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              
              {/* User avatar */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl cursor-pointer border-none transition-all duration-200 group"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: 'var(--accent-primary)',
                      color: '#fff',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm font-medium" style={{ color: 'var(--text-secondary)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden"
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-base)',
                        boxShadow: 'var(--shadow-xl)',
                        backdropFilter: 'blur(20px)',
                      }}
                    >
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-3 text-sm no-underline transition-colors hover:bg-white/5"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'var(--accent-primary)', color: '#fff' }}
                        >
                          {initials}
                        </div>
                        Profile
                      </Link>
                      <div style={{ height: '1px', background: 'var(--border-base)', margin: '0 12px' }} />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm cursor-pointer border-none text-left transition-colors hover:bg-white/5"
                        style={{ background: 'transparent', color: '#ef4444' }}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ba3cc' }}
              >
                {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="md:hidden overflow-hidden"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}
            >
              <div className="px-5 py-4 space-y-1">
                <div className="flex items-center justify-between mb-4 px-4 py-2 rounded-xl" style={{ border: '1px solid var(--border-base)', background: 'var(--bg-surface-1)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Appearance</span>
                  <ThemeToggle />
                </div>
                {navLinks.map(link => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="flex items-center px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all"
                      style={{
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        background: isActive ? 'var(--accent-p-glow)' : 'transparent',
                        border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer border-none text-left transition-colors mt-2"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}
