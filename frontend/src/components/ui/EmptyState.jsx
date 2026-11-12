import React from 'react';
import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

/**
 * Universal Fintech Empty State Component
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are currently no items available to display in this section.',
  actionText,
  actionOnClick,
  actionTo,
  secondaryActionText,
  secondaryActionOnClick,
  secondaryActionTo,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 ${className}`}
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-primaryLight text-brand-primary flex items-center justify-center mb-4 shadow-xs">
        <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-brand-dark mb-1">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {(actionText || secondaryActionText) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {actionText && (
            actionTo ? (
              <Link to={actionTo}>
                <Button variant="primary" size="md">
                  {actionText}
                </Button>
              </Link>
            ) : (
              <Button variant="primary" size="md" onClick={actionOnClick}>
                {actionText}
              </Button>
            )
          )}

          {secondaryActionText && (
            secondaryActionTo ? (
              <Link to={secondaryActionTo}>
                <Button variant="secondary" size="md">
                  {secondaryActionText}
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" size="md" onClick={secondaryActionOnClick}>
                {secondaryActionText}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
};

