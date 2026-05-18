import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { api } from '../api.js';
import { AuthLayout } from '../components/Layout.jsx';
import { Field, Input, ErrorBanner } from '../components/Field.jsx';
import { Button } from '../components/Button.jsx';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [enrolled, setEnrolled] = useState(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!enrolled || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, enrolled.otpauthUrl, {
      width: 220,
      margin: 1,
      color: { dark: '#0f172a', light: '#f8fafc' },
    });
  }, [enrolled]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      const data = await api.register(email, password);
      setEnrolled(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  if (enrolled) {
    return (
      <AuthLayout
        title="Scan to enroll"
        subtitle="Add this account to Google Authenticator, 1Password, Authy, or any TOTP app."
      >
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <canvas ref={canvasRef} />
          </div>
          <div className="w-full">
            <Field label="Or enter this secret manually" hint="Base32 — case-insensitive">
              <Input readOnly value={enrolled.totpSecret} className="font-mono" />
            </Field>
          </div>
          <Button className="w-full" onClick={() => navigate('/login')}>
            Continue to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Password + authenticator app (TOTP).">
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
        <Field label="Password" hint="Minimum 8 characters">
          <Input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
