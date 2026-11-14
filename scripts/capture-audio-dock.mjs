import { spawn } from "node:child_process";
import { access, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const port = Number(process.env.CAPTURE_PORT || 4327);
const debugPort = Number(process.env.CAPTURE_DEBUG_PORT || 9237);
const outputDir = process.env.CAPTURE_DIR || "/tmp/lanze-audio-dock";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const origin = `http://127.0.0.1:${port}`;
const processes = [];

const stopAll = () => {
  for (const child of processes) {
    if (!child.killed) child.kill("SIGTERM");
  }
};
process.on("exit", stopAll);

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

const main = async () => {
  await access(chromePath);
  await mkdir(outputDir, { recursive: true });
  const profile = await mkdtemp(join(tmpdir(), "lanze-audio-capture-"));
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
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ], { stdio: "ignore" });
  processes.push(chrome);
  await Promise.all([waitFor(origin), waitFor(`http://127.0.0.1:${debugPort}/json/version`)]);
  const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
  const page = targets.find((target) => target.type === "page");
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
  const evaluate = async (expression) => (await send("Runtime.evaluate", {
    expression, returnByValue: true, awaitPromise: true,
  })).result?.value;
  const capture = async (name, width, height) => {
    await send("Emulation.setDeviceMetricsOverride", {
      width, height, deviceScaleFactor: 1, mobile: width <= 820,
    });
    await delay(400);
    const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    await writeFile(join(outputDir, `${name}.png`), Buffer.from(result.data, "base64"));
  };
  const layout = async () => evaluate(`(() => {
    const dock = document.querySelector('.audio-dock');
    const rect = (selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) };
    };
    return {
      dock: rect('.audio-dock'),
      handle: rect('.audio-dock__handle'),
      toggle: rect('.audio-dock__toggle'),
      stage: rect('.audio-dock__stage'),
      meta: rect('.audio-dock__meta'),
      seek: rect('.audio-dock__seek-wrap'),
      controls: rect('.audio-dock__controls'),
      state: rect('.audio-dock__state'),
      compact: rect('.audio-dock__compact-title'),
      playlist: rect('.audio-dock__playlist'),
    };
  })()`);

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url: `${origin}/#/` });
  await delay(1200);
  await capture("desktop-collapsed", 1280, 800);
  console.log("desktop-collapsed", JSON.stringify(await layout()));
  await evaluate("document.querySelector('.audio-dock__handle')?.click(); true");
  await delay(400);
  await capture("desktop-expanded", 1280, 800);
  console.log("desktop-expanded", JSON.stringify(await layout()));
  await evaluate("[...document.querySelectorAll('.audio-dock__controls button')].pop()?.click(); true");
  await delay(300);
  await capture("desktop-playlist", 1280, 800);
  console.log("desktop-playlist", JSON.stringify(await layout()));
  await evaluate("[...document.querySelectorAll('.audio-dock__controls button')].pop()?.click(); true");
  await delay(200);
  await capture("mobile-collapsed", 390, 844);
  console.log("mobile-collapsed", JSON.stringify(await layout()));
  await evaluate("document.querySelector('.audio-dock__handle')?.click(); true");
  await delay(300);
  await capture("mobile-expanded", 390, 844);
  console.log("mobile-expanded", JSON.stringify(await layout()));
  stopAll();
};

main().catch((error) => {
  console.error(error);
  stopAll();
  process.exit(1);
});
