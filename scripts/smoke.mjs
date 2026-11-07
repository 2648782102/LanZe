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
    [...html.matchAll(/(?:src|href)="(\.\/[^"?#]+)"/g)]
      .map((match) => match[1])
      .filter((asset) => asset.startsWith("./assets/") || asset === "./favicon.ico"),
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

  const builtJs = (await readdir("dist/assets")).filter((name) => name.endsWith(".js"));
  const builtJsText = await Promise.all(
    builtJs.map((name) => readFile(`dist/assets/${name}`, "utf8")),
  );
  const thirdPartyMediaHosts = ["music.163.com", "music.126.net", "p1.music.126.net", "p2.music.126.net"];
  for (const host of thirdPartyMediaHosts) {
    if (builtJsText.some((text) => text.includes(host))) {
      throw new Error(`Built JavaScript still references ${host}`);
    }
  }

  const { POETRY_SOURCE_URL: poetrySourceUrl } = await import("../src/config/poetrySource.constants.js");
  if (!builtJsText.some((text) => text.includes(poetrySourceUrl))) {
    throw new Error("Built JavaScript is missing the configurable poetry source endpoint");
  }

  const mediaAssets = ["media/lanze-demo.wav", "media/lanze-demo-cover.svg"];
  for (const asset of mediaAssets) await expectOk(`/${asset}`);

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
      [...text.matchAll(/url\(\.\/([^)'"?#]+\.(?:woff2?|ttf|eot|svg))\)/g)].map((match) => `./assets/${match[1]}`),
    ),
  )];
  const uniqueAssets = [...new Set([...localAssets, ...fontAssets])];
  if (fontAssets.length === 0) throw new Error("No local font assets found in built CSS");

  await expectOk("/");
  for (const asset of uniqueAssets) await expectOk(`/${asset.replace(/^\.\//, "")}`);
  console.log(`Smoke passed: ${uniqueAssets.length + mediaAssets.length + corpusAssets.length} local assets returned 200.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  stopServer();
}
