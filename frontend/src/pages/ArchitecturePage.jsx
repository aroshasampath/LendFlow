import React from 'react';
import { FolderTree, Server, Monitor, Shield, Database } from 'lucide-react';

export const ArchitecturePage = () => {
  const backendModules = [
    { name: 'config/', desc: 'Database connection configuration (db.js) and environment settings.' },
    { name: 'controllers/', desc: 'Request handlers coordinating business operations and HTTP responses.' },
    { name: 'middleware/', desc: 'Security filters (Helmet, CORS), JWT authentication, rate limiting, and centralized error handler.' },
    { name: 'models/', desc: 'Mongoose schemas with strict validations (User, Loan, Repayment, Notification).' },
    { name: 'routes/', desc: 'REST API endpoints structured by resource.' },
    { name: 'services/', desc: 'Financial calculations, loan lifecycle state machine, and transaction logic.' },
    { name: 'validators/', desc: 'Input validation and sanitization preventing injection attacks.' },
    { name: 'utils/', desc: 'Standardized response generators (apiResponse.js), safe logging, and currency formatters.' },
  ];

  const frontendModules = [
    { name: 'components/', desc: 'Reusable, accessible UI components (Navbar, Footer, Modals, Cards, Buttons).' },
    { name: 'pages/', desc: '17 specialized application views covering Auth, Loans, Repayments, Profiles, and Dashboard.' },
    { name: 'layouts/', desc: 'Responsive page wrappers adapting automatically to mobile, tablet, and desktop viewports.' },
    { name: 'context/', desc: 'Global state managers for authenticated user session and real-time alerts.' },
    { name: 'services/', desc: 'Axios API client with automated error translation for user-friendly notifications.' },
    { name: 'hooks/', desc: 'Custom hooks for viewport measurement, data polling, and form handling.' },
    { name: 'utils/', desc: 'Minor unit currency conversions and date formatting helpers.' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Project Architecture</h1>
        <p className="text-sm text-slate-500 mt-1">
          Structured separation of concerns following industry standards for scalable full-stack MERN applications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend Architecture */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-blue-50 text-brand-primary">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Backend Architecture (Node.js & Express)</h2>
              <p className="text-xs text-slate-500">Root: backend/</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {backendModules.map((item) => (
              <div key={item.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-white hover:border-brand-primary/40 transition-colors">
                <span className="font-mono text-xs font-bold text-brand-primary">{item.name}</span>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Frontend Architecture */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Frontend Architecture (React & Vite)</h2>
              <p className="text-xs text-slate-500">Root: frontend/src/</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {frontendModules.map((item) => (
              <div key={item.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-white hover:border-emerald-500/40 transition-colors">
                <span className="font-mono text-xs font-bold text-emerald-700">{item.name}</span>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

