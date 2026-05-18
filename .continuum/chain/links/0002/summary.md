## Decisions
- **Auth: Password + TOTP MFA (true two-factor).** Supersedes the implicit baseline from link 0001 (basic email+password → JWT). New flow:
  1. `POST /auth/register { email, password }` → `{ otpauthUrl, totpSecret }` for authenticator-app enrollment.
  2. `POST /auth/login { email, password }` → short-lived `mfaToken` (JWT, `purpose: 'mfa'`, ~5 min). NOT a full-access token.
  3. `POST /auth/login/verify { mfaToken, totpCode }` → full-access JWT.
- User shape on disk gains `totpSecret`: `{ id, email, passwordHash, totpSecret }`.
- TOTP library: `otplib` (authenticator preset — 6-digit, 30s step, SHA1).
- Backup codes considered, **deferred** (not in scope for this iteration).

## Changes since last link
- `src/auth/router.js` — added `POST /auth/login/verify` route.
- `src/auth/handlers.js` — rewrote stub doc-blocks for the 2-step MFA flow; added `verifyLogin` handler stub.
- `src/auth/totp.js` — NEW file with `generateSecret`, `otpauthUrl`, `verifyCode` stubs (backed by `otplib`).
- `src/store/db.js` — disk-shape comment updated; user now includes `totpSecret`.
- `package.json` — added `otplib ^12.0.1` dependency.
- `.continuum/STATE.md` — refreshed to reflect MFA direction.
- No git commits yet — working tree still uncommitted on `master`.

## Open threads
- All handlers + store + jwtAuth middleware + password + totp are still TODO stubs (no behavior yet).
- No initial git commit on `master`.
- No test suite.
- Backup-codes flow deferred — revisit if account-recovery becomes a requirement.
- `node_modules` not installed; `npm install` needed before any runtime test.

## Constraints / Do not
- Do NOT issue a full-access JWT from `POST /auth/login`. That endpoint issues `mfaToken` only; full token is gated behind `/auth/login/verify`. (Anchors the security boundary of the 2-step flow.)
- Do NOT re-propose passwordless TOTP or password-only auth — user explicitly chose Password + TOTP after seeing all three options.

## Refs
- mfa-decision → `src/auth/router.js`, `src/auth/handlers.js` (route + handler doc-blocks)
- totp-helpers → `src/auth/totp.js`
- user-shape → `src/store/db.js:1`
- deps → `package.json` (`otplib ^12.0.1`)
