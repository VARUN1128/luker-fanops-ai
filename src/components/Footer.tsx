import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 pt-6 pb-8 border-t border-gray-200 text-xs text-gray-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-600">
          <ShieldCheck size={16} className="text-[#D32F2F]" />
          <span className="font-semibold text-gray-800">FanOps AI</span>
          <span>•</span>
          <span>Manufacturing Operations Intelligence Prototype</span>
        </div>

        <div className="text-center sm:text-right text-[11px] text-gray-500 max-w-xl">
          <p className="flex items-center justify-center sm:justify-end gap-1.5 font-medium text-gray-600">
            <Info size={12} className="text-gray-400" />
            Independent prototype inspired by publicly available Luker brand identity. Not an official Luker product. All operational data is synthetic.
          </p>
          <p className="text-[10px] text-gray-400 mt-1 font-mono">
            Designed for Luker AI Efficiency Enabler Demonstrations • High-Density Manufacturing UI
          </p>
        </div>
      </div>
    </footer>
  );
};
