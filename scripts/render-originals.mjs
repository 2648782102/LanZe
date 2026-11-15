#!/usr/bin/env node
/*
 * 把 src/assets/originals/ 下的原创 SVG 渲染成项目实际使用的位图尺寸。
 * 这些图由本仓库绘制，不含第三方素材，因此可明确以 MIT 覆盖。
 */
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const chromePath = process.env.CHROME_PATH
  || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const jobs = [
  { src: "src/assets/originals/moon-blossom.svg", out: "src/assets/exhibit/poem-768.jpg", width: 672, height: 768, type: "jpeg", quality: 78 },
  { src: "src/assets/originals/night-study.svg", out: "src/assets/exhibit/auth-960.jpg", width: 960, height: 600, type: "jpeg", quality: 78 },
];

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
try {
  for (const job of jobs) {
    const svg = await readFile(join(root, job.src), "utf8");
    const page = await browser.newPage({
      viewport: { width: job.width, height: job.height },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<!doctype html><html><body style="margin:0">${svg}</body></html>`,
      { waitUntil: "load" },
    );
    const target = join(root, job.out);
    await mkdir(dirname(target), { recursive: true });
    await page.screenshot({ path: target, type: job.type, quality: job.quality, clip: { x: 0, y: 0, width: job.width, height: job.height } });
    await page.close();
    console.log(`rendered ${job.out} (${job.width}x${job.height})`);
  }
} finally {
  await browser.close();
}
