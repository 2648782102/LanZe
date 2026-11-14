import { stat, readdir } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import { gotoStable, openBrowser, startPreview } from "./lab.mjs";

const port = Number(process.env.PERF_PORT || 4373);
const budgets = {
  lcpMs: Number(process.env.PERF_LCP_BUDGET || 2500),
  cls: Number(process.env.PERF_CLS_BUDGET || 0.05),
  initialJsKb: Number(process.env.PERF_JS_BUDGET || 95),
  initialCssKb: Number(process.env.PERF_CSS_BUDGET || 12),
};

const measureBundle = async () => {
  const assetsDir = join(process.cwd(), "dist", "assets");
  const html = await readFile(join(process.cwd(), "dist", "index.html"), "utf8");
  const referenced = [...html.matchAll(/(?:src|href)="\.\/(assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]);
  const rows = [];
  for (const relative of referenced) {
    const path = join(process.cwd(), "dist", relative);
    const buffer = await readFile(path);
    rows.push({
      file: relative,
      rawKb: Math.round(buffer.length / 1024),
      gzipKb: Math.round(gzipSync(buffer).length / 1024),
      type: relative.endsWith(".css") ? "css" : "js",
    });
  }
  const total = (type) => rows.filter((row) => row.type === type).reduce((sum, row) => sum + row.gzipKb, 0);
  return { rows, jsKb: total("js"), cssKb: total("css") };
};

const main = async () => {
  const bundle = await measureBundle();
  const preview = await startPreview({ port });
  const lab = await openBrowser({ headless: true });
  const { page } = await lab.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  let metrics;
  try {
    await page.addInitScript(() => {
      window.__lcp = 0;
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__lcp = entry.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await gotoStable(page, `${preview.origin}/#/`, { settle: 1200 });
    metrics = await page.evaluate(() => ({
      lcp: Math.round(window.__lcp),
      cls: Number(window.__cls.toFixed(4)),
      domNodes: document.querySelectorAll("*").length,
      resources: performance.getEntriesByType("resource").length,
      transferKb: Math.round(
        performance.getEntriesByType("resource").reduce((sum, entry) => sum + (entry.transferSize || 0), 0) / 1024,
      ),
    }));
  } finally {
    await lab.stop();
    preview.stop();
  }

  const failures = [];
  if (metrics.lcp > budgets.lcpMs) failures.push(`LCP ${metrics.lcp}ms > ${budgets.lcpMs}ms`);
  if (metrics.cls > budgets.cls) failures.push(`CLS ${metrics.cls} > ${budgets.cls}`);
  if (bundle.jsKb > budgets.initialJsKb) failures.push(`initial JS ${bundle.jsKb}KB > ${budgets.initialJsKb}KB`);
  if (bundle.cssKb > budgets.initialCssKb) failures.push(`initial CSS ${bundle.cssKb}KB > ${budgets.initialCssKb}KB`);

  console.log(JSON.stringify({ ok: failures.length === 0, budgets, bundle, metrics, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
