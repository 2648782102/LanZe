import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
for (const w of [320, 390, 1280]) {
  const page = await browser.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 });
  await page.goto("http://127.0.0.1:4399/#/explore", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.click(".poem-row__save");
  await page.waitForTimeout(350);
  console.log(w, JSON.stringify(await page.evaluate(() => {
    const n = document.querySelector('.notice');
    const dock = document.querySelector('.mobile-dock');
    const b = n.getBoundingClientRect();
    const d = dock ? dock.getBoundingClientRect() : null;
    return { top: Math.round(b.top), bottom: Math.round(b.bottom), height: Math.round(b.height), dockTop: d ? Math.round(d.top) : null, covered: d ? b.bottom > d.top : false, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
  })));
  if (w === 390) await page.screenshot({ path: "/tmp/notice-m.png" });
  await page.close();
}
await browser.close();
