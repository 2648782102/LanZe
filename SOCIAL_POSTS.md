# 宣发短帖（中英文）

> 本文件是仓库内可复核的文案素材，当前不代表已经向外部平台发布。人工发布时请附真实仓库、Release 或 Discussion 链接，不写 star 数、用户数、性能百分比、线上 Demo 或付费推广；外部发布均需人工确认。

## 使用约定

- 核心信息：开源、古诗词、本地可运行、Vue 3 + Vite 6、自有组件、本地演示数据、27 项单测、CI Browser E2E、MIT、中文文档、欢迎贡献。
- 不写「正式上线 / 生产可用 / 后端已恢复 / 官方 Demo」；旧展示地址一律不用。
- 不写具体 star 数、增长数据、性能百分比或未经录制的演示效果。
- 配图优先用仓库内 `public/og-image.png`，或真实本地录屏；不要使用来源不明的截图。
- 每条都可以按平台语气微调；同一天不要把所有短帖一次性刷到同一社区。

---

## 1. GitHub / X 风格：青瓷数字诗馆

**中文**

> 把 2022 年留下的「兰泽诗词」重做成一间青瓷数字诗馆：Vue 3 自有组件、今日展厅、诗词索引、读诗详情、我的诗卷与写作台，先安静读完一首诗，再决定去哪里。\
> 这轮保留了单张历史白色摘录卡，接入可回退的诗句源，修好吸底播放器与音源不可达状态；静态素材换成子集和压缩图，27 项单测与 CI Browser E2E 覆盖主要演示链路。本地 `npm ci && npm run dev` 即可，不承诺线上 Demo 或托管后端。\
> #开源 #Vue3 #古诗词

**English**

> Rebuilding LanZe, a 2022 Chinese poetry frontend, as a “Celadon Poetry Room”: independent Vue 3 components, a daily reading room, searchable index, poem sheets, a personal collection and a writing desk. One poem comes first.\
> The single historical excerpt card is preserved, now with a fallible-but-observable poetry source; the pinned player handles unreachable audio; assets are subsetted and the main demo flow is covered by 27 unit tests plus Chromium CI E2E. Run it locally with `npm ci && npm run dev`—no hosted demo or backend is promised.\
> #opensource #Vue3 #ChinesePoetry

## 2. 微博 / 即刻风格：中文项目与新人友好

**中文**

> 一个适合慢慢读、也适合第一次参与开源的中文项目：兰泽诗词。它用 Vue 3 写成一间「青瓷数字诗馆」：先读今日的一首诗，再去索引里寻诗、收进诗卷，或到写作台起草自己的作品。\
> 项目不依赖「先看线上 demo」：Node 20/22 本地安装即可运行，未配置后端也能用演示数据体验主要界面。README、MIT、贡献指南、FAQ、路线图、27 项单测和 CI 浏览器回归都写清楚了。不会写代码也能从文档勘误、素材授权、移动端检查开始。

**English**

> LanZe is a Chinese-language open-source frontend for classical poetry—a quiet reading room, searchable index, personal collection and writing desk built with Vue 3. The README, MIT license, contribution/security docs, FAQ, roadmap, 27 unit tests and Chromium CI smoke are all in the repository.\
> No public demo is required to try the frontend: install with Node 20/22 and run it locally; built-in demo data works without a backend. Docs, licensing checks and mobile QA are good first contributions.

## 3. 小红书风格：轻介绍（不夸大）

**中文**

> 📜 发现一个中文古诗词开源前端：兰泽诗词\
> · Vue 3 + Vite 6，今日展厅 / 诗词索引 / 我的诗卷 / 写作台\
> · 冷白瓷面、青灰线框与铜金索引色；每次先安静读完一首诗\
> · 保留一张按旧版等比还原的白色竖排摘录卡，换句失败会诚实回退\
> · 吸底播放器、错误态、图片尺寸与 CLS 预算都认真收了一遍\
> · 本地 `npm run dev` 可看，内置演示数据，MIT 开源，不承诺线上账号服务\
> 想练手的话，文档校对、素材授权、跨浏览器/视觉回归都很适合作为第一个 PR。把旧项目一点点修好，也挺浪漫的。🌿

**English**

> 📜 LanZe: an open-source Chinese poetry frontend\
> · Vue 3 + Vite 6: a daily reading room, searchable index, personal collection and writing desk\
> · Cool porcelain surfaces, celadon rules and brass index marks; one poem at a time\
> · One restored vertical excerpt card, with an honest local fallback when its poetry source fails\
> · A pinned player, readable error states, explicit image dimensions and a CLS budget\
> · Runs locally with `npm run dev`; built-in demo data, MIT-licensed, with no hosted account promise\
> Good first PRs: docs, asset licensing, cross-browser and visual regression. Quietly restoring an old project can be lovely. 🌿

## 4. 技术社区风格：重构之后把验证补上

**中文**

> 旧前端项目不只是换个皮肤。兰泽诗词这轮把 36 个旧页面收敛到六类主任务，移除 Element Plus / Bootstrap / Lottie / APlayer / 滑块验证码，改用 Vue 3 自有组件；旧 URL 保留兼容重定向，历史白色摘录卡作为明确视觉例外单独还原。\
> 工程侧：27 项单测、lint、Node 20/22 构建、静态资源冒烟，再加独立 Browser E2E workflow；CDP 冒烟覆盖桌面/窄屏、搜索、收藏、吸底播放器、登录、发布、控制台/网络错误与 CLS。静态素材从约 27 MB 未引用历史文件收敛到子集与压缩图，音源不可达时显示状态而不是静默失败。\
> 仍诚实保留边界：不承诺线上 Demo 或托管后端，第三方素材授权未核验，CI 浏览器回归只覆盖 Chromium 关键路径。欢迎可验证的小 PR。

**English**

> A frontend rebuild is more than a new skin. LanZe now replaces 36 legacy pages with six main tasks and independent Vue 3 components, removes Element Plus / Bootstrap / Lottie / APlayer / slider CAPTCHA, keeps legacy URL redirects, and restores one historical excerpt card as an explicit visual exception.\
> Engineering: 27 unit tests, lint, Node 20/22 builds, static-asset smoke and a separate Browser E2E workflow. The CDP smoke covers desktop/mobile, search, saving, the pinned player, login, publishing, console/network errors and CLS. Unused legacy assets were removed; unreachable audio now has a readable state instead of silent failure.\
> Boundaries remain explicit: no hosted demo or backend, third-party asset licensing is not verified, and CI browser coverage is Chromium only. Small, verifiable PRs welcome.

## 5. Release / Discussion 联动风格

**中文**

> `v0.3.0` 候选整理好了：青瓷数字诗馆视图重构、单张历史摘录卡、可回退诗句源、吸底播放器与音源错误态、静态资源/布局稳定性、27 项单测、CI Browser E2E，以及同步后的中文文档与素材哈希清单。它是一个可本地复核的开源前端版本，不是「诗词社区正式上线」的公告。\
> 当前最需要的是跨浏览器/视觉回归、素材授权核验、可选后端契约与内容版本依据。路线图与 FAQ 都写清了已知限制；如果没有后端，请用本地演示理解界面。仓库见链接 👇

**English**

> The `v0.3.0` candidate is ready: a rebuilt Celadon Poetry Room interface, one restored historical excerpt card, a poetry source with local fallback, a pinned player with readable audio errors, smaller assets, 27 unit tests, Chromium CI E2E, updated Chinese docs and asset hashes. It is a locally verifiable frontend release—not a launch notice for a hosted poetry community.\
> Most useful next: cross-browser/visual regression, asset licensing, optional backend contracts and content provenance. Known limits are in the roadmap and FAQ; built-in demo data works when no backend is configured. Repo in the link 👇

---

## 发布前核对

- [ ] 仓库链接指向 `https://github.com/2648782102/LanZe`；若附 Release/Discussion，链接已实际创建并验证。
- [ ] 没有附历史 MemFire / Vercel 演示地址，没有写「官网 / 线上体验 / 正式上线」。
- [ ] 若提到 `v0.3.0`，tag/Release 已存在；否则改成「重构改动已合并到 main」。
- [ ] 若提到演示数据，说明它仅保存在当前浏览器 `localStorage`，不是账号服务。
- [ ] 配图来自 `public/og-image.png` 或真实本地录屏；画面不含密钥、真实账号或私人路径。
- [ ] 没有 star、fork、用户数、增长或性能数字；没有购买推广/刷互动。
- [ ] 发布后把可执行的反馈整理成 issue，并同步修正文档；不要把讨论只留在评论区。
