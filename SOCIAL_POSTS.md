# 宣发短帖（中英文）

> 本文件是仓库内可复核的文案素材，当前不代表已经向外部平台发布。人工发布时请附真实仓库、Release 或 Discussion 链接，不写 star 数、用户数、性能百分比、线上 Demo 或付费推广；外部发布均需人工确认。

## 使用约定

- 核心信息：开源、古诗词、本地可运行、Vue 3 + Vite 6、自有组件、9,350 篇离线馆藏、三段可复现本地声景、39 项单测、CI Browser E2E、MIT、中文文档、欢迎贡献。
- 不写「正式上线 / 生产可用 / 后端已恢复 / 官方 Demo」；旧展示地址一律不用。
- 不写具体 star 数、增长数据、性能百分比或未经录制的演示效果。
- 配图优先用仓库内 `public/og-image.png`，或真实本地录屏；不要使用来源不明的截图。
- 每条都可以按平台语气微调；同一天不要把所有短帖一次性刷到同一社区。

---

## 1. GitHub / X 风格：离线诗馆

**中文**

> 把 2022 年留下的「兰泽诗词」整理成一间青瓷数字诗馆：Vue 3 自有组件、今日展厅、诗词索引、读诗详情、我的诗卷与写作台，先安静读完一首诗，再决定去哪里。\
> 这轮把业务诗库换成 9,350 篇可校验的离线馆藏，保留单张历史白色摘录卡，并把单段演示音升级为三段可复现生成的本地声景曲库；39 项单测与 CI Browser E2E 覆盖主要演示链路。本地 `npm ci && npm run dev` 即可，不承诺线上 Demo 或托管后端。\
> #开源 #Vue3 #古诗词

**English**

> LanZe, a 2022 Chinese poetry frontend, is now a “Celadon Poetry Room”: independent Vue 3 components, a daily reading room, searchable index, poem sheets, a personal collection and a writing desk. One poem comes first.\
> This round adds a verifiable offline collection of 9,350 poems, preserves one historical excerpt card, and replaces the single demo sound with three reproducible local soundscapes. 39 unit tests and Chromium CI E2E cover the main demo flow. Run it locally with `npm ci && npm run dev`—no hosted demo or backend is promised.\
> #opensource #Vue3 #ChinesePoetry

## 2. 微博 / 即刻风格：中文项目与新人友好

**中文**

> 一个适合慢慢读、也适合第一次参与开源的中文项目：兰泽诗词。它用 Vue 3 写成一间「青瓷数字诗馆」：先读今日的一首诗，再去离线馆藏里寻诗、收进诗卷，或到写作台起草自己的作品。\
> 项目不依赖「先看线上 demo」：Node 20/22 本地安装即可运行，未配置后端也能用 9,350 篇离线馆藏和演示数据体验主要界面。README、MIT、贡献指南、FAQ、路线图、39 项单测和 CI 浏览器回归都写清楚了。不会写代码也能从文档勘误、素材授权、移动端检查开始。

**English**

> LanZe is a Chinese-language open-source frontend for classical poetry—a quiet reading room, offline searchable collection, personal library and writing desk built with Vue 3. The README, MIT license, contribution/security docs, FAQ, roadmap, 39 unit tests and Chromium CI smoke are all in the repository.\
> No public demo is required to try the frontend: install with Node 20/22 and run it locally; 9,350 offline poems and built-in demo data work without a backend. Docs, licensing checks and mobile QA are good first contributions.

## 3. 小红书风格：轻介绍（不夸大）

**中文**

> 📜 发现一个中文古诗词开源前端：兰泽诗词\
> · Vue 3 + Vite 6，今日展厅 / 离线馆藏 / 我的诗卷 / 写作台\
> · 冷白瓷面、青灰线框与铜金索引色；每次先安静读完一首诗\
> · 9,350 篇可校验馆藏，朝代与体裁双轴筛选；保留一张按旧版等比还原的白色竖排摘录卡\
> · 三段自制本地声景可切轨、拖进度、调音量；窄屏下播放器与底部导航自动避让\
> · 本地 `npm run dev` 可看，39 项单测与 CI 浏览器回归，MIT 开源，不承诺线上账号服务\
> 想练手的话，文档校对、素材授权、跨浏览器/视觉回归都很适合作为第一个 PR。把旧项目一点点修好，也挺浪漫的。🌿

**English**

> 📜 LanZe: an open-source Chinese poetry frontend\
> · Vue 3 + Vite 6: a daily reading room, offline collection, personal library and writing desk\
> · Cool porcelain surfaces, celadon rules and brass index marks; one poem at a time\
> · 9,350 verifiable offline poems, dynasty/form facets, and one restored vertical excerpt card\
> · Three self-generated local soundscapes with a playlist, seek bar and volume controls\
> · Runs locally with `npm run dev`; 39 unit tests, Chromium CI smoke, MIT-licensed, with no hosted account promise\
> Good first PRs: docs, asset licensing, cross-browser and visual regression. Quietly restoring an old project can be lovely. 🌿

## 4. 技术社区风格：离线优先与回归

**中文**

> 旧前端项目的维护不只是换个皮肤。兰泽诗词把 36 个旧页面收敛到六类主任务，移除 Element Plus / Bootstrap / Lottie / APlayer / 滑块验证码，改用 Vue 3 自有组件；旧 URL 保留兼容重定向，历史白色摘录卡作为明确视觉例外单独还原。\
> 工程侧：9,350 篇离线馆藏按 16 个分卷按需加载，三段本地声景由脚本确定性生成并按 SHA-256 校验；39 项单测、lint、Node 20/22 构建、静态资源冒烟再加独立 Browser E2E。CDP 冒烟覆盖桌面/320px 窄屏、馆藏筛选、搜索、收藏、播放器、登录、发布、控制台/网络错误与 CLS。\
> 仍诚实保留边界：不承诺线上 Demo 或托管后端，第三方素材授权未核验，CI 浏览器回归只覆盖 Chromium 关键路径。欢迎可验证的小 PR。

**English**

> Maintaining a legacy frontend is more than a new skin. LanZe replaces 36 legacy pages with six main tasks and independent Vue 3 components, removes Element Plus / Bootstrap / Lottie / APlayer / slider CAPTCHA, keeps legacy URL redirects, and restores one historical excerpt card as an explicit visual exception.\
> Engineering: 9,350 offline poems load from 16 split volumes, three local soundscapes are deterministically generated and verified by SHA-256, and 39 unit tests, lint, Node 20/22 builds, static-asset smoke and a separate Browser E2E workflow guard the main flow. CDP smoke covers desktop/320px mobile, facets, search, saving, the player, login, publishing, console/network errors and CLS.\
> Boundaries remain explicit: no hosted demo or backend, third-party asset licensing is not verified, and CI browser coverage is Chromium only. Small, verifiable PRs welcome.

## 5. Release / Discussion 联动风格

**中文**

> `v0.4.0` 聚焦「离线馆藏与声景曲库」：9,350 篇可校验馆藏、朝代/体裁双轴筛选、移动端走查、三段可复现本地声景、39 项单测与 CI Browser E2E。默认运行不依赖外部诗词接口、第三方音乐平台或线上账号，仍不是「诗词社区正式上线」的公告。\
> 当前最需要的是跨浏览器/视觉回归、素材授权核验、可选后端契约与内容版本依据。路线图与 FAQ 都写清了已知限制；如果没有后端，请用本地演示理解界面。仓库见链接 👇

**English**

> LanZe `v0.4.0` focuses on an offline collection and a local soundscape library: 9,350 verifiable poems, dynasty/form facets, a mobile walkthrough, three reproducible local soundscapes, 39 unit tests and Chromium CI E2E. The default run does not depend on an external poetry API, third-party music platform or hosted account—and this is not a launch notice for a hosted poetry community.\
> Most useful next: cross-browser/visual regression, asset licensing, optional backend contracts and content provenance. Known limits are in the roadmap and FAQ; built-in demo data works when no backend is configured. Repo in the link 👇

---

## 发布前核对

- [ ] 仓库链接指向 `https://github.com/2648782102/LanZe`；若附 Release/Discussion，链接已实际创建并验证。
- [ ] 没有附历史 MemFire / Vercel 演示地址，没有写「官网 / 线上体验 / 正式上线」。
- [ ] `v0.4.0` tag/Release 已存在；如附链接，先回读 `https://github.com/2648782102/LanZe/releases/tag/v0.4.0`。
- [ ] 若提到演示数据，说明它仅保存在当前浏览器 `localStorage`，不是账号服务。
- [ ] 配图来自 `public/og-image.png` 或真实本地录屏；画面不含密钥、真实账号或私人路径。
- [ ] 没有 star、fork、用户数、增长或性能数字；没有购买推广/刷互动。
- [ ] 发布后把可执行的反馈整理成 issue，并同步修正文档；不要把讨论只留在评论区。
