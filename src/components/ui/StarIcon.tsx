"use client";

interface StarIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function StarIcon({ className = "", size = "md" }: StarIconProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <defs>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a5f3fc" stopOpacity="1" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <circle cx="20" cy="20" r="10" fill="url(#starGlow)" opacity="0.7" />

        <path
          d="M20 8 L22.5 17.5 L32 20 L22.5 22.5 L20 32 L17.5 22.5 L8 20 L17.5 17.5 Z"
          fill="#e0f2fe"
          className="animate-[spark_2s_ease-in-out_infinite]"
        />

        <path
          d="M20 5 L20 35 M5 20 L35 20"
          stroke="#7dd3fc"
          strokeWidth="0.3"
          opacity="0.3"
        />
      </svg>

      <style jsx>{`
        @keyframes spark {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.15) rotate(10deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
