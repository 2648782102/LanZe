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
  .replace(/^\s*<link rel="canonical"[^>]*>\n/gm, "")
  .replace("</head>", '  <meta name="robots" content="noindex, follow">\n</head>');

await writeFile(join(dist, "404.html"), withNoindex);
console.log("Wrote dist/404.html (noindex)");
