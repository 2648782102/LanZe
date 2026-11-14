import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(root, "public", "media");
const sourceDirectory = process.env.AUDIO_SOURCE_DIR || "/tmp";
const sampleRate = 11025;
const seconds = 36;
const fadeSeconds = 2;

const tracks = Object.freeze([
  {
    id: "qingshan",
    name: "空山 · 松风",
    mood: "清远 · 古筝晨曲",
    artist: "Antti Luode",
    source: "Guzheng Morning (Antti Luode).mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Guzheng_Morning_(Antti_Luode).mp3",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    offsetSeconds: 20,
    filename: "lanze-qingshan.wav",
    cover: "lanze-qingshan-cover.svg",
  },
  {
    id: "yuese",
    name: "月色 · 瓷盏",
    mood: "疏淡 · 筝语",
    artist: "Antti Luode",
    source: "Senor Guzheng and the Happy Monks (Antti Luode).mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Senor_Guzheng_and_the_Happy_Monks_(Antti_Luode).mp3",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    offsetSeconds: 45,
    filename: "lanze-yuese.wav",
    cover: "lanze-yuese-cover.svg",
  },
  {
    id: "wanzhou",
    name: "晚舟 · 水纹",
    mood: "悠然 · 筝韵",
    artist: "Antti Luode",
    source: "My name is Zheng Zheng GuZheng (Antti Luode).mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:My_name_is_Zheng_Zheng_GuZheng_(Antti_Luode).mp3",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    offsetSeconds: 60,
    filename: "lanze-wanzhou.wav",
    cover: "lanze-wanzhou-cover.svg",
  },
]);

const localSource = (filename) => join(sourceDirectory, filename.replace(/\.mp3$/, ".mp3"));

const decodeSource = async (track) => {
  const input = localSource(track.source);
  const output = join(sourceDirectory, `${track.id}-decoded.wav`);
  await run("afconvert", [
    "-f", "WAVE",
    "-d", `LEI16@${sampleRate}`,
    "-c", "1",
    "--offset", String(Math.round(track.offsetSeconds * 44100)),
    input,
    output,
  ]);
  return readFile(output);
};

const renderClip = (source) => {
  const totalSamples = sampleRate * seconds;
  const dataSize = totalSamples * 2;
  const output = Buffer.alloc(44 + dataSize);
  source.copy(output, 0, 0, 44);
  output.write("RIFF", 0);
  output.writeUInt32LE(36 + dataSize, 4);
  output.write("WAVE", 8);
  output.write("fmt ", 12);
  output.writeUInt32LE(16, 16);
  output.writeUInt16LE(1, 20);
  output.writeUInt16LE(1, 22);
  output.writeUInt32LE(sampleRate, 24);
  output.writeUInt32LE(sampleRate * 2, 28);
  output.writeUInt16LE(2, 32);
  output.writeUInt16LE(16, 34);
  output.write("data", 36);
  output.writeUInt32LE(dataSize, 40);
  for (let index = 0; index < totalSamples; index += 1) {
    const time = index / sampleRate;
    const fade = Math.max(0, Math.min(1, time / fadeSeconds, (seconds - time) / fadeSeconds));
    const sample = source.readInt16LE(44 + index * 2);
    output.writeInt16LE(Math.round(sample * fade), 44 + index * 2);
  }
  return output;
};

const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

const main = async () => {
  await mkdir(outputDirectory, { recursive: true });
  const manifestTracks = [];
  const checksums = [];
  for (const track of tracks) {
    const source = await decodeSource(track);
    const audio = renderClip(source);
    const cover = await readFile(join(outputDirectory, track.cover));
    await writeFile(join(outputDirectory, track.filename), audio);
    manifestTracks.push({
      id: track.id,
      name: track.name,
      artist: track.artist,
      mood: track.mood,
      url: `./media/${track.filename}`,
      cover: `./media/${track.cover}`,
      duration: seconds,
      license: track.license,
      licenseUrl: track.licenseUrl,
      source: track.source,
      sourceUrl: track.sourceUrl,
      excerpt: `${track.offsetSeconds}s–${track.offsetSeconds + seconds}s`,
    });
    checksums.push(`${sha256(audio)}  media/${track.filename}`);
    checksums.push(`${sha256(cover)}  media/${track.cover}`);
  }
  const manifest = {
    generator: "scripts/import-audio-library.mjs",
    format: `PCM WAV, 16-bit mono, ${sampleRate} Hz`,
    seconds,
    rights: "Excerpts of CC BY 3.0 guzheng recordings by Antti Luode via Wikimedia Commons; attribution recorded per track.",
    tracks: manifestTracks,
  };
  await writeFile(join(outputDirectory, "audio-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(join(outputDirectory, "SHA256SUMS.txt"), `${checksums.join("\n")}\n`);
  await writeFile(
    join(outputDirectory, "AUDIO_CREDITS.md"),
    [
      "# 默认声景署名",
      "",
      "默认三段声景均节选自 Wikimedia Commons 上 Antti Luode 的古筝录音，按 CC BY 3.0 使用并裁切/降采样/加淡入淡出：",
      "",
      ...tracks.map((track) =>
        `- 《${track.name}》：节选 [${track.source}](${track.sourceUrl})，作者 Antti Luode，[CC BY 3.0](${track.licenseUrl})，${track.offsetSeconds}s–${track.offsetSeconds + seconds}s。`),
      "",
      "封面 SVG 为本项目原创，不含第三方美术素材。",
      "",
    ].join("\n"),
  );
  process.stdout.write(`Imported ${tracks.length} open-licensed audio excerpts (${seconds}s each).\n`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
