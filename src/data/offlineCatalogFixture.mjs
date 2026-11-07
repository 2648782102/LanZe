import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile("public/data/poetry/manifest.json", "utf8"));
const collections = new Map(
  await Promise.all(
    manifest.collections.map(async (entry) => [
      `${entry.id}.json`,
      JSON.parse(await readFile(`public/data/poetry/${entry.id}.json`, "utf8")),
    ]),
  ),
);

export const offlineCatalogFixture = async (url) => {
  const name = String(url).split("/").pop();
  const payload = name === "manifest.json" ? manifest : collections.get(name);
  return { ok: Boolean(payload), json: async () => payload };
};

export const offlineCatalogManifest = manifest;
