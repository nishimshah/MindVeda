import { motion } from 'framer-motion';

/* Animated floating orbs — used on landing/auth backgrounds */
export default function AnimatedBackground({ variant = 'default' }) {
  const orbs = {
    default: [
      { cls: 'orb orb-purple orb-drift', size: 600, top: '-15%', left: '-10%', delay: 0 },
      { cls: 'orb orb-teal orb-drift',   size: 500, top: '50%',  right: '-10%', delay: -4 },
      { cls: 'orb orb-pink orb-drift',   size: 350, bottom: '5%',left: '30%',   delay: -7 },
    ],
    auth: [
      { cls: 'orb orb-purple orb-drift', size: 700, top: '-20%', left: '-15%',  delay: 0 },
      { cls: 'orb orb-teal orb-drift',   size: 450, top: '40%',  right: '-12%', delay: -3 },
      { cls: 'orb orb-blue orb-drift',   size: 300, bottom: '0', left: '20%',   delay: -6 },
    ],
    hero: [
      { cls: 'orb orb-purple orb-drift', size: 800, top: '-25%', left: '-15%',  delay: 0 },
      { cls: 'orb orb-teal orb-drift',   size: 600, top: '20%',  right: '-20%', delay: -5 },
      { cls: 'orb orb-pink orb-drift',   size: 400, bottom: '5%',left: '25%',   delay: -9 },
      { cls: 'orb orb-blue orb-drift',   size: 350, top: '60%',  left: '50%',   delay: -3 },
    ],
  };

  const selected = orbs[variant] || orbs.default;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {selected.map((orb, i) => (
        <div
          key={i}
          className={orb.cls}
          style={{
            width:  orb.size,
            height: orb.size,
            top:    orb.top,
            left:   orb.left,
            right:  orb.right,
            bottom: orb.bottom,
            animationDelay: `${orb.delay}s`,
            opacity: 'var(--orb-opacity)',
          }}
        />
      ))}
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
