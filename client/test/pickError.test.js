import { test } from "node:test";
import assert from "node:assert/strict";
import { pickErrorMessage } from "../src/api.js";

test("pickErrorMessage prefers API body.error", () => {
  assert.equal(pickErrorMessage(400, { error: "Bad email" }), "Bad email");
});

test("pickErrorMessage maps connectivity (status 0)", () => {
  assert.match(pickErrorMessage(0, null), /reach|server/i);
});

test("pickErrorMessage maps 401", () => {
  assert.match(pickErrorMessage(401, {}), /sign in/i);
});

test("pickErrorMessage maps 409 without body", () => {
  assert.match(pickErrorMessage(409, {}), /overlap|Conflict/i);
});

test("pickErrorMessage maps 5xx", () => {
  assert.match(pickErrorMessage(502, {}), /later/i);
});
