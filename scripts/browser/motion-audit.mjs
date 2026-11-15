#!/usr/bin/env node
/**
 * 动效审计：
 * 1) 样式里不允许再出现裸的 cubic-bezier / 毫秒时长，必须走 motion token；
 * 2) reduced-motion 下打开抽屉不加载 motion chunk、不启用弹簧；
 * 3) 正常模式下用到的 motion 是按需加载的独立 chunk，不进首屏。
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gotoStable, openBrowser, startPreview } from "./lab.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const srcDir = join(root, "src");
const port = Number(process.env.MOTION_PORT || 4381);

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (/\.(css|vue)$/.test(entry.name)) files.push(full);
  }
  return files;
};

// 允许出现裸值的地方：token 定义本身，以及 JS 里需要数值的缓动常量。
const ALLOW_BARE_CURVE = new Set(["styles/base.css"]);
const ALLOWED_MS = new Set(["var(--motion-fast)", "var(--motion-base)", "var(--motion-slow)", "var(--motion-cinematic)"]);

const auditTokens = async () => {
  const problems = [];
  for (const file of await walk(srcDir)) {
    const rel = relative(srcDir, file);
    const text = await readFile(file, "utf8");
    const style = file.endsWith(".vue")
      ? [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n")
      : text;
    if (!ALLOW_BARE_CURVE.has(rel) && /cubic-bezier\(/.test(style)) {
      problems.push(`${rel}: 样式里出现裸 cubic-bezier，应使用 --ease-out / --ease-standard / --ease-exit`);
    }
    for (const match of style.matchAll(/(?:transition|animation)[^;{}]*?([\d.]+)ms/g)) {
      // 0ms 是「无延迟」的默认值；reduced-motion 里的 0.01ms 是刻意写死的极短时长。
      if (Number(match[1]) === 0 || Number(match[1]) === 0.01) continue;
      problems.push(`${rel}: 动效时长写死为 ${match[1]}ms，应使用 --motion-* token`);
    }
  }
  return problems;
};

const auditRuntime = async () => {
  const preview = await startPreview({ port, root });
  const { browser, newPage, stop } = await openBrowser({ headless: true });
  const problems = [];
  const results = {};
  try {
    for (const mode of ["reduce", "no-preference"]) {
      const { page, context, errors } = await newPage({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
        reducedMotion: mode,
      });
      const scripts = [];
      page.on("request", (request) => {
        if (request.resourceType() === "script") scripts.push(request.url());
      });
      await gotoStable(page, `${preview.origin}/#/explore`, { settle: 500 });
      const base = scripts.length;
      await page.locator(".mobile-filter-bar button").click();
      await page.waitForTimeout(700);
      const loaded = scripts.slice(base).map((url) => url.split("/").pop());
      const spring = await page.evaluate(
        "document.querySelector('.filter-wall.is-open')?.classList.contains('is-spring-driven') ?? null",
      );
      results[mode] = { extraScripts: loaded, spring };

      if (mode === "reduce") {
        if (loaded.length) problems.push(`reduced-motion 下仍加载了脚本: ${loaded.join(", ")}`);
        if (spring) problems.push("reduced-motion 下仍启用了弹簧动画");
      } else {
        // 效果才是硬指标：弹簧类必须真的挂上，且首屏之外确实多取了脚本。
        if (!loaded.length) problems.push("正常模式下打开抽屉没有触发按需加载");
        if (!spring) problems.push("正常模式下抽屉未使用弹簧动画");
      }
      // 打开抽屉后不应出现控制台/网络错误
      if (errors.length) problems.push(...errors);
      await context.close();
    }
  } finally {
    await stop();
    preview.stop();
  }
  return { problems, results };
};

const main = async () => {
  const tokenProblems = await auditTokens();
  const runtime = await auditRuntime();
  const problems = [...tokenProblems, ...runtime.problems];
  console.log(JSON.stringify({ ok: problems.length === 0, problems, runtime: runtime.results }, null, 2));
  if (problems.length) process.exitCode = 1;
};

await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
