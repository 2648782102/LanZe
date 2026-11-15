import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await page.goto("http://127.0.0.1:4399/#/explore", { waitUntil: "networkidle" });
await page.click(".mobile-filter-bar button");
await page.waitForTimeout(500);
console.log(JSON.stringify(await page.evaluate(() => {
  const r = document.querySelector('.filter-wall').getBoundingClientRect();
  return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), innerH: window.innerHeight, vv: Math.round(window.visualViewport.height), scrollY: window.scrollY, docH: document.documentElement.clientHeight, zoom: window.devicePixelRatio };
}), null, 2));
await browser.close();
