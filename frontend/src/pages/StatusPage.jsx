import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Terminal } from 'lucide-react';
import { fetchSystemHealth } from '../services/api';

export const StatusPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);

  const testEndpoint = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const res = await fetchSystemHealth();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testEndpoint();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">System Diagnostics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time latency, health verification, and database state.
          </p>
        </div>
        <button
          onClick={testEndpoint}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primaryHover transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Run Health Diagnostics
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Status</p>
          <p className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            {data?.status === 'healthy' ? (
              <span className="text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> Healthy
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5" /> Degraded
              </span>
            )}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">API Latency</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {latency !== null ? `${latency} ms` : 'Measuring...'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Server Uptime</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {data?.uptimeSeconds !== undefined ? `${data.uptimeSeconds}s` : 'Unknown'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 font-semibold text-sm text-slate-800">
          <Terminal className="w-4 h-4 text-brand-primary" />
          Live JSON Response (GET /api/health)
        </div>
        <div className="p-6 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
          {error ? (
            <p className="text-red-400">Error: {error}</p>
          ) : data ? (
            <pre>{JSON.stringify(data, null, 2)}</pre>
          ) : (
            <p className="text-slate-400">Loading diagnostic response...</p>
          )}
        </div>
      </div>
    </div>
  );
};

