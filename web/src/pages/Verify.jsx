import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { setToken } from '../auth.js';
import { AuthLayout } from '../components/Layout.jsx';
import { Field, Input, ErrorBanner } from '../components/Field.jsx';
import { Button } from '../components/Button.jsx';

export function Verify() {
  const location = useLocation();
  const navigate = useNavigate();
  const mfaToken = location.state?.mfaToken;
  const email = location.state?.email;
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!mfaToken) return <Navigate to="/login" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      const { token } = await api.verifyLogin(mfaToken, code);
      setToken(token);
      navigate('/todos', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout title="Two-factor code" subtitle={`Step 2 of 2 · ${email ?? 'authenticator app'}`}>
      <ErrorBanner message={error} />
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="6-digit code" hint="From your authenticator app">
          <Input
            ref={inputRef}
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="font-mono tracking-[0.4em] text-center text-lg"
          />
        </Field>
        <Button type="submit" className="w-full" disabled={pending || code.length !== 6}>
          {pending ? 'Verifying…' : 'Verify and sign in'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => navigate('/login')}
        >
          Back
        </Button>
      </form>
    </AuthLayout>
  );
}
