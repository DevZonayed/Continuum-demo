import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Register } from './pages/Register.jsx';
import { Login } from './pages/Login.jsx';
import { Verify } from './pages/Verify.jsx';
import { Todos } from './pages/Todos.jsx';
import { isAuthed } from './auth.js';

function RequireAuth({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthed() ? '/todos' : '/login'} replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<Verify />} />
      <Route
        path="/todos"
        element={
          <RequireAuth>
            <Todos />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
