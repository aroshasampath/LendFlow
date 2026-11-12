import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Activity,
  Smartphone,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Landmark,
} from 'lucide-react';

export const Sidebar = ({
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
  onToggleCollapseDesktop,
}) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Responsive QA', path: '/responsive-qa', icon: Smartphone },
    { name: 'Architecture', path: '/architecture', icon: Layers },
    { name: 'System Status', path: '/status', icon: Activity },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-brand-dark text-slate-200 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shrink-0 shadow-md shadow-brand-primary/30">
            <Landmark className="w-5 h-5" />
          </div>
          {!isCollapsedDesktop && (
            <div className="truncate">
              <span className="font-bold text-lg text-white tracking-tight">
                Lend<span className="text-brand-primaryLight">Flow</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Fintech System</p>
            </div>
          )}
        </div>

        {/* Close button on mobile */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                } ${isCollapsedDesktop ? 'justify-center' : ''}`
              }
              title={isCollapsedDesktop ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsedDesktop && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Security & System Info Pill */}
      {!isCollapsedDesktop && (
        <div className="p-3 m-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Architecture</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Atlas MongoDB &bull; Stage 3 Active
          </p>
        </div>
      )}

      {/* Desktop Collapse Toggle */}
      <div className="hidden lg:flex items-center justify-end p-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onToggleCollapseDesktop}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition touch-target flex items-center justify-center w-full"
          aria-label={isCollapsedDesktop ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsedDesktop ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center justify-between w-full text-xs text-slate-400">
              <span>Collapse Sidebar</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-200 border-r border-slate-800 ${
          isCollapsedDesktop ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* 2. Mobile / Tablet Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

