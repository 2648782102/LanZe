import test from "node:test";
import assert from "node:assert/strict";

const withFakeTimers = () => {
  const originalSetTimeout = globalThis.window?.setTimeout;
  const timers = [];
  globalThis.window = globalThis.window || {};
  globalThis.window.setTimeout = (fn) => {
    timers.push(fn);
    return timers.length;
  };
  return {
    flush: () => {
      while (timers.length) timers.shift()();
    },
    restore: () => {
      if (originalSetTimeout) globalThis.window.setTimeout = originalSetTimeout;
    },
  };
};

test("keeps at most three notices and drops empty messages", async () => {
  const timers = withFakeTimers();
  const { notify, useNotices, dismissNotice } = await import("./useNotices.js");
  const { notices } = useNotices();
  const before = notices.value.length;

  assert.equal(notify(""), undefined);
  assert.equal(notices.value.length, before);

  notify("一");
  notify("二");
  notify("三");
  notify("四");
  assert.equal(notices.value.length, 3);
  assert.deepEqual(notices.value.map((notice) => notice.message), ["二", "三", "四"]);

  const firstId = notices.value[0].id;
  dismissNotice(firstId);
  assert.equal(notices.value.some((notice) => notice.id === firstId), false);

  timers.restore();
});

test("auto-dismisses each notice after its duration timer fires", async () => {
  const timers = withFakeTimers();
  const { notify, useNotices } = await import("./useNotices.js");
  const { notices } = useNotices();
  notify("自动消失", "success", 1000);
  assert.equal(notices.value.some((notice) => notice.message === "自动消失"), true);
  timers.flush();
  assert.equal(notices.value.some((notice) => notice.message === "自动消失"), false);
  timers.restore();
});
