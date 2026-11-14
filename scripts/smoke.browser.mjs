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
      if (message.sessionId) return;
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
  const poetryResponseDelay = Number(process.env.BROWSER_SMOKE_POETRY_DELAY_MS || 1200);
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
    if (poetryResponseDelay > 0) await delay(poetryResponseDelay);
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
  const createColdStartPage = async () => {
    const created = await send("Target.createTarget", { url: "about:blank" });
    const attached = await send("Target.attachToTarget", { targetId: created.targetId, flatten: true });
    const sessionId = attached.sessionId;
    const sessionSend = (method, params = {}) => new Promise((resolve, reject) => {
      const id = nextId += 1;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`Chrome DevTools timed out: ${method}`));
        }
      }, 10000);
    });
    const sessionEvaluate = async (expression) => {
      const result = await sessionSend("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
      return result.result.value;
    };
    await sessionSend("Page.enable");
    await sessionSend("Runtime.enable");
    await sessionSend("Network.enable");
    await sessionSend("Performance.enable");
    await sessionSend("Page.addScriptToEvaluateOnNewDocument", {
      source: `(() => {
        window.__coldLayoutShift = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) window.__coldLayoutShift += entry.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
      })()`,
    });
    await sessionSend("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sessionSend("Page.navigate", { url: `${origin}/#/` });
    await waitUntil("cold start reading view", () => sessionEvaluate(
      "Boolean(document.querySelector('.poem-plinth'))",
    ), 60);
    await delay(500);
    const coldStart = await sessionEvaluate(`(() => {
      const dock = document.querySelector('.audio-dock')?.getBoundingClientRect();
      const plinth = document.querySelector('.poem-plinth')?.getBoundingClientRect();
      const action = document.querySelector('.poem-plinth__actions')?.getBoundingClientRect();
      const intersects = (first, second) => Boolean(first && second
        && first.left < second.right
        && first.right > second.left
        && first.top < second.bottom
        && first.bottom > second.top);
      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        dockWidth: dock ? Math.round(dock.width) : 0,
        dockHeight: dock ? Math.round(dock.height) : 0,
        dockCollapsed: Boolean(document.querySelector('.audio-dock')?.classList.contains('is-collapsed')),
        audioPaused: Boolean(document.querySelector('audio')?.paused),
        audioTime: Number(document.querySelector('audio')?.currentTime || 0),
        autoplayAttribute: Boolean(document.querySelector('audio')?.autoplay),
        overlapsPlinth: intersects(dock, plinth),
        overlapsPlinthActions: intersects(dock, action),
      };
    })()`);
    const coldLayoutShift = Number(await sessionEvaluate("window.__coldLayoutShift || 0"));
    await send("Target.closeTarget", { targetId: created.targetId });
    return { ...coldStart, coldLayoutShift };
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
  const coldStart = await createColdStartPage();
  if (coldStart.scrollWidth > coldStart.viewportWidth + 1) {
    throw new Error("Cold start reading page overflows horizontally");
  }
  if (coldStart.overlapsPlinth || coldStart.overlapsPlinthActions) {
    throw new Error("Desktop audio dock overlaps the reading plinth on cold start");
  }
  if (coldStart.dockWidth > 190 || coldStart.dockHeight > 56) {
    throw new Error("Desktop audio dock exceeds its compact fixed-layer budget");
  }
  if (coldStart.coldLayoutShift > 0.05) {
    throw new Error(`Cold start layout shifted beyond the 0.05 budget: ${coldStart.coldLayoutShift.toFixed(4)}`);
  }
  if (!coldStart.dockCollapsed || !coldStart.audioPaused || coldStart.audioTime !== 0 || coldStart.autoplayAttribute) {
    throw new Error("Cold start must show a collapsed, silent audio dock without autoplay");
  }
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
    dockCollapsed: Boolean(document.querySelector('.audio-dock')?.classList.contains('is-collapsed')),
    audioPaused: Boolean(document.querySelector('audio')?.paused),
    navCount: document.querySelectorAll('.main-nav a').length,
  }))()`);
  if (!home.text.includes("余韵 · 一则")) throw new Error("Today's reading page did not render");
  if (home.audioDocks !== 1) throw new Error("Expected one native local audio dock");
  if (!home.audioTitle.includes("空山 · 松风")) throw new Error("Local soundscape was not selected");
  if (home.audioStateRole !== "status" || !["试听", "播放中"].includes(home.audioState)) {
    throw new Error("Audio dock status is missing or reports an unexpected initial state");
  }
  if (!home.dockCollapsed || !home.audioPaused) {
    throw new Error("Audio dock should start collapsed and silent");
  }
  await evaluate(`(() => {
    document.querySelector('.audio-dock__handle')?.click();
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
    document.querySelector('.audio-dock__handle')?.click();
    return true;
  })()`);
  await waitUntil("audio library returns to collapsed", () => evaluate(
    "document.querySelector('.audio-dock')?.classList.contains('is-collapsed')",
  ));
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
    const box = cards[0]?.querySelector('.legacy-card__box--current');
    const verse = cards[0]?.querySelector('.legacy-card__box--current .legacy-card__verse');
    const art = cards[0]?.querySelector('.legacy-card__box--current .legacy-card__art');
    const avifSource = cards[0]?.querySelector('.legacy-card__box--current picture source[type="image/avif"]');
    const boxRect = box?.getBoundingClientRect();
    const verseRect = verse?.getBoundingClientRect();
    const artRect = art?.getBoundingClientRect();
    return {
      count: cards.length,
      firstVerse: verse?.textContent?.trim() || '',
      saveButtons: cards.filter((card) => card.querySelector('.legacy-card__box--current .legacy-card__save')).length,
      pressedStates: cards.map((card) => card.querySelector('.legacy-card__box--current .legacy-card__save')?.getAttribute('aria-pressed')),
      writingMode: verse ? getComputedStyle(verse).writingMode : '',
      artLoaded: Boolean(art?.complete && art.naturalWidth > 0),
      artWidth: art?.getAttribute('width') || '',
      artHeight: art?.getAttribute('height') || '',
      artCurrentSrc: art?.currentSrc || '',
      avifSrcset: avifSource?.getAttribute('srcset') || '',
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
  if (!excerptCards.avifSrcset.endsWith('.avif') || !excerptCards.artCurrentSrc.includes('.avif')) {
    throw new Error(`Historical artwork did not load its optimized AVIF source: ${JSON.stringify(excerptCards)}`);
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
  if (!await evaluate(`(() => {
    const card = document.querySelector('.legacy-card');
    return Boolean(card?.getAttribute('tabindex') === '0'
      && card.querySelector('.legacy-card__gesture')
      && card.style.getPropertyValue('--swipe-progress') !== ''
      && !card.querySelector('.legacy-card__turn'));
  })()`)) {
    throw new Error("Excerpt card does not expose its click and keyboard affordance");
  }
  if (!await evaluate(`(() => {
    const card = document.querySelector('.legacy-card');
    const layers = card?.querySelectorAll('.legacy-card__stack > .legacy-card__box:not(.legacy-card__fling-layer)') || [];
    return Boolean(layers.length === 3 && !card.querySelector('.legacy-card__wash')
      && card.querySelector('.legacy-card__gesture'));
  })()`)) {
    throw new Error("Excerpt card must keep a three-layer deck with its swipe rail");
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
      collapsed: dock.classList.contains('is-collapsed'),
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      viewportHeight: innerHeight,
      visible: rect.bottom > 0 && rect.top < innerHeight,
    };
  })()`);
  if (!dockLayout?.collapsed || dockLayout.position !== "fixed" || dockLayout.zIndex < 2
    || !dockLayout.visible || dockLayout.bottom > dockLayout.viewportHeight) {
    throw new Error(`Audio dock is not pinned inside the viewport: ${JSON.stringify(dockLayout)}`);
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
    const button = document.querySelector('.legacy-card__box--current .legacy-card__save');
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
  currentStep = "static excerpt card";
  await evaluate(`(() => {
    const card = document.querySelector('.legacy-card');
    if (card) card.scrollIntoView({ block: 'start', behavior: 'instant' });
    return true;
  })()`);
  await waitUntil("excerpt card grab area in viewport", () => evaluate(`(() => {
    const rect = document.querySelector('.legacy-card')?.getBoundingClientRect();
    return Boolean(rect && rect.top >= 0 && rect.top < innerHeight - 180);
  })()`));
  const firstStaticExcerpt = await evaluate(
    "document.querySelector('.legacy-card__box--current .legacy-card__verse')?.textContent?.trim() || ''",
  );
  const flingAnimation = await evaluate(`(async () => {
    const card = document.querySelector('.legacy-card');
    card?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return {
      layers: card?.querySelectorAll('.legacy-card__stack > .legacy-card__box:not(.legacy-card__fling-layer)').length || 0,
      flinging: Boolean(card?.querySelector('[data-flinging="true"]')),
      turnCount: Number(card?.getAttribute('data-turn-count') || 0),
    };
  })()`);
  const staticTurn = await waitUntil("static excerpt click turn", () => evaluate(`
    (() => {
      const card = document.querySelector('.legacy-card');
      const verse = card?.querySelector('.legacy-card__box--current .legacy-card__verse')?.textContent?.trim() || '';
      return verse && verse !== ${JSON.stringify(firstStaticExcerpt)} ? verse : false;
    })()
  `), 60);
  if (!staticTurn) throw new Error("Clicking the static excerpt card did not change the verse");
  if (flingAnimation.layers !== 3 || !flingAnimation.flinging || flingAnimation.turnCount < 1) {
    throw new Error(`Card fling transition did not start: ${JSON.stringify(flingAnimation)}`);
  }
  await evaluate("document.querySelector('.legacy-card')?.blur(); window.scrollTo({ top: 0, behavior: 'instant' })");
  await waitUntil("page scroll reset after static turn", () => evaluate("scrollY === 0"));
  const secondStaticExcerpt = await waitUntil("second static excerpt click turn", () => evaluate(`
    (() => {
      const card = document.querySelector('.legacy-card');
      const verse = card?.querySelector('.legacy-card__box--current .legacy-card__verse')?.textContent?.trim() || '';
      if (verse && verse !== ${JSON.stringify(String(staticTurn || ""))}) return verse;
      if (!card?.querySelector('[data-flinging="true"]')) card?.click();
      return false;
    })()
  `), 60);
  if (!secondStaticExcerpt) throw new Error("Second click on the excerpt card did not change the verse");
  await evaluate(`(() => {
    const card = document.querySelector('.legacy-card');
    if (card) card.scrollIntoView({ block: 'start', behavior: 'instant' });
    return true;
  })()`);
  await waitUntil("excerpt card settled before swipe", () => evaluate(`
    (() => {
      const card = document.querySelector('.legacy-card');
      return Boolean(card) && !card.querySelector('[data-flinging="true"]');
    })()
  `), 32);
  const beforeSwipeExcerpt = await evaluate(
    "document.querySelector('.legacy-card__box--current .legacy-card__verse')?.textContent?.trim() || ''",
  );
  const swipeOrigin = await evaluate(`(() => {
    const rect = document.querySelector('.legacy-card')?.getBoundingClientRect();
    return rect ? { x: Math.round(rect.left + rect.width / 2), y: Math.round(rect.top + Math.min(rect.height / 3, 180)) } : null;
  })()`);
  if (!swipeOrigin) throw new Error("Excerpt card was not available for a swipe gesture");
  const excerptQueue = await evaluate(`(() => {
    const card = document.querySelector('.legacy-card');
    return {
      depth: Number(card?.getAttribute('data-excerpt-queue-depth') || 0),
      poetryRequests: performance.getEntriesByType('resource')
        .filter((entry) => entry.name.includes('all.json')).length,
    };
  })()`);
  if (excerptQueue.depth < 4) {
    throw new Error(`Excerpt queue was not prefetched before interaction: ${JSON.stringify(excerptQueue)}`);
  }
  const poetryRequestsBeforeSwipe = events.filter((entry) => {
    if (entry.method !== "Network.requestWillBeSent") return false;
    return isPoetrySourceRequest(entry.params.request?.url || "");
  }).length;
  const swipeFrame = await evaluate(`(async () => {
    const card = document.querySelector('.legacy-card');
    const pointerOptions = { pointerId: 71, pointerType: 'mouse', isPrimary: true, bubbles: true, cancelable: true, button: 0, buttons: 1 };
    card.dispatchEvent(new PointerEvent('pointerdown', { ...pointerOptions, clientX: ${swipeOrigin.x}, clientY: ${swipeOrigin.y} }));
    card.dispatchEvent(new PointerEvent('pointermove', { ...pointerOptions, clientX: ${swipeOrigin.x + 28}, clientY: ${swipeOrigin.y - 6} }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const face = card?.querySelector('.legacy-card__box--current');
    const frame = {
      swiping: Boolean(card?.classList.contains('is-swiping')),
      progress: Number(card?.style.getPropertyValue('--swipe-progress') || 0),
      direction: card?.getAttribute('data-direction'),
      faceOffset: face && card ? Math.round(face.getBoundingClientRect().left - (card.getBoundingClientRect().left + parseFloat(getComputedStyle(card).paddingLeft))) : -1,
    };
    card.dispatchEvent(new PointerEvent('pointermove', { ...pointerOptions, clientX: ${swipeOrigin.x + 72}, clientY: ${swipeOrigin.y - 10} }));
    card.dispatchEvent(new PointerEvent('pointerup', { ...pointerOptions, clientX: ${swipeOrigin.x + 72}, clientY: ${swipeOrigin.y - 10}, buttons: 0 }));
    return frame;
  })()`);
  if (!swipeFrame.swiping || swipeFrame.progress <= 0 || swipeFrame.direction !== 'right'
    || swipeFrame.faceOffset < 6 || swipeFrame.faceOffset > 20) {
    throw new Error(`Excerpt swipe did not drag the card face with the pointer: ${JSON.stringify(swipeFrame)}`);
  }
  const swipedExcerpt = await waitUntil("swipe excerpt turn", () => evaluate(`
    (() => {
      const card = document.querySelector('.legacy-card');
      const verse = card?.querySelector('.legacy-card__box--current .legacy-card__verse')?.textContent?.trim() || '';
      return verse && verse !== ${JSON.stringify(beforeSwipeExcerpt)} ? verse : false;
    })()
  `), 60);
  if (!swipedExcerpt) throw new Error("Swiping the excerpt card did not change the verse");
  const poetryRequestsAfterSwipe = events.filter((entry) => {
    if (entry.method !== "Network.requestWillBeSent") return false;
    return isPoetrySourceRequest(entry.params.request?.url || "");
  }).length;
  if (poetryRequestsAfterSwipe !== poetryRequestsBeforeSwipe) {
    throw new Error(`Swipe turn started a new poetry request: ${poetryRequestsBeforeSwipe} -> ${poetryRequestsAfterSwipe}`);
  }
  await evaluate("window.scrollTo({ top: 0, behavior: 'instant' })");
  await waitUntil("page scroll reset", () => evaluate("scrollY === 0"));

  currentStep = "audio dock two states";
  await evaluate(`(() => {
    const dock = document.querySelector('.audio-dock');
    const handle = dock?.querySelector('.audio-dock__handle');
    if (handle && !dock.classList.contains('is-collapsed')) handle.click();
    return true;
  })()`);
  await waitUntil("initial collapsed audio dock", () => evaluate(
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
  await waitUntil("expanded audio dock size settles", () => evaluate(`
    (() => {
      const dock = document.querySelector('.audio-dock');
      return Boolean(dock) && Math.round(dock.getBoundingClientRect().height) > 100
        && Math.round(dock.getBoundingClientRect().width) > 300;
    })()
  `), 32);
  const expandedDock = await evaluate(`(() => {
    const dock = document.querySelector('.audio-dock');
    const controls = [...document.querySelectorAll('.audio-dock__controls button')];
    const seek = document.querySelector('.audio-dock__seek');
    const handleIcon = dock?.querySelector('.audio-dock__handle svg path')?.getAttribute('d') || '';
    const rect = dock?.getBoundingClientRect();
    const inside = (selector) => {
      const node = document.querySelector(selector);
      if (!node || !rect) return false;
      const box = node.getBoundingClientRect();
      return box.left >= rect.left - 1 && box.right <= rect.right + 1
        && box.top >= rect.top - 1 && box.bottom <= rect.bottom + 1;
    };
    return {
      isExpanded: Boolean(dock?.classList.contains('is-expanded')),
      stageVisible: getComputedStyle(document.querySelector('.audio-dock__stage')).display !== 'none',
      minControlHeight: controls.length ? Math.min(...controls.map((button) => button.getBoundingClientRect().height)) : 0,
      seekHeight: seek ? seek.getBoundingClientRect().height : 0,
      width: dock ? Math.round(dock.getBoundingClientRect().width) : 0,
      height: dock ? Math.round(dock.getBoundingClientRect().height) : 0,
      audioPaused: Boolean(document.querySelector('audio')?.paused),
      handleIcon,
      aligned: ['.audio-dock__toggle', '.audio-dock__meta', '.audio-dock__right', '.audio-dock__seek-wrap', '.audio-dock__controls'].every(inside),
    };
  })()`);
  if (!expandedDock.isExpanded || !expandedDock.stageVisible) {
    throw new Error("Manually expanded audio dock did not reveal its controls");
  }
  if (!expandedDock.audioPaused) {
    throw new Error("Expanding the audio dock must not start playback");
  }
  if (expandedDock.height > 120) {
    throw new Error(`Expanded audio dock exceeds the fixed-layer height budget: ${JSON.stringify(expandedDock)}`);
  }
  if (expandedDock.minControlHeight < 36 || expandedDock.seekHeight < 24) {
    throw new Error("Expanded audio dock controls fell below the touch target floor");
  }
  if (!expandedDock.aligned) {
    throw new Error(`Expanded audio dock regions are not contained and aligned: ${JSON.stringify(expandedDock)}`);
  }
  if (!expandedDock.handleIcon.includes('m15 5-7 7 7 7')) {
    throw new Error(`Expanded audio dock must show a left chevron: ${expandedDock.handleIcon}`);
  }
  await evaluate(`(() => {
    const handle = document.querySelector('.audio-dock__handle');
    handle.focus();
    return true;
  })()`);
  await waitUntil("focus keeps audio dock expanded", async () => {
    await delay(320);
    return evaluate("document.querySelector('.audio-dock')?.classList.contains('is-expanded')");
  });
  await evaluate(`(() => {
    const handle = document.querySelector('.audio-dock__handle');
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    handle.click();
    return true;
  })()`);
  await waitUntil("audio dock returns to collapsed", () => evaluate(
    "document.querySelector('.audio-dock')?.classList.contains('is-collapsed')",
  ));
  await waitUntil("collapsed audio dock settles", () => evaluate(`(() => {
    const dock = document.querySelector('.audio-dock');
    return dock ? Math.round(dock.getBoundingClientRect().width) <= 190 : false;
  })()`));
  const collapsedDock = await evaluate(`(() => {
    const dock = document.querySelector('.audio-dock');
    return {
      width: dock ? Math.round(dock.getBoundingClientRect().width) : 0,
      height: dock ? Math.round(dock.getBoundingClientRect().height) : 0,
      compactTitle: getComputedStyle(document.querySelector('.audio-dock__compact-title')).display !== 'none',
      stageHidden: getComputedStyle(document.querySelector('.audio-dock__meta')).display === 'none',
      audioPaused: Boolean(document.querySelector('audio')?.paused),
      handleIcon: dock?.querySelector('.audio-dock__handle svg path')?.getAttribute('d') || '',
    };
  })()`);
  if (!collapsedDock.compactTitle || !collapsedDock.stageHidden || !collapsedDock.audioPaused
    || collapsedDock.width > 190 || collapsedDock.height > 56) {
    throw new Error(`Collapsed audio dock should be a quiet soundscape slip: ${JSON.stringify(collapsedDock)}`);
  }
  if (!collapsedDock.handleIcon.includes('m9 5 7 7-7 7')) {
    throw new Error(`Collapsed audio dock must show a right chevron: ${collapsedDock.handleIcon}`);
  }

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
  const desktopTypography = await evaluate(`(() => {
    const title = document.querySelector('.poem-row__title h3');
    const selectors = ['.eyebrow', '.quick-terms button', '.facet__head button', '.filter-note', '.corpus-note'];
    const sizes = selectors
      .map((selector) => document.querySelector(selector))
      .filter(Boolean)
      .map((element) => parseFloat(getComputedStyle(element).fontSize));
    return {
      titleWhiteSpace: title ? getComputedStyle(title).whiteSpace : '',
      titleTextOverflow: title ? getComputedStyle(title).textOverflow : '',
      minSize: sizes.length ? Math.min(...sizes) : 0,
    };
  })()`);
  if (desktopTypography.titleWhiteSpace === "nowrap" || desktopTypography.titleTextOverflow === "ellipsis") {
    throw new Error("Long poem titles should wrap instead of being clipped");
  }
  if (desktopTypography.minSize < 11) {
    throw new Error("Explore supporting text fell below the 11px readability floor");
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
      return dock.classList.contains('is-collapsed') && Boolean(document.querySelector('audio')?.paused);
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
    audioPaused: Boolean(document.querySelector('audio')?.paused),
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
  if (!mobileLayout.audioPaused) {
    throw new Error("Mobile audio dock should start silently");
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
  const composeTypography = await evaluate(`(() => {
    const selectors = ['.field-hint', '.draft-status', '.preview-panel__top', '.preview-category', '.preview-hint'];
    const sizes = selectors
      .map((selector) => document.querySelector(selector))
      .filter(Boolean)
      .map((element) => parseFloat(getComputedStyle(element).fontSize));
    const loginLink = document.querySelector('.compose-login-note a');
    return {
      minSize: sizes.length ? Math.min(...sizes) : 0,
      loginHeight: loginLink ? Math.round(loginLink.getBoundingClientRect().height) : 0,
      fixedLayerSpace: parseFloat(getComputedStyle(document.querySelector("main")).paddingBottom),
    };
  })()`);
  if (composeTypography.minSize < 11) {
    throw new Error("Compose supporting text fell below the 11px readability floor");
  }
  if (composeTypography.loginHeight < 40) {
    throw new Error("Compose login link is below the minimum touch target");
  }
  if (composeTypography.fixedLayerSpace < 120) {
    throw new Error("Narrow screens do not reserve space for fixed layers");
  }
  const consistency = await evaluate(`(() => ({
    fixedLayerSpace: parseFloat(getComputedStyle(document.querySelector("main")).paddingBottom),
    footerPadding: parseFloat(getComputedStyle(document.querySelector('.museum-footer')).paddingBottom),
    noticeBottom: parseFloat(getComputedStyle(document.querySelector('.notice-host')).bottom),
  }))()`);
  if (consistency.footerPadding < consistency.fixedLayerSpace || consistency.noticeBottom < 200) {
    throw new Error("Fixed layers do not share the narrow-screen safe area");
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
  if (!await evaluate(`(() => {
    const dock = document.querySelector('.audio-dock');
    const handle = dock?.querySelector('.audio-dock__handle');
    if (!handle) return false;
    handle.click();
    return true;
  })()`)) throw new Error("Narrow audio dock expand control was not found");
  await waitUntil("320px expanded audio dock", () => evaluate(
    "!document.querySelector('.audio-dock')?.classList.contains('is-collapsed')",
  ));
  const narrowExpanded = await evaluate(`(() => {
    const dock = document.querySelector('.audio-dock');
    const controls = [...document.querySelectorAll('.audio-dock__controls button')]
      .filter((button) => getComputedStyle(button).display !== "none");
    return {
      width: dock ? Math.round(dock.getBoundingClientRect().width) : 0,
      height: dock ? Math.round(dock.getBoundingClientRect().height) : 0,
      minControlHeight: controls.length ? Math.min(...controls.map((button) => button.getBoundingClientRect().height)) : 0,
      visibleControls: controls.length,
      audioPaused: Boolean(document.querySelector('audio')?.paused),
    };
  })()`);
  if (narrowExpanded.height > 120 || narrowExpanded.visibleControls < 3
    || narrowExpanded.minControlHeight < 36 || !narrowExpanded.audioPaused) {
    throw new Error(`320px expanded audio dock is unstable: ${JSON.stringify(narrowExpanded)}`);
  }
  await evaluate("document.querySelector('.audio-dock__handle').click()");
  await waitUntil("320px audio dock collapsed again", () => evaluate(
    "document.querySelector('.audio-dock')?.classList.contains('is-collapsed')",
  ));
  const narrowLayout = await evaluate(`(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    filterBar: getComputedStyle(document.querySelector('.mobile-filter-bar')).display,
    audioDockCollapsed: document.querySelector('.audio-dock')?.classList.contains('is-collapsed') || false,
    audioPaused: Boolean(document.querySelector('audio')?.paused),
  }))()`);
  if (narrowLayout.scrollWidth > narrowLayout.viewportWidth + 1 || narrowLayout.bodyScrollWidth > narrowLayout.viewportWidth + 1) {
    throw new Error("320px explore page overflows horizontally");
  }
  if (narrowLayout.filterBar === "none" || !narrowLayout.audioDockCollapsed) {
    throw new Error("320px mobile controls did not adapt as expected");
  }
  if (!narrowLayout.audioPaused) {
    throw new Error("320px audio dock did not start silently");
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
  const authSemantics = await evaluate(`(() => ({
    hiddenFocusable: [...document.querySelectorAll('[aria-hidden="true"] a, [aria-hidden="true"] button, [aria-hidden="true"] input, [aria-hidden="true"] [tabindex]')]
      .filter((element) => element.tabIndex >= 0).length,
    tablist: document.querySelectorAll('.auth-tabs[role="tablist"]').length,
    currentPage: document.querySelector('.auth-tabs a[aria-current="page"]')?.textContent?.trim() || '',
    verseWritingMode: getComputedStyle(document.querySelector('.auth-verse__line')).writingMode,
    verseLines: [...document.querySelectorAll('.auth-verse__line')].every((line) => getComputedStyle(line).whiteSpace === 'nowrap'),
    verseGeometry: [...document.querySelectorAll('.auth-verse__line')].map((line) => {
      const rect = line.getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    }),
    verseText: [...document.querySelectorAll('.auth-verse__line')].map((line) => line.textContent.trim()).join('，'),
    captionWritingMode: getComputedStyle(document.querySelector('.auth-verse figcaption')).writingMode,
  }))()`);
  if (authSemantics.hiddenFocusable || authSemantics.tablist || authSemantics.currentPage !== "登录"
    || authSemantics.verseWritingMode !== "vertical-rl" || !authSemantics.verseLines) {
    throw new Error("Auth page has hidden focusable content or inconsistent navigation semantics");
  }
  if (authSemantics.verseText !== "山有木兮木有枝，心悦君兮君不知"
    || authSemantics.captionWritingMode !== "vertical-rl"
    || authSemantics.verseGeometry.length !== 2
    || authSemantics.verseGeometry.some((line) => line.width > 70 || line.height < 180)
    || Math.abs(authSemantics.verseGeometry[0].height - authSemantics.verseGeometry[1].height) > 2) {
    throw new Error("Auth verse should form two complete vertical columns");
  }
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
  if (!excerptCards.sourceLabel.includes("诗句源：")) {
    throw new Error("Excerpt source label did not report the active source");
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
    `no unexpected console or network errors, cold-start CLS ${coldStart.coldLayoutShift.toFixed(4)}, CLS ${cumulativeLayoutShift.toFixed(4)}.`,
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
