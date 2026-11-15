#!/usr/bin/env node
/**
 * Font-independent layout contract.
 *
 * Screenshot baselines are pixel-exact for one font stack, so they cannot be
 * compared across macOS and Linux. This audit instead records structural facts
 * (overflow, fixed-layer overlap, grid shape, control sizes, type floor) which
 * stay stable regardless of glyph metrics, and diffs them against a committed
 * snapshot. That makes the check meaningful in CI.
 */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { assertNoBrowserErrors, gotoStable, openBrowser, startPreview } from "./lab.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const baselinePath = join(root, "tests/visual/layout-contract.json");
const update = process.argv.includes("--update");
const port = Number(process.env.CONTRACT_PORT || 4379);

const routes = [
  { name: "read", path: "/#/" },
  { name: "explore", path: "/#/explore" },
  { name: "poem", path: "/#/poem/demo-shuidiaoge" },
  { name: "collection", path: "/#/collection" },
  { name: "compose", path: "/#/compose" },
  { name: "login", path: "/#/login" },
];

// 320 / 390 phone, 820 phone-shell edge, 821 desktop-shell edge, 1280 desktop.
const viewports = [
  { width: 320, height: 720, mobile: true },
  { width: 390, height: 844, mobile: true },
  { width: 820, height: 900, mobile: false },
  { width: 821, height: 900, mobile: false },
  { width: 1280, height: 900, mobile: false },
];

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const measure = async (page) => page.evaluate(() => {
  const doc = document.documentElement;
  const visible = (node) => {
    if (!node) return false;
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const box = node.getBoundingClientRect();
    return box.width > 0 && box.height > 0;
  };
  const box = (selector) => {
    const node = document.querySelector(selector);
    return node ? node.getBoundingClientRect() : null;
  };

  const fixedLayers = [...document.querySelectorAll("body *")]
    .filter((node) => getComputedStyle(node).position === "fixed" && visible(node))
    .map((node) => ({
      selector: `${node.tagName.toLowerCase()}.${[...node.classList].slice(0, 2).join(".")}`,
      top: Math.round(node.getBoundingClientRect().top),
      height: Math.round(node.getBoundingClientRect().height),
      zIndex: Number(getComputedStyle(node).zIndex) || 0,
    }))
    .sort((a, b) => a.top - b.top);

  // Content sitting under an opaque fixed layer would be unreadable. The
  // mobile tab bar is the only persistent element over page content; the
  // notice host is transient and the drawer scrim is intentional.
  const overlays = fixedLayers
    .filter((layer) => /\.mobile-dock/.test(layer.selector))
    .map((layer) => layer.top);
  const highestOverlay = overlays.length ? Math.min(...overlays) : Number.POSITIVE_INFINITY;
  const footerLinks = [...document.querySelectorAll(".footer-links a")]
    .map((node) => node.getBoundingClientRect());
  const overlapped = {
    footerLinks: footerLinks.filter((link) => link.bottom > highestOverlay + 1).length,
  };

  const nav = document.querySelector(".main-nav");
  const mobileDock = document.querySelector(".mobile-dock");
  const filterBar = document.querySelector(".mobile-filter-bar");

  const shells = {
    mobileDock: visible(mobileDock),
    desktopNav: visible(nav),
    mobileFilterBar: visible(filterBar),
  };

  const grid = (selector) => {
    const node = document.querySelector(selector);
    if (!node) return null;
    return getComputedStyle(node).gridTemplateColumns.split(" ").filter(Boolean).length;
  };

  // Only control *height* is font-independent: widths of text buttons follow the
  // glyph metrics, so comparing them across platforms produces false failures.
  const controlHeights = [...document.querySelectorAll("button, a[href], input, select, textarea, summary")]
    .filter(visible)
    .map((node) => Math.round(node.getBoundingClientRect().height));
  const minControlHeight = controlHeights.length ? Math.min(...controlHeights) : null;

  const typeSizes = [...document.querySelectorAll("p, li, span, small, h1, h2, h3, h4, button, a, label")]
    .filter((node) => visible(node) && (node.textContent || "").trim().length > 1)
    // The wordmark's Latin lockup is decorative, not reading text.
    .filter((node) => !node.classList.contains("brand__latin"))
    .map((node) => parseFloat(getComputedStyle(node).fontSize))
    .filter((size) => Number.isFinite(size) && size > 0);

  return {
    overflowX: Math.max(0, doc.scrollWidth - doc.clientWidth),
    shells,
    shellConsistent: !(filterBar ? shells.mobileDock !== shells.mobileFilterBar : false),
    fixedLayers,
    overlapped,
    grids: {
      index: grid(".index-grid"),
      room: grid(".room-grid"),
      collection: grid(".collection-layout"),
      compose: grid(".compose-grid"),
      legacy: grid(".legacy-gallery"),
    },
    minControlHeight,
    minFontSize: typeSizes.length ? Math.min(...typeSizes) : null,
  };
});

const main = async () => {
  const previous = await exists(baselinePath)
    ? JSON.parse(await readFile(baselinePath, "utf8"))
    : null;

  const preview = await startPreview({ port, root });
  const { browser, newPage, stop } = await openBrowser({ headless: true });
  const snapshot = {};
  const problems = [];

  try {
    for (const route of routes) {
      for (const viewport of viewports) {
        const key = `${route.name}@${viewport.width}`;
        const { page, context, errors } = await newPage({
          viewport: { width: viewport.width, height: viewport.height },
          deviceScaleFactor: 1,
          isMobile: viewport.mobile,
          hasTouch: viewport.mobile,
        });
        await gotoStable(page, `${preview.origin}${route.path}`, { settle: 600 });
        const facts = await measure(page);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.waitForTimeout(250);
        const atBottom = await measure(page);
        assertNoBrowserErrors(errors);
        snapshot[key] = { ...facts, footerOverlapAtBottom: atBottom.overlapped };

        // Hard rules that must never regress, independent of any baseline.
        if (facts.overflowX > 1) problems.push(`${key}: horizontal overflow ${facts.overflowX}px`);
        if (!facts.shellConsistent) problems.push(`${key}: mobile dock and filter bar disagree`);
        if (atBottom.overlapped.footerLinks > 0) problems.push(`${key}: fixed layer covers footer links when scrolled`);
        // 9px is the reading floor this project uses for the smallest meta text;
        // allow a hair of sub-pixel slack because font metrics differ per platform.
        if (facts.minFontSize !== null && facts.minFontSize < 8.5) {
          problems.push(`${key}: text below 8.5px (${facts.minFontSize}px)`);
        }
        await context.close();
      }
    }
  } finally {
    await stop();
    preview.stop();
  }

  const drifted = [];
  if (previous && !update) {
    for (const [key, facts] of Object.entries(snapshot)) {
      const before = previous.views?.[key];
      if (!before) {
        drifted.push(`${key}: new view without a baseline`);
        continue;
      }
      if (before.shells?.mobileDock !== facts.shells.mobileDock
        || before.shells?.mobileFilterBar !== facts.shells.mobileFilterBar) {
        drifted.push(`${key}: shell visibility changed`);
      }
      for (const [name, count] of Object.entries(facts.grids)) {
        if (count === null) continue;
        if (before.grids?.[name] !== count) {
          drifted.push(`${key}: ${name} grid ${before.grids?.[name]} -> ${count}`);
        }
      }
      if (before.minControlHeight !== null && facts.minControlHeight !== null
        && facts.minControlHeight + 1 < before.minControlHeight) {
        drifted.push(`${key}: control height floor shrank ${before.minControlHeight} -> ${facts.minControlHeight}`);
      }
    }
    for (const key of Object.keys(previous.views || {})) {
      if (!snapshot[key]) drifted.push(`${key}: view no longer renders`);
    }
  }

  if (update || !previous) {
    await mkdir(join(root, "tests/visual"), { recursive: true });
    await writeFile(baselinePath, `${JSON.stringify({
      note: "Font-independent layout facts; safe to compare across platforms.",
      updatedAt: new Date().toISOString(),
      viewports: viewports.map((viewport) => viewport.width),
      routes: routes.map((route) => route.name),
      views: snapshot,
    }, null, 2)}\n`);
  }

  console.log(JSON.stringify({
    ok: problems.length === 0 && drifted.length === 0,
    mode: update ? "update" : previous ? "compare" : "bootstrap",
    views: Object.keys(snapshot).length,
    baseline: relative(root, baselinePath),
    problems,
    drifted,
  }, null, 2));

  if (problems.length || drifted.length) process.exitCode = 1;
};

await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
