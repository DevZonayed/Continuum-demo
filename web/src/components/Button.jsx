import React from 'react';

export function Button({ variant = 'primary', className = '', ...rest }) {
  const variants = {
    primary:
      'bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:bg-slate-700 disabled:text-slate-400',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 disabled:opacity-50',
    ghost: 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60',
    danger: 'text-red-400 hover:text-red-300 hover:bg-red-950/40',
  };
  return (
    <button
      {...rest}
      className={
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ' +
        'transition disabled:cursor-not-allowed ' +
        variants[variant] +
        ' ' +
        className
      }
    />
  );
}
