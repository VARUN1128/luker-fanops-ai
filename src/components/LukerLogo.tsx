import React, { useState } from 'react';

interface LukerLogoProps {
  className?: string;
  showTextFallbackAlways?: boolean;
  variant?: 'light' | 'dark';
}

export const LukerLogo: React.FC<LukerLogoProps> = ({
  className = 'h-8',
  variant = 'light'
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    // Official fallback specified by prompt: LUKER | FanOps AI
    return (
      <div className={`flex items-center gap-2 font-bold tracking-tight select-none ${className}`}>
        <span className="text-xl font-black text-[#D32F2F] tracking-wider">LUKER</span>
        <span className="text-sm font-light text-gray-300">|</span>
        <span className={`text-sm font-semibold ${variant === 'dark' ? 'text-gray-900' : 'text-white'}`}>
          FanOps AI
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/luker-logo.svg"
        alt="Luker Genuine Brand Logo"
        className={`${className} object-contain transition-opacity duration-200`}
        onError={() => setImageFailed(true)}
      />
    </div>
  );
};
