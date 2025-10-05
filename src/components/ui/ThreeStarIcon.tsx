"use client";

interface ThreeStarIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function ThreeStarIcon({ className = "", size = "md" }: ThreeStarIconProps) {
  const sizeClasses = {
    sm: "w-8 h-6",
    md: "w-12 h-10", 
    lg: "w-16 h-14"
  };

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 60 50" className="w-full h-full">
        <defs>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a5f3fc" stopOpacity="1" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <g className="animate-[spark_2s_ease-in-out_infinite] [animation-delay:0s]">
          <circle cx="30" cy="10" r="7" fill="url(#starGlow)" opacity="0.8" />
          <path
            d="M30 3 L32 10 L39 12 L32 14 L30 21 L28 14 L21 12 L28 10 Z"
            fill="#e0f2fe"
          />
        </g>

        <g className="animate-[spark_2s_ease-in-out_infinite] [animation-delay:0.4s]">
          <circle cx="18" cy="30" r="6" fill="url(#starGlow)" opacity="0.6" />
          <path
            d="M18 23 L20 29 L26 30 L20 31 L18 37 L16 31 L10 30 L16 29 Z"
            fill="#e0f2fe"
          />
        </g>

        <g className="animate-[spark_2s_ease-in-out_infinite] [animation-delay:0.8s]">
          <circle cx="42" cy="30" r="6" fill="url(#starGlow)" opacity="0.6" />
          <path
            d="M42 23 L44 29 L50 30 L44 31 L42 37 L40 31 L34 30 L40 29 Z"
            fill="#e0f2fe"
          />
        </g>
      </svg>

      <style jsx>{`
        @keyframes spark {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
