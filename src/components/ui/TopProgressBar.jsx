import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ⚡ TopProgressBar Component
 * Renders a sleek crimson/gold animated top bar whenever the route pathname shifts.
 */
export function TopProgressBar() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Trigger top progress animation on path changes
    setLoading(true);
    setProgress(30);

    const timer1 = setTimeout(() => {
      setProgress(75);
    }, 100);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 300);

    const timer3 = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname, location.search]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[10000] pointer-events-none">
      <div
        className="h-1 bg-gradient-to-r from-[#CC033B] via-[#f8c62c] to-[#CC033B] transition-all duration-300 ease-out shadow-[0_0_12px_#CC033B]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}

export default TopProgressBar;
