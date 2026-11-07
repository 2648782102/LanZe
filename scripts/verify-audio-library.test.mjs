import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { inspectWav, sha256, verifyAudioLibrary } from "./verify-audio-library.mjs";

const root = new URL("../", import.meta.url).pathname;
const media = `${root}public/media`;

test("audio manifest and checksums describe all local assets", async () => {
  const result = await verifyAudioLibrary();
  assert.equal(result.tracks, 3);
  assert.equal(result.checksums, 6);
});

test("WAV inspector rejects a changed header", async () => {
  const audio = await readFile(`${media}/lanze-qingshan.wav`);
  assert.equal(inspectWav(audio).seconds, 24);
  const changed = Buffer.from(audio);
  changed.writeUInt16LE(2, 22);
  assert.throws(() => inspectWav(changed), /16-bit mono PCM/);
});

test("SHA-256 helper is stable", () => {
  assert.equal(
    sha256(Buffer.from("lanze")),
    "1ed9e2c34175e217fda9b3c28fa011fd72714a319314f3bf9812b77f7dd8867e",
  );
});
