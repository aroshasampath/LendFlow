import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, Menu, Bell, ShieldCheck, LogIn, UserPlus, LogOut, KeyRound, User, Search } from 'lucide-react';
import { useViewport } from '../hooks/useViewport';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ isLiveConnected, onOpenSidebarMobile }) => {
  const { width, breakpoint } = useViewport();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/login');
  };

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

          {/* Center / Right: Viewport Pill, Status, & Auth */}
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

            {/* User Account / Auth Actions */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-primary text-white text-xs font-bold flex items-center justify-center shadow-xs overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      user?.fullName?.charAt(0) || 'U'
                    )}
                  </div>
                  <span className="hidden md:inline text-xs font-semibold text-slate-800">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user?.fullName}</p>
                      <p className="text-slate-500 font-mono truncate">@{user?.username}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      My Profile
                    </Link>

                    <Link
                      to="/users/search"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <Search className="w-4 h-4 text-slate-500" />
                      Search Members
                    </Link>

                    <Link
                      to="/security-settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <KeyRound className="w-4 h-4 text-slate-500" />
                      Security Settings
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3.5 py-2 text-brand-danger hover:bg-red-50 font-medium w-full text-left border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-brand-danger" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden xs:inline">Log In</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primaryHover transition shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
