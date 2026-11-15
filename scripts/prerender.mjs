#!/usr/bin/env node
/*
 * 构建期预渲染：为每首诗生成独立的静态 HTML，让搜索引擎能直接读到
 * 标题、作者、正文与结构化数据（而不是一个空的 <div id="app">）。
 *
 * 范围取舍：只预渲染精校短章（22 首）+ 主要页面。9,350 篇全量预渲染
 * 会让构建时间和产物体积失控，其余诗目由 404.html 兜底后由前端渲染，
 * 仍可被访问，只是不进入站点地图。
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { curatedPoems } from "../src/data/poetryCatalog.js";

const dist = join(process.cwd(), "dist");
const template = await readFile(join(dist, "index.html"), "utf8");
const siteName = "兰泽";
// Pages 项目站点部署在 /<repo>/ 下，绝对路径必须带 base。
const base = (process.env.VITE_BASE || "/").replace(/\/?$/, "/");
const asset = (path) => `${base}${String(path).replace(/^\//, "")}`;

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const setMeta = (html, { title, description, path, image, jsonLd }) => {
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*">/,
      `<meta name="description" content="${escapeHtml(description)}">`,
    )
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeHtml(title)}">`)
    .replace(
      /<meta property="og:description" content="[^"]*">/,
      `<meta property="og:description" content="${escapeHtml(description)}">`,
    )
    .replace(
      /<link rel="icon"[^>]*>/,
      `<link rel="icon" type="image/svg+xml" href="${escapeHtml(asset("favicon.svg"))}">`,
    )
    .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${escapeHtml(asset(image))}">`);

  const head = [
    `<link rel="canonical" href="${escapeHtml(asset(path))}">`,
    jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : "",
  ].filter(Boolean).join("\n  ");
  out = out.replace("</head>", `  ${head}\n</head>`);
  return out;
};

const writePage = async (routePath, html) => {
  const target = routePath === "/" ? join(dist, "index.html") : join(dist, routePath, "index.html");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html);
};

// 现代爬虫会执行 JS，但静态 HTML 里的正文仍是最可靠的信号。
const poemBody = (poem) => `
    <main>
      <article>
        <h1>${escapeHtml(poem.title)}</h1>
        <p>${escapeHtml(poem.author)} · ${escapeHtml(poem.dynasty)} · ${escapeHtml(poem.category)}</p>
        ${poem.paragraphs.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      </article>
    </main>`;

const pages = [];

// 1) 首页与主要路由：给真实标题与描述。
const staticRoutes = [
  { path: "/", title: "兰泽 · 读诗的地方", description: "一间读诗、寻句、收卷的数字诗馆：今日展厅、9,350 篇诗词索引与个人诗卷。" },
  { path: "/explore", title: "诗词索引 · 兰泽", description: "按朝代、体裁、作者或一句诗检索 9,350 篇诗词。" },
  { path: "/collection", title: "我的诗卷 · 兰泽", description: "收藏、最近读过与自己写下的诗，都留在当前浏览器。" },
  { path: "/compose", title: "写一首诗 · 兰泽", description: "在写作台写下一首诗，草稿只留在这台设备上。" },
];

for (const route of staticRoutes) {
  pages.push({
    route,
    html: setMeta(template, {
      title: route.title,
      description: route.description,
      path: route.path,
      image: "og-image.png",
    }),
  });
}

// 2) 每首诗一个独立页面，带正文与 BlogPosting 结构化数据。
for (const poem of curatedPoems) {
  const path = `/poem/${poem.id}`;
  const description = `${poem.author}《${poem.title}》：${poem.paragraphs[0] || ""}`;
  const html = setMeta(template, {
    title: `${poem.title} · ${poem.author} · 兰泽`,
    description,
    path,
    image: "og-image.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: poem.title,
      author: { "@type": "Person", name: poem.author },
      articleBody: poem.paragraphs.join("\n"),
      inLanguage: "zh-CN",
      isPartOf: { "@type": "WebSite", name: siteName },
    },
  }).replace('<div id="app"></div>', `${poemBody(poem)}\n  <div id="app"></div>`);
  pages.push({ route: { path }, html });
}

for (const page of pages) await writePage(page.route.path, page.html);

// 3) 站点地图：只收录实际预渲染的页面。
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url><loc>${asset(page.route.path)}</loc></url>`).join("\n")}
</urlset>
`;
await writeFile(join(dist, "sitemap.xml"), sitemap);

console.log(`Prerendered ${pages.length} pages + sitemap.xml`);
