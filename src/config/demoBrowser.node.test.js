import test from "node:test";
import assert from "node:assert/strict";
import { createDemoBrowserWork } from "./demoBrowser.node.js";

test("creates a publish payload for the local API", () => {
  assert.deepEqual(createDemoBrowserWork(), {
    origin: "窗前一纸",
    author: "兰泽来客",
    category: "即兴",
    content: "窗前一盏灯，照亮旧诗行。",
    title: "写在窗前，留在此页。",
  });
});
