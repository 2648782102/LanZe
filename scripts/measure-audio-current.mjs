import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const port = 4333;
const debugPort = 9247;
const processes = [];
process.on("exit", () => processes.forEach((child) => !child.killed && child.kill("SIGTERM")));
const waitFor = async (url) => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(url, { signal: AbortSignal.timeout(500) })).ok) return; } catch {}
    await delay(250);
  }
  throw new Error(`timeout ${url}`);
};
const profile = await mkdtemp(join(tmpdir(), "lanze-current-"));
const preview = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "ignore" });
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
processes.push(preview, chrome);
await Promise.all([waitFor(`http://127.0.0.1:${port}`), waitFor(`http://127.0.0.1:${debugPort}/json/version`)]);
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
    message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
  }
});
await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId += 1;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
  setTimeout(() => pending.has(id) && (pending.delete(id), reject(new Error(`timeout ${method}`))), 10000);
});
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.value;
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: `http://127.0.0.1:${port}/#/` });
await delay(1200);
await evaluate("document.querySelector('.audio-dock__handle')?.click(); true");
await delay(500);
const data = await evaluate(`(() => {
  const dock = document.querySelector('.audio-dock').getBoundingClientRect();
  const box = (selector) => {
    const node = document.querySelector(selector);
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    return {
      x: Math.round(rect.left - dock.left),
      y: Math.round(rect.top - dock.top),
      w: Math.round(rect.width),
      h: Math.round(rect.height),
    };
  };
  return {
    card: { w: Math.round(dock.width), h: Math.round(dock.height) },
    handle: box('.audio-dock__handle'),
    toggle: box('.audio-dock__toggle'),
    cover: box('.audio-dock__cover'),
    title: box('.audio-dock__title'),
    subtitle: box('.audio-dock__subtitle'),
    time: box('.audio-dock__time'),
    state: box('.audio-dock__state'),
    seek: box('.audio-dock__seek'),
    controls: box('.audio-dock__controls'),
    index: box('.audio-dock__index'),
    volume: box('.audio-dock__volume'),
  };
})()`);
console.log(JSON.stringify(data, null, 2));
processes.forEach((child) => !child.killed && child.kill("SIGTERM"));
