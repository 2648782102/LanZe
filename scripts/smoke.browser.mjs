import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const port = Number(process.env.BROWSER_SMOKE_PORT || 4188);
const debugPort = Number(process.env.BROWSER_SMOKE_DEBUG_PORT || 9223);
const chromePath = process.env.CHROME_PATH
  || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
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
  const profile = await mkdtemp(join(tmpdir(), "lanze-browser-smoke-"));
  const preview = spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
    { stdio: "ignore" },
  );
  processes.push(preview);
  const chrome = spawn(chromePath, [
    "--headless=new",
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
  const events = [];
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    } else if (message.method) {
      events.push(message);
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
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: `${origin}/#/home` });
  await delay(4000);

  const home = await evaluate(`(() => ({
    href: location.href,
    title: document.title,
    appText: document.querySelector('#app')?.innerText || '',
    audioPlayers: document.querySelectorAll('.aplayer').length,
    audioTitle: document.querySelector('.aplayer-title')?.textContent?.trim() || '',
  }))()`);
  if (!home.appText.includes("山有木兮木有枝")) throw new Error("Home excerpt did not render");
  if (home.audioPlayers !== 1) throw new Error("Expected one local audio player");
  if (!home.audioTitle.includes("兰泽 · 本地演示音")) throw new Error("Local demo audio was not selected");

  const clicked = await evaluate(`(() => {
    const links = [...document.querySelectorAll('a')];
    const target = links.find(a => /文库/.test(a.innerText))
      || links.find(a => (a.getAttribute('href') || '').includes('wenku'));
    if (!target) return false;
    target.click();
    return true;
  })()`);
  if (!clicked) throw new Error("Library navigation link was not found");
  await delay(1200);

  const library = await evaluate(`(() => ({
    href: location.href,
    title: document.title,
    appText: document.querySelector('#app')?.innerText || '',
  }))()`);
  if (!library.appText.includes("唐诗三百") || !library.appText.includes("宋词三百")) {
    throw new Error("Library categories did not render");
  }

  const consoleErrors = events
    .filter((event) => event.method === "Runtime.consoleAPICalled" && event.params.type === "error")
    .map((event) => event.params.args.map((arg) => arg.value || arg.description).join(" "));
  const exceptions = events
    .filter((event) => event.method === "Runtime.exceptionThrown")
    .map((event) => event.params.exceptionDetails.text);
  const failedRequests = events
    .filter((event) => event.method === "Network.loadingFailed")
    .map((event) => event.params.errorText);
  const problems = [...consoleErrors, ...exceptions, ...failedRequests];
  if (problems.length) throw new Error(`Browser reported problems: ${problems.join(" | ")}`);

  socket.close();
  console.log(`Browser smoke passed: ${home.title} → ${library.title}, one local audio player, no console or network errors.`);
};

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  stopAll();
}
