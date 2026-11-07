import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const mediaDirectory = join(root, "public", "media");

const readAsset = async (path) => readFile(join(mediaDirectory, path.replace(/^\.\/media\//, "")));

export const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

const readUint32 = (buffer, offset) => buffer.readUInt32LE(offset);
const readUint16 = (buffer, offset) => buffer.readUInt16LE(offset);

export const inspectWav = (buffer) => {
  if (buffer.length < 44 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("Audio asset is not a RIFF/WAVE file");
  }
  const channels = readUint16(buffer, 22);
  const sampleRate = readUint32(buffer, 24);
  const bitsPerSample = readUint16(buffer, 34);
  const dataSize = readUint32(buffer, 40);
  if (channels !== 1 || sampleRate !== 22050 || bitsPerSample !== 16 || dataSize + 44 !== buffer.length) {
    throw new Error("Audio asset must be 16-bit mono PCM at 22050 Hz with an intact header");
  }
  return { channels, sampleRate, bitsPerSample, seconds: dataSize / (sampleRate * channels * 2) };
};

export const verifyAudioLibrary = async () => {
  const manifest = JSON.parse(await readFile(join(mediaDirectory, "audio-manifest.json"), "utf8"));
  if (!Array.isArray(manifest.tracks) || manifest.tracks.length !== 3) {
    throw new Error("Audio manifest must describe exactly three local tracks");
  }
  const checksums = [];
  for (const track of manifest.tracks) {
    for (const key of ["id", "name", "artist", "mood", "url", "cover", "duration"]) {
      if (!track[key]) throw new Error(`Audio manifest track is missing ${key}`);
    }
    const audio = await readAsset(track.url);
    const cover = await readAsset(track.cover);
    const format = inspectWav(audio);
    if (Math.abs(format.seconds - track.duration) > 0.01) {
      throw new Error(`Audio duration mismatch for ${track.id}`);
    }
    if (!cover.toString("utf8").includes("<svg")) throw new Error(`Audio cover is not SVG for ${track.id}`);
    checksums.push(`${sha256(audio)}  ${track.url.replace(/^\.\//, "")}`);
    checksums.push(`${sha256(cover)}  ${track.cover.replace(/^\.\//, "")}`);
  }
  const expected = await readFile(join(mediaDirectory, "SHA256SUMS.txt"), "utf8");
  const actual = `${checksums.join("\n")}\n`;
  if (actual !== expected) throw new Error("Audio checksum list does not match generated assets");
  return { tracks: manifest.tracks.length, checksums: checksums.length };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = await verifyAudioLibrary();
    process.stdout.write(`Audio library verified: ${result.tracks} tracks, ${result.checksums} hashes.\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
