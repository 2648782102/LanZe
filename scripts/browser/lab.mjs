import { spawn } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

export const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const waitForUrl = async (url, timeout = 15000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(500) });
      if (response.ok) return;
    } catch {}
    await delay(200);
  }
  throw new Error(`Timed out waiting for ${url}`);
};

export const startPreview = async ({ port = 4355, root = process.cwd() } = {}) => {
  const preview = spawn(process.execPath, [
    "node_modules/vite/bin/vite.js", "preview",
    "--host", "127.0.0.1", "--port", String(port), "--strictPort",
  ], { cwd: root, stdio: "ignore" });
  await waitForUrl(`http://127.0.0.1:${port}`);
  return {
    origin: `http://127.0.0.1:${port}`,
    stop: () => !preview.killed && preview.kill("SIGTERM"),
  };
};

export const openBrowser = async ({ headless = true } = {}) => {
  await access(CHROME_PATH);
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
  });
  return {
    browser,
    async newPage(options = {}) {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 2,
        ...options,
      });
      const page = await context.newPage();
      const errors = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(`console: ${message.text()}`);
      });
      page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
      page.on("requestfailed", (request) => {
        const failure = request.failure()?.errorText || "";
        const url = request.url();
        if (failure === "net::ERR_ABORTED" && /music\.(163|126)\.com|music\.126\.net/.test(url)) return;
        if (!failure.includes("ERR_ABORTED")) errors.push(`network: ${failure} ${url}`);
      });
      return { context, page, errors };
    },
    stop: () => browser.close(),
  };
};

export const gotoStable = async (page, url, { settle = 500 } = {}) => {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(settle);
};

export const setViewport = async (page, { width, height, deviceScaleFactor = 2, mobile = false }) => {
  await page.setViewportSize({ width, height });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return { width, height, deviceScaleFactor, mobile };
};

export const captureElement = async (page, selector, output, { padding = 8 } = {}) => {
  const locator = page.locator(selector);
  await locator.waitFor({ state: "visible" });
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Element has no box: ${selector}`);
  await page.screenshot({
    path: output,
    clip: {
      x: Math.max(0, box.x - padding),
      y: Math.max(0, box.y - padding),
      width: box.width + padding * 2,
      height: box.height + padding * 2,
    },
  });
  return box;
};

export const captureViewport = async (page, output) => {
  await page.screenshot({ path: output, fullPage: false });
};

export const comparePng = async (leftPath, rightPath, diffPath, { threshold = 0.12 } = {}) => {
  const [left, right] = await Promise.all([readFile(leftPath), readFile(rightPath)]);
  const leftPng = PNG.sync.read(left);
  const rightPng = PNG.sync.read(right);
  const width = Math.min(leftPng.width, rightPng.width);
  const height = Math.min(leftPng.height, rightPng.height);
  const crop = (source) => {
    if (source.width === width && source.height === height) return source.data;
    const data = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y += 1) {
      const from = (y * source.width) * 4;
      const to = (y * width) * 4;
      source.data.copy(data, to, from, from + width * 4);
    }
    return data;
  };
  const diff = new PNG({ width, height });
  const mismatches = pixelmatch(
    crop(leftPng),
    crop(rightPng),
    diff.data,
    width,
    height,
    { threshold, includeAA: false },
  );
  if (diffPath) {
    await mkdir(join(diffPath, ".."), { recursive: true }).catch(() => {});
    await writeFile(diffPath, PNG.sync.write(diff));
  }
  return {
    width,
    height,
    sizeMismatch: leftPng.width !== rightPng.width || leftPng.height !== rightPng.height,
    leftSize: [leftPng.width, leftPng.height],
    rightSize: [rightPng.width, rightPng.height],
    mismatches,
    ratio: mismatches / (width * height),
  };
};

export const realDrag = async (page, selector, { from, to, steps = 12 } = {}) => {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error(`Element has no box: ${selector}`);
  const originX = box.x + box.width / 2;
  const originY = box.y + Math.min(box.height / 3, 180);
  const startX = originX + from;
  const endX = originX + to;
  await page.mouse.move(startX, originY);
  await page.mouse.down();
  await page.mouse.move(endX, originY, { steps });
  await page.mouse.up();
};

export const collectGeometry = async (page, selectors) => page.evaluate((entries) => {
  const box = (selector) => {
    const node = document.querySelector(selector);
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    return {
      x: Math.round(rect.x * 10) / 10,
      y: Math.round(rect.y * 10) / 10,
      width: Math.round(rect.width * 10) / 10,
      height: Math.round(rect.height * 10) / 10,
      bottom: Math.round(rect.bottom * 10) / 10,
      right: Math.round(rect.right * 10) / 10,
    };
  };
  return Object.fromEntries(entries.map(([label, selector]) => [label, box(selector)]));
}, Object.entries(selectors));

export const assertNoBrowserErrors = (errors) => {
  if (errors.length) throw new Error(`Browser reported problems:\n${errors.join("\n")}`);
};
