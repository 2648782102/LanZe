import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const escapeAttribute = (value) => String(value).replaceAll('"', "&quot;");

export const preloadRouteAssets = (root) => ({
  name: "lanze-preload-route-assets",
  apply: "build",
  async closeBundle() {
    const manifestPath = join(root, "dist", ".vite", "manifest.json");
    const indexPath = join(root, "dist", "index.html");
    let manifest;
    try {
      manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    } catch {
      return;
    }
    const route = Object.values(manifest).find((entry) =>
      /ReadView\.vue$/.test(entry.src || ""),
    );
    if (!route) return;
    const tags = [
      `<link rel="modulepreload" crossorigin href="./${escapeAttribute(route.file)}">`,
      ...(route.css || []).map((file) =>
        `<link rel="preload" as="style" crossorigin href="./${escapeAttribute(file)}">`,
      ),
    ];
    const html = await readFile(indexPath, "utf8");
    if (html.includes(route.file)) return;
    await writeFile(indexPath, html.replace("</head>", `  ${tags.join("\n  ")}\n</head>`));
  },
});
