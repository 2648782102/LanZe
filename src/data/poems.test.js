import test from "node:test";
import assert from "node:assert/strict";
import { normalizePoem, normalizePoemList } from "./poems.js";

test("keeps facets through normalization", () => {
  const poem = normalizePoem({
    id: "x-1",
    title: "春晓",
    author: "孟浩然",
    category: "唐诗",
    dynasty: "唐",
    collection: "兰泽精校",
    source: "兰泽精校",
    paragraph: "春眠不觉晓",
  });
  assert.equal(poem.dynasty, "唐");
  assert.equal(poem.collection, "兰泽精校");
  assert.equal(poem.source, "兰泽精校");
  assert.equal(poem.category, "唐诗");
});

test("falls back to empty facets when the source has none", () => {
  const [poem] = normalizePoemList([{ title: "无题", author: "佚名", paragraph: "一句" }]);
  assert.equal(poem.dynasty, "");
  assert.equal(poem.collection, "");
  assert.equal(poem.source, "");
});
