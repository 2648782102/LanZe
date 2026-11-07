import test from "node:test";
import assert from "node:assert/strict";
import {
  POETRY_SOURCE_URL,
  buildPoetrySourceRequest,
  createPoetrySourceConfig,
  normalizeExcerpt,
} from "./poetrySource.node.js";

test("keeps local excerpts by default and allows opting into a remote source", () => {
  const config = createPoetrySourceConfig({});
  assert.equal(config.enabled, false);
  assert.equal(config.url, POETRY_SOURCE_URL);
  assert.equal(config.timeout, 4000);
  assert.equal(createPoetrySourceConfig({ VITE_POETRY_SOURCE: "remote" }).enabled, true);
  assert.equal(createPoetrySourceConfig({ VITE_POETRY_SOURCE: "jinrishici" }).enabled, true);
  assert.equal(createPoetrySourceConfig({ VITE_POETRY_SOURCE: "false" }).enabled, false);
  assert.equal(createPoetrySourceConfig({ VITE_POETRY_SOURCE: "local" }).enabled, false);
  assert.equal(
    createPoetrySourceConfig({ VITE_POETRY_SOURCE_URL: "https://poetry.example.test/all.json/" }).url,
    "https://poetry.example.test/all.json",
  );
  assert.match(
    buildPoetrySourceRequest(POETRY_SOURCE_URL, 7),
    /^https:\/\/v1\.jinrishici\.com\/all\.json\?t=\d+-7$/,
  );
  const custom = createPoetrySourceConfig({ VITE_POETRY_SOURCE_URL: "https://poetry.example.test/all.json/" });
  assert.match(custom.requestUrl(2), /^https:\/\/poetry\.example\.test\/all\.json\?t=\d+-2$/);
});

test("normalizes historical poetry source payloads defensively", () => {
  assert.deepEqual(
    normalizeExcerpt({
      content: "山有木兮木有枝。",
      origin: "越人歌",
      author: "佚名",
      category: "古诗文-先秦",
    }),
    {
      id: "excerpt-山有木兮木有枝。",
      content: "山有木兮木有枝。",
      origin: "越人歌",
      author: "佚名",
      category: "先秦",
    },
  );
  assert.equal(normalizeExcerpt({ data: null }), null);
  assert.equal(normalizeExcerpt({ content: "  " }), null);
});
