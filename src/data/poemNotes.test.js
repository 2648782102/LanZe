import test from "node:test";
import assert from "node:assert/strict";
import { poemNotes, getPoemNote } from "./poemNotes.js";
import { curatedPoems } from "./poetryCatalog.js";

test("every note targets a real curated poem", () => {
  const ids = new Set(curatedPoems.map((poem) => poem.id));
  for (const id of Object.keys(poemNotes)) {
    assert.ok(ids.has(id), `note for unknown poem: ${id}`);
  }
});

test("each note has usable text and no empty lines", () => {
  for (const [id, note] of Object.entries(poemNotes)) {
    assert.ok(note.translation.length > 0, `${id} missing translation`);
    for (const line of note.translation) {
      assert.equal(typeof line, "string");
      assert.ok(line.trim().length > 0, `${id} has an empty translation line`);
    }
    assert.ok(note.note.trim().length > 0, `${id} missing note`);
  }
});

test("getPoemNote returns null for unknown or empty ids", () => {
  assert.equal(getPoemNote("nope"), null);
  assert.equal(getPoemNote(""), null);
  assert.equal(getPoemNote(undefined), null);
  assert.ok(getPoemNote("demo-jingyesi"));
});
