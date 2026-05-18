# Continuum-demo — Frontend + Backend Wire-up

**Date:** 2026-05-18
**Status:** Approved (inline) — implementation in progress.

## Goal

Deliver a runnable end-to-end demo of the Password + TOTP MFA todos service: implement the backend stubs, build a React+Vite frontend that drives the full auth flow, serve both from one Express process on `:3000`, and verify visually in a browser.

## Non-goals

Backup codes, password reset, email verification, rate limiting, multi-device sessions, refresh tokens, persistent dev infra. All deferred per `.continuum/STATE.md`.

## Stack

- Backend: existing Node.js (ESM) + Express 4. Dependencies already declared: `bcrypt`, `jsonwebtoken`, `otplib`.
- Frontend: React 18 + Vite + React Router + Tailwind CSS. QR codes via `qrcode`.
- Storage: file-backed JSON at `data/db.json`.
- Single Express process serves the SPA's static build (`web/dist`) plus the JSON API (`/auth`, `/todos`). For non-API routes, the server falls through to `index.html` for client-side routing.

## Backend implementation

`src/store/db.js` — JSON file store.
- `readAll()`: reads `config.dbPath`; returns `{ users: [], todos: [] }` if the file is missing.
- `writeAll(data)`: writes atomically (tmp file + `rename`).
- Helpers: `findUserByEmail`, `insertUser`, `listTodosForUser(userId)`, `insertTodo`, `updateTodoById(id, userId, patch)`, `deleteTodoById(id, userId)` — all enforce ownership where applicable.

`src/auth/password.js` — `bcrypt.hash` (cost 10) and `bcrypt.compare`.

`src/auth/totp.js` — backed by `otplib.authenticator`.
- `generateSecret()` → base32 string.
- `otpauthUrl(email, secret, issuer)` → `keyuri(email, issuer, secret)`.
- `verifyCode(code, secret)` → `authenticator.check(code, secret)`.

`src/auth/handlers.js`:
- `register({ email, password })`: validate, reject duplicate emails, hash password, generate TOTP secret, insert user with `crypto.randomUUID()`, return `201 { otpauthUrl, totpSecret }`.
- `login({ email, password })`: verify password, sign JWT `{ sub, purpose: 'mfa' }`, `expiresIn: '5m'`. Returns `{ mfaToken }`. 401 on bad creds.
- `verifyLogin({ mfaToken, totpCode })`: verify the mfa token (reject if `purpose !== 'mfa'`), load user, check TOTP code, sign full JWT `{ sub, email }`, `expiresIn: '12h'`. Returns `{ token }`.

`src/middleware/jwtAuth.js`: parse `Authorization: Bearer …`. Reject `purpose: 'mfa'` tokens (only full tokens accepted). Set `req.user = { id, email }`.

`src/todos/handlers.js`: list/create/update/delete scoped to `req.user.id`. IDs via `crypto.randomUUID()`.

## Frontend structure

```
web/
  index.html
  vite.config.js
  tailwind.config.js
  postcss.config.js
  src/
    main.jsx
    App.jsx
    api.js          // fetch wrapper, token storage
    auth.js         // localStorage token helpers
    pages/
      Register.jsx
      Login.jsx
      Verify.jsx
      Todos.jsx
    components/
      Layout.jsx
      Field.jsx
      Button.jsx
```

Routes (React Router v6):
- `/` → redirect to `/todos` if authed else `/login`.
- `/register` → email + password form → success shows QR code + the base32 secret with a "Continue to login" button.
- `/login` → email + password → on success, hold `mfaToken` in route state, navigate to `/verify`.
- `/verify` → 6-digit input → on success, store full JWT in `localStorage`, navigate to `/todos`.
- `/todos` → list, add, toggle done, delete. Logout clears JWT.

API client: `web/src/api.js` — `fetch` wrapper that auto-attaches `Authorization`, throws on non-2xx with the server's error message, parses JSON.

Token storage: `localStorage` key `continuum.token` (full JWT only — `mfaToken` lives in route state and dies on refresh, which is fine for a 5-minute single-use token).

Styling: Tailwind utility classes, dark/minimal aesthetic, centered card on auth screens, simple list view for todos.

## Server changes

`src/app.js`:
- Mount `express.static('web/dist')`.
- Add a fallback handler: for any GET that isn't `/auth/*` or `/todos/*`, send `web/dist/index.html` so client-side routes work on refresh.

## Scripts

`package.json`:
- `npm install` — installs root + workspace deps.
- `npm run build:web` — `vite build` in `web/`.
- `npm start` — `node index.js` (assumes `web/dist` exists).
- `npm run dev` — `vite build --watch` (in `web/`) in parallel with `node --watch index.js`.

We'll set up `web/` as a sibling with its own `package.json` so its React/Vite/Tailwind deps don't leak into the server's runtime dependency tree.

## Error model

Backend: JSON `{ error: '<message>' }` plus HTTP status. Frontend surfaces this verbatim in an inline error banner per screen.

## Verification plan

1. `npm install` succeeds in root and `web/`.
2. `npm run build:web` produces `web/dist/index.html` + assets.
3. `npm start` listens on `:3000`.
4. Open `http://localhost:3000` via Super-Tester MCP:
   - Register a new user → QR code renders + secret is visible.
   - Seed an authenticator (use the base32 secret with `otplib.authenticator.generate` in a small Node one-liner) to produce a valid code.
   - Login step 1 → returns `mfaToken` (visible in network panel).
   - Verify step 2 with the generated TOTP → returns full token.
   - Todos page: create, toggle done, delete — all reflected in the UI and persisted to `data/db.json`.
   - Refresh page: still authenticated.
   - Logout: token cleared, redirected to login.
5. Confirm no console errors and no failing network calls.

## Out of scope

Backup codes, password reset, email verification, rate limiting, refresh tokens, multi-device sessions, persistent test suite (manual browser verification is the bar for this iteration).
