const { test } = require("node:test");
const assert = require("node:assert/strict");
const { registerSchema, loginSchema, blockUpsertSchema } = require("../validation");

test("register: password must be at least 8 characters", () => {
  const bad = registerSchema.safeParse({ email: "user@example.com", password: "short" });
  assert.equal(bad.success, false);
  const ok = registerSchema.safeParse({ email: "user@example.com", password: "12345678" });
  assert.equal(ok.success, true);
});

test("register: email normalized and validated", () => {
  const r = registerSchema.safeParse({ email: "  USER@EXAMPLE.COM  ", password: "12345678" });
  assert.equal(r.success, true);
  assert.equal(r.data.email, "user@example.com");
});

test("block: title required", () => {
  const bad = blockUpsertSchema.safeParse({
    title: "   ",
    start_time: "2026-05-01T10:00:00.000Z",
    end_time: "2026-05-01T11:00:00.000Z",
    importance: 3,
    location: null,
    type: "flexible",
  });
  assert.equal(bad.success, false);
});

test("block: valid ISO datetimes accepted", () => {
  const ok = blockUpsertSchema.safeParse({
    title: "Deep work",
    start_time: "2026-05-01T10:00:00.000Z",
    end_time: "2026-05-01T11:00:00.000Z",
    importance: 4,
    location: "Lab",
    type: "locked",
  });
  assert.equal(ok.success, true);
});

test("login: empty password rejected", () => {
  const bad = loginSchema.safeParse({ email: "a@b.co", password: "" });
  assert.equal(bad.success, false);
});

test("block: importance coerced from numeric string", () => {
  const ok = blockUpsertSchema.safeParse({
    title: "Study",
    start_time: "2026-05-01T10:00:00.000Z",
    end_time: "2026-05-01T11:00:00.000Z",
    importance: "4",
    location: null,
    type: "flexible",
  });
  assert.equal(ok.success, true);
  assert.equal(ok.data.importance, 4);
});
