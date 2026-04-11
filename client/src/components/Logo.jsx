import React from 'react';

/**
 * MindVeda Logo Asset
 * Renders the pure brand image without and containers or backgrounds.
 * Managed by parent containers for sizing.
 */
export default function Logo({ className = "w-full h-full" }) {
  return (
    <img 
      src="/logo.png" 
      alt="MindVeda Logo" 
      className={`object-contain ${className}`}
      style={{ display: 'block' }}
    />
  );
}
