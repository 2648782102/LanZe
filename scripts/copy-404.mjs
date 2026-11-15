#!/usr/bin/env node
/*
 * GitHub Pages 是纯静态托管：直接访问 /poem/xxx 这类深链会 404。
 * 把构建产物 index.html 复制成 404.html，Pages 会用它兜底，前端路由
 * 再根据 location.pathname 渲染正确页面。
 */
import { copyFile } from "node:fs/promises";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
await copyFile(join(dist, "index.html"), join(dist, "404.html"));
console.log("Wrote dist/404.html");
