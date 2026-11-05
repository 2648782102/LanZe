import test from "node:test";
import assert from "node:assert/strict";
import {
  failure,
  isSuccess,
  normalizeListResponse,
  normalizePoemPayload,
  success,
} from "./response.node.js";

test("recognizes success codes across legacy and modern APIs", () => {
  assert.equal(isSuccess(success({})), true);
  assert.equal(isSuccess({ code: 0 }), true);
  assert.equal(isSuccess({ status: 201 }), true);
  assert.equal(isSuccess({ code: 401 }), false);
});

test("extracts list data from common response shapes", () => {
  assert.deepEqual(normalizeListResponse([{ title: "A" }]), [{ title: "A" }]);
  assert.deepEqual(normalizeListResponse({ data: [{ title: "B" }] }), [{ title: "B" }]);
  assert.deepEqual(normalizeListResponse({ results: [{ title: "C" }] }), [{ title: "C" }]);
});

test("normalizes poems for list and detail rendering", () => {
  const payload = normalizePoemPayload({
    code: 200,
    data: [{ title: "静夜思", author: "李白", paragraphs: ["床前明月光"] }],
  });
  assert.equal(payload.data[0].poemName, "静夜思");
  assert.equal(payload.data[0].textBody, "床前明月光");
  assert.equal(payload.data[0].paragraphs.length, 1);
});

test("turns request errors into friendly messages", () => {
  assert.equal(failure({ message: "boom" }).msg, "boom");
  assert.equal(failure({ response: { status: 503, data: { msg: "维护中" } } }).code, 503);
  assert.equal(failure({ response: { status: 503, data: { msg: "维护中" } } }).msg, "维护中");
});
