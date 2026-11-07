import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  loadPoetryCatalog,
  getDailyLibraryPoem,
  getLibraryExcerpt,
  getLibraryPage,
  getLibraryPoem,
  getRelatedLibraryPoems,
} from "./poetryCatalog.js";

const manifest = JSON.parse(await readFile("public/data/poetry/manifest.json", "utf8"));
const collections = await Promise.all(
  manifest.collections.map(async (entry) =>
    JSON.parse(await readFile(`public/data/poetry/${entry.id}.json`, "utf8")),
  ),
);

test("loads offline corpus from split collections", async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url) => {
    const name = String(url).split("/").pop();
    requests.push(name);
    const payload = name === "manifest.json"
      ? manifest
      : collections[manifest.collections.findIndex((entry) => `${entry.id}.json` === name)];
    return { ok: Boolean(payload), json: async () => payload };
  };
  try {
    const catalog = await loadPoetryCatalog({ force: true });
    assert.equal(requests[0], "manifest.json");
    assert.equal(requests.length, manifest.collections.length + 1);
    assert.ok(catalog.length > 9000);
    assert.equal(catalog[0].id, "demo-jingyesi");
    assert.ok(catalog.some((poem) => poem.category === "宋词"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("catalog records keep stable ids, source metadata and poem lines", () => {
  const first = getLibraryPage({ page: 1, pageSize: 1 }).items[0];
  assert.equal(first.id, "demo-jingyesi");
  assert.equal(first.title, "静夜思");
  assert.equal(first.dynasty, "唐诗");
  assert.equal(first.collection, "兰泽精校");
  assert.equal(first.paragraphs.length, 2);
  assert.equal(getLibraryPoem(first.id).id, first.id);
});

test("search, facets and pagination return bounded results", () => {
  const all = getLibraryPage({ page: 1, pageSize: 24 });
  const second = getLibraryPage({ page: 2, pageSize: 24 });
  const search = getLibraryPage({ keyword: "李白", page: 1, pageSize: 12 });
  const filtered = getLibraryPage({ dynasty: "宋", genre: "宋词", page: 1, pageSize: 12 });
  const bounded = getLibraryPage({ page: 9999, pageSize: 24 });

  assert.equal(all.items.length, 24);
  assert.notEqual(all.items[0].id, second.items[0].id);
  assert.equal(search.items.length, 12);
  assert.ok(search.items.some((poem) => poem.author === "李白" || poem.searchText.includes("李白")));
  assert.ok(filtered.items.every((poem) => poem.dynasty === "宋" && poem.category === "宋词"));
  assert.equal(bounded.page, bounded.totalPages);
});

test("daily reading, excerpts and related poems stay offline", () => {
  const daily = getDailyLibraryPoem(new Date("2026-11-07T00:00:00Z"));
  const excerpt = getLibraryExcerpt(0);
  const sourcePoem = getLibraryPoem("shijing-13-0");
  const related = getRelatedLibraryPoems(sourcePoem, 3);

  assert.ok(daily.id && daily.paragraphs.length);
  assert.equal(excerpt.origin, "静夜思");
  assert.ok(sourcePoem);
  assert.equal(related.length, 3);
  assert.ok(related.every((poem) => poem.id !== sourcePoem.id));
  assert.ok(related.every((poem) => poem.category === "诗经" || poem.author === sourcePoem.author));
});
