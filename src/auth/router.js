import { Router } from 'express';
import { register, login, verifyLogin } from './handlers.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/login/verify', verifyLogin);
