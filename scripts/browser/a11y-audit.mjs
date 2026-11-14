import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { gotoStable, openBrowser, startPreview } from "./lab.mjs";

const port = Number(process.env.A11Y_PORT || 4371);
const routes = ["/#/", "/#/explore", "/#/collection", "/#/compose", "/#/login"];
const viewports = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
const SEVERITY_ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };

const main = async () => {
  const axeSource = await readFile(join(process.cwd(), "node_modules/axe-core/axe.min.js"), "utf8");
  const preview = await startPreview({ port });
  const lab = await openBrowser({ headless: true });
  const { page } = await lab.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const findings = [];

  try {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      for (const route of routes) {
        await gotoStable(page, `${preview.origin}${route}`);
        await page.addScriptTag({ content: axeSource });
        const result = await page.evaluate(async () => {
          const run = await window.axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
            resultTypes: ["violations"],
          });
          return run.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            help: violation.help,
            nodes: violation.nodes.slice(0, 3).map((node) => ({
              target: node.target.join(" "),
              summary: (node.failureSummary || "").split("\n").slice(0, 2).join(" "),
            })),
            count: violation.nodes.length,
          }));
        });
        for (const violation of result) {
          findings.push({ viewport: viewport.name, route, ...violation });
        }
      }
    }
  } finally {
    await lab.stop();
    preview.stop();
  }

  findings.sort((a, b) => (SEVERITY_ORDER[a.impact] ?? 9) - (SEVERITY_ORDER[b.impact] ?? 9));
  if (!findings.length) {
    console.log(JSON.stringify({ ok: true, violations: 0 }, null, 2));
    return;
  }
  console.log(JSON.stringify({ ok: false, violations: findings.length, findings }, null, 2));
  process.exitCode = 1;
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
