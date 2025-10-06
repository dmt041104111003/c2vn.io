import React from 'react';

interface LogoProps {
  className?: string;
  compact?: boolean; 
  showText?: boolean;
}

export default function Logo({ className = '', compact = false, showText = true }: LogoProps) {
  if (compact) {
    return (
      <img
        src="/images/common/loading.png"
        className={className || 'h-8 w-auto'}
        alt="Cardano2VN Logo"
        draggable={false}
      />
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="relative w-48 h-48 mx-auto mb-8">
        <img
          src="/images/common/loading.png"
          className="w-full h-full object-contain"
          alt="Cardano2VN Logo"
          draggable={false}
        />
      </div>
      {showText && (
        <>
          <div className="text-[32px] font-bold text-[#003C8C] dark:text-[#00A3FF] mb-2">CARDANO2VN.IO</div>
          <div className="text-xl text-[#666666] dark:text-gray-400 tracking-[0.2em] uppercase">BREAK THE BLOCKS</div>
        </>
      )}
    </div>
  );
}


