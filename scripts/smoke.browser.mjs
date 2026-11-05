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

const waitUntil = async (label, check, attempts = 24) => {
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

  const failureCount = () => events.filter((event) => (
    (event.method === "Runtime.consoleAPICalled" && event.params.type === "error")
    || event.method === "Runtime.exceptionThrown"
    || event.method === "Network.loadingFailed"
  )).length;

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
  const initialFailureCount = failureCount();
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

  await send("Page.navigate", { url: `${origin}/#/home` });
  await delay(1500);
  await waitUntil("desktop search input", () => evaluate("Boolean(document.querySelector('#home-search-desktop'))"));
  if (!await setInput("#home-search-desktop", "李白")) {
    throw new Error("Desktop search input was not found");
  }
  await evaluate(`document.querySelector('#home-search-desktop')
    .dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }))`);
  const desktopSearch = await waitUntil("desktop search results", () => evaluate(`(() => ({
    href: location.href,
    text: document.querySelector('#app')?.innerText || '',
  }))()`).then((value) => value && value.href.includes("searchul") && value.text.includes("李白") ? value : null));
  if (!desktopSearch.text.includes("搜索内容")) throw new Error("Desktop search results header did not render");

  await evaluate(`(() => {
    for (const key of ['lanze_demo_users', 'lanze_demo_works', 'lanze_demo_profile']) {
      localStorage.removeItem(key);
    }
    for (const key of ['lanze_user', 'lanze_upload']) {
      document.cookie = key + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    return true;
  })()`);

  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Page.navigate", { url: `${origin}/#/home` });
  await waitUntil("mobile search input", () => evaluate("Boolean(document.querySelector('#home-search-mobile'))"));
  const mobileLayout = await evaluate(`(() => ({
    bottomNav: getComputedStyle(document.querySelector('.min-tab-bottom')).display,
    desktopNav: getComputedStyle(document.querySelector('.tab-top')).display,
    audioPlayer: document.querySelectorAll('.aplayer').length,
  }))()`);
  if (mobileLayout.bottomNav === "none" || mobileLayout.desktopNav !== "none") {
    throw new Error("Mobile navigation layout did not switch as expected");
  }
  if (!await setInput("#home-search-mobile", "春晓")) {
    throw new Error("Mobile search input was not found");
  }
  await evaluate(`document.querySelector('#home-search-mobile')
    .dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }))`);
  const mobileSearch = await waitUntil("mobile search results", () => evaluate(`(() => ({
    href: location.href,
    text: document.querySelector('#app')?.innerText || '',
  }))()`).then((value) => value.href.includes("searchul") ? value : null));
  if (!mobileSearch.text.includes("搜索内容")) throw new Error("Mobile search results header did not render");

  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: `${origin}/#/login` });
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
  if (!await clickByText("验证")) throw new Error("Login verification button was not found");
  await waitUntil("login slider", () => evaluate("Boolean(document.querySelector('.range-btn'))"));
  await evaluate(`(() => {
    const originalRandom = Math.random;
    Math.random = () => 0.5;
    window.__restoreRandom = () => { Math.random = originalRandom; };
    document.querySelector('.reset_')?.click();
    return true;
  })()`);
  const sliderTarget = await evaluate(`(() => {
    const canvas = document.querySelector('.auth-canvas2_');
    const box = document.querySelector('.range-box');
    const button = document.querySelector('.range-btn');
    if (!canvas || !box || !button) return null;
    const canvasRect = canvas.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const canvasWidth = Number(document.querySelector('.auth-body_')?.style.width.replace("px", "")) || 310;
    const sliderSize = buttonRect.width || 50;
    const puzzleWidth = canvasRect.width || 59;
    const pinX = Math.ceil((canvasWidth - puzzleWidth - 10 + (puzzleWidth + 20)) / 2);
    const move = (pinX - 3) * (canvasWidth - sliderSize) / (canvasWidth - puzzleWidth);
    return {
      left: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top + buttonRect.height / 2,
      move,
    };
  })()`);
  if (!sliderTarget) throw new Error("Login slider geometry was not available");
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: sliderTarget.left,
    y: sliderTarget.y,
    button: "left",
    clickCount: 1,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: sliderTarget.left + sliderTarget.move,
    y: sliderTarget.y,
    button: "left",
    buttons: 1,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: sliderTarget.left + sliderTarget.move,
    y: sliderTarget.y,
    button: "left",
    clickCount: 1,
  });
  await waitUntil("login verification", () => evaluate(
    `document.querySelector('.info-box_')?.textContent?.includes('验证通过')`,
  ));
  await delay(1000);
  await evaluate("window.__restoreRandom?.()");
  if (!await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')]
      .find((node) => node.getAttribute('aria-label') === '提交登录');
    if (!button) return false;
    button.click();
    return true;
  })()`)) throw new Error("Login submit button was not found");
  await waitUntil("login success", () => evaluate(
    `document.cookie.includes('lanze_user') && location.href.includes('shezhi')`,
  ));

  await send("Page.navigate", { url: `${origin}/#/publishpoem` });
  await waitUntil("publish form", () => evaluate("Boolean(document.querySelector('#origin'))"));
  const work = createDemoBrowserWork();
  for (const [selector, value] of [
    ["#origin", work.origin],
    ["#author", work.author],
    ["#category", work.category],
    ["#content", work.content],
    ["#title", work.title],
  ]) {
    if (!await setInput(selector, value)) throw new Error(`Publish input ${selector} was not found`);
  }
  if (!await clickByText("提交")) throw new Error("Publish submit button was not found");
  const publishedWork = await waitUntil("published local demo work", () => evaluate(`(() => {
    let works = [];
    try { works = JSON.parse(localStorage.getItem('lanze_demo_works') || '[]'); } catch {}
    return (Array.isArray(works) ? works : []).find((item) => item.title === ${JSON.stringify(work.origin)}) || null;
  })()`));
  if (publishedWork.textBody !== work.content && publishedWork.content !== work.content) {
    throw new Error("Published work did not retain its content");
  }
  await waitUntil("works page navigation", () => evaluate("location.href.includes('samplereels')"));
  const worksPage = await waitUntil("published work on works page", () => evaluate(
    `document.querySelector('#app')?.innerText.includes(${JSON.stringify(work.origin)})`,
  ));
  if (!worksPage) throw new Error("Published work was not rendered on the works page");

  await evaluate(`(() => {
    for (const key of ['lanze_demo_users', 'lanze_demo_works', 'lanze_demo_profile']) {
      localStorage.removeItem(key);
    }
    for (const key of ['lanze_user', 'lanze_upload']) {
      document.cookie = key + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    return true;
  })()`);

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
      return [
        details.text,
        details.exception?.description,
        frames.join(" ← "),
      ].filter(Boolean).join(" | ");
    });
  const failedRequests = events
    .filter((event) => event.method === "Network.loadingFailed")
    .map((event) => event.params.errorText);
  const problems = [
    ...consoleErrors,
    ...exceptions,
    ...failedRequests,
    ...(failureCount() > initialFailureCount ? ["Unexpected browser failures during extended smoke"] : []),
  ];
  if (problems.length) throw new Error(`Browser reported problems: ${problems.join(" | ")}`);

  socket.close();
  console.log([
    "Browser smoke passed:",
    `${home.title} → ${library.title},`,
    "desktop/mobile search,",
    "narrow-screen navigation,",
    "local demo publish path,",
    "one local audio player,",
    "no console or network errors.",
  ].join(" "));
};

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  stopAll();
}
