import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const upstreamRepository = "chinese-poetry/chinese-poetry";
const upstreamRef = process.env.POETRY_CORPUS_REF || "b8594f81a89752241442f2ce267d6f66f96704ee";
const upstream = `${upstreamRepository}@${upstreamRef}`;
const raw = (path) =>
  `https://raw.githubusercontent.com/${upstreamRepository}/${upstreamRef}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
const sources = [
  { path: "五代诗词/huajianji/huajianji-1-juan.json", kind: "huajianji" },
  { path: "五代诗词/huajianji/huajianji-2-juan.json", kind: "huajianji" },
  { path: "五代诗词/huajianji/huajianji-3-juan.json", kind: "huajianji" },
  { path: "五代诗词/nantang/poetrys.json", kind: "nantang" },
  { path: "元曲/yuanqu.json", kind: "yuanqu", limit: 1500 },
  { path: "全唐诗/poet.tang.0.json", kind: "tangshi" },
  { path: "全唐诗/poet.tang.1000.json", kind: "tangshi" },
  { path: "宋词/ci.song.0.json", kind: "songci" },
  { path: "宋词/ci.song.1000.json", kind: "songci" },
  { path: "宋词/ci.song.2000.json", kind: "songci" },
  { path: "宋词/ci.song.3000.json", kind: "songci" },
  { path: "宋词/ci.song.4000.json", kind: "songci" },
  { path: "楚辞/chuci.json", kind: "chuci" },
  { path: "诗经/shijing.json", kind: "shijing" },
  { path: "曹操诗集/caocao.json", kind: "caocao" },
  { path: "纳兰性德/纳兰性德诗集.json", kind: "nalan" },
];

const fetchJson = async (path) => {
  const { stdout } = await execFileAsync("curl", ["-fsSL", raw(path)], {
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(stdout);
};

const pickText = (...values) =>
  values.find((value) => typeof value === "string" && value.trim())?.trim() || "";

const lines = (value) =>
  (Array.isArray(value) ? value : typeof value === "string" ? [value] : [])
    .map((line) => String(line || "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

const maybeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeTang = (item, index) => ({
  id: `tangshi-${index}`,
  title: pickText(item.title, `唐诗残卷 ${index + 1}`),
  author: pickText(item.author, "佚名"),
  paragraphs: lines(item.paragraphs).slice(0, 32),
  dynasty: "唐",
  genre: "唐诗",
  collection: "全唐诗",
  source: "全唐诗",
  note: "全唐诗语料，原文为繁体；引用前请核对底本与简化字。",
});

const normalizeSongCi = (item, index) => ({
  id: `songci-${index}`,
  title: pickText(item.rhythmic, `宋词残卷 ${index + 1}`),
  author: pickText(item.author, "佚名"),
  paragraphs: lines(item.paragraphs).slice(0, 24),
  dynasty: "宋",
  genre: "宋词",
  collection: "全宋词",
  source: "全宋词",
  note: "全宋词语料，以词牌为题；引用前请核对底本。",
});

const normalizeShijing = (item, index) => ({
  id: `shijing-${index}`,
  title: pickText(item.title, `诗经 ${index + 1}`),
  author: "佚名",
  paragraphs: lines(item.content).slice(0, 24),
  dynasty: "先秦",
  genre: "诗经",
  collection: pickText(item.chapter, item.section, "诗经"),
  source: "诗经",
  note: "《诗经》篇章；分类来自上游 JSON 的 chapter / section 字段。",
});

const normalizeChuci = (item, index) => ({
  id: `chuci-${index}`,
  title: pickText(item.title, item.section, `楚辞 ${index + 1}`),
  author: pickText(item.author, "屈原等"),
  paragraphs: lines(item.content).slice(0, 28),
  dynasty: "先秦",
  genre: "楚辞",
  collection: pickText(item.section, "楚辞"),
  source: "楚辞",
  note: "《楚辞》长篇按上游分卷截取展示段落，完整文本请核对底本。",
});

const normalizeYuanqu = (item, index) => ({
  id: `yuanqu-${index}`,
  title: pickText(item.title, `元曲 ${index + 1}`),
  author: pickText(item.author, "佚名"),
  paragraphs: lines(item.paragraphs).slice(0, 18),
  dynasty: "元",
  genre: "元曲",
  collection: "元曲",
  source: "元曲",
  note: "元曲语料；题名与断句来自上游 JSON。",
});

const normalizeCaocao = (item, index) => ({
  id: `caocao-${index}`,
  title: pickText(item.title, `曹操诗集 ${index + 1}`),
  author: "曹操",
  paragraphs: lines(item.paragraphs).slice(0, 28),
  dynasty: "汉",
  genre: "建安诗",
  collection: "曹操诗集",
  source: "曹操诗集",
  note: "建安诗语料；引用前请核对底本。",
});

const normalizeNalan = (item, index) => ({
  id: `nalan-${index}`,
  title: pickText(item.title, `纳兰词 ${index + 1}`),
  author: pickText(item.author, "纳兰性德"),
  paragraphs: lines(item.para || item.paragraphs).slice(0, 20),
  dynasty: "清",
  genre: "清词",
  collection: "纳兰性德诗集",
  source: "纳兰性德诗集",
  note: "纳兰性德词作语料；引用前请核对底本。",
});

const normalizeHuajianji = (item, index) => ({
  id: `huajianji-${index}`,
  title: pickText(item.title, item.rhythmic, `花间集 ${index + 1}`),
  author: pickText(item.author, "佚名"),
  paragraphs: lines(item.paragraphs || item.content || item.para).slice(0, 20),
  dynasty: "五代",
  genre: "花间词",
  collection: "花间集",
  source: "花间集",
  note: "《花间集》分卷语料；题名来自上游字段，引用前请核对底本。",
});

const normalizeNantang = (item, index) => ({
  id: `nantang-${index}`,
  title: pickText(item.title, item.rhythmic, `南唐词 ${index + 1}`),
  author: pickText(item.author, "佚名"),
  paragraphs: lines(item.paragraphs || item.content || item.para).slice(0, 20),
  dynasty: "五代",
  genre: "南唐词",
  collection: "南唐词",
  source: "南唐词",
  note: "南唐词语料；引用前请核对底本。",
});

const normalizers = {
  tangshi: normalizeTang,
  songci: normalizeSongCi,
  shijing: normalizeShijing,
  chuci: normalizeChuci,
  yuanqu: normalizeYuanqu,
  caocao: normalizeCaocao,
  nalan: normalizeNalan,
  huajianji: normalizeHuajianji,
  nantang: normalizeNantang,
};

const flatten = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) {
    if (payload.content.every((group) => Array.isArray(group?.content))) {
      return payload.content.flatMap((group) =>
        (group.content || []).map((item) => ({
          ...item,
          title: item.chapter || item.subchapter || item.title,
          collection: group.type || payload.title,
        })),
      );
    }
    return payload.content;
  }
  return [];
};

const readCached = async (path) => {
  const cachePath = join("/tmp/lanze-poetry-cache", path.replaceAll("/", "_"));
  try {
    return JSON.parse(await readFile(cachePath, "utf8"));
  } catch {
    const payload = await fetchJson(path);
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(cachePath, JSON.stringify(payload));
    return payload;
  }
};

const main = async () => {
  const collections = [];
  for (const source of sources) {
    const payload = await readCached(source.path);
    const items = flatten(payload)
      .slice(0, maybeNumber(source.limit) ?? Infinity)
      .map((item, index) => normalizers[source.kind](item, `${collections.length}-${index}`))
      .filter((item) => item.title && item.paragraphs.length);
    collections.push({
      id: `${source.kind}-${collections.length}`,
      path: source.path,
      items,
    });
  }
  const outputDir = "public/data/poetry";
  await mkdir(outputDir, { recursive: true });
  const licenseName = "LICENSE.chinese-poetry.txt";
  const licenseBytes = (await execFileAsync("curl", ["-fsSL", raw("LICENSE")], {
    maxBuffer: 1024 * 1024,
    encoding: "buffer",
  })).stdout;
  await writeFile(`${outputDir}/${licenseName}`, licenseBytes);
  const files = new Map(
    await Promise.all(
      collections.map(async ({ id, items }) => {
        const name = `${id}.json`;
        const bytes = `${JSON.stringify(items)}\n`;
        await writeFile(`${outputDir}/${name}`, bytes);
        return [id, { name, sha256: sha256(bytes), count: items.length }];
      }),
    ),
  );
  const manifest = {
    generatedAt: new Date().toISOString(),
    upstream: `${upstreamRepository}@${upstreamRef}`,
    license: {
      name: "MIT",
      file: licenseName,
      sha256: sha256(licenseBytes),
      note: "See docs/THIRD_PARTY_ASSETS.md for reuse and attribution notes.",
    },
    collections: collections.map(({ id, path, items }) => ({
      id,
      path,
      file: files.get(id).name,
      count: items.length,
      sha256: files.get(id).sha256,
      genres: [...new Set(items.map((item) => item.genre))],
      dynasties: [...new Set(items.map((item) => item.dynasty))],
    })),
  };
  const manifestBytes = `${JSON.stringify(manifest)}\n`;
  await writeFile(`${outputDir}/manifest.json`, manifestBytes);
  const checksums = [
    ...collections.map(({ id }) => `${files.get(id).sha256}  ${files.get(id).name}`),
    `${sha256(licenseBytes)}  ${licenseName}`,
    `${sha256(manifestBytes)}  manifest.json`,
  ];
  await writeFile(`${outputDir}/SHA256SUMS.txt`, `${checksums.join("\n")}\n`);
};

await main();
