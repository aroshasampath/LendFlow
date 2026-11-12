import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Menu, Bell, ShieldCheck } from 'lucide-react';
import { useViewport } from '../hooks/useViewport';

export const Navbar = ({ isLiveConnected, onOpenSidebarMobile }) => {
  const { width, breakpoint } = useViewport();

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Drawer Trigger + Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenSidebarMobile}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden touch-target flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-primary"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-sm shadow-brand-primary/25">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-brand-dark">
                Lend<span className="text-brand-primary">Flow</span>
              </span>
            </Link>
          </div>

          {/* Center / Right: Viewport Pill & System Indicators */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Viewport Indicator Pill */}
            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-600">
              <span className="font-semibold text-brand-primary">{width}px</span>
              <span className="text-slate-300">|</span>
              <span className="uppercase text-[10px] font-bold">{breakpoint.split(' ')[0]}</span>
            </div>

            {/* Atlas Connection Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isLiveConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveConnected ? 'bg-brand-success animate-pulse' : 'bg-brand-warning'
                }`}
              />
              <span className="hidden sm:inline">
                {isLiveConnected ? 'Atlas Live' : 'Connecting'}
              </span>
            </div>

            {/* Notification button placeholder */}
            <button
              type="button"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 touch-target flex items-center justify-center relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-primary"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
