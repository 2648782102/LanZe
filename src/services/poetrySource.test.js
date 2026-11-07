import test from "node:test";
import assert from "node:assert/strict";
import { demoExcerpts } from "../data/poems.js";
import { loadExcerptFromSource, makeLocalExcerpt } from "./poetrySource.js";

test("keeps a stable local fallback for every requested excerpt index", () => {
  assert.equal(makeLocalExcerpt(0).content, demoExcerpts[0].content);
  assert.equal(makeLocalExcerpt(demoExcerpts.length).id, `excerpt-${demoExcerpts[0].content}`);
  assert.equal(makeLocalExcerpt(-2).id, `excerpt-${demoExcerpts[2].content}`);
});

test("falls back to the next built-in excerpt when a source repeats the current verse", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ content: "山有木兮木有枝。" }),
  });
  try {
    const result = await loadExcerptFromSource({ index: 1, previousContent: "山有木兮木有枝。" });
    assert.equal(result.source, "local");
    assert.equal(result.reason, "duplicate");
    assert.equal(result.excerpt.content, demoExcerpts[1].content);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
