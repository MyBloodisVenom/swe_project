const { test } = require("node:test");
const assert = require("node:assert/strict");
const { overlapsIso } = require("../lib/overlap");

test("touching intervals do not overlap (half-open)", () => {
  const aStart = "2026-05-01T10:00:00.000Z";
  const aEnd = "2026-05-01T11:00:00.000Z";
  const bStart = "2026-05-01T11:00:00.000Z";
  const bEnd = "2026-05-01T12:00:00.000Z";
  assert.equal(overlapsIso(aStart, aEnd, bStart, bEnd), false);
});

test("actual overlap detected", () => {
  assert.equal(
    overlapsIso(
      "2026-05-01T10:00:00.000Z",
      "2026-05-01T11:30:00.000Z",
      "2026-05-01T11:00:00.000Z",
      "2026-05-01T12:00:00.000Z"
    ),
    true
  );
});

test("nested overlap", () => {
  assert.equal(
    overlapsIso(
      "2026-05-01T09:00:00.000Z",
      "2026-05-01T18:00:00.000Z",
      "2026-05-01T12:00:00.000Z",
      "2026-05-01T13:00:00.000Z"
    ),
    true
  );
});
