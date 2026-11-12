import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidthOnMobile = false,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none disabled:active:scale-100 touch-target select-none cursor-pointer';

  const variants = {
    primary:
      'bg-brand-primary text-white hover:bg-brand-primaryHover shadow-sm shadow-brand-primary/20',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200',
    outline:
      'bg-transparent text-brand-primary border border-brand-primary hover:bg-brand-primaryLight',
    danger:
      'bg-brand-danger text-white hover:bg-red-700 shadow-sm shadow-brand-danger/20',
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  };

  const sizes = {
    sm: 'text-xs px-3 py-2 min-h-[38px]',
    md: 'text-sm px-4 py-2.5 min-h-[44px]',
    lg: 'text-base px-5 py-3.5 min-h-[48px]',
  };

  const widthStyle = fullWidthOnMobile ? 'w-full sm:w-auto' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${widthStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 mr-2 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
};

