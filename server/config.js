/**
 * Central environment loading and validation for the API server.
 * Loads `.env` from the server directory (not dependent on process.cwd()).
 */

require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const fs = require("fs");
const path = require("path");

const isProd = process.env.NODE_ENV === "production";

function fatal(msg) {
  console.error(`FATAL: ${msg}`);
  process.exit(1);
}

function parsePort(raw) {
  const v = Number(raw ?? "5175");
  if (!Number.isInteger(v) || v < 1 || v > 65535) {
    fatal(`Invalid PORT "${raw}". Use an integer between 1 and 65535.`);
  }
  return v;
}

const JWT_MIN_LENGTH_DEV = 16;
const JWT_MIN_LENGTH_PROD = 32;

function parseJwtSecret() {
  const trimmed = process.env.JWT_SECRET?.trim();

  if (isProd) {
    if (!trimmed || trimmed.length < JWT_MIN_LENGTH_PROD) {
      fatal(
        `JWT_SECRET must be set to a random string of at least ${JWT_MIN_LENGTH_PROD} characters when NODE_ENV=production. ` +
          "Example: openssl rand -hex 32"
      );
    }
    return trimmed;
  }

  if (trimmed) {
    if (trimmed.length < JWT_MIN_LENGTH_DEV) {
      fatal(
        `JWT_SECRET is too short (${trimmed.length} chars). Use at least ${JWT_MIN_LENGTH_DEV} characters in development.`
      );
    }
    return trimmed;
  }

  const fallback =
    "local-dev-only-not-for-production-minimum-length-requirement-met-xx";
  console.warn(
    "[config] JWT_SECRET not set; using a fixed development default. " +
      "Copy server/.env.example to server/.env and set JWT_SECRET before any real deployment."
  );
  return fallback;
}

function resolveDbPath(raw) {
  const value = (raw ?? "./data.db").trim() || "./data.db";
  if (value === ":memory:") return ":memory:";
  const resolved = path.resolve(__dirname, value);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  return resolved;
}

function parseCorsOrigin() {
  const raw = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
  const origins = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (origins.length === 0) return { origin: "http://localhost:5173" };
  if (origins.length === 1) return { origin: origins[0] };
  return { origin: origins };
}

const PORT = parsePort(process.env.PORT);
const JWT_SECRET = parseJwtSecret();
const DB_PATH = resolveDbPath(process.env.DB_PATH);
const corsOptions = parseCorsOrigin();

module.exports = {
  PORT,
  JWT_SECRET,
  DB_PATH,
  corsOptions,
  isProd,
};
