import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  assertNoBrowserErrors,
  captureElement,
  captureViewport,
  collectGeometry,
  comparePng,
  gotoStable,
  openBrowser,
  realDrag,
  startPreview,
} from "./lab.mjs";

const outDir = process.env.RENDER_LAB_DIR || "/tmp/lanze-render-lab";
const compareOnline = process.env.RENDER_COMPARE === "online";
const onlineUrl = `https://2648782102.github.io/LanZe/?render=${Date.now()}#/`;
const routes = ["/#/", "/#/explore", "/#/login", "/#/compose", "/#/collection"];

const main = async () => {
  await mkdir(outDir, { recursive: true });
  const preview = await startPreview({ port: 4355 });
  const lab = await openBrowser({ headless: true });
  const session = await lab.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const { page, errors } = session;
  await page.route("**/*", async (route) => {
    await route.continue();
  });
  await session.context.setExtraHTTPHeaders({ "Cache-Control": "no-cache" });

  const report = { local: {}, online: {}, comparisons: {}, geometry: {} };

  try {
    for (const route of routes) {
      const name = route === "/#/" ? "today" : route.replace("/#/", "").replace(/\W+/g, "-");
      await gotoStable(page, `${preview.origin}${route}`);
      const localShot = join(outDir, `local-${name}.png`);
      await captureViewport(page, localShot);
      report.local[name] = localShot;
      report.geometry[name] = await collectGeometry(page, {
        header: ".museum-header",
        brand: ".brand",
        brandName: ".brand__name",
        brandLatin: ".brand__latin",
        brandMark: ".brand__mark",
        audioDock: ".audio-dock",
      });
    }

    await gotoStable(page, `${preview.origin}/#/`);
    await page.locator(".audio-dock__handle").click();
    await page.waitForTimeout(400);
    const localDock = join(outDir, "local-audio-expanded.png");
    await captureElement(page, ".audio-dock", localDock, { padding: 6 });

    const localBrand = join(outDir, "local-brand.png");
    await gotoStable(page, `${preview.origin}/#/`);
    await captureElement(page, ".brand", localBrand, { padding: 8 });

    if (compareOnline) {
      await gotoStable(page, onlineUrl, { settle: 900 });
      const onlineHome = join(outDir, "online-today.png");
      await captureViewport(page, onlineHome);
      const onlineBrand = join(outDir, "online-brand.png");
      await captureElement(page, ".brand", onlineBrand, { padding: 8 });
      report.online.today = onlineHome;
      report.online.brand = onlineBrand;
      const comparison = await comparePng(localBrand, onlineBrand, join(outDir, "diff-brand.png"));
      report.comparisons.brand = comparison;
      if (comparison.sizeMismatch) {
        throw new Error(`Online brand box size differs from local build: ${JSON.stringify(comparison)}`);
      }
      if (comparison.mismatches > 0) {
        throw new Error(`Online brand render differs from local build: ${JSON.stringify(comparison)}`);
      }
    }
    report.local.brand = localBrand;
    report.local.audioExpanded = localDock;

    await gotoStable(page, `${preview.origin}/#/`);
    await page.locator(".legacy-card").scrollIntoViewIfNeeded();
    await realDrag(page, ".legacy-card", { from: -10, to: 70, steps: 14 });
    await page.waitForTimeout(600);
    report.geometry.afterRealDrag = await collectGeometry(page, {
      card: ".legacy-card",
      hint: ".legacy-card__hint",
    });

    assertNoBrowserErrors(errors);
    console.log(JSON.stringify({ outDir, report }, null, 2));
  } finally {
    await lab.stop();
    preview.stop();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
