import React from 'react';
import { Shield, Lock, Smartphone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-brand-dark">LendFlow</span>
            <span>&copy; {new Date().getFullYear()}</span>
            <span>&bull;</span>
            <span>Multi-User Loan Management System</span>
          </div>

          <div className="flex items-center gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Shield className="w-3.5 h-3.5" />
              End-to-End Encrypted
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <Smartphone className="w-3.5 h-3.5" />
              Responsive Design
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
