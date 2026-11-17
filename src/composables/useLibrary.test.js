import test from "node:test";
import assert from "node:assert/strict";
import "vue";
import { demoPoems } from "../data/poems.js";
import { readStore } from "../services/browserStore.js";

const makePoem = (index) => ({
  id: `test-poem-${index}`,
  name: `测试诗 ${index}`,
  author: "测试作者",
  dynasty: "唐",
  genre: "诗",
  content: `第 ${index} 行的句子。`,
});

test("toggleSaved 往返写入 lanze_saved_poems", async () => {
  const { useLibrary, __testing } = await import("./useLibrary.js");
  const library = useLibrary();
  const poem = demoPoems[0];

  assert.equal(library.isSaved(poem.id), false);
  assert.equal(library.toggleSaved(poem), true, "首次点击应返回 true（已收藏）");
  assert.equal(library.isSaved(poem.id), true);
  assert.ok(
    readStore(__testing.SAVED_KEY, []).some((item) => item.id === poem.id),
    "收藏应持久化到 localStorage",
  );

  assert.equal(library.toggleSaved(poem), false, "再次点击应返回 false（已取消）");
  assert.equal(library.isSaved(poem.id), false);
  assert.ok(
    !readStore(__testing.SAVED_KEY, []).some((item) => item.id === poem.id),
    "取消后应从存储里移除",
  );
});

test("recordRecent 去重并把最近读过的诗限制在 12 条", async () => {
  const { useLibrary, __testing } = await import("./useLibrary.js");
  const library = useLibrary();

  for (let index = 0; index < 14; index += 1) library.recordRecent(makePoem(index));
  assert.equal(library.recentPoems.value.length, 12, "最多保留 12 条");

  // 重复读同一首应提到最前，不新增条目
  library.recordRecent(makePoem(3));
  assert.equal(library.recentPoems.value.length, 12);
  assert.equal(library.recentPoems.value[0].id, "test-poem-3");

  const recentIds = readStore(__testing.RECENT_KEY, []).map((item) => item.id);
  assert.equal(recentIds[0], "test-poem-3", "最近读过的顺序也要持久化");
});

test("getPoem 能在没有馆藏记录时回落到已收藏与最近读过", async () => {
  const { useLibrary } = await import("./useLibrary.js");
  const library = useLibrary();
  const poem = demoPoems[0];

  library.toggleSaved(poem);
  const found = library.getPoem(poem.id);
  assert.ok(found, "已收藏的诗应能被 getPoem 取到");
  assert.equal(found.id, poem.id);

  assert.equal(library.getPoem("looks-like-a-missing-id"), null);
});
