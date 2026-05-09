# FocusBlocks

**FocusBlocks** is a semester-ready full-stack app: **React (Vite)** calendar UI with **Node/Express** API, **SQLite** storage, **JWT** auth, and **time-block CRUD** with overlap prevention (half-open intervals: touching slots are allowed).

## Documentation (course submission)

- [Analysis — requirements, use cases, scope](docs/ANALYSIS.md)
- [Design — architecture, data model, API, behavior](docs/DESIGN.md)

## Features

- Register, login, logout
- Per-user time blocks
- **Day**, **week**, and **month** views
- Create / edit / delete blocks (modal)
- API returns **409** when a block would overlap another

## Automated tests

After `npm install` in each package:

```bash
cd server && npm test
cd client && npm test
```

Server tests cover overlap math and Zod validation (including auth and block payloads). Client tests cover HTTP/network error messaging used by the UI.

## Prerequisites

- **Node.js** ≥ 18.18 ([nodejs.org](https://nodejs.org/))
- npm (bundled with Node)

If `npm run build` in `client` fails with “vite not recognized”, run `npm install` again inside `client/` (dependencies must be present locally).

## Quick start

Use **two terminals**: one for the API, one for the Vite client.

### 1. Backend (`server/`)

```bash
cd server
```

Create `server/.env` from the template (required for a stable local JWT secret and documented defaults):

**Windows (PowerShell)**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux**

```bash
cp .env.example .env
```

Install and run:

```bash
npm install
npm run dev
```

The API listens on **`http://localhost:5175`** by default (see `PORT` in `server/.env`).

Health check: `GET http://localhost:5175/api/health` → `{ "ok": true }`

### 2. Frontend (`client/`)

```bash
cd client
npm install
npm run dev
```

Open **`http://localhost:5173`**. The dev server proxies **`/api`** to the backend URL in `client/.env.example` (`VITE_DEV_API_ORIGIN`, default `http://localhost:5175`). If you change `PORT` on the server, copy `client/.env.example` to `client/.env` and set `VITE_DEV_API_ORIGIN` to match.

## Environment variables

| Location | Variable | Purpose |
|----------|----------|---------|
| `server/.env` | `PORT` | API port (default `5175`) |
| `server/.env` | `JWT_SECRET` | JWT signing secret (≥16 chars in development; **≥32 chars required** when `NODE_ENV=production`) |
| `server/.env` | `DB_PATH` | SQLite file path, resolved relative to `server/` (parent dirs created on startup) |
| `server/.env` | `CLIENT_ORIGIN` | CORS allowed origin(s); default `http://localhost:5173`. Comma-separated list allowed |
| `server/.env` | `NODE_ENV` | Set to `production` when deploying |
| `client/.env` | `VITE_DEV_API_ORIGIN` | Vite proxy target for `/api` during development |

Tracked templates (safe to commit): **`server/.env.example`**, **`client/.env.example`**.

## Production notes

- Set **`NODE_ENV=production`** and a strong **`JWT_SECRET`** (e.g. `openssl rand -hex 32`).
- Serve the built client (`npm run build` in `client/`) from static hosting or behind the same origin as the API; configure **`CLIENT_ORIGIN`** to your real browser origin(s).
- Run the API with **`npm start`** in `server/` (no file watcher).

## Submitting / GitHub

1. Ensure **`server/.env`** and **`client/.env`** are **not** committed (they are ignored).
2. **`*.db`** files are ignored; graders clone fresh and get an empty DB on first API start.
3. Commit **`server/.env.example`** and **`client/.env.example`** so setup steps stay reproducible.

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

## Troubleshooting

### `better-sqlite3` native module error after switching Node version

From `server/`:

```bash
npm rebuild better-sqlite3
```

Stop any running API first so Windows can replace the `.node` file.

### CORS errors in the browser

Align **`CLIENT_ORIGIN`** in `server/.env` with the exact URL Vite prints (scheme + host + port).

## Project layout

- `client/` — React UI, Vite
- `server/` — Express API, SQLite via `better-sqlite3`, Zod validation (`validation.js`)

## License

ISC (see `server/package.json`). Adjust for your course requirements if needed.
