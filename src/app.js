import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { authRouter } from './auth/router.js';
import { todosRouter } from './todos/router.js';
import { jwtAuth } from './middleware/jwtAuth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDist = path.resolve(__dirname, '..', 'web', 'dist');

export const app = express();

app.use(express.json());
app.use('/auth', authRouter);
app.use('/todos', jwtAuth, todosRouter);

if (existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get(/^\/(?!auth|todos).*/, (req, res) => {
    res.sendFile(path.join(webDist, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res
      .status(503)
      .type('text/plain')
      .send(
        'Frontend not built yet. Run:\n  cd web && npm install && npm run build\nor from the root:\n  npm run build:web'
      );
  });
}
