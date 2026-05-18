import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { AuthLayout } from '../components/Layout.jsx';
import { Field, Input, ErrorBanner } from '../components/Field.jsx';
import { Button } from '../components/Button.jsx';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      const { mfaToken } = await api.login(email, password);
      navigate('/verify', { state: { mfaToken, email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout title="Sign in" subtitle="Step 1 of 2 · password">
      <ErrorBanner message={error} />
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email">
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Signing in…' : 'Continue'}
        </Button>
        <p className="text-center text-xs text-slate-500">
          No account?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
