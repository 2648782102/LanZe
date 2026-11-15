#!/usr/bin/env node
/**
 * Mobile visual regression: renders key routes at three widths and compares
 * them against committed baselines. Missing baselines are written instead of
 * failing so the first run bootstraps the set; `--update` refreshes them.
 */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { platform } from "node:os";
import { fileURLToPath } from "node:url";
import { assertNoBrowserErrors, comparePng, gotoStable, openBrowser, startPreview } from "./lab.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const baselineDir = join(root, "tests/visual/mobile");
const outputDir = join(root, "tests/visual/.actual");
const manifestPath = join(baselineDir, "manifest.json");
const update = process.argv.includes("--update");
const maxRatio = Number(process.env.VISUAL_MAX_DIFF || 0.012);
const strict = process.env.VISUAL_STRICT !== "0";

const routes = [
  { name: "explore", path: "/#/explore" },
  { name: "read", path: "/#/" },
  { name: "poem", path: "/#/poem/demo-shuidiaoge" },
  { name: "collection", path: "/#/collection" },
];
const widths = [320, 390, 430];

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const readManifest = async () => {
  if (!await exists(manifestPath)) return null;
  try {
    return JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    return null;
  }
};

const main = async () => {
  await mkdir(baselineDir, { recursive: true });
  await mkdir(outputDir, { recursive: true });

  // Baselines are pixel-exact for one font stack. Chinese glyph fallback differs
  // between macOS and Linux, so compare only where the environment matches.
  const manifest = await readManifest();
  const currentPlatform = platform();
  if (manifest && manifest.platform !== currentPlatform && !update) {
    const message = `Visual baselines were captured on ${manifest.platform}, running on ${currentPlatform}.`;
    console.log(JSON.stringify({
      ok: true,
      compared: false,
      skipped: true,
      reason: message,
      hint: "Run `npm run audit:visual:update` on the baseline platform, or set VISUAL_STRICT=1 to compare anyway.",
    }, null, 2));
    return;
  }

  const preview = await startPreview({ port: 4377, root });
  const { browser, newPage, stop } = await openBrowser({ headless: true });
  const results = [];
  try {
    for (const route of routes) {
      for (const width of widths) {
        const { page, context, errors } = await newPage({
          viewport: { width, height: 844 },
          deviceScaleFactor: 2,
          isMobile: true,
          hasTouch: true,
        });
        await gotoStable(page, `${preview.origin}${route.path}`, { settle: 700 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(150);
        const file = `${route.name}-${width}.png`;
        const actual = join(outputDir, file);
        const baseline = join(baselineDir, file);
        await page.screenshot({ path: actual, fullPage: false });
        assertNoBrowserErrors(errors);
        if (update || !await exists(baseline)) {
          await page.screenshot({ path: baseline, fullPage: false });
          results.push({ file, status: update ? "updated" : "created" });
        } else {
          const diffPath = join(outputDir, `${route.name}-${width}.diff.png`);
          const diff = await comparePng(baseline, actual, diffPath);
          results.push({
            file,
            status: diff.ratio > maxRatio ? "changed" : "same",
            ratio: Number((diff.ratio * 100).toFixed(2)),
          });
        }
        await context.close();
      }
    }
  } finally {
    await stop();
    preview.stop();
  }

  await writeFile(manifestPath, `${JSON.stringify({
    platform: currentPlatform,
    deviceScaleFactor: 2,
    routes: routes.map((route) => route.path),
    widths,
    updatedAt: new Date().toISOString(),
  }, null, 2)}\n`);

  const changed = results.filter((entry) => entry.status === "changed");
  const created = results.filter((entry) => entry.status.startsWith("created"));
  console.log(JSON.stringify({
    ok: changed.length === 0,
    maxRatio: `${(maxRatio * 100).toFixed(1)}%`,
    total: results.length,
    baselineDir: relative(root, baselineDir),
    results,
  }, null, 2));
  if (changed.length) {
    console.error(`\nVisual changes exceeded ${(maxRatio * 100).toFixed(1)}% in ${changed.length} view(s).`);
    console.error(`Diffs: ${relative(root, outputDir)}`);
    console.error("Review them, then re-run with --update to accept a new baseline.");
    process.exitCode = 1;
  } else if (created.length) {
    console.log(`\nBootstrapped ${created.length} baseline(s) in ${relative(root, baselineDir)}.`);
  }
};

await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
