import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const port = 4341;
const debugPort = 9255;
const processes = [];
process.on("exit", () => processes.forEach((child) => !child.killed && child.kill("SIGTERM")));
const waitFor = async (url) => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(url, { signal: AbortSignal.timeout(500) })).ok) return; } catch {}
    await delay(250);
  }
  throw new Error(`timeout ${url}`);
};

const profile = await mkdtemp(join(tmpdir(), "lanze-spacing-"));
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

const probe = `(() => {
  const rect = (selector) => {
    const node = document.querySelector(selector);
    if (!node) return null;
    const box = node.getBoundingClientRect();
    if (!box.width && !box.height) return null;
    return { top: Math.round(box.top * 10) / 10, bottom: Math.round(box.bottom * 10) / 10,
      left: Math.round(box.left * 10) / 10, right: Math.round(box.right * 10) / 10 };
  };
  const pair = (label, upper, lower) => {
    const a = rect(upper), b = rect(lower);
    const stacked = a && b && a.left < b.right && b.left < a.right;
    return { label, gap: stacked ? Math.round((b.top - a.bottom) * 10) / 10 : null, upper: a, lower: b };
  };
  const hint = rect('.legacy-card__hint');
  const nextBlock = document.querySelector('.strip-intro');
  const nextRect = nextBlock ? rectOf(nextBlock) : null;
  const stackedWithNext = hint && nextRect && hint.left < nextRect.right && nextRect.left < hint.right;
  return [
    pair('card stack -> hint', '.legacy-card__stack', '.legacy-card__hint'),
    pair('card box -> hint', '.legacy-card__box--current', '.legacy-card__hint'),
    pair('card -> hint', '.legacy-card', '.legacy-card__hint'),
    { label: 'hint -> next block', gap: stackedWithNext ? Math.round((nextRect.top - hint.bottom) * 10) / 10 : null, upper: hint, lower: nextRect },
    { label: 'exhibit frame -> caption', gap: (() => {
      const node = document.querySelector('.exhibit-card__caption');
      return node ? Math.round(parseFloat(getComputedStyle(node).paddingTop) * 10) / 10 : null;
    })(), upper: null, lower: null },
    pair('poem body -> actions', '.poem-plinth__body', '.poem-plinth__actions'),
    pair('strip h2 -> strip copy', '.strip-intro h2', '.strip-intro > p:not(.eyebrow)'),
    pair('strip copy -> actions', '.strip-intro > p:not(.eyebrow)', '.strip-actions'),
    pair('strip actions -> source', '.strip-actions', '.excerpt-source'),
    pair('room meta -> title', '.poem-plinth__meta', '.poem-plinth h1'),
    { label: 'exhibit caption padding', gap: (() => {
      const node = document.querySelector('.exhibit-card__caption');
      return node ? Math.round(parseFloat(getComputedStyle(node).paddingTop) * 10) / 10 : null;
    })(), upper: null, lower: null },
    { label: 'footer column overlap', gap: null, upper: null, lower: null },
    ...(() => {
      const selectors = [
        '.legacy-card__hint', '.excerpt-source', '.legacy-card-status',
        '.auth-fineprint', '.compose-login-note', '.poem-disclaimer',
        '.corpus-note', '.audio-dock__playlist > p', '.notice-host .notice',
      ];
      return selectors.flatMap((selector) => {
        const nodes = [...document.querySelectorAll(selector)];
        return nodes.map((node, index) => {
          const box = node.getBoundingClientRect();
          let previous = node.previousElementSibling;
          while (previous && !previous.getClientRects().length) previous = previous.previousElementSibling;
          const gap = previous
            ? Math.round((box.top - previous.getBoundingClientRect().bottom) * 10) / 10
            : null;
          return { label: 'small:' + selector + '[' + index + ']', gap,
            upper: previous ? rectOf(previous) : null, lower: rectOf(node) };
        });
      });
    })(),
  ];
  function rectOf(node) {
    const box = node.getBoundingClientRect();
    return { top: Math.round(box.top * 10) / 10, bottom: Math.round(box.bottom * 10) / 10,
      left: Math.round(box.left * 10) / 10, right: Math.round(box.right * 10) / 10 };
  }
})()`;

const routes = [
  ["today", "/#/"],
  ["login", "/#/login"],
  ["compose", "/#/compose"],
  ["collection", "/#/collection"],
  ["explore", "/#/explore"],
];

for (const [name, width, height] of [["desktop", 1280, 800], ["mobile", 390, 844]]) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 820 });
  for (const [routeName, route] of routes) {
    await send("Page.navigate", { url: `http://127.0.0.1:${port}${route}` });
    await delay(1000);
    const rows = await evaluate(probe);
    console.log(`=== ${name} ${width}x${height} ${routeName} ===`);
    for (const row of rows) if (row.gap !== null && row.gap < 8) console.log(`TIGHT ${row.label.padEnd(34)} gap=${row.gap}`);
  }
}
processes.forEach((child) => !child.killed && child.kill("SIGTERM"));
