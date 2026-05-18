# Continuum-demo — baseline

**Status:** working tree has files but no git commits yet on `master`.

**Stack:** Node.js (ESM), Express 4, bcrypt, jsonwebtoken, **otplib** (TOTP). JSON-file persistence at `data/db.json` (path configurable via `DB_PATH`).

**Shape:**
- `index.js` — entrypoint; starts `app` on `config.port`.
- `src/app.js` — Express app; mounts `/auth` (public) and `/todos` (JWT-guarded).
- `src/config.js` — env-driven config (`PORT`, `JWT_SECRET`, `DB_PATH`) with dev fallbacks.
- `src/auth/` — `router.js` (register / login / login/verify), `handlers.js`, `password.js` (bcrypt), `totp.js` (otplib).
- `src/todos/`, `src/middleware/jwtAuth.js`, `src/store/db.js` — feature modules (all stubs).
- `.env.example` documents required env vars.

**Active decisions:**
- **Auth: Password + TOTP MFA (true two-factor).** Two-step login:
  1. `POST /auth/login { email, password }` → short-lived `mfaToken` (JWT, `purpose: 'mfa'`, ~5 min).
  2. `POST /auth/login/verify { mfaToken, totpCode }` → full-access JWT.
  Registration returns `{ otpauthUrl, totpSecret }` for authenticator-app enrollment.
  User shape: `{ id, email, passwordHash, totpSecret }`. Supersedes the earlier email+password-only plan.

**Do NOT:**
- Don't commit `.env` (already in `.gitignore`).
- Don't hard-code the JWT secret — keep using `config.jwtSecret`.
- Don't issue a full-access JWT from `POST /auth/login`; that endpoint only issues `mfaToken`. Full token is gated behind `/auth/login/verify`.

**Open threads:**
- No initial commit yet — first commit will need a reasonable baseline message.
- All handlers + store + jwt middleware + password + totp are still TODO stubs.
- No test suite present.
- Backup codes not in scope yet (considered, deferred).
