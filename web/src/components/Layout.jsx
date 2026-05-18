import React from 'react';

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700 text-xs text-slate-300 uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Continuum Demo
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-50">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
        <div className="bg-slate-900/70 backdrop-blur rounded-2xl border border-slate-800 shadow-xl shadow-black/30 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
