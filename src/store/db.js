import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';

const EMPTY = { users: [], todos: [] };

export async function readAll() {
  if (!existsSync(config.dbPath)) {
    await mkdir(path.dirname(config.dbPath), { recursive: true });
    await writeAll(EMPTY);
    return structuredClone(EMPTY);
  }
  const raw = await readFile(config.dbPath, 'utf8');
  if (!raw.trim()) return structuredClone(EMPTY);
  const parsed = JSON.parse(raw);
  return { users: parsed.users ?? [], todos: parsed.todos ?? [] };
}

export async function writeAll(data) {
  await mkdir(path.dirname(config.dbPath), { recursive: true });
  const tmp = `${config.dbPath}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await rename(tmp, config.dbPath);
}

export async function findUserByEmail(email) {
  const { users } = await readAll();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function insertUser(user) {
  const data = await readAll();
  data.users.push(user);
  await writeAll(data);
  return user;
}

export async function findUserById(id) {
  const { users } = await readAll();
  return users.find((u) => u.id === id) ?? null;
}

export async function listTodosForUser(userId) {
  const { todos } = await readAll();
  return todos.filter((t) => t.userId === userId);
}

export async function insertTodo(todo) {
  const data = await readAll();
  data.todos.push(todo);
  await writeAll(data);
  return todo;
}

export async function updateTodoById(id, userId, patch) {
  const data = await readAll();
  const idx = data.todos.findIndex((t) => t.id === id && t.userId === userId);
  if (idx === -1) return null;
  data.todos[idx] = { ...data.todos[idx], ...patch, id, userId };
  await writeAll(data);
  return data.todos[idx];
}

export async function deleteTodoById(id, userId) {
  const data = await readAll();
  const before = data.todos.length;
  data.todos = data.todos.filter((t) => !(t.id === id && t.userId === userId));
  if (data.todos.length === before) return false;
  await writeAll(data);
  return true;
}
