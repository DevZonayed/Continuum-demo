import { authenticator } from 'otplib';

authenticator.options = { digits: 6, step: 30, window: 1 };

export function generateSecret() {
  return authenticator.generateSecret();
}

export function otpauthUrl(email, secret, issuer = 'continuum-demo') {
  return authenticator.keyuri(email, issuer, secret);
}

export function verifyCode(code, secret) {
  try {
    return authenticator.check(String(code).trim(), secret);
  } catch {
    return false;
  }
}
