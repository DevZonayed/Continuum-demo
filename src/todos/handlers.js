import { randomUUID } from 'node:crypto';
import {
  listTodosForUser,
  insertTodo,
  updateTodoById,
  deleteTodoById,
} from '../store/db.js';

export async function listTodos(req, res) {
  const todos = await listTodosForUser(req.user.id);
  return res.json({ todos });
}

export async function createTodo(req, res) {
  const { title } = req.body ?? {};
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const todo = {
    id: randomUUID(),
    userId: req.user.id,
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
  await insertTodo(todo);
  return res.status(201).json({ todo });
}

export async function updateTodo(req, res) {
  const patch = {};
  if (typeof req.body?.title === 'string') {
    if (!req.body.title.trim()) return res.status(400).json({ error: 'title cannot be empty' });
    patch.title = req.body.title.trim();
  }
  if (typeof req.body?.done === 'boolean') {
    patch.done = req.body.done;
  }
  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ error: 'no updatable fields provided' });
  }
  const updated = await updateTodoById(req.params.id, req.user.id, patch);
  if (!updated) return res.status(404).json({ error: 'todo not found' });
  return res.json({ todo: updated });
}

export async function deleteTodo(req, res) {
  const ok = await deleteTodoById(req.params.id, req.user.id);
  if (!ok) return res.status(404).json({ error: 'todo not found' });
  return res.status(204).end();
}
