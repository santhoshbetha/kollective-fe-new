import React from 'react';

/**
 * ⚡ KollectiveSpinner Component
 * Premium branded loader with dual rotating glowing rings, pulsing thunder emblem, and dynamic state text.
 * 
 * Variants:
 * - 'fullscreen': Full screen overlay for app hydration, route transitions, login/logout.
 * - 'overlay': Semi-transparent backdrop overlay for active async mutations.
 * - 'page': Centered within a page content view.
 * - 'inline': Compact spinner for cards, buttons, or inline feeds.
 */
export function KollectiveSpinner({
  variant = 'page',
  size = 'md',
  text = 'Loading...',
  showText = true,
  className = ''
}) {
  // Size mapping metrics
  const sizeMap = {
    sm: { outer: 'w-8 h-8 border-2', inner: 'w-5 h-5 border-2', logo: 'h-3.5', text: 'text-xs' },
    md: { outer: 'w-14 h-14 border-3', inner: 'w-9 h-9 border-2', logo: 'h-6', text: 'text-sm' },
    lg: { outer: 'w-20 h-20 border-4', inner: 'w-12 h-12 border-3', logo: 'h-8', text: 'text-base' },
    xl: { outer: 'w-28 h-28 border-4', inner: 'w-16 h-16 border-3', logo: 'h-11', text: 'text-lg' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const spinnerGraphic = (
    <div className="relative flex items-center justify-center select-none">
      {/* Ambient Crimson Aura Glow */}
      <div className="absolute w-24 h-24 bg-[#CC033B]/25 rounded-full blur-2xl animate-pulse pointer-events-none" />

      {/* Outer Crimson Rotating Ring */}
      <div
        className={`${currentSize.outer} rounded-full border-t-[#CC033B] border-r-[#CC033B] border-b-transparent border-l-transparent animate-spin`}
        style={{ animationDuration: '0.95s' }}
      />

      {/* Inner Gold Rotating Ring (Reverse Spin) */}
      <div
        className={`absolute ${currentSize.inner} rounded-full border-b-[#f8c62c] border-l-[#f8c62c] border-t-transparent border-r-transparent animate-spin`}
        style={{ animationDirection: 'reverse', animationDuration: '1.4s' }}
      />

      {/* Center Kollective Thunderbolt Logo Emblem */}
      <div className="absolute flex items-center justify-center animate-pulse" style={{ animationDuration: '1.8s' }}>
        <img
          src="/KThunder.png"
          alt="Kollective Loading"
          className={`${currentSize.logo} w-auto object-contain drop-shadow-[0_0_12px_rgba(204,3,59,0.8)]`}
          onError={(e) => {
            // Fallback SVG bolt if image fails
            e.target.style.display = 'none';
          }}
        />
      </div>
    </div>
  );

  const textContent = showText && text && (
    <div className="flex flex-col items-center gap-1">
      <p className={`${currentSize.text} font-bold text-text-primary tracking-wide font-sans flex items-center gap-1.5`}>
        <span>{text}</span>
        <span className="flex items-center gap-0.5 ml-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CC033B] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#f8c62c] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#CC033B] animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </p>
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#060a0d] text-text-primary backdrop-blur-xl animate-in fade-in duration-300 ${className}`}>
        <div className="glass-panel p-10 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full mx-4 text-center">
          {spinnerGraphic}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold bg-[#CC033B] bg-clip-text text-transparent" style={{ fontFamily: "Protest Riot, sans-serif" }}>
              Kollective
            </span>
            {textContent}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200 ${className}`}>
        <div className="p-8 rounded-2xl bg-[#10161d] border border-white/10 shadow-2xl flex flex-col items-center gap-5 max-w-xs text-center">
          {spinnerGraphic}
          {textContent}
        </div>
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className={`w-full py-16 px-4 flex flex-col items-center justify-center gap-5 text-center ${className}`}>
        {spinnerGraphic}
        {textContent}
      </div>
    );
  }

  // Inline variant
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {spinnerGraphic}
      {showText && <span className={`${currentSize.text} font-semibold text-text-secondary`}>{text}</span>}
    </div>
  );
}

export default KollectiveSpinner;
