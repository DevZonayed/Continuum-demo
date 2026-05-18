import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { clearToken } from '../auth.js';
import { Field, Input, ErrorBanner } from '../components/Field.jsx';
import { Button } from '../components/Button.jsx';

function decodeEmail() {
  try {
    const token = localStorage.getItem('continuum.token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email ?? null;
  } catch {
    return null;
  }
}

export function Todos() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const email = decodeEmail();

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const { todos } = await api.listTodos();
      setTodos(todos);
    } catch (err) {
      setError(err.message);
      if (err.status === 401) {
        clearToken();
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setError('');
    try {
      const { todo } = await api.createTodo(title.trim());
      setTodos((prev) => [...prev, todo]);
      setTitle('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function onToggle(todo) {
    setError('');
    const optimistic = { ...todo, done: !todo.done };
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? optimistic : t)));
    try {
      await api.updateTodo(todo.id, { done: optimistic.done });
    } catch (err) {
      setError(err.message);
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)));
    }
  }

  async function onDelete(todo) {
    setError('');
    const prev = todos;
    setTodos((p) => p.filter((t) => t.id !== todo.id));
    try {
      await api.deleteTodo(todo.id);
    } catch (err) {
      setError(err.message);
      setTodos(prev);
    }
  }

  function onLogout() {
    clearToken();
    navigate('/login', { replace: true });
  }

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <div className="min-h-full">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Continuum Demo</div>
              {email && <div className="text-sm text-slate-200">{email}</div>}
            </div>
          </div>
          <Button variant="secondary" onClick={onLogout}>
            Log out
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Your todos</h1>
          <p className="text-sm text-slate-400 mt-1">
            {loading
              ? 'Loading…'
              : todos.length === 0
                ? 'No todos yet. Add one below.'
                : `${remaining} of ${todos.length} remaining`}
          </p>
        </div>

        <ErrorBanner message={error} />

        <form onSubmit={onCreate} className="flex gap-2">
          <div className="flex-1">
            <Field label="New todo">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs doing?"
              />
            </Field>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={!title.trim()}>
              Add
            </Button>
          </div>
        </form>

        <ul className="space-y-2">
          {todos.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
            >
              <button
                type="button"
                onClick={() => onToggle(t)}
                aria-label={t.done ? 'mark not done' : 'mark done'}
                className={
                  'h-5 w-5 rounded-md border flex items-center justify-center transition ' +
                  (t.done
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                    : 'border-slate-600 hover:border-emerald-500')
                }
              >
                {t.done && (
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M3 8.5l3.5 3.5L13 5" />
                  </svg>
                )}
              </button>
              <span
                className={
                  'flex-1 text-sm ' +
                  (t.done ? 'line-through text-slate-500' : 'text-slate-100')
                }
              >
                {t.title}
              </span>
              <Button variant="danger" onClick={() => onDelete(t)} aria-label="delete">
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
