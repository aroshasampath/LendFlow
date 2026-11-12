import React from 'react';

export const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100/90 shadow-xs p-5 sm:p-6 transition-all ${
        hover ? 'hover:shadow-md hover:border-slate-200/80 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 ${className}`}>
      <div>
        <h3 className="text-base sm:text-lg font-bold text-brand-dark tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
