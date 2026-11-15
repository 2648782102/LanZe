import test from "node:test";
import assert from "node:assert/strict";
import { __testing } from "./useExploreQuery.js";

const { pageWindowFor } = __testing;

test("page window lists every page when total is small", () => {
  assert.deepEqual(pageWindowFor(1, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(pageWindowFor(5, 7), [1, 2, 3, 4, 5, 6, 7]);
});

test("page window condenses long ranges with ellipses", () => {
  assert.deepEqual(pageWindowFor(1, 390), [1, 2, 3, 4, "…", 390]);
  assert.deepEqual(pageWindowFor(200, 390), [1, "…", 199, 200, 201, "…", 390]);
  assert.deepEqual(pageWindowFor(389, 390), [1, "…", 387, 388, 389, 390]);
});

test("page window never emits out-of-range pages or duplicates", () => {
  for (const total of [8, 20, 390]) {
    for (let page = 1; page <= total; page += 1) {
      const entries = pageWindowFor(page, total).filter((entry) => typeof entry === "number");
      assert.ok(entries.includes(page), `page ${page} missing for total ${total}`);
      assert.equal(new Set(entries).size, entries.length);
      assert.ok(entries.every((entry) => entry >= 1 && entry <= total));
    }
  }
});
