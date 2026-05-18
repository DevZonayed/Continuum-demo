import { getToken, clearToken } from './auth.js';

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    if (res.status === 401 && getToken()) clearToken();
    const message = data?.error || `request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  register: (email, password) => request('POST', '/auth/register', { email, password }),
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  verifyLogin: (mfaToken, totpCode) =>
    request('POST', '/auth/login/verify', { mfaToken, totpCode }),
  listTodos: () => request('GET', '/todos'),
  createTodo: (title) => request('POST', '/todos', { title }),
  updateTodo: (id, patch) => request('PATCH', `/todos/${id}`, patch),
  deleteTodo: (id) => request('DELETE', `/todos/${id}`),
};
