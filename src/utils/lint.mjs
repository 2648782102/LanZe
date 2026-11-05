import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("../../", import.meta.url).pathname;
const sourceRoot = join(root, "src");
const forbiddenPatterns = [
  { pattern: /\$cookies\.(?!get|set|config|remove)/, message: "禁止直接使用 $cookies，请使用 useSession()" },
  { pattern: /localhost:5565/, message: "禁止硬编码失效后端地址", excludeSelf: true },
  { pattern: /lan-ze-user\.vercel\.app|lanze-node\.vercel\.app|memfiredb\.com/, message: "禁止硬编码失效服务地址", excludeSelf: true },
  { pattern: /\.\.\/\.\.\/node_modules\//, message: "禁止直接引用 node_modules 路径", excludeSelf: true },
];

const ownedFiles = new Set([
  "src/App.vue",
  "src/main.js",
  "src/apis/env.js",
  "src/apis/request.js",
  "src/apis/api/list.js",
  "src/apis/api/login.js",
  "src/function/supabase.js",
  "src/pages/Home.vue",
  "src/pages/ZhaiLu/ZhaiLu.vue",
  "src/pages/login/login.vue",
  "src/pages/Personal/son/dataMessage.vue",
  "src/pages/Personal/son/publishPoem.vue",
  "src/pages/Personal/SheZhi.vue",
  "src/pages/Personal/Personal.vue",
  "src/pages/Personal/PersonalZiLiao.vue",
  "src/pages/Personal/SampleReels.vue",
  "src/pages/WenKu/GuShi.vue",
  "src/pages/Audio.vue",
  "src/components/GuShiDiv.vue",
  "src/components/UserLi.vue",
  "src/pages/ChaLou/JingXuan.vue",
  "src/pages/WenKu/GuShi/GuShiHuaJianJi.vue",
  "src/pages/searchUl.vue",
  "src/pages/details.vue",
  "src/router/index.js",
]);

const walk = (directory) =>
  readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory()
      ? walk(path)
      : /\.(js|mjs|vue)$/.test(path)
        ? [path]
        : [];
  });

const issues = [];
for (const file of walk(sourceRoot)) {
  const relativePath = relative(root, file);
  const isOwned = ownedFiles.has(relativePath) || /^src\/(config|data|services|utils|composables)\//.test(relativePath);
  if (!isOwned) continue;
  const text = readFileSync(file, "utf8");
  text.split("\n").forEach((line, index) => {
    for (const { pattern, message, excludeSelf } of forbiddenPatterns) {
      if (excludeSelf && relativePath === "src/utils/lint.mjs") continue;
      if (pattern.test(line)) issues.push(`${relativePath}:${index + 1} ${message}`);
    }
  });
}

if (issues.length) {
  process.stderr.write(`Lint found ${issues.length} issue(s):\n`);
  for (const issue of issues) process.stderr.write(`- ${issue}\n`);
  process.exit(1);
}

process.stdout.write("Lint passed: no forbidden runtime dependencies found.\n");
