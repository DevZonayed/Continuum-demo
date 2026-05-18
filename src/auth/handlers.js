import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { findUserByEmail, findUserById, insertUser } from '../store/db.js';
import { hashPassword, verifyPassword } from './password.js';
import { generateSecret, otpauthUrl, verifyCode } from './totp.js';

const MFA_TTL = '5m';
const FULL_TTL = '12h';

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export async function register(req, res) {
  const { email, password } = req.body ?? {};
  if (!email || typeof email !== 'string') return badRequest(res, 'email is required');
  if (!password || typeof password !== 'string' || password.length < 8) {
    return badRequest(res, 'password must be at least 8 characters');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await findUserByEmail(normalizedEmail)) {
    return res.status(409).json({ error: 'email already registered' });
  }

  const passwordHash = await hashPassword(password);
  const totpSecret = generateSecret();
  const user = {
    id: randomUUID(),
    email: normalizedEmail,
    passwordHash,
    totpSecret,
  };
  await insertUser(user);

  return res.status(201).json({
    otpauthUrl: otpauthUrl(normalizedEmail, totpSecret),
    totpSecret,
  });
}

export async function login(req, res) {
  const { email, password } = req.body ?? {};
  if (!email || !password) return badRequest(res, 'email and password are required');

  const user = await findUserByEmail(String(email).trim().toLowerCase());
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });

  const mfaToken = jwt.sign(
    { sub: user.id, purpose: 'mfa' },
    config.jwtSecret,
    { expiresIn: MFA_TTL }
  );
  return res.json({ mfaToken });
}

export async function verifyLogin(req, res) {
  const { mfaToken, totpCode } = req.body ?? {};
  if (!mfaToken || !totpCode) return badRequest(res, 'mfaToken and totpCode are required');

  let payload;
  try {
    payload = jwt.verify(mfaToken, config.jwtSecret);
  } catch {
    return res.status(401).json({ error: 'invalid or expired mfa token' });
  }
  if (payload.purpose !== 'mfa') {
    return res.status(401).json({ error: 'invalid mfa token' });
  }

  const user = await findUserById(payload.sub);
  if (!user) return res.status(401).json({ error: 'invalid mfa token' });

  if (!verifyCode(totpCode, user.totpSecret)) {
    return res.status(401).json({ error: 'invalid totp code' });
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: FULL_TTL }
  );
  return res.json({ token });
}
