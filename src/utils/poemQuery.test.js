import test from "node:test";
import assert from "node:assert/strict";
import {
  paginate,
  parseJsonArray,
  parseJsonObject,
  parseStringArray,
  parseTags,
  normalizeDetails,
} from "./poemQuery.node.js";

test("parses route query payloads defensively", () => {
  assert.deepEqual(parseJsonArray(['[{"id":1}]', "ignored"], []), [{ id: 1 }]);
  assert.deepEqual(parseJsonArray("not-json", []), []);
  assert.deepEqual(parseJsonObject('{"title":"春晓"}', {}), { title: "春晓" });
  assert.deepEqual(parseStringArray(["甲，乙", "ignored"]), ["甲", "乙"]);
  assert.deepEqual(parseTags('["唐诗","思乡"]'), ["唐诗", "思乡"]);
});

test("paginates without mutating the source array", () => {
  const items = [1, 2, 3, 4, 5];
  assert.deepEqual(paginate(items, 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(items, [1, 2, 3, 4, 5]);
});

test("normalizes detail payloads from multiple data shapes", () => {
  const fromStrings = normalizeDetails({
    title: "静夜思",
    author: "李白",
    tags: '["唐诗"]',
    paragraphs: '["床前明月光","疑是地上霜"]',
  });
  assert.equal(fromStrings.title, "静夜思");
  assert.deepEqual(fromStrings.tags, ["唐诗"]);
  assert.deepEqual(fromStrings.paragraphs, ["床前明月光", "疑是地上霜"]);

  const fromArrays = normalizeDetails({
    poemName: "春晓",
    paragraphs: ["春眠不觉晓", "处处闻啼鸟"],
    tags: ["春天"],
  });
  assert.equal(fromArrays.title, "春晓");
  assert.equal(fromArrays.paragraphs.length, 2);
});
