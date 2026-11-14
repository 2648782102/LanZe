import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const port = 4343;
const debugPort = 9257;
const output = "/tmp/lanze-brand-current.png";
const processes = [];
process.on("exit", () => processes.forEach((child) => !child.killed && child.kill("SIGTERM")));
const waitFor = async (url) => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(url, { signal: AbortSignal.timeout(500) })).ok) return; } catch {}
    await delay(250);
  }
  throw new Error(`timeout ${url}`);
};
const profile = await mkdtemp(join(tmpdir(), "lanze-brand-"));
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
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 2, mobile: false });
await send("Page.navigate", { url: `http://127.0.0.1:${port}/#/` });
await delay(1200);
const rect = await evaluate(`(() => {
  const node = document.querySelector('.brand');
  const box = node.getBoundingClientRect();
  return { x: box.x, y: box.y, width: box.width, height: box.height };
})()`);
const result = await send("Page.captureScreenshot", {
  format: "png", captureBeyondViewport: false,
  clip: { x: rect.x - 8, y: rect.y - 8, width: rect.width + 16, height: rect.height + 16, scale: 2 },
});
await writeFile(output, Buffer.from(result.data, "base64"));
console.log(JSON.stringify({ output, rect }));
processes.forEach((child) => !child.killed && child.kill("SIGTERM"));
