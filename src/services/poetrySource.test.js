import test from "node:test";
import assert from "node:assert/strict";
import { demoExcerpts } from "../data/poems.js";
import { createPoetrySourceConfig } from "../config/poetrySource.js";
import { loadExcerptFromSource, makeLocalExcerpt } from "./poetrySource.js";

test("keeps a stable local fallback for every requested excerpt index", () => {
  assert.equal(makeLocalExcerpt(0).content, demoExcerpts[0].content);
  assert.equal(makeLocalExcerpt(demoExcerpts.length).id, `excerpt-${demoExcerpts[0].content}`);
  assert.equal(makeLocalExcerpt(-2).id, `excerpt-${demoExcerpts[2].content}`);
});

test("falls back to the next built-in excerpt when a source repeats the current verse", async () => {
  const originalFetch = globalThis.fetch;
  const remoteConfig = createPoetrySourceConfig({ VITE_POETRY_SOURCE: "remote" });
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ content: "山有木兮木有枝。" }),
  });
  try {
    const result = await loadExcerptFromSource({
      index: 1,
      previousContent: "山有木兮木有枝。",
      config: remoteConfig,
    });
    assert.equal(result.source, "local");
    assert.equal(result.reason, "duplicate");
    assert.equal(result.excerpt.content, "床前明月光，疑是地上霜。");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("local fallback draws from the offline catalog for alternating indexes", () => {
  const first = makeLocalExcerpt(0);
  const second = makeLocalExcerpt(1);
  assert.equal(first.content, demoExcerpts[0].content);
  assert.equal(second.content, "床前明月光，疑是地上霜。");
  assert.equal(second.origin, "静夜思");
  assert.equal(second.category, "唐诗");
});
