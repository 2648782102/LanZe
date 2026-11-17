import { spawn } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { verifyPoetryCorpus } from "./verify-poetry-corpus.mjs";

const port = Number(process.env.SMOKE_PORT || 4179);
const origin = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
  { stdio: "ignore" },
);

const stopServer = () => {
  if (!server.killed) server.kill("SIGTERM");
};
process.on("exit", stopServer);

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
    } catch {
      await delay(250);
    }
  }
  throw new Error(`Preview server did not become ready at ${origin}`);
}

async function expectOk(path) {
  const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(3000) });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
}

function localAssetPaths(html) {
  return [...new Set(
    // 构建改成绝对 base（history 路由要求），因此同时接受 / 与 ./ 前缀。
    [...html.matchAll(/(?:src|href)="((?:\.\/|\/)[^"?#]+)"/g)]
      .map((match) => match[1])
      .filter((asset) => /^(\.\/|\/)assets\//.test(asset) || /^(\.\/|\/)favicon\.svg$/.test(asset)),
  )];
}

try {
  await waitForServer();
  const html = await readFile("dist/index.html", "utf8");
  const localAssets = localAssetPaths(html);
  if (localAssets.length === 0) throw new Error("No local build assets found in dist/index.html");

  const forbiddenCdnHosts = ["cdn.staticfile.org", "cdn.bootcss.com"];
  for (const host of forbiddenCdnHosts) {
    if (html.includes(host)) throw new Error(`dist/index.html still references ${host}`);
  }

  // 元数据回归检查：社交抓取器只认绝对 URL；SPA 兜底页不该被搜索引擎当成内容页收录。
  for (const meta of ['og:image', 'twitter:image']) {
    const pattern = new RegExp(`<meta (?:property|name)="${meta}" content="https?://[^"]+">`);
    if (!pattern.test(html)) throw new Error(`dist/index.html 的 ${meta} 必须是绝对 URL`);
  }
  const notFoundHtml = await readFile("dist/404.html", "utf8");
  if (!/<meta name="robots" content="noindex/.test(notFoundHtml)) {
    throw new Error("dist/404.html 缺少 noindex，SPA 兜底页会被搜索引擎收录");
  }
  if (/<link rel="canonical"/.test(notFoundHtml)) {
    throw new Error("dist/404.html 不应带 canonical，未知路径不该指回首页");
  }

  const builtJs = (await readdir("dist/assets")).filter((name) => name.endsWith(".js"));
  const builtJsText = await Promise.all(
    builtJs.map((name) => readFile(`dist/assets/${name}`, "utf8")),
  );
  const { POETRY_SOURCE_URL: poetrySourceUrl } = await import("../src/config/poetrySource.constants.js");
  if (!builtJsText.some((text) => text.includes(poetrySourceUrl))) {
    throw new Error("Built JavaScript is missing the configurable poetry source endpoint");
  }


  const manifest = await (await fetch(`${origin}/data/poetry/manifest.json`)).json();
  const corpusAssets = ["data/poetry/manifest.json", "data/poetry/SHA256SUMS.txt", "data/poetry/LICENSE.chinese-poetry.txt"];
  if (!Array.isArray(manifest.collections) || manifest.collections.length < 16) {
    throw new Error("Offline poetry manifest is missing collections");
  }
  for (const entry of manifest.collections) corpusAssets.push(`data/poetry/${entry.id}.json`);
  for (const asset of corpusAssets) await expectOk(`/${asset}`);
  await verifyPoetryCorpus();

  const cssFiles = (await readdir("dist/assets")).filter((name) => name.endsWith(".css"));
  const cssText = await Promise.all(
    cssFiles.map((name) => readFile(`dist/assets/${name}`, "utf8")),
  );
  const fontAssets = [...new Set(
    cssText.flatMap((text) =>
      // 绝对 base 下字体是 /assets/xxx.woff2；旧版是 ./xxx.woff2。
      [...text.matchAll(/url\((?:\.\/|\/assets\/)([^)'"?#]+\.(?:woff2?|ttf|eot|svg))\)/g)]
        .map((match) => `./assets/${match[1]}`),
    ),
  )];
  const uniqueAssets = [...new Set([...localAssets, ...fontAssets])];
  if (fontAssets.length === 0) throw new Error("No local font assets found in built CSS");

  await expectOk("/");
  for (const asset of uniqueAssets) await expectOk(`/${asset.replace(/^\.\//, "").replace(/^\//, "")}`);
  console.log(`Smoke passed: ${uniqueAssets.length + corpusAssets.length} local assets returned 200.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  stopServer();
}
