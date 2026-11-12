import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  Landmark, 
  Menu, 
  Bell, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  LogOut, 
  KeyRound, 
  User, 
  Search,
  CheckCheck,
  Coins,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useViewport } from '../hooks/useViewport';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar = ({ isLiveConnected, onOpenSidebarMobile }) => {
  const { width, breakpoint } = useViewport();
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'loan_request':
        return <Coins className="w-3.5 h-3.5 text-brand-primary" />;
      case 'loan_accepted':
      case 'repayment_confirmed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'loan_rejected':
      case 'repayment_rejected':
      case 'loan_cancelled':
        return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      case 'repayment_submitted':
        return <CreditCard className="w-3.5 h-3.5 text-blue-600" />;
      case 'loan_overdue':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
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

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-4 border-l border-slate-200 pl-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-primaryLight text-brand-primary font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                Dashboard
              </NavLink>
              {isAuthenticated && (
                <>
                  <NavLink
                    to="/loans"
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-primaryLight text-brand-primary font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    Loans
                  </NavLink>
                  <NavLink
                    to="/repayments"
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-primaryLight text-brand-primary font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    Repayments
                  </NavLink>
                  <NavLink
                    to="/users/search"
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-primaryLight text-brand-primary font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    Search Members
                  </NavLink>
                </>
              )}
              <NavLink
                to="/responsive-qa"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-primaryLight text-brand-primary font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                Responsive QA
              </NavLink>
            </nav>
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

            {/* Notifications Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 touch-target flex items-center justify-center relative focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary text-white">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-[11px] text-brand-primary font-semibold hover:underline flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.slice(0, 5).map((item) => (
                        <div
                          key={item._id}
                          className={`p-3 transition-colors ${
                            item.isRead ? 'bg-white hover:bg-slate-50' : 'bg-brand-primaryLight/30 hover:bg-brand-primaryLight/50'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 rounded-lg bg-white border border-slate-100 shrink-0 mt-0.5">
                              {getNotificationIcon(item.type)}
                            </div>
                            <div className="flex-1 truncate">
                              <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                              <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug mt-0.5">
                                {item.message}
                              </p>
                              <div className="flex items-center justify-between mt-1 pt-1 text-[10px] text-slate-400">
                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                {item.link && (
                                  <Link
                                    to={item.link}
                                    onClick={() => {
                                      markAsRead(item._id);
                                      setNotifDropdownOpen(false);
                                    }}
                                    className="font-semibold text-brand-primary hover:underline"
                                  >
                                    View details &rarr;
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {notifications.length === 0 && (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-2 border-t border-slate-100 text-center">
                      <Link
                        to="/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-xs font-bold text-brand-primary hover:underline"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Account / Auth Actions */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
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
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
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
                      to="/loans"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <Coins className="w-4 h-4 text-slate-500" />
                      My Loans
                    </Link>

                    <Link
                      to="/repayments"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <CreditCard className="w-4 h-4 text-slate-500" />
                      Repayments
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
