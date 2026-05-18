import React from 'react';

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wide text-slate-400 mb-1.5">
        {label}
      </span>
      {children}
      {hint && <span className="block mt-1 text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export const Input = React.forwardRef(function Input(props, ref) {
  return (
    <input
      {...props}
      ref={ref}
      className={
        'w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 ' +
        'placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ' +
        'focus:border-emerald-500/60 transition ' +
        (props.className ?? '')
      }
    />
  );
});

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
      {message}
    </div>
  );
}
