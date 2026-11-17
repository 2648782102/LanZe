import test from "node:test";
import assert from "node:assert/strict";
// 同 useSession 测试：先让 Vue 在没有 document 的环境完成初始化。
import "vue";

/* useNotices 会用 window.setTimeout 做自动消失，node 里给个手动触发的替身。 */
const timers = [];
globalThis.window = globalThis.window || {};
globalThis.window.setTimeout = (fn) => {
  timers.push(fn);
  return timers.length;
};
const flushTimers = () => {
  while (timers.length) timers.shift()();
};

const SAVES_KEY = "lanze_saved_excerpts";

test("prepareRemote 在没有远程源时把本地队列填满", async () => {
  const { useExcerptDeck } = await import("./useExcerptDeck.js");
  const deck = useExcerptDeck();
  // 默认 VITE_POETRY_SOURCE=local，prepareRemote 只填本地队列、不发起请求
  await deck.prepareRemote();
  assert.equal(deck.depth.value, 6, "队列应填到 EXCERPT_QUEUE_SIZE");
  assert.equal(deck.sourceLabel.value, "诗句源：馆内诗笺");
});

test("turn 在 loading 状态不切页，队列长度保持不变", async () => {
  const { useExcerptDeck } = await import("./useExcerptDeck.js");
  const deck = useExcerptDeck();
  await deck.prepareRemote();
  const before = deck.depth.value;
  deck.turn();
  assert.equal(deck.status.value, "loading", "未完成首次加载时不应切页");
  assert.equal(deck.depth.value, before, "turn 不应消耗队列");
});

test("toggleSavedExcerpt 往返写入 localStorage", async () => {
  const { useExcerptDeck } = await import("./useExcerptDeck.js");
  const { readStore } = await import("../services/browserStore.js");
  const deck = useExcerptDeck();
  const target = { content: "落日照大旗，马鸣风萧萧。" };

  deck.toggleSavedExcerpt(target);
  flushTimers();
  assert.deepEqual(readStore(SAVES_KEY, []), [`excerpt-${target.content}`]);

  // 再点一次应移除，而不是重复追加
  deck.toggleSavedExcerpt(target);
  flushTimers();
  assert.deepEqual(readStore(SAVES_KEY, []), []);
});
