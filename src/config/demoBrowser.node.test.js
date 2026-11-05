import test from "node:test";
import assert from "node:assert/strict";
import { createDemoBrowserWork } from "./demoBrowser.node.js";

test("creates a publish payload for the local demo API", () => {
  assert.deepEqual(createDemoBrowserWork(), {
    origin: "冒烟测试作品",
    author: "浏览器冒烟",
    category: "回归测试",
    content: "窗前一盏灯，照亮旧诗行。",
    title: "由本机浏览器冒烟写入 localStorage，仅用于验证发布链路。",
  });
});
