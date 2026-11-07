import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createDemoBrowserWork } from "../src/config/demoBrowser.node.js";

const port = Number(process.env.BROWSER_SMOKE_PORT || 4188);
const debugPort = Number(process.env.BROWSER_SMOKE_DEBUG_PORT || 9223);
const chromePath = process.env.CHROME_PATH
  || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const origin = `http://127.0.0.1:${port}`;
const processes = [];
let currentStep = "boot";

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

const waitUntil = async (label, check, attempts = 32) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const value = await check();
    if (value) return value;
    await delay(250);
  }
  throw new Error(`Timed out waiting for ${label}`);
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
  const layoutShifts = [];
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    } else if (message.method) {
      events.push(message);
      if (message.method === "Performance.layoutShift" && !message.params?.hadRecentInput) {
        layoutShifts.push(message.params?.score || 0);
      }
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
      const details = result.exceptionDetails;
      throw new Error([
        details.text,
        details.exception?.description,
        `${details.url || "inline"}:${(details.lineNumber ?? -1) + 1}`,
      ].filter(Boolean).join(" | "));
    }
    return result.result.value;
  };
  const clickByText = (text) => evaluate(`(() => {
    const target = [...document.querySelectorAll('button, a, [role="button"]')]
      .find((node) => (node.innerText || node.textContent || '').includes(${JSON.stringify(text)}));
    if (!target) return false;
    target.click();
    return true;
  })()`);
  const setInput = (selector, value) => evaluate(`(() => {
    const input = document.querySelector(${JSON.stringify(selector)});
    if (!input) return false;
    const prototype = input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    setter?.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  const clearLocalState = () => evaluate(`(() => {
    try {
      for (const key of [
        'lanze_demo_users',
        'lanze_demo_works',
        'lanze_demo_profile',
        'lanze_saved_poems',
        'lanze_recent_poems',
        'lanze_compose_draft',
      ]) {
        localStorage.removeItem(key);
      }
    } catch {}
    for (const key of ['lanze_user', 'lanze_upload']) {
      document.cookie = key + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    return true;
  })()`);

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Network.enable");
  await send("Performance.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });

  currentStep = "today";
  await send("Page.navigate", { url: `${origin}/#/` });
  await waitUntil("today's reading view", () => evaluate("Boolean(document.querySelector('.poem-plinth'))"));

  const home = await evaluate(`(() => ({
    href: location.href,
    title: document.title,
    text: document.querySelector('#app')?.innerText || '',
    audioDocks: document.querySelectorAll('.audio-dock').length,
    audioTitle: document.querySelector('.audio-dock__title')?.textContent?.trim() || '',
    navCount: document.querySelectorAll('.main-nav a').length,
  }))()`);
  if (!home.text.includes("余韵 · 三则")) throw new Error("Today's reading page did not render");
  if (home.audioDocks !== 1) throw new Error("Expected one native local audio dock");
  if (!home.audioTitle.includes("兰泽 · 本地演示音")) throw new Error("Local demo audio was not selected");
  if (home.navCount !== 3) throw new Error("Primary navigation did not render");

  if (!await clickByText("收入诗卷")) throw new Error("Save-to-collection button was not found");
  currentStep = "save";
  const savedCount = await waitUntil("saved poem in local storage", () => evaluate(`(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lanze_saved_poems') || '[]');
      return Array.isArray(saved) ? saved.length : 0;
    } catch {
      return 0;
    }
  })()`).then((value) => value > 0 && value));
  if (!savedCount) throw new Error("Saving a poem did not persist locally");

  if (!await clickByText("寻诗")) throw new Error("Explore navigation link was not found");
  currentStep = "explore";
  await waitUntil("explore view", () => evaluate("Boolean(document.querySelector('#global-search'))"));
  const explore = await evaluate("document.querySelector('#app')?.innerText || ''");
  if (!explore.includes("全部诗目") || !explore.includes("唐诗") || !explore.includes("宋词")) {
    throw new Error("Explore index or categories did not render");
  }

  if (!await setInput("#global-search", "李白")) throw new Error("Explore search input was not found");
  currentStep = "desktop search";
  await evaluate("document.querySelector('#global-search').closest('form').requestSubmit()");
  const desktopSearch = await waitUntil("desktop search results", () => evaluate(`(() => ({
    href: location.href,
    text: document.querySelector('#app')?.innerText || '',
  }))()`).then((value) => value.href.includes("q=") && value.text.includes("李白") ? value : null));
  if (!desktopSearch.text.includes("找到")) throw new Error("Desktop search summary did not render");

  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Page.navigate", { url: `${origin}/#/explore` });
  currentStep = "mobile layout";
  await waitUntil("mobile search input", () => evaluate("Boolean(document.querySelector('#global-search'))"));
  const mobileLayout = await evaluate(`(() => ({
    mobileDock: getComputedStyle(document.querySelector('.mobile-dock')).display,
    desktopNav: getComputedStyle(document.querySelector('.main-nav')).display,
  }))()`);
  if (mobileLayout.mobileDock === "none" || mobileLayout.desktopNav !== "none") {
    throw new Error("Mobile navigation layout did not switch as expected");
  }
  if (!await setInput("#global-search", "春晓")) throw new Error("Mobile search input was not found");
  currentStep = "mobile search";
  await evaluate("document.querySelector('#global-search').closest('form').requestSubmit()");
  const mobileSearch = await waitUntil("mobile search results", () => evaluate(
    `document.querySelector('#app')?.innerText.includes('春晓')`,
  ));
  if (!mobileSearch) throw new Error("Mobile search did not return the expected poem");

  await clearLocalState();
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: `${origin}/#/login` });
  currentStep = "login";
  await waitUntil("login form", () => evaluate(`(() => {
    return Boolean(document.querySelector('input[aria-label="登录账号"]'))
      && Boolean(document.querySelector('input[aria-label="登录密码"]'));
  })()`));
  if (!await setInput('input[aria-label="登录账号"]', "demo")) {
    throw new Error("Login username input was not found");
  }
  if (!await setInput('input[aria-label="登录密码"]', "lanze2026")) {
    throw new Error("Login password input was not found");
  }
  if (!await evaluate(`(() => {
    const button = document.querySelector('button[aria-label="提交登录"]');
    if (!button) return false;
    button.click();
    return true;
  })()`)) throw new Error("Login submit button was not found");
  await waitUntil("login success", () => evaluate(
    `document.cookie.includes('lanze_user') && location.href.includes('collection')`,
  ));

  await send("Page.navigate", { url: `${origin}/#/compose` });
  currentStep = "compose";
  await waitUntil("compose form", () => evaluate("Boolean(document.querySelector('#poem-title'))"));
  const work = createDemoBrowserWork();
  for (const [selector, value] of [
    ["#poem-title", work.origin],
    ["#poem-author", work.author],
    ["#poem-category", work.category],
    ["#poem-content", work.content],
    ["#poem-note", work.title],
  ]) {
    if (!await setInput(selector, value)) throw new Error(`Compose input ${selector} was not found`);
  }
  if (!await clickByText("发布到我的诗卷")) throw new Error("Publish button was not found");
  const publishedWork = await waitUntil("published local work", () => evaluate(`(() => {
    let works = [];
    try { works = JSON.parse(localStorage.getItem('lanze_demo_works') || '[]'); } catch {}
    return (Array.isArray(works) ? works : []).find((item) => item.title === ${JSON.stringify(work.origin)}) || null;
  })()`));
  if (publishedWork.textBody !== work.content && publishedWork.content !== work.content) {
    throw new Error("Published work did not retain its content");
  }
  await waitUntil("works page navigation", () => evaluate("location.href.includes('collection')"));
  const worksPage = await waitUntil("published work on collection page", () => evaluate(
    `document.querySelector('#app')?.innerText.includes(${JSON.stringify(work.origin)})`,
  ));
  if (!worksPage) throw new Error("Published work was not rendered on the collection page");

  currentStep = "final assertions";
  await clearLocalState();

  const consoleErrors = events
    .filter((event) => event.method === "Runtime.consoleAPICalled" && event.params.type === "error")
    .map((event) => event.params.args.map((arg) => arg.value || arg.description).join(" "));
  const exceptions = events
    .filter((event) => event.method === "Runtime.exceptionThrown")
    .map((event) => {
      const details = event.params.exceptionDetails;
      const frames = (details.stackTrace?.callFrames || [])
        .slice(0, 3)
        .map((frame) => `${frame.functionName || "anonymous"}@${frame.url}:${frame.lineNumber + 1}`);
      return [details.text, details.exception?.description, frames.join(" ← ")]
        .filter(Boolean)
        .join(" | ");
    });
  const failedRequests = events
    .filter((event) => event.method === "Network.loadingFailed")
    .map((event) => event.params.errorText);
  const problems = [...consoleErrors, ...exceptions, ...failedRequests];
  if (problems.length) throw new Error(`Browser reported problems: ${problems.join(" | ")}`);
  const cumulativeLayoutShift = layoutShifts.reduce((total, score) => total + score, 0);
  if (cumulativeLayoutShift > 0.05) {
    throw new Error(`Layout shifted beyond the 0.05 budget: ${cumulativeLayoutShift.toFixed(4)}`);
  }

  socket.close();
  console.log([
    "Browser smoke passed:",
    `${home.title} → ${desktopSearch.href},`,
    "local save,",
    "desktop/mobile search,",
    "native audio dock,",
    "login and publish flow,",
    `no console or network errors, CLS ${cumulativeLayoutShift.toFixed(4)}.`,
  ].join(" "));
  currentStep = "complete";
};

try {
  await main();
} catch (error) {
  console.error(`[${currentStep}] ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
} finally {
  stopAll();
}
