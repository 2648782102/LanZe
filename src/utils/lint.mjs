import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("../../", import.meta.url).pathname;
const sourceRoot = join(root, "src");
const forbiddenPatterns = [
  { pattern: /\$cookies\.(?!get|set|config|remove)/, message: "禁止直接使用 $cookies，请使用 useSession()" },
  { pattern: /localhost:5565/, message: "禁止硬编码失效后端地址", excludeSelf: true },
  {
    pattern: /lan-ze-user\.vercel\.app|lanze-node\.vercel\.app|memfiredb\.com/,
    message: "禁止硬编码失效服务地址",
    excludeSelf: true,
  },
  { pattern: /\.\.\/\.\.\/node_modules\//, message: "禁止直接引用 node_modules 路径", excludeSelf: true },
  {
    pattern: /from\s+["'](?:element-plus|bootstrap|@fortawesome|aplayer|vue3-puzzle-vcode)/,
    message: "界面应使用仓库自有组件与样式，不重新引入旧 UI 套件",
    excludeSelf: true,
  },
  {
    pattern: /music\.163\.com|music\.126\.net/,
    message: "禁止在默认播放器中硬编码第三方音乐/封面外链",
    excludeSelf: true,
  },
];

const isOwned = (relativePath) =>
  relativePath === "src/App.vue" ||
  relativePath === "src/main.js" ||
  relativePath === "src/router/index.js" ||
  /^src\/(apis|components|composables|config|data|function|services|utils|views)\//.test(relativePath);

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
  if (!isOwned(relativePath)) continue;
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

process.stdout.write("Lint passed: independent UI layer and safe runtime references.\n");
