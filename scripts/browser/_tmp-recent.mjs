import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.goto("http://127.0.0.1:4399/#/poem/demo-chunxiao", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.goto("http://127.0.0.1:4399/#/collection", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
console.log(JSON.stringify(await page.evaluate(() => ({
  recent: JSON.parse(localStorage.getItem('lanze_recent_poems') || '[]').map(p => p.title),
  stats: document.querySelector('.collection-tabs')?.innerText.replace(/\n/g, ' '),
  emptyVisible: Boolean(document.querySelector('.empty-state')),
}))));
// switch to recent tab
const tabs = await page.$$('.collection-tabs button');
await tabs[1].click();
await page.waitForTimeout(400);
console.log("recent tab:", JSON.stringify(await page.evaluate(() => ({
  text: document.querySelector('#collection-tab-panel')?.innerText.replace(/\n/g,' | ').slice(0, 80),
  rows: document.querySelectorAll('.poem-row').length,
}))));
await page.screenshot({ path: "/tmp/recent-tab.png" });
await browser.close();
