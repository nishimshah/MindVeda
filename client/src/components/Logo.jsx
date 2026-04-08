import React from 'react';

/**
 * MindVeda Logo: "The Golden Neuron"
 * An abstract brain design using precise, golden-ratio geometric lines.
 */
export default function Logo({ className = "w-8 h-8", color = "currentColor" }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Central neural core */}
      <circle cx="12" cy="12" r="3" />
      
      {/* Golden ratio arcs forming brain lobes */}
      <path d="M12 9c-2.5-3-7-3-7 1.5s3 6 7 8.5" />
      <path d="M12 9c2.5-3 7-3 7 1.5s-3 6-7 8.5" />
      
      {/* Interconnecting geometric neurons */}
      <path d="M5 10.5c-1.5 0-2.5-1-2.5-2.5s1-2.5 2.5-2.5 2.5 1 2.5 2.5" />
      <path d="M19 10.5c1.5 0 2.5-1 2.5-2.5s-1-2.5-2.5-2.5-2.5 1-2.5 2.5" />
      
      {/* Connection lines */}
      <line x1="7.5" y1="8" x2="10" y2="10" />
      <line x1="16.5" y1="8" x2="14" y2="10" />
      <line x1="12" y1="15" x2="12" y2="21" />
    </svg>
  );
}
