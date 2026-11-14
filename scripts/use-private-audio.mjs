import { spawn } from "node:child_process";
import { access, readdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const privateDirectory = join(root, "public", "media", "private");
const envFile = join(root, ".env.local.audio");
const supported = new Set([".mp3", ".m4a", ".aac", ".ogg", ".wav", ".flac"]);

const titleFromFilename = (filename) =>
  filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim() || "本地音轨";

const main = async () => {
  let filenames;
  try {
    filenames = (await readdir(privateDirectory))
      .filter((filename) => supported.has(extname(filename).toLowerCase()))
      .sort();
  } catch {
    console.error("未找到 public/media/private/。请先创建目录并放入你有权使用的音频文件。");
    process.exitCode = 1;
    return;
  }

  if (!filenames.length) {
    console.error("public/media/private/ 中没有受支持的音频文件。");
    process.exitCode = 1;
    return;
  }

  const tracks = filenames.map((filename, index) => ({
    id: `private-${index + 1}`,
    name: titleFromFilename(filename),
    artist: "本地私有音轨",
    mood: "仅本机使用",
    url: `./media/private/${encodeURIComponent(filename)}`,
  }));

  await writeFile(
    envFile,
    [
      "# 本机私有音轨配置；此文件已被 .gitignore 忽略，不会提交或部署。",
      "VITE_AUDIO_SOURCE=custom",
      `VITE_AUDIO_TRACKS=${JSON.stringify(tracks)}`,
      "",
    ].join("\n"),
  );

  console.log(`已载入 ${tracks.length} 条本地私有音轨，启动开发服务器……`);
  const child = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--mode", "local.audio"], {
    cwd: root,
    stdio: "inherit",
  });
  child.on("exit", (code) => { process.exitCode = code ?? 0; });
};

main();
