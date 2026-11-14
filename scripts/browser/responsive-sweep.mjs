import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { assertNoBrowserErrors, gotoStable, openBrowser, startPreview } from "./lab.mjs";

const outDir = process.env.SWEEP_DIR || "/tmp/lanze-responsive";
const port = Number(process.env.SWEEP_PORT || 4361);
const widths = [320, 360, 390, 414, 480, 560, 640, 768, 820, 900, 1024, 1280, 1440, 1920];
const routes = ["/#/", "/#/explore", "/#/collection", "/#/compose", "/#/login"];

const main = async () => {
  await mkdir(outDir, { recursive: true });
  const preview = await startPreview({ port });
  const lab = await openBrowser({ headless: true });
  const session = await lab.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const { page, errors } = session;
  const report = [];

  try {
    for (const route of routes) {
      await gotoStable(page, `${preview.origin}${route}`);
      for (const width of widths) {
        await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
        await page.waitForTimeout(140);
        const row = await page.evaluate(() => {
          const doc = document.documentElement;
          const overflowing = [...document.querySelectorAll('body *')]
            .filter((node) => {
              const rect = node.getBoundingClientRect();
              const position = getComputedStyle(node).position;
              return rect.width > 0
                && (rect.right > doc.clientWidth + 1 || rect.left < -1)
                && position !== 'fixed';
            })
            .slice(0, 6)
            .map((node) => `${node.tagName.toLowerCase()}.${[...node.classList].slice(0, 2).join('.')}`);
          return {
            viewport: innerWidth,
            overflow: doc.scrollWidth - doc.clientWidth,
            overflowing,
            tightTargets: [...document.querySelectorAll('button, a, [role="button"]')]
              .filter((node) => {
                const rect = node.getBoundingClientRect();
                if (rect.width <= 0 || rect.height <= 0) return false;
                const style = getComputedStyle(node);
                return style.visibility !== 'hidden' && style.display !== 'none'
                  && (rect.height < 24 || (rect.width < 24 && node.textContent.trim()));
              })
              .slice(0, 4)
              .map((node) => `${node.textContent.trim().slice(0, 8)}@${Math.round(node.getBoundingClientRect().height)}px`),
            clipped: [...document.querySelectorAll('h1, h2, .room-head, .room-count')]
              .filter((node) => {
                const rect = node.getBoundingClientRect();
                const style = getComputedStyle(node);
                return style.overflow === 'hidden' && rect.width > 0
                  && node.scrollWidth > rect.width + 2;
              })
              .slice(0, 4)
              .map((node) => `${node.tagName.toLowerCase()}.${[...node.classList].join('.')} clip${node.scrollWidth - Math.round(node.getBoundingClientRect().width)}px`),
          };
        });
        const shot = join(outDir, `${route.replace('/#/', '').replace(/\W+/g, '-') || 'today'}-${width}.png`);
        await page.screenshot({ path: shot, fullPage: false });
        report.push({ route, ...row, shot });
      }
    }
    assertNoBrowserErrors(errors);
    await writeFile(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
    const problems = report.filter((row) => row.overflow > 1);
    console.log(JSON.stringify({ ok: problems.length === 0, total: report.length, problems }, null, 2));
    if (problems.length) process.exitCode = 1;
  } finally {
    await lab.stop();
    preview.stop();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
