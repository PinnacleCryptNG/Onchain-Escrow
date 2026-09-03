import React, { useState, useEffect } from 'react';
import { Shield, Loader2, CheckCircle2 } from 'lucide-react';

interface OpeningLoaderProps {
  onComplete: () => void;
}

export const OpeningLoader: React.FC<OpeningLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 3800; // Slower, smoother animation (~3.8 seconds)

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(100, (elapsed / duration) * 100);

      // Smooth ease-out progress curve
      const easedProgress = Math.min(
        100,
        Math.round(100 * (1 - Math.pow(1 - rawProgress / 100, 1.5)))
      );

      setProgress(easedProgress);

      if (easedProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            onComplete();
          }, 400);
        }, 300);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 select-none transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
        {/* Centered Brand Logo */}
        <div className="relative">
          <div className="absolute -inset-2 bg-emerald-500/20 rounded-3xl blur-md animate-pulse"></div>
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-950/80 border border-emerald-400/30">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
          </div>
          {progress >= 100 && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Loading Button Only */}
        <div className="w-52 sm:w-56">
          <div className="relative overflow-hidden w-full h-11 px-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2.5 shadow-2xl">
            {/* Progress fill bar inside the button */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-emerald-500/20 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
            {/* Subtle glow edge at progress front */}
            {progress > 0 && progress < 100 && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-emerald-400/70 blur-[1px] transition-all duration-75"
                style={{ left: `calc(${progress}% - 2px)` }}
              />
            )}

            {progress < 100 ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0 relative z-10" />
                <span className="relative z-10 font-medium tracking-wide">
                  Loading... {progress}%
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 relative z-10" />
                <span className="relative z-10 font-medium text-emerald-300 tracking-wide">
                  Ready
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
