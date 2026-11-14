// 以固定 191x57 CSS（= 参考图 382x114 @2x）裁切品牌区，供 1:1 对比。
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const port = Number(process.env.BRAND_PORT || 4359);
const debugPort = Number(process.env.BRAND_DEBUG_PORT || 9279);
const output = process.env.BRAND_OUTPUT || "/tmp/lanze-brand-1x1.png";
const profile = await mkdtemp(join(tmpdir(), "lanze-brand-1x1-"));
const preview = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "ignore" });
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
process.on("exit", () => { !preview.killed && preview.kill("SIGTERM"); !chrome.killed && chrome.kill("SIGTERM"); });

const waitFor = async (url) => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try { if ((await fetch(url, { signal: AbortSignal.timeout(400) })).ok) return; } catch {}
    await delay(200);
  }
  throw new Error(`timeout ${url}`);
};
await waitFor(`http://127.0.0.1:${port}`);
await waitFor(`http://127.0.0.1:${debugPort}/json/version`);
const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
const page = targets.find((target) => target.type === "page");
const socket = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id).resolve(message.result);
    pending.delete(message.id);
  }
});
await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));
const send = (method, params = {}) => new Promise((resolve) => {
  const id = nextId += 1;
  pending.set(id, { resolve });
  socket.send(JSON.stringify({ id, method, params }));
});
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 2, mobile: false });
await send("Page.navigate", { url: `http://127.0.0.1:${port}/#/` });
await delay(1600);
const boxResult = await send("Runtime.evaluate", {
  expression: `(() => {
    const rect = document.querySelector('.brand').getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  })()`,
  returnByValue: true,
});
const box = boxResult.result.value;
const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: box.x, y: box.y, width: box.width, height: box.height, scale: 2 } });
await writeFile(output, Buffer.from(shot.data, "base64"));
const metrics = await send("Runtime.evaluate", {
  expression: `(() => {
    const q = (s) => document.querySelector(s).getBoundingClientRect();
    const b = q('.brand'), m = q('.brand__mark'), n = q('.brand__name'), l = q('.brand__latin');
    return { total: +b.width.toFixed(1), mark: +m.width.toFixed(1),
      gap1: +(n.x - m.right).toFixed(1), name: +n.width.toFixed(1),
      gap2: +(l.x - n.right).toFixed(1), latin: +l.width.toFixed(1) };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify({ output, metrics: metrics.result.value }, null, 2));
preview.kill("SIGTERM");
chrome.kill("SIGTERM");
