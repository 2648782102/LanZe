import { spawn } from "node:child_process";
import { access, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createDemoBrowserWork } from "../src/config/demoBrowser.node.js";
import { POETRY_SOURCE_URL } from "../src/config/poetrySource.constants.js";

const port = Number(process.env.BROWSER_SMOKE_PORT || 4188);
const debugPort = Number(process.env.BROWSER_SMOKE_DEBUG_PORT || 9223);
const chromeCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);
const origin = `http://127.0.0.1:${port}`;
const poetrySourceUrl = process.env.VITE_POETRY_SOURCE_URL || POETRY_SOURCE_URL;
const processes = [];
let currentStep = "boot";

const isPoetrySourceRequest = (url) => {
  try {
    const request = new URL(url);
    const configured = new URL(poetrySourceUrl);
    return request.origin === configured.origin && request.pathname === configured.pathname;
  } catch {
    return false;
  }
};

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
  throw new Error(`Chrome or Chromium was not found; set CHROME_PATH. Candidates: ${chromeCandidates.join(", ")}`);
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
    const value = await check();
    if (value) return value;
    await delay(250);
  }
  throw new Error(`Timed out waiting for ${label}`);
};

const main = async () => {
  const chromePath = await resolveChromePath();
  const profile = await mkdtemp(join(tmpdir(), "lanze-browser-smoke-"));
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
  const events = [];
  const layoutShifts = [];
  let send;
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

  send = (method, params = {}) => new Promise((resolve, reject) => {
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
  const poetryResponses = [
    {
      content: "山有木兮木有枝，心悦君兮君不知。",
      origin: "越人歌",
      author: "佚名",
      category: "古诗文-先秦",
    },
    {
      content: "雨雪雰雰，益之以霡霂。",
      origin: "信南山",
      author: "佚名",
      category: "古诗文-天气-写雪",
    },
  ];
  let poetryRequestIndex = 0;
  socket.addEventListener("message", async (event) => {
    const message = JSON.parse(event.data);
    if (message.method !== "Fetch.requestPaused") return;
    const { requestId, request } = message.params;
    if (!isPoetrySourceRequest(request.url)) {
      await send("Fetch.continueRequest", { requestId });
      return;
    }
    const payload = poetryResponses[poetryRequestIndex % poetryResponses.length];
    poetryRequestIndex += 1;
    await send("Fetch.fulfillRequest", {
      requestId,
      responseCode: 200,
      responseHeaders: [
        { name: "Access-Control-Allow-Origin", value: "*" },
        { name: "Content-Type", value: "application/json; charset=utf-8" },
      ],
      body: Buffer.from(JSON.stringify(payload)).toString("base64"),
    });
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
        'lanze_saved_excerpts',
        'lanze_recent_poems',
        'lanze_compose_draft',
        'lanze_audio_preferences',
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
  await send("Fetch.enable", {
    patterns: [{ urlPattern: `${poetrySourceUrl}*`, requestStage: "Request" }],
  });
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
  await waitUntil("excerpt source settled", () => evaluate(
    "Boolean(document.querySelector('.legacy-card')) && !document.querySelector('.button--quiet[aria-label=\"换一句今日摘录\"]')?.disabled",
  ), 60);

  const home = await evaluate(`(() => ({
    href: location.href,
    title: document.title,
    text: document.querySelector('#app')?.innerText || '',
    audioDocks: document.querySelectorAll('.audio-dock').length,
    audioTitle: document.querySelector('.audio-dock__title')?.textContent?.trim() || '',
    audioState: document.querySelector('.audio-dock__state')?.textContent?.trim() || '',
    audioStateRole: document.querySelector('.audio-dock__state')?.getAttribute('role') || '',
    navCount: document.querySelectorAll('.main-nav a').length,
  }))()`);
  if (!home.text.includes("余韵 · 一则")) throw new Error("Today's reading page did not render");
  if (home.audioDocks !== 1) throw new Error("Expected one native local audio dock");
  if (!home.audioTitle.includes("空山 · 松风")) throw new Error("Local soundscape was not selected");
  if (home.audioStateRole !== "status" || !["试听", "播放中"].includes(home.audioState)) {
    throw new Error("Audio dock status is missing or reports an unexpected initial state");
  }
  await evaluate(`(() => {
    document.querySelector('button[aria-label="查看播放列表"]')?.click();
    return true;
  })()`);
  const audioLibrary = await waitUntil("audio playlist", () => evaluate(`(() => ({
    tracks: document.querySelectorAll('.audio-dock__playlist button').length,
    seek: Boolean(document.querySelector('.audio-dock__seek')),
    volume: Boolean(document.querySelector('.audio-dock__volume')),
    cover: Boolean(document.querySelector('.audio-dock__cover')),
    title: document.querySelector('.audio-dock__title')?.textContent?.trim() || '',
  }))()`).then((value) => value.tracks === 3 ? value : null));
  if (!audioLibrary.seek || !audioLibrary.volume || !audioLibrary.cover) {
    throw new Error("Local soundscape controls did not render");
  }
  await evaluate(`(() => {
    document.querySelector('button[aria-label="下一首声景"]')?.click();
    return true;
  })()`);
  const nextTrack = await waitUntil("next soundscape", () => evaluate(`(() => {
    const title = document.querySelector('.audio-dock__title')?.textContent?.trim() || '';
    const preferences = JSON.parse(localStorage.getItem('lanze_audio_preferences') || '{}');
    return title === '月色 · 瓷盏' && preferences.trackIndex === 1 ? title : null;
  })()`));
  if (!nextTrack) throw new Error("Soundscape selection or preference did not persist");
  await evaluate(`(() => {
    const seek = document.querySelector('.audio-dock__seek');
    if (!seek) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(seek, '8');
    seek.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  const seekedAudio = await waitUntil("soundscape seek", () => evaluate(
    "document.querySelector('audio')?.currentTime >= 7.5",
  ));
  if (!seekedAudio) throw new Error("Soundscape seek did not update playback position");
  await evaluate(`(() => {
    document.querySelector('button[aria-label="查看播放列表"]')?.click();
    return true;
  })()`);
  await evaluate(`(() => {
    const buttons = document.querySelectorAll('.audio-dock__playlist button');
    if (buttons.length) buttons[0].click();
    return true;
  })()`);
  await waitUntil("first soundscape restored", () => evaluate(
    "document.querySelector('.audio-dock__title')?.textContent?.trim() === '空山 · 松风'",
  ));
  if (home.navCount !== 3) throw new Error("Primary navigation did not render");
  const excerptCards = await evaluate(`(() => {
    const cards = [...document.querySelectorAll('.legacy-card')];
    const box = cards[0]?.querySelector('.legacy-card__box');
    const verse = cards[0]?.querySelector('.legacy-card__verse');
    const art = cards[0]?.querySelector('.legacy-card__art');
    const boxRect = box?.getBoundingClientRect();
    const verseRect = verse?.getBoundingClientRect();
    const artRect = art?.getBoundingClientRect();
    return {
      count: cards.length,
      firstVerse: cards[0]?.querySelector('.legacy-card__verse')?.textContent?.trim() || '',
      saveButtons: cards.filter((card) => card.querySelector('.legacy-card__save')).length,
      pressedStates: cards.map((card) => card.querySelector('.legacy-card__save')?.getAttribute('aria-pressed')),
      writingMode: cards[0] ? getComputedStyle(cards[0].querySelector('.legacy-card__verse')).writingMode : '',
      artLoaded: Boolean(art?.complete && art.naturalWidth > 0),
      artWidth: art?.getAttribute('width') || '',
      artHeight: art?.getAttribute('height') || '',
      boxBackground: box ? getComputedStyle(box).backgroundColor : '',
      boxOverflow: box ? getComputedStyle(box).overflow : '',
      rightGutter: boxRect && verseRect ? boxRect.right - verseRect.right : 0,
      artRightGutter: boxRect && artRect ? boxRect.right - artRect.right : 0,
      sourceLabel: document.querySelector('.excerpt-source')?.textContent?.trim() || '',
    };
  })()`);
  if (excerptCards.count !== 1 || excerptCards.saveButtons !== 1) {
    throw new Error("One historical excerpt card did not render");
  }
  if (!excerptCards.firstVerse || excerptCards.writingMode !== "vertical-rl") {
    throw new Error("Excerpt verse or vertical layout did not render");
  }
  if (excerptCards.pressedStates.some((state) => !["true", "false"].includes(state))) {
    throw new Error("Excerpt card save controls are missing pressed state");
  }
  if (!excerptCards.artLoaded || excerptCards.artWidth !== "720" || excerptCards.artHeight !== "412") {
    throw new Error("Historical artwork did not render with stable dimensions");
  }
  if (excerptCards.boxBackground !== "rgb(255, 255, 255)" || excerptCards.boxOverflow !== "hidden") {
    throw new Error("Historical card surface did not render");
  }
  if (excerptCards.rightGutter < 28 || excerptCards.artRightGutter < 24) {
    throw new Error("Historical card content is too close to the right edge");
  }
  if (!excerptCards.sourceLabel.includes("诗句源：")) {
    throw new Error("Excerpt source state did not render");
  }
  const firstExcerpt = excerptCards.firstVerse;
  const dockLayout = await evaluate(`(() => {
    const dock = document.querySelector('.audio-dock');
    if (!dock) return null;
    const style = getComputedStyle(dock);
    const rect = dock.getBoundingClientRect();
    return {
      position: style.position,
      zIndex: Number(style.zIndex),
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      viewportHeight: innerHeight,
      visible: rect.bottom > 0 && rect.top < innerHeight,
    };
  })()`);
  if (dockLayout?.position !== "fixed" || dockLayout.zIndex < 2 || !dockLayout.visible || dockLayout.bottom > dockLayout.viewportHeight) {
    throw new Error("Audio dock is not pinned inside the viewport");
  }

  currentStep = "audio dock scroll";
  await evaluate("window.scrollTo({ top: 600, behavior: 'instant' })");
  await waitUntil("page scroll", () => evaluate("scrollY > 300"));
  const scrolledDock = await evaluate(`(() => {
    const rect = document.querySelector('.audio-dock')?.getBoundingClientRect();
    return rect ? { top: Math.round(rect.top), bottom: Math.round(rect.bottom) } : null;
  })()`);
  if (!scrolledDock || Math.abs(scrolledDock.bottom - dockLayout.bottom) > 1) {
    throw new Error("Audio dock did not stay pinned while scrolling");
  }
  currentStep = "historical excerpt card";
  if (!await evaluate(`(() => {
    const button = document.querySelector('.legacy-card__save');
    if (!button) return false;
    button.click();
    return true;
  })()`)) throw new Error("Excerpt card save control was not found");
  const savedExcerpt = await waitUntil("saved excerpt in local storage", () => evaluate(`(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lanze_saved_excerpts') || '[]');
      return Array.isArray(saved) && saved.length > 0 ? saved : null;
    } catch {
      return null;
    }
  })()`));
  if (!savedExcerpt) throw new Error("Saving an excerpt did not persist locally");
  if (!await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((node) => (node.innerText || '').includes('换一句'));
    if (!button || button.disabled) return false;
    button.click();
    return true;
  })()`)) throw new Error("Excerpt rotation control was not found");
  const rotatedExcerpts = await waitUntil("rotated historical excerpt", () => evaluate(`
    (() => {
      const button = [...document.querySelectorAll('button')].find((node) => (node.innerText || '').includes('换一句'));
      const verse = document.querySelector('.legacy-card__verse')?.textContent?.trim();
      return Boolean(verse) && verse !== ${JSON.stringify(firstExcerpt)} && button && !button.disabled;
    })()
  `), 60);
  if (!rotatedExcerpts) throw new Error("Historical excerpt card did not rotate");
  await evaluate("window.scrollTo({ top: 0, behavior: 'instant' })");
  await waitUntil("page scroll reset", () => evaluate("scrollY === 0"));

  currentStep = "audio dock collapse";
  if (!await evaluate(`(() => {
    const handle = document.querySelector('.audio-dock__handle');
    if (!handle) return false;
    handle.click();
    return true;
  })()`)) throw new Error("Audio dock collapse control was not found");
  await waitUntil("collapsed audio dock", () => evaluate(
    "document.querySelector('.audio-dock')?.classList.contains('is-collapsed')",
  ));
  if (!await evaluate(`(() => {
    const handle = document.querySelector('.audio-dock__handle');
    if (!handle) return false;
    handle.click();
    return true;
  })()`)) throw new Error("Audio dock expand control was not found");
  await waitUntil("expanded audio dock", () => evaluate(
    "!document.querySelector('.audio-dock')?.classList.contains('is-collapsed')",
  ));

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
  await waitUntil("offline catalog loaded", () => evaluate(
    "Boolean(document.querySelector('#app')?.innerText.includes('9,350'))",
  ), 60);
  const explore = await evaluate(`(() => ({
    text: document.querySelector('#app')?.innerText || '',
    rows: document.querySelectorAll('.poem-row').length,
    facets: document.querySelectorAll('.facet__list button').length,
    stats: document.querySelector('.index-banner__stats')?.innerText || '',
  }))()`);
  if (!explore.text.includes("全部馆藏") || !explore.text.includes("唐诗") || !explore.text.includes("宋词")) {
    throw new Error("Explore index or categories did not render");
  }
  if (explore.rows !== 24 || explore.facets < 12 || !explore.stats.includes("9,350")) {
    throw new Error("Offline catalog, facets or pagination did not render");
  }

  if (!await setInput("#global-search", "李白")) throw new Error("Explore search input was not found");
  currentStep = "desktop search";
  await evaluate("document.querySelector('#global-search').closest('form').requestSubmit()");
  const desktopSearch = await waitUntil("desktop search results", () => evaluate(`(() => ({
    href: location.href,
    text: document.querySelector('#app')?.innerText || '',
    rows: document.querySelectorAll('.poem-row').length,
    summary: document.querySelector('.result-head__right')?.innerText || '',
  }))()`).then((value) => value.href.includes("q=") && value.text.includes("李白") ? value : null));
  if (!desktopSearch.text.includes("找到") || desktopSearch.rows !== 24 || !desktopSearch.summary.includes("找到")) {
    throw new Error("Desktop search summary or pagination did not render");
  }

  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Page.navigate", { url: `${origin}/#/explore` });
  currentStep = "mobile layout";
  await waitUntil("mobile search input", () => evaluate("Boolean(document.querySelector('#global-search'))"));
  await waitUntil("mobile audio dock preference", () => evaluate(
    `(() => {
      const dock = document.querySelector('.audio-dock');
      if (!dock) return false;
      const handle = dock.querySelector('.audio-dock__handle');
      if (handle && !dock.classList.contains('is-collapsed')) handle.click();
      return dock.classList.contains('is-collapsed');
    })()`,
  ));
  const mobileLayout = await evaluate(`(() => ({
    mobileDock: getComputedStyle(document.querySelector('.mobile-dock')).display,
    desktopNav: getComputedStyle(document.querySelector('.main-nav')).display,
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    filterBar: getComputedStyle(document.querySelector('.mobile-filter-bar')).display,
    filterPanel: getComputedStyle(document.querySelector('.filter-wall')).display,
    audioDockBottom: Math.round(document.querySelector('.audio-dock')?.getBoundingClientRect().bottom || 0),
    mobileDockTop: Math.round(document.querySelector('.mobile-dock')?.getBoundingClientRect().top || 0),
    audioDockCollapsed: document.querySelector('.audio-dock')?.classList.contains('is-collapsed') || false,
  }))()`);
  if (mobileLayout.mobileDock === "none" || mobileLayout.desktopNav !== "none") {
    throw new Error("Mobile navigation layout did not switch as expected");
  }
  if (mobileLayout.scrollWidth > mobileLayout.viewportWidth + 1) {
    throw new Error("Mobile explore page overflows horizontally");
  }
  if (mobileLayout.filterBar === "none" || mobileLayout.filterPanel !== "none") {
    throw new Error("Mobile filter disclosure did not start collapsed");
  }
  if (mobileLayout.audioDockBottom > mobileLayout.mobileDockTop) {
    throw new Error("Mobile audio dock overlaps the bottom navigation");
  }
  if (!mobileLayout.audioDockCollapsed) {
    throw new Error("Mobile audio dock should start collapsed");
  }
  if (!await evaluate(`(() => {
    const button = document.querySelector('.mobile-filter-bar button');
    if (!button) return false;
    button.click();
    return true;
  })()`)) throw new Error("Mobile filter button was not found");
  const mobileFilters = await waitUntil("mobile filter panel", () => evaluate(`(() => ({
    panel: getComputedStyle(document.querySelector('.filter-wall')).display,
    expanded: document.querySelector('.mobile-filter-bar button')?.getAttribute('aria-expanded'),
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }))()`).then((value) => value.panel !== "none" && value.expanded === "true" ? value : null));
  if (mobileFilters.scrollWidth > mobileFilters.viewportWidth + 1) {
    throw new Error("Open mobile filter panel overflows horizontally");
  }
  if (!await evaluate(`(() => {
    const button = document.querySelector('.mobile-filter-bar button');
    if (!button) return false;
    button.click();
    return true;
  })()`)) throw new Error("Mobile filter button was not found after opening");
  if (!await setInput("#global-search", "春晓")) throw new Error("Mobile search input was not found");
  currentStep = "mobile search";
  await evaluate("document.querySelector('#global-search').closest('form').requestSubmit()");
  const mobileSearch = await waitUntil("mobile search results", () => evaluate(
    `document.querySelector('#app')?.innerText.includes('春晓')`,
  ));
  if (!mobileSearch) throw new Error("Mobile search did not return the expected poem");

  await send("Page.navigate", { url: `${origin}/#/compose` });
  await waitUntil("guest compose form", () => evaluate("Boolean(document.querySelector('#poem-title'))"));
  const guestCompose = await evaluate(`(() => ({
    route: location.hash,
    note: document.querySelector('.compose-login-note')?.innerText || '',
    action: document.querySelector('.form-actions .button--solid')?.innerText.trim() || '',
    preview: document.querySelector('.preview-panel')?.innerText || '',
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }))()`);
  if (!guestCompose.route.includes("/compose") || !guestCompose.note.includes("访客")) {
    throw new Error("Guest compose preview is not available without a login redirect");
  }
  if (!guestCompose.action.includes("登录后发布")) {
    throw new Error("Guest compose action does not explain the login step");
  }
  if (!guestCompose.preview.includes("预览")) {
    throw new Error("Guest compose preview did not render");
  }
  if (!await setInput("#poem-title", "访客草稿")) {
    throw new Error("Guest compose input was not found");
  }
  const guestDraft = await waitUntil("guest compose draft", () => evaluate(`(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('lanze_compose_draft') || '{}');
      return draft.title === '访客草稿' ? draft : null;
    } catch {
      return null;
    }
  })()`));
  if (!guestDraft) throw new Error("Guest compose draft was not retained locally");
  if (guestCompose.scrollWidth > guestCompose.viewportWidth + 1) {
    throw new Error("Mobile compose page overflows horizontally");
  }

  await send("Emulation.setDeviceMetricsOverride", {
    width: 320,
    height: 720,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Page.navigate", { url: `${origin}/#/explore` });
  await waitUntil("narrow search input", () => evaluate("Boolean(document.querySelector('#global-search'))"));
  await waitUntil("narrow audio dock preference", () => evaluate(
    "document.querySelector('.audio-dock')?.classList.contains('is-collapsed')",
  ));
  const narrowLayout = await evaluate(`(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    filterBar: getComputedStyle(document.querySelector('.mobile-filter-bar')).display,
    audioDockCollapsed: document.querySelector('.audio-dock')?.classList.contains('is-collapsed') || false,
  }))()`);
  if (narrowLayout.scrollWidth > narrowLayout.viewportWidth + 1 || narrowLayout.bodyScrollWidth > narrowLayout.viewportWidth + 1) {
    throw new Error("320px explore page overflows horizontally");
  }
  if (narrowLayout.filterBar === "none" || !narrowLayout.audioDockCollapsed) {
    throw new Error("320px mobile controls did not adapt as expected");
  }
  await evaluate("window.scrollTo({ top: 600, behavior: 'instant' })");
  await waitUntil("320px page scroll", () => evaluate("scrollY > 300"));
  const narrowHeader = await evaluate(`(() => {
    const header = document.querySelector('.museum-header');
    return header ? {
      position: getComputedStyle(header).position,
      top: Math.round(header.getBoundingClientRect().top),
    } : null;
  })()`);
  if (narrowHeader?.position !== "sticky" || Math.abs(narrowHeader.top) > 1) {
    throw new Error("320px sticky header did not remain pinned while scrolling");
  }

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
  await evaluate(`(() => {
    const audio = document.querySelector('audio');
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    return true;
  })()`);
  await delay(300);

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
    .filter((event) => event.method === "Network.loadingFailed");
  const requestsById = new Map(
    events
      .filter((event) => event.method === "Network.requestWillBeSent")
      .map((event) => [event.params.requestId, event.params.request?.url || ""]),
  );
  const unexpectedFailedRequests = failedRequests.filter((event) => {
    const url = requestsById.get(event.params.requestId) || "";
    const expectedPoetryFailure = isPoetrySourceRequest(url);
    const expectedMediaAbort = event.params.errorText === "net::ERR_ABORTED"
      && url.startsWith(`${origin}/media/lanze-`)
      && /\.(wav|svg)$/.test(url);
    return !expectedPoetryFailure && !expectedMediaAbort;
  });
  const expectedPoetryFailures = failedRequests.length - unexpectedFailedRequests.length;
  const problems = [
    ...consoleErrors,
    ...exceptions,
    ...unexpectedFailedRequests.map((event) => {
      const url = requestsById.get(event.params.requestId) || "unknown URL";
      return `${event.params.errorText}: ${url}`;
    }),
  ];
  if (problems.length) throw new Error(`Browser reported problems: ${problems.join(" | ")}`);
  if (!excerptCards.sourceLabel.includes("诗句源：仓库内置摘录")) {
    throw new Error("Local excerpt source was not reported in offline default mode");
  }
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
    `no unexpected console or network errors, CLS ${cumulativeLayoutShift.toFixed(4)}.`,
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
