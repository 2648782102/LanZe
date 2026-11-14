import { spawn } from "node:child_process";
import { access, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const port = Number(process.env.MEASURE_PORT || 4311);
const debugPort = Number(process.env.MEASURE_DEBUG_PORT || 9227);
const chromeCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);
const origin = `http://127.0.0.1:${port}`;
const processes = [];

const stopAll = () => {
  for (const child of processes) {
    if (!child.killed) child.kill("SIGTERM");
  }
};
process.on("exit", stopAll);

const resolveChromePath = async () => {
  for (const candidate of chromeCandidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }
  throw new Error(`Chrome not found; set CHROME_PATH. Candidates: ${chromeCandidates.join(", ")}`);
};

const waitFor = async (url) => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(500) });
      if (response.ok) return;
    } catch {
      await delay(250);
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
};

const waitUntil = async (label, check, attempts = 32) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await check()) return;
    await delay(250);
  }
  throw new Error(`Timed out waiting for ${label}`);
};

const main = async () => {
  const chromePath = await resolveChromePath();
  const profile = await mkdtemp(join(tmpdir(), "lanze-excerpt-measure-"));
  const preview = spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
    { stdio: "ignore" },
  );
  processes.push(preview);
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ], { stdio: "ignore" });
  processes.push(chrome);

  await Promise.all([
    waitFor(origin),
    waitFor(`http://127.0.0.1:${debugPort}/json/version`),
  ]);

  const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
  const page = targets.find((target) => target.type === "page");
  if (!page) throw new Error("Chrome did not expose a page target");

  const socket = new WebSocket(page.webSocketDebuggerUrl);
  let nextId = 1;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    }
  });
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId += 1;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`Chrome DevTools timed out: ${method}`));
      }
    }, 10000);
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    }
    return result.result.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Performance.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: `${origin}/#/` });
  await waitUntil("excerpt card", () => evaluate("Boolean(document.querySelector('.legacy-card'))"), 60);
  await delay(600);

  const payload = await evaluate(`(async () => {
    const card = document.querySelector('.legacy-card');
    const verse = () => card.querySelector('.legacy-card__box--current .legacy-card__verse')?.textContent?.trim() || '';
    const frames = [];
    const marks = [];
    const longFrames = [];
    let observer;
    try {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          longFrames.push({
            start: Math.round(entry.startTime * 100) / 100,
            duration: Math.round(entry.duration * 100) / 100,
            blocking: Math.round((entry.blockingDuration || 0) * 100) / 100,
          });
        }
      });
      observer.observe({ type: 'long-animation-frame', buffered: true });
    } catch {}
    const t0 = performance.now();
    const loop = () => {
      frames.push({
        t: Math.round((performance.now() - t0) * 100) / 100,
        exchanging: card.classList.contains('is-exchanging'),
      });
      if (performance.now() - t0 < 4000) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    await new Promise((resolve) => setTimeout(resolve, 350));
    for (let i = 0; i < 6; i += 1) {
      const before = verse();
      const clickAt = performance.now() - t0;
      marks.push({ type: 'click', t: Math.round(clickAt * 100) / 100 });
      card.click();
      await new Promise((resolve) => {
        const check = () => {
          if (verse() !== before) {
            marks.push({ type: 'changed', t: Math.round((performance.now() - t0) * 100) / 100 });
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        requestAnimationFrame(check);
      });
      await new Promise((resolve) => {
        const check = () => {
          if (!card.classList.contains('is-exchanging')) {
            marks.push({ type: 'settled', t: Math.round((performance.now() - t0) * 100) / 100 });
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        requestAnimationFrame(check);
      });
      await new Promise((resolve) => setTimeout(resolve, 160));
    }
    for (let i = 0; i < 4; i += 1) {
      const before = verse();
      const rect = card.getBoundingClientRect();
      const cx = Math.round(rect.left + rect.width / 2);
      const cy = Math.round(rect.top + Math.min(rect.height / 3, 180));
      const options = {
        pointerId: 81,
        pointerType: 'mouse',
        isPrimary: true,
        bubbles: true,
        cancelable: true,
        button: 0,
        buttons: 1,
      };
      card.dispatchEvent(new PointerEvent('pointerdown', { ...options, clientX: cx, clientY: cy }));
      card.dispatchEvent(new PointerEvent('pointermove', { ...options, clientX: cx + 24, clientY: cy }));
      const thresholdAt = performance.now() - t0;
      card.dispatchEvent(new PointerEvent('pointermove', { ...options, clientX: cx + 48, clientY: cy }));
      marks.push({ type: 'swipeThreshold', t: Math.round(thresholdAt * 100) / 100 });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const changedBeforeUp = verse() !== before;
      const changedAt = performance.now() - t0;
      card.dispatchEvent(new PointerEvent('pointerup', { ...options, clientX: cx + 48, clientY: cy, buttons: 0 }));
      marks.push({
        type: changedBeforeUp ? 'swipeChangedBeforeUp' : 'swipeChangedAfterUp',
        t: Math.round(changedAt * 100) / 100,
      });
      await new Promise((resolve) => {
        const check = () => {
          if (verse() !== before && !card.classList.contains('is-exchanging')) resolve();
          else requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      });
      await new Promise((resolve) => setTimeout(resolve, 160));
    }
    const doubleTurnCounts = [];
    for (let i = 0; i < 3; i += 1) {
      const rect = card.getBoundingClientRect();
      const cx = Math.round(rect.left + rect.width / 2);
      const cy = Math.round(rect.top + Math.min(rect.height / 3, 180));
      const options = {
        pointerId: 91,
        pointerType: 'mouse',
        isPrimary: true,
        bubbles: true,
        cancelable: true,
        button: 0,
        buttons: 1,
      };
      card.dispatchEvent(new PointerEvent('pointerdown', { ...options, clientX: cx, clientY: cy }));
      card.dispatchEvent(new PointerEvent('pointermove', { ...options, clientX: cx + 52, clientY: cy }));
      card.dispatchEvent(new PointerEvent('pointerup', { ...options, clientX: cx + 52, clientY: cy, buttons: 0 }));
      card.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      let last = verse();
      let transitions = 0;
      const start = performance.now();
      await new Promise((resolve) => {
        const poll = () => {
          const now = verse();
          if (now !== last) {
            transitions += 1;
            last = now;
          }
          if (performance.now() - start < 600) requestAnimationFrame(poll);
          else resolve();
        };
        requestAnimationFrame(poll);
      });
      doubleTurnCounts.push(transitions);
      await new Promise((resolve) => setTimeout(resolve, 160));
    }
    observer?.disconnect();
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { frames, marks, longFrames, doubleTurnCounts };
  })()`);

  const gaps = [];
  for (let index = 1; index < payload.frames.length; index += 1) {
    gaps.push(Math.round((payload.frames[index].t - payload.frames[index - 1].t) * 100) / 100);
  }
  const sorted = [...gaps].sort((a, b) => b - a);
  const latency = [];
  const exchangeDuration = [];
  const swipeThresholdToChange = [];
  let swipeChangedBeforeUp = 0;
  let swipeChangedAfterUp = 0;
  for (let index = 0; index < payload.marks.length; index += 1) {
    if (payload.marks[index].type === "click") {
      const change = payload.marks.find((mark, offset) => offset > index && mark.type === "changed");
      const settled = payload.marks.find((mark, offset) => offset > index && mark.type === "settled");
      if (change) latency.push(Math.round((change.t - payload.marks[index].t) * 100) / 100);
      if (settled) exchangeDuration.push(Math.round((settled.t - payload.marks[index].t) * 100) / 100);
    }
    if (payload.marks[index].type === "swipeThreshold") {
      const beforeUp = payload.marks.find((mark, offset) => offset > index && mark.type === "swipeChangedBeforeUp");
      const afterUp = payload.marks.find((mark, offset) => offset > index && mark.type === "swipeChangedAfterUp");
      if (beforeUp) {
        swipeChangedBeforeUp += 1;
        swipeThresholdToChange.push(Math.round((beforeUp.t - payload.marks[index].t) * 100) / 100);
      } else if (afterUp) {
        swipeChangedAfterUp += 1;
        swipeThresholdToChange.push(Math.round((afterUp.t - payload.marks[index].t) * 100) / 100);
      }
    }
  }
  console.log(JSON.stringify({
    frameCount: payload.frames.length,
    maxFrameGapMs: sorted[0],
    topFrameGapsMs: sorted.slice(0, 8),
    gapsOver34ms: gaps.filter((gap) => gap > 34).length,
    gapsOver50ms: gaps.filter((gap) => gap > 50).length,
    turnLatencyToChangeMs: latency,
    exchangeDurationMs: exchangeDuration,
    swipeChangedBeforeUp,
    swipeChangedAfterUp,
    swipeThresholdToChangeMs: swipeThresholdToChange,
    doubleTurnCounts: payload.doubleTurnCounts,
    longAnimationFrames: payload.longFrames.filter((frame) => frame.duration > 40),
  }, null, 2));

  stopAll();
};

main().catch((error) => {
  console.error(error);
  stopAll();
  process.exit(1);
});
