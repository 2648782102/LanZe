import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(root, "public", "media");
const sampleRate = 22050;
const seconds = 24;
const totalSamples = sampleRate * seconds;

const tracks = Object.freeze([
  {
    id: "qingshan",
    title: "空山 · 松风",
    artist: "兰泽声景",
    mood: "舒缓 · 五声音阶",
    notes: [0, 2, 4, 7, 9, 12, 9, 7, 4, 2, 0, -3],
    root: 146.83,
    wave: 0.26,
    bell: 0.2,
    air: 0.05,
  },
  {
    id: "yuese",
    title: "月色 · 瓷盏",
    artist: "兰泽声景",
    mood: "清冷 · 泛音",
    notes: [-5, 0, 7, 12, 7, 2, 9, 14, 9, 4, 7, 0],
    root: 174.61,
    wave: 0.22,
    bell: 0.3,
    air: 0.035,
  },
  {
    id: "wanzhou",
    title: "晚舟 · 水纹",
    artist: "兰泽声景",
    mood: "流动 · 低频",
    notes: [0, 4, 7, 11, 9, 4, 2, -1, 0, 5, 7, 2],
    root: 130.81,
    wave: 0.3,
    bell: 0.15,
    air: 0.065,
  },
]);

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

const seededNoise = (index) => {
  let state = (index * 1664525 + 1013904223) >>> 0;
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 0xffffffff * 2 - 1;
};

const envelope = (time, start, duration) => {
  const local = (time - start) / duration;
  if (local < 0 || local > 1) return 0;
  const attack = Math.min(1, local / 0.04);
  const decay = Math.exp(-local * 3.2);
  return attack * decay * Math.min(1, (1 - local) / 0.08);
};

const noteFrequency = (root, semitone) => root * 2 ** (semitone / 12);

const renderTrack = (track) => {
  const samples = Buffer.alloc(totalSamples * 2);
  const step = 1.5;
  for (let sampleIndex = 0; sampleIndex < totalSamples; sampleIndex += 1) {
    const time = sampleIndex / sampleRate;
    const noteIndex = Math.floor(time / step) % track.notes.length;
    const frequency = noteFrequency(track.root, track.notes[noteIndex]);
    const phase = 2 * Math.PI * frequency * time;
    const bellPhase = 2 * Math.PI * frequency * 2.01 * time;
    const localTime = time % step;
    const noteGain = envelope(localTime, 0, step);
    const breathing = 0.78 + 0.22 * Math.sin(2 * Math.PI * 0.055 * time);
    const bed =
      Math.sin(phase * 0.5) * 0.1 +
      Math.sin(phase) * track.wave +
      Math.sin(bellPhase) * track.bell * noteGain;
    const water =
      Math.sin(2 * Math.PI * 0.13 * time + Math.sin(time * 0.27) * 2) * track.air +
      seededNoise(sampleIndex) * track.air * 0.12;
    const fade = Math.min(1, time / 1.5) * Math.min(1, (seconds - time) / 2);
    const amplitude = clamp((bed * noteGain + water) * breathing * fade * 0.72, -1, 1);
    samples.writeInt16LE(Math.round(amplitude * 26000), sampleIndex * 2);
  }
  return samples;
};

const writeWav = async (filename, samples) => {
  const header = Buffer.alloc(44);
  const dataSize = samples.length;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  const output = Buffer.concat([header, samples]);
  await writeFile(join(outputDirectory, filename), output);
  return output;
};

const cover = (track) => `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" role="img" aria-labelledby="title desc">
  <title id="title">${track.title} · 兰泽声景封面</title>
  <desc id="desc">青瓷色圆形、水纹与琴弦组成的仓库自制抽象封面。</desc>
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f3f5f0" /><stop offset="1" stop-color="#dce9e2" />
    </linearGradient>
    <linearGradient id="ink" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#517a70" /><stop offset="1" stop-color="#102827" />
    </linearGradient>
  </defs>
  <rect width="320" height="320" fill="url(#paper)" />
  <circle cx="160" cy="160" r="122" fill="url(#ink)" opacity="0.94" />
  <circle cx="160" cy="160" r="106" fill="none" stroke="#fbfcf9" stroke-opacity="0.32" stroke-width="2" />
  <g fill="none" stroke="#fbfcf9" stroke-linecap="round" opacity="0.72">
    <path d="M64 132 Q110 112 160 132 T256 132" />
    <path d="M64 160 Q110 140 160 160 T256 160" />
    <path d="M64 188 Q110 168 160 188 T256 188" />
  </g>
  <circle cx="160" cy="160" r="34" fill="#fbfcf9" opacity="0.92" />
  <circle cx="160" cy="160" r="24" fill="none" stroke="#a88245" stroke-width="1.5" />
  <text x="160" y="170" text-anchor="middle" font-family="serif" font-size="24" fill="#162c2b">兰泽</text>
  <text x="160" y="272" text-anchor="middle" font-family="serif" font-size="13" letter-spacing="3" fill="#355b4b">${track.mood}</text>
</svg>\n`;

const main = async () => {
  await mkdir(outputDirectory, { recursive: true });
  const assets = [];
  const checksums = [];
  for (const track of tracks) {
    const audioFilename = `lanze-${track.id}.wav`;
    const coverFilename = `lanze-${track.id}-cover.svg`;
    const audio = await writeWav(audioFilename, renderTrack(track));
    const coverSvg = cover(track);
    await writeFile(join(outputDirectory, coverFilename), coverSvg);
    const hash = (content, filename) =>
      `${createHash("sha256").update(content).digest("hex")}  media/${filename}`;
    checksums.push(hash(audio, audioFilename), hash(Buffer.from(coverSvg), coverFilename));
    assets.push({
      id: track.id,
      name: track.title,
      artist: track.artist,
      mood: track.mood,
      url: `./media/${audioFilename}`,
      cover: `./media/${coverFilename}`,
      duration: seconds,
    });
  }
  await writeFile(
    join(outputDirectory, "audio-manifest.json"),
    `${JSON.stringify({
      generator: "scripts/generate-audio-library.mjs",
      format: "PCM WAV, 16-bit mono, 22050 Hz",
      seconds,
      rights: "Synthesized from original code in this repository; no third-party recording is included.",
      tracks: assets,
    }, null, 2)}\n`,
  );
  await writeFile(join(outputDirectory, "SHA256SUMS.txt"), `${checksums.join("\n")}\n`);
  process.stdout.write(`Generated ${assets.length} local tracks (${seconds}s each) and cover art.\n`);
};

await main();
