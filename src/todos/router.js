import { Router } from 'express';
import { listTodos, createTodo, updateTodo, deleteTodo } from './handlers.js';

export const todosRouter = Router();

todosRouter.get('/', listTodos);
todosRouter.post('/', createTodo);
todosRouter.patch('/:id', updateTodo);
todosRouter.delete('/:id', deleteTodo);
