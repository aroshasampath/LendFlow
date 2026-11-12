import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Universal Fintech Breadcrumb Navigation
 */
export const Breadcrumbs = ({ items = [], className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs sm:text-sm text-slate-500 overflow-x-auto whitespace-nowrap py-1 scrollbar-none ${className}`}
    >
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {/* Home Root */}
        <li className="flex items-center">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-brand-primary transition-colors p-1 rounded-md"
            title="Dashboard"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5 sm:gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              {isLast || !item.path ? (
                <span
                  className="font-semibold text-brand-dark truncate max-w-[180px] sm:max-w-xs"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-brand-primary transition-colors truncate max-w-[140px] sm:max-w-xs p-1 rounded-md"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

