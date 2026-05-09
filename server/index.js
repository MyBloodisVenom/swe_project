const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { PORT, JWT_SECRET, DB_PATH, corsOptions, isProd } = require("./config");
const { openDb } = require("./db");
const { makeAuthMiddleware } = require("./auth");
const { registerSchema, loginSchema, blockUpsertSchema } = require("./validation");
const { formatZodError } = require("./util/zodFormat");

const db = openDb(DB_PATH);

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

const auth = makeAuthMiddleware({ jwtSecret: JWT_SECRET });

function issueToken(user) {
  return jwt.sign({ email: user.email }, JWT_SECRET, { subject: String(user.id), expiresIn: "7d" });
}

function hasOverlap({ userId, startIso, endIso, excludeId = null }) {
  const rows = db
    .prepare(
      `
      SELECT id, start_time, end_time, type
      FROM blocks
      WHERE user_id = ?
        AND NOT (end_time <= ? OR start_time >= ?)
        ${excludeId ? "AND id != ?" : ""}
    `
    )
    .all(excludeId ? [userId, startIso, endIso, excludeId] : [userId, startIso, endIso]);

  return rows.length > 0;
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/register", (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: formatZodError(parsed) });

  const { email, password } = parsed.data;
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const password_hash = bcrypt.hashSync(password, 10);
  const info = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(email, password_hash);
  const user = { id: info.lastInsertRowid, email };

  return res.status(201).json({ token: issueToken(user), user });
});

app.post("/api/auth/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: formatZodError(parsed) });

  const { email, password } = parsed.data;
  const user = db.prepare("SELECT id, email, password_hash FROM users WHERE email = ?").get(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  return res.json({ token: issueToken(user), user: { id: user.id, email: user.email } });
});

app.get("/api/me", auth, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/blocks", auth, (req, res) => {
  const start = req.query.start;
  const end = req.query.end;

  let rows;
  if (typeof start === "string" && typeof end === "string") {
    rows = db
      .prepare(
        `
        SELECT id, user_id, title, start_time, end_time, importance, location, type
        FROM blocks
        WHERE user_id = ?
          AND start_time < ?
          AND end_time > ?
        ORDER BY start_time ASC
      `
      )
      .all(req.user.id, end, start);
  } else {
    rows = db
      .prepare(
        `
        SELECT id, user_id, title, start_time, end_time, importance, location, type
        FROM blocks
        WHERE user_id = ?
        ORDER BY start_time ASC
      `
      )
      .all(req.user.id);
  }

  res.json({ blocks: rows });
});

app.post("/api/blocks", auth, (req, res) => {
  const parsed = blockUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: formatZodError(parsed) });
  const b = parsed.data;

  if (b.end_time <= b.start_time) return res.status(400).json({ error: "end_time must be after start_time" });

  if (hasOverlap({ userId: req.user.id, startIso: b.start_time, endIso: b.end_time })) {
    return res.status(409).json({ error: "Block overlaps an existing block" });
  }

  const info = db
    .prepare(
      `
      INSERT INTO blocks (user_id, title, start_time, end_time, importance, location, type, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `
    )
    .run(req.user.id, b.title, b.start_time, b.end_time, b.importance, b.location ?? null, b.type);

  const created = db
    .prepare(
      `
      SELECT id, user_id, title, start_time, end_time, importance, location, type
      FROM blocks
      WHERE id = ?
    `
    )
    .get(info.lastInsertRowid);

  return res.status(201).json({ block: created });
});

app.put("/api/blocks/:id", auth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid block id" });

  const existing = db.prepare("SELECT id FROM blocks WHERE id = ? AND user_id = ?").get(id, req.user.id);
  if (!existing) return res.status(404).json({ error: "Block not found" });

  const parsed = blockUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: formatZodError(parsed) });
  const b = parsed.data;

  if (b.end_time <= b.start_time) return res.status(400).json({ error: "end_time must be after start_time" });

  if (hasOverlap({ userId: req.user.id, startIso: b.start_time, endIso: b.end_time, excludeId: id })) {
    return res.status(409).json({ error: "Block overlaps an existing block" });
  }

  db.prepare(
    `
      UPDATE blocks
      SET title = ?,
          start_time = ?,
          end_time = ?,
          importance = ?,
          location = ?,
          type = ?,
          updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `
  ).run(b.title, b.start_time, b.end_time, b.importance, b.location ?? null, b.type, id, req.user.id);

  const updated = db
    .prepare(
      `
      SELECT id, user_id, title, start_time, end_time, importance, location, type
      FROM blocks
      WHERE id = ?
    `
    )
    .get(id);

  return res.json({ block: updated });
});

app.delete("/api/blocks/:id", auth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid block id" });

  const info = db.prepare("DELETE FROM blocks WHERE id = ? AND user_id = ?").run(id, req.user.id);
  if (info.changes === 0) return res.status(404).json({ error: "Block not found" });

  return res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  if (!isProd) {
    console.log(`[config] SQLite database: ${DB_PATH}`);
  }
});

