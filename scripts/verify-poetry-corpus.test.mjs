import assert from "node:assert/strict";
import test from "node:test";
import { readFile, writeFile } from "node:fs/promises";
import { verifyPoetryCorpus } from "./verify-poetry-corpus.mjs";

const target = "public/data/poetry/tangshi-5.json";
const original = await readFile(target);

test("offline poetry corpus checksum list keeps files and counts aligned", async () => {
  const result = await verifyPoetryCorpus();
  assert.equal(result.collections, 16);
  assert.equal(result.total, 9328);
  assert.ok(result.upstream.startsWith("chinese-poetry/chinese-poetry@"));
});

test("offline poetry corpus verification rejects a changed collection", async (context) => {
  const payload = JSON.parse(original.toString("utf8"));
  payload[0].title = "校验用临时题名";
  await writeFile(target, `${JSON.stringify(payload)}\n`);
  context.after(async () => writeFile(target, original));
  await assert.rejects(
    () => verifyPoetryCorpus(),
    /checksum does not match: tangshi-5\.json|collection hash does not match: tangshi-5/,
  );
});
