# Time-Block Calendar (MVP)

React (JS) + Node/Express + SQLite scheduling app with day/week calendar, user auth, and time-block CRUD with overlap prevention.

## Prereqs
- Node.js installed

## Run backend
```bash
cd server
copy .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:5174`.

## Run frontend
```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api/*` to the backend.

## MVP rules implemented
- Users register/login/logout (JWT)
- Each user has their own blocks
- Create / edit / delete blocks
- Day + week views
- Overlaps are rejected by the API (HTTP 409). Touching end/start is allowed (\([start, end)\)).

