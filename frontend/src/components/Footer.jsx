import React from 'react';

export const Footer = () => {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center text-sm text-slate-500">
          <span className="font-semibold text-brand-dark">LendFlow</span>
          <span className="ml-2">&copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};
