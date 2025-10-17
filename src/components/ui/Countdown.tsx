"use client";

import React from "react";

type Props = {
  seconds: number;
  warningThreshold?: number; 
};

export default function Countdown({ seconds, warningThreshold = 30 }: Props) {
  const mm = String(Math.floor(Math.max(0, seconds) / 60)).padStart(2, '0');
  const ss = String(Math.max(0, seconds) % 60).padStart(2, '0');
  const warn = seconds <= warningThreshold;
  const lastMinute = seconds <= 60;
  return (
    <>
      <span
        className={
          `relative inline-flex items-center justify-center text-sm font-semibold tabular-nums px-2 py-1 rounded ` +
          (lastMinute
            ? 'bg-red-600 text-white dark:bg-red-600 dark:text-white ring-2 ring-red-400 shadow-md shadow-red-500/60 countdown-shake animate-pulse '
            : warn
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200 '
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 ')
        }
      >
        {(lastMinute || warn) && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
        )}
        <span className="relative z-10">{mm}:{ss}</span>
      </span>
      <style jsx>{`
        @keyframes countdown-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }
        .countdown-shake { animation: countdown-shake 0.6s ease-in-out infinite; }
      `}</style>
    </>
  );
}


