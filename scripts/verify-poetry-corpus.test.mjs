import assert from "node:assert/strict";
import test from "node:test";
import { readFile, writeFile } from "node:fs/promises";
import { verifyPoetryCorpus } from "./verify-poetry-corpus.mjs";

test("offline poetry corpus checksum list keeps files and counts aligned", async () => {
  const result = await verifyPoetryCorpus();
  assert.equal(result.collections, 16);
  assert.equal(result.total, 9328);
  assert.ok(result.upstream.startsWith("chinese-poetry/chinese-poetry@"));
});

test("offline poetry corpus verification rejects a changed checksum", async (context) => {
  const checksumFile = "public/data/poetry/SHA256SUMS.txt";
  const originalChecksums = await readFile(checksumFile);
  const tampered = originalChecksums.toString("utf8")
    .replace(/^[0-9a-f]{64}  tangshi-5\.json$/m, `${"0".repeat(64)}  tangshi-5.json`);
  context.after(async () => writeFile(checksumFile, originalChecksums));
  try {
    await writeFile(checksumFile, tampered);
    await assert.rejects(
      () => verifyPoetryCorpus(),
      /checksum does not match: tangshi-5\.json/,
    );
  } finally {
    await writeFile(checksumFile, originalChecksums);
  }
});
