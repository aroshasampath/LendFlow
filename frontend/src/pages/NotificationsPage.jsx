import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';
import { 
  Bell, 
  CheckCheck, 
  Coins, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Inbox
} from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'loan_request':
        return <Coins className="w-5 h-5 text-brand-primary" />;
      case 'loan_accepted':
      case 'repayment_confirmed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'loan_rejected':
      case 'repayment_rejected':
      case 'loan_cancelled':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case 'repayment_submitted':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'loan_overdue':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: 'Notifications' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Instant updates about new expenses, debt confirmations, and payments.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={CheckCheck}
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item._id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                item.isRead
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-brand-primaryLight/30 border-brand-primary/40 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-xs shrink-0 mt-0.5 sm:mt-0">
                  {getNotificationIcon(item.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.message}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {item.link && (
                  <Link
                    to={item.link}
                    onClick={() => {
                      if (!item.isRead) markAsRead(item._id);
                    }}
                  >
                    <Button variant="outline" size="sm" className="text-xs py-1">
                      View
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                )}

                {!item.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs py-1"
                    onClick={() => markAsRead(item._id)}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You're all caught up! New updates from friends will show up here."
        />
      )}
    </div>
  );
};

