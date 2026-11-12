import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Landmark,
  KeyRound,
  LogIn,
  LogOut,
  Search,
  User,
  Coins,
  CreditCard,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Sidebar = ({
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
  onToggleCollapseDesktop,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const notificationCtx = useNotifications();
  const unreadCount = notificationCtx?.unreadCount || 0;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    ...(isAuthenticated
      ? [
        { name: 'Debts & IOUs', path: '/loans', icon: Coins },
        { name: 'Settlements', path: '/repayments', icon: CreditCard },
        { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
        { name: 'Find Friends', path: '/users/search', icon: Search },
        { name: 'My Profile', path: '/profile', icon: User },
        { name: 'Security Settings', path: '/security-settings', icon: KeyRound },
      ]
      : []),
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
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                } ${isCollapsedDesktop ? 'justify-center' : ''}`
              }
              title={isCollapsedDesktop ? item.name : undefined}
            >
              <div className="relative shrink-0">
                <Icon className="w-5 h-5" />
                {isCollapsedDesktop && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                )}
              </div>
              {!isCollapsedDesktop && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{item.name}</span>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Session or Auth Call to Action */}
      {!isCollapsedDesktop && (
        <div className="p-3 m-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2">
          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <NavLink to="/profile" className="truncate hover:underline">
                <p className="font-semibold text-white truncate">{user?.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate">@{user?.username}</p>
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              onClick={onCloseMobile}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-brand-primary text-white font-semibold text-xs hover:bg-brand-primaryHover transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In to Account</span>
            </NavLink>
          )}
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
      {/* Responsive Slide-out Navigation Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          {/* Drawer Body */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 shadow-2xl animate-in slide-in-from-left duration-200 border-r border-slate-800">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
