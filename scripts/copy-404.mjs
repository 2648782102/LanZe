#!/usr/bin/env node
/*
 * GitHub Pages 是纯静态托管：直接访问 /poem/xxx 这类深链会 404。
 * 把构建产物 index.html 复制成 404.html，Pages 会用它兜底，前端路由
 * 再根据 location.pathname 渲染正确页面。
 *
 * 兜底页不是真实内容页：必须标注 noindex，否则搜索引擎会把同一个 SPA 外壳
 * 当成大量重复页面收录；canonical 也要移除，避免把未知路径指回首页。
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
const html = await readFile(join(dist, "index.html"), "utf8");

const withNoindex = html
  // 兜底页沿用首页标题会被当成重复页面，改成一个明确表示「这里没有这个地址」的标题
  .replace(/<title>[\s\S]*?<\/title>/, "<title>页面走失了 · 兰泽</title>")
  .replace(
    /<meta property="og:title" content="[^"]*">/,
    '<meta property="og:title" content="页面走失了 · 兰泽">',
  )
  .replace(/^\s*<link rel="canonical"[^>]*>\n/gm, "")
  .replace("</head>", '  <meta name="robots" content="noindex, follow">\n</head>');

await writeFile(join(dist, "404.html"), withNoindex);
console.log("Wrote dist/404.html (noindex)");
