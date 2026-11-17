# 宣发文案（v0.5.0 口径，中英文）

> 本文件是仓库内可复核的文案素材，**不代表已经向外部平台发布**。人工发布时请附真实仓库或 Release 链接；不写 star 数、用户数、性能百分比或「线上 Demo」；外部发布均需人工确认。

## 使用约定

- 当前口径：开源中文古诗词前端、本地可运行、Vue 3 + Vite 6、自有组件、9,350 篇离线馆藏、**26 个构建期预渲染页面**、**56 项单测**、CI 与独立 Browser E2E、MIT、中文文档。
- 已移除：背景音乐播放器与全部音频（v0.5.0）。任何旧文案里的「声景」「音轨」「播放器」都不要再用。
- 不写「正式上线 / 生产可用 / 后端已恢复 / 官方线上 Demo」；GitHub Pages 只能称**静态前端预览**。
- 配图用 `docs/preview-home.jpg`（真实首屏截图）或 `public/og-image.png`（社交预览），不要用来源不明的图。
- 同一天不要把同一段文案刷到多个社区；每个平台按自己的语气微调。

---

## 1. X / 即刻（短帖，可直接发）

**中文**

> 把 2022 年烂尾的「兰泽诗词」重做成一间青瓷数字诗馆：今日展厅先安静读完一首，再去 9,350 篇离线馆藏里寻诗、收进自己的诗卷。\\\
> Vue 3 + Vite 6，自有组件，构建期预渲染 26 个页面，56 项单测，axe 无障碍 0 违规。本地 `npm ci && npm run dev` 就能跑，不依赖任何后端。\\\
> 欢迎来读，也欢迎来挑错字。 #开源 #Vue3 #古诗词

**English**

> Rebuilt a 2022 side project into a "celadon poetry room": read today's poem first, then search 9,350 offline poems and keep your own scroll.\\\
> Vue 3 + Vite 6, hand-written components, 26 prerendered pages, 56 unit tests, zero axe violations. `npm ci && npm run dev` works without any backend.\\\
> Typos and word breaks are welcome as issues. #opensource #Vue3 #ChinesePoetry

## 2. V2EX「分享创造」（中文，可直接发）

**标题**：分享一个离线的中文古诗词阅读器，Vue 3 + Vite，9,350 篇馆藏

**正文**：

> 断断续续做了几年，最近把仓库整个重做了一遍，想拿出来求点批评。
>
> **它是什么**：一间读诗的地方。首页是「今日展厅」，一次只推一首，先读完再决定去哪；之后是 9,350 篇离线馆藏的索引（朝代、体裁、诗名、作者、字句都能查），读诗详情页，收藏与最近读过，以及一个只存在浏览器 localStorage 里的本地草稿台。
>
> **技术上值得说的**：
> - Vue 3 + Vite 6，没有 UI 框架，组件自己写；
> - 全站改成 history 路由，构建期预渲染 26 个页面，每页独立 title / description / BlogPosting JSON-LD，附 sitemap.xml；GitHub Pages 的深链用 404 兜底，兜底页带 `noindex`；
> - 质量门禁是照真项目做的：56 项 `node --test` 单测、axe-core 无障碍（桌面/移动各 5 条路由，0 违规）、LCP/CLS 与首屏体积预算、移动端 40px 触控下限、320/390/430 三档像素基线、CodeQL 静态扫描、Dependabot；
> - 不依赖后端：没配 `VITE_API_BASE_URL` 就用仓库内离线馆藏和演示数据。
>
> **边界也说清楚**：GitHub Pages 只是静态前端预览，没有托管后端、没有账号服务、没有内容审核；第三方字体与图片的授权还在逐项核验。
>
> 想找两类反馈：一是读诗体验（字号、行距、翻页节奏、移动端），二是工程上哪里还能更省（首屏体积、预渲染范围）。
>
> 仓库：https://github.com/2648782102/LanZe ｜ 静态预览：https://2648782102.github.io/LanZe/

## 3. 掘金长文（技术向，1500 字左右）

**标题**：把一个烂尾两年的古诗词前端重做完：预渲染、无障碍与质量门禁怎么落地

**摘要**：一个不起眼的个人项目，从「能跑」到「可复现、可验证」，中间做了哪些取舍。

**正文**

一、先决定它不是什么

2022 年我做过一个诗词界面，停更两年。重做时最难的取舍是砍功能：不做诗词社区、不做后端、不做内容审核，只做一件事——**把一首诗安静地读完，并且能查到其他诗**。砍完之后，剩下的部分才谈得上做扎实。

二、真实 URL 比动效重要

原来的页面是 hash 路由，`/#/poem/xxx` 这类地址搜索引擎读不到内容，分享出去也没法预览。这轮改成 `createWebHistory`，并在构建期预渲染 26 个页面（六类主路由 + 22 首精校短章）。每页有独立标题、描述、`BlogPosting` 结构化数据，另出 `sitemap.xml`。

GitHub Pages 是纯静态托管，深链会 404，所以构建时把 `index.html` 复制成 `404.html` 做兜底，前端路由再按 pathname 渲染。这里踩了个坑：兜底页会原样带上首页的 `canonical`，等于告诉搜索引擎「所有不存在的地址都指向首页」，结果是一堆重复页面被收录。修法是兜底页移除 `canonical`、注入 `noindex, follow`，并把标题改成「页面走失了」。

第三个坑更隐蔽：`og:image` 原来写的是站内相对路径 `/og-image.png`，部署在项目子路径下就成了 `https://<user>.github.io/og-image.png`，实测 404。社交抓取器不解析相对路径，所以必须输出绝对 URL——这个改动我顺手加进了 smoke 测试，防止回退。

三、质量门禁不是装饰

单测从 45 项补到 56 项，重点补的是以前完全没有覆盖的状态层：`useSession`（登录态 cookie 读写、资料合并）、`useExcerptDeck`（摘录队列、翻页、收藏）、`useLibrary`（收藏、最近读过、12 条上限）。`node:test` 没有 DOM，所以 cookie jar 和 `window.setTimeout` 都在测试里做了替身；还有个细节——必须**先 `import "vue"` 再注入假 `document`**，否则 `@vue/runtime-dom` 在模块加载时探测到 document，就会走浏览器分支，报 `doc.createElement is not a function`。

无障碍用 axe-core 跑 5 条路由 × 桌面/移动，从 12 组违规降到 0。真实改动很朴素：`--ink-faint` 从 `#809793` 调到 `#586965`，正文金色全部换成 `--brass-text`，移动端底部导航文字透明度 0.5 → 0.62。

性能只做预算不做玄学：LCP、CLS、首屏 JS/CSS 的 gzip 体积都设上限，进 CI。实测 LCP 296ms、CLS 0，首屏 JS 64KB——对一个自带 9,350 篇诗词数据的站点，靠的是分卷按需加载。

四、把「可复现」当产品特性

现在合并一个改动，跑的是：Node 20/22 构建、56 项单测、lint、静态资源冒烟、独立 Browser E2E（含 axe、性能预算、40px 触控、三档移动端像素基线）、CodeQL。听起来重，但它是这个项目敢继续改的前提——很多个人项目不是写不下去，是改不动。

五、还差什么

没有托管后端，没有账号服务，第三方素材授权逐项核验中，浏览器回归只覆盖 Chromium。这些都在 README 和 FAQ 里写死了，不打算用「即将支持」糊过去。

如果只想要一句话：**先决定砍掉什么，再谈把它做扎实。**

仓库：https://github.com/2648782102/LanZe

## 4. 小红书 / 朋友圈（轻介绍）

> 📜 一个中文古诗词开源前端：兰泽诗词\\\
> · Vue 3 + Vite 6，今日展厅 / 9,350 篇离线馆藏 / 我的诗卷 / 写作台\\\
> · 冷白瓷面、青灰线框、铜金索引色；一次只读一首，读完再去寻诗\\\
> · 构建期预渲染 26 个页面，每首诗都有自己的地址；56 项单测、无障碍 0 违规\\\
> · 本地 `npm ci && npm run dev` 就能跑，不需要后端，MIT 开源\\\
> 想练手的话，错字勘误、断行校对、移动端排版都很适合当第一个 issue。把旧项目一点点修好，挺浪漫的。🌿

## 发布前核对

- [ ] 仓库链接指向 `https://github.com/2648782102/LanZe`；附带的 Release / Discussion 链接已实际创建并回读。
- [ ] 没有附历史 MemFire / Vercel 地址，没有写「官网 / 官方线上 Demo / 正式上线」；GitHub Pages 只称静态前端预览。
- [ ] 没有出现「声景 / 音轨 / 播放器」（v0.5.0 已移除音频）。
- [ ] 单测数写 56，预渲染页数写 26，与 README 一致。
- [ ] 配图用 `docs/preview-home.jpg` 或 `public/og-image.png`，画面不含密钥、真实账号、私人路径。
- [ ] 没有任何 star / fork / 用户数 / 增长 / 性能百分比数字；没有购买推广或互 star。
- [ ] 发布后把可执行反馈整理成 issue，并同步修正文档。
