# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (server/)
```bash
cd server
npm run dev        # Start with --watch (auto-restart on file change), port 5000
npm run seed       # Drop & recreate DB with test data
```

### Frontend (client/)
```bash
cd client
npm run dev        # Vite dev server, port 5173
npm run build      # Production build → client/dist/
```

### Full launch (Windows)
Double-click `Lancer_BTP_Manager.bat` — starts backend + opens the Electron desktop app.

No lint scripts and no test suite are configured.

## Architecture

### Three delivery targets from one codebase
- **Web**: React (Vite) served at `localhost:5173` in dev, or by Express from `client/dist/` in production.
- **Desktop**: Electron wrapper (`main.js` at root, `dist-desktop/`) that loads the Express server and React build.
- **Mobile**: Separate React Native app in `mobile/` — independent navigation and screens, connects to the same Express API.

### Backend conventions
- **Runtime**: Node.js ES modules (`"type": "module"`) throughout — use `import`/`export`, not `require`.
- **Server**: Express 5 — async route handlers do NOT need try/catch; unhandled promise rejections are forwarded to the global error handler automatically.
- **Database**: SQLite by default (`DB_DIALECT=sqlite`) — embedded file, zero external service, works fully offline. File lives at `server/data/database.sqlite` in dev, or the Electron `userData` folder in the desktop app (set via `DB_STORAGE`, passed by `main.js`). PostgreSQL remains available as an opt-in for a shared server/web deployment (`DB_DIALECT=postgres` + `DB_HOST`/`DB_USER`/... in `.env`).
- **DB sync**: `sequelize.sync({ constraints: false })` runs on every startup — creates missing *tables* only (new model → auto-created, just register it in `server/src/models/index.js` + mount its route). It does **not** add new *columns* to existing tables. For that, register the column in `server/src/utils/ensureColumns.js` → `runAdditiveMigrations()`, called right after `sequelize.sync()` in `app.js` (idempotent describeTable/addColumn helper — there are still no real migration files).
- **Cross-dialect gotcha**: PostgreSQL's `Op.iLike` is not supported by SQLite — use the `iLike` helper from `server/src/utils/dbOps.js` (resolves to `Op.iLike` on postgres, `Op.like` elsewhere — SQLite's `LIKE` is already ASCII case-insensitive) for any case-insensitive search.
- **Auth flow**: `authenticate` middleware (JWT Bearer) sets `req.user`. `authorizeRoles(...roles)` guards write routes. Roles: `Admin`, `Conducteur`, `Achats`, `Comptabilité`.

### Frontend conventions
- **API calls**: All requests go through `client/src/api/axios.js` — a single Axios instance with `baseURL: '/api'`, JWT header injector, and a global 401 → redirect-to-login interceptor.
- **Auth state**: `useAuth()` from `AuthContext` — provides `{ user, login, logout }`. `user.role` drives UI permission gates.
- **UI palette** (dark theme):
  - Inputs: `bg-[#0F172A] border border-slate-700 text-white focus:border-btp-blue outline-none rounded-lg px-3 py-2`
  - Primary action button: `bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg`
  - Danger button: `bg-[#DC2626]`
  - Secondary/cancel button: `bg-slate-700 hover:bg-slate-600`
- **Shared UI components**: `Modal`, `ConfirmModal`, `DataTable`, `KpiCard`, `Badge` — reuse these instead of rolling custom UI.

### Adding a new resource (standard pattern)
1. Create `server/src/models/MyModel.js` (Sequelize `define` + `export default`)
2. Import and wire associations in `server/src/models/index.js`, add to the named `export {}`
3. Create `server/src/controllers/myController.js` (plain async functions, no try/catch)
4. Create `server/src/routes/my.js` (Router + `authenticate` + `authorizeRoles`)
5. Mount in `server/src/app.js`: `app.use('/api/my', myRoutes)`
6. Call from the frontend via `api.get/post/put/delete('/my')`

## Key files

| File | Purpose |
|---|---|
| `server/src/models/index.js` | All Sequelize associations; single source of truth for model relationships |
| `server/src/app.js` | Express setup, route mounting, DB sync & admin seed on startup |
| `server/src/config/database.js` | Sequelize connection — SQLite (default, offline) or PostgreSQL (opt-in) based on `DB_DIALECT` |
| `server/src/utils/ensureColumns.js` | Additive column migrations, run after every `sequelize.sync()` |
| `server/.env` | `DB_*`, `JWT_SECRET`, `PORT` — never committed |
| `client/src/api/axios.js` | Shared Axios instance (token injection + 401 handler) |
| `client/src/context/AuthContext.jsx` | JWT decode, login/logout, role-based guard |
| `client/src/App.jsx` | React Router route definitions |
