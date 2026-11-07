import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const poetryDir = join(dirname(fileURLToPath(import.meta.url)), "../public/data/poetry");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const read = async (name) => {
  const bytes = await readFile(join(poetryDir, name));
  return { bytes, digest: sha256(bytes) };
};

export const verifyPoetryCorpus = async () => {
  const manifestFile = await read("manifest.json");
  const manifest = JSON.parse(manifestFile.bytes.toString("utf8"));
  if (!Array.isArray(manifest.collections) || manifest.collections.length !== 16) {
    throw new Error("Expected 16 offline poetry collections");
  }
  if (!String(manifest.upstream).includes("chinese-poetry/chinese-poetry@")) {
    throw new Error("Offline poetry corpus is missing a pinned upstream commit");
  }
  if (manifest.license?.file !== "LICENSE.chinese-poetry.txt") {
    throw new Error("Offline poetry manifest is missing its license file entry");
  }

  const checks = new Map(
    (await read("SHA256SUMS.txt")).bytes
      .toString("utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [digest, name] = line.split(/\s+/);
        return [name, digest];
      }),
  );
  const expectedNames = [
    "manifest.json",
    "LICENSE.chinese-poetry.txt",
    ...manifest.collections.map((entry) => `${entry.id}.json`),
  ];
  if (checks.size !== expectedNames.length || expectedNames.some((name) => !checks.has(name))) {
    throw new Error("Offline poetry checksum list does not cover the expected files");
  }
  for (const name of expectedNames) {
    const file = name === "manifest.json" ? manifestFile : await read(name);
    if (checks.get(name) !== file.digest) {
      throw new Error(`Offline poetry checksum does not match: ${name}`);
    }
  }
  if (checks.get("LICENSE.chinese-poetry.txt") !== manifest.license.sha256) {
    throw new Error("Offline poetry license hash does not match the manifest");
  }

  let total = 0;
  for (const entry of manifest.collections) {
    const file = await read(`${entry.id}.json`);
    const poems = JSON.parse(file.bytes.toString("utf8"));
    if (file.digest !== entry.sha256) {
      throw new Error(`Offline poetry collection hash does not match: ${entry.id}`);
    }
    if (!Array.isArray(poems) || poems.length !== entry.count) {
      throw new Error(`Offline poetry collection count does not match: ${entry.id}`);
    }
    total += poems.length;
  }
  if (total !== 9328) {
    throw new Error(`Offline poetry corpus is unexpectedly sized: ${total}`);
  }
  return { collections: manifest.collections.length, total, upstream: manifest.upstream };
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = await verifyPoetryCorpus();
  process.stdout.write(
    `Poetry corpus verified: ${result.collections} collections, ${result.total} poems.\n`,
  );
}
