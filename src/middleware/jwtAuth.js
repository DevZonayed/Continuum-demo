import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function jwtAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'missing or malformed Authorization header' });
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return res.status(401).json({ error: 'invalid or expired token' });
  }

  if (payload.purpose === 'mfa') {
    return res.status(401).json({ error: 'mfa token is not a full-access token' });
  }
  if (!payload.sub || !payload.email) {
    return res.status(401).json({ error: 'invalid token payload' });
  }

  req.user = { id: payload.sub, email: payload.email };
  next();
}
