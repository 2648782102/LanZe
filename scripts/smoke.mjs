import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

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

try {
  await waitForServer();
  const html = await readFile("dist/index.html", "utf8");
  const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)]
    .map((match) => `/${match[1].replace(/^\.\//, "")}`);
  const uniqueAssets = [...new Set(assets)];
  if (uniqueAssets.length === 0) throw new Error("No local build assets found in dist/index.html");

  await expectOk("/");
  for (const asset of uniqueAssets) await expectOk(asset);
  console.log(`Smoke passed: ${uniqueAssets.length} local assets returned 200.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  stopServer();
}
