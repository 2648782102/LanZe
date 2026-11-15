import { gotoStable, openBrowser, startPreview } from "./lab.mjs";

const port = Number(process.env.TOUCH_PORT || 4393);
const MIN = Number(process.env.TOUCH_MIN || 40);
// Linux headless rounds layout edges down by a fraction of a pixel; keep a
// tolerance so a 40px target does not fail at 39.99.
const TOLERANCE = Number(process.env.TOUCH_TOLERANCE || 0.6);
const routes = ["/#/", "/#/explore", "/#/collection", "/#/compose", "/#/login", "/#/poem/demo-chunxiao"];

const main = async () => {
  const preview = await startPreview({ port });
  const lab = await openBrowser({ headless: true });
  const { page } = await lab.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const problems = [];
  try {
    for (const route of routes) {
      await gotoStable(page, `${preview.origin}${route}`);
      const rows = await page.evaluate(([min, tolerance]) => {
        const found = [];
        for (const node of document.querySelectorAll("button, a[href], input, summary, [role=button]")) {
          const box = node.getBoundingClientRect();
          if (!box.width || !box.height) continue;
          const style = getComputedStyle(node);
          if (style.visibility === "hidden" || style.display === "none") continue;
          if (box.height < min - tolerance || box.width < min - tolerance) {
            found.push({
              label: `${node.tagName.toLowerCase()}.${[...node.classList].slice(0, 2).join(".")}`,
              text: (node.textContent || "").trim().slice(0, 12),
              size: `${Math.round(box.width)}x${Math.round(box.height)}`,
            });
          }
        }
        const seen = new Set();
        return found.filter((item) => {
          const key = item.label + item.size;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }, [MIN, TOLERANCE]);
      if (rows.length) problems.push({ route, rows });
    }
  } finally {
    await lab.stop();
    preview.stop();
  }
  console.log(JSON.stringify({ minTarget: MIN, ok: problems.length === 0, problems }, null, 2));
  if (problems.length) process.exitCode = 1;
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
