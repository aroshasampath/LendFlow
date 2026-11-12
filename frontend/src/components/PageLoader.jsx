import React from 'react';
import { Landmark } from 'lucide-react';

/**
 * Lightweight Page Suspense Fallback Loader
 */
export const PageLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in duration-200">
      <div className="relative mb-4">
        {/* Animated pulse ring */}
        <div className="absolute inset-0 rounded-2xl bg-brand-primary/20 animate-ping" />
        
        {/* Brand Icon */}
        <div className="relative w-14 h-14 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/30">
          <Landmark className="w-7 h-7 animate-pulse" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-slate-800 text-sm tracking-tight">
          Loading Lend<span className="text-brand-primary">Flow</span>
        </h3>
        <p className="text-xs text-slate-400">
          Fetching application module...
        </p>
      </div>
    </div>
  );
};
