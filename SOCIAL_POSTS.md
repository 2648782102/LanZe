# 宣发短帖（中英文）

> 本文件是仓库内可复核的文案素材。当前不连接到外部社媒，也不自动群发；如人工发布，请附真实仓库、Release 或 Discussion 链接，不写 star 数、用户数、性能百分比、线上 Demo 或付费推广。到 2026-11-06 08:00 前仅维护项目自有 GitHub 渠道。

## 使用约定

- 核心信息：开源、古诗词、本地可运行、Vue 3 + Vite 6、本地演示数据、MIT、中文文档、欢迎贡献。
- 不写「正式上线 / 生产可用 / 后端已恢复 / 官方 Demo」；旧展示地址一律不用。
- 不写具体 star 数、增长数据、性能百分比或未经录制的演示效果。
- 配图优先用仓库内 `public/og-image.svg` 转出的 PNG，或真实本地录屏；不要使用来源不明的截图。
- 每条都可以按平台语气微调；同一天不要把所有短帖一次性刷到同一社区。

---

## 1. GitHub / X 风格：项目重启

**中文**

> 把 2022 年留下的「兰泽诗词」重新整理成可参与的开源前端：README、MIT、贡献指南、安全政策、架构/部署文档、Node 20/22 CI、issue 模板都补齐了。Vue 3 + Vite 6，本地 `npm ci && npm run dev` 就能看摘录、文库、搜索与茶楼界面。  
> 不承诺线上 Demo 或托管后端，先从可复现、17 项单测和本地演示数据开始。欢迎文档勘误、API 适配、交互回归与前端稳定性 PR。  
> #开源 #Vue3 #古诗词

**English**

> Reopening LanZe, a 2022 Chinese poetry frontend, as a maintainable open-source repo: rewritten README, MIT license, contributing/security docs, architecture & deployment notes, Node 20/22 CI, and issue templates. Built with Vue 3 + Vite 6; `npm ci && npm run dev` runs excerpts, library, search and community UI locally with built-in demo data.  
> No hosted demo or backend is promised—reproducible builds, 17 unit tests and local data come first. Docs, API and frontend fixes welcome.  
> #opensource #Vue3 #ChinesePoetry

## 2. 微博 / 即刻风格：中文项目与新人友好

**中文**

> 一个适合慢慢读、也适合第一次参与开源的中文项目：兰泽诗词。古诗词摘录、分类文库、茶楼创作界面，用 Vue 3 写成；这次把 README、MIT、贡献指南、FAQ、路线图与 CI 整理清楚，也补了本地演示数据和测试。  
> 项目不依赖「先看线上 demo」：Node 20/22 本地安装即可运行前端，未配置后端也能用演示账号体验主要界面。不会写代码也能从文档勘误、素材授权、移动端检查开始。

**English**

> LanZe is a Chinese-language open-source frontend for classical poetry—excerpts, category browsing and a community prototype in Vue 3. We rewrote the README, added MIT licensing, contribution/security docs, FAQ, roadmap, CI, unit tests and local demo data.  
> No public demo is required to try the frontend: install with Node 20/22 and run it locally; built-in demo data works without a backend. Docs, licensing checks and mobile QA are great first contributions.

## 3. 小红书风格：轻介绍（不夸大）

**中文**

> 📜 发现一个中文古诗词开源前端：兰泽诗词  
> · Vue 3 + Vite 6，摘录 / 文库 / 搜索 / 茶楼界面  
> · 本地 `npm run dev` 可看，内置演示数据，MIT 开源，README 与贡献指南都换成了清楚的中文  
> · 目前整理的是前端与文档，不承诺线上账号服务；演示数据不是正式社区  
> 想练手的话，文档校对、移动端布局、空状态/错误态、交互回归都很适合作为第一个 PR。把旧项目一点点修好，也挺浪漫的。🌿

**English**

> 📜 LanZe: an open-source Chinese poetry frontend  
> · Vue 3 + Vite 6: excerpts, library, search and community screens  
> · Runs locally with `npm run dev`; built-in demo data, MIT-licensed, with a clear Chinese README and contributing guide  
> · Frontend/docs first—no hosted account service is promised; demo data is not a production community  
> Good first PRs: docs, mobile layout, empty/error states and interaction QA. Quietly restoring an old project can be lovely. 🌿

## 4. 技术社区风格：治理先行

**中文**

> 旧前端项目怎么重新开放？我们没有先堆功能，而是先处理「别人能不能跑起来、能不能相信文档」：  
> ① README 删除失效托管/演示承诺；② MIT + 贡献/行为/安全政策；③ 把 Vite 升到 6，统一 ESM 与相对 base；④ 用 `VITE_API_BASE_URL` + `VITE_USE_MOCK` 收敛请求层，未配置后端时自动使用本地演示数据；⑤ Node 20/22 CI 跑 `npm ci`、`npm run build`、`npm run test --if-present`，另有 17 项单测与静态检查；⑥ 默认音源/封面本地化，Pages 只手动触发，不自动发到旧域名。  
> 兰泽诗词的下一段是拆分大体积依赖、补充 E2E 与素材授权清单。欢迎来提可验证的小 PR。

**English**

> How do you reopen a dormant frontend? Start with trust, not features: remove stale demo claims; add MIT + contribution/security policies; upgrade to Vite 6 with one ESM config and a relative base; converge requests behind `VITE_API_BASE_URL` + `VITE_USE_MOCK`, with local demo data as the no-backend fallback; run Node 20/22 CI with `npm ci`, `npm run build` and `npm run test --if-present`, plus 17 unit tests and a lint scan; use a repository-generated local audio demo by default; keep Pages manual and away from dead domains.  
> Next for LanZe: bundle splitting, E2E coverage and third-party asset licensing. Small, verifiable PRs welcome.

## 5. Release / Discussion 联动风格

**中文**

> `v0.2.0` 整理好了：README、许可证、贡献与安全文档、架构/开发/部署/路线图、CI、模板、17 项单测、Vite 6、本地演示数据与本地演示音源都补齐了。它是一个可复现的起点，不是「诗词社区正式上线」的公告。  
> 当前最需要的是本地验证、文档与源码一致性、mock/API 边界、第三方素材授权和交互回归。路线图与 FAQ 都写清了已知限制；如果没有后端，请用本地演示理解界面。仓库见链接 👇

**English**

> `v0.2.0` is ready: rewritten README, MIT license, contribution/security docs, architecture/development/deployment/roadmap notes, CI, templates, 17 unit tests, Vite 6, local demo data and a local audio demo. It is a reproducible starting point—not a launch announcement for a hosted poetry community.  
> Most useful next: local reproduction, docs/code consistency, mock/API boundaries, third-party asset licensing and interaction QA. Known limits are in the roadmap and FAQ; built-in demo data works when no backend is configured. Repo in the link 👇

---

## 发布前核对

- [ ] 仓库链接指向 `https://github.com/2648782102/LanZe`；若附 Release/Discussion，链接已由主 agent 实际创建并验证。
- [ ] 没有附历史 MemFire / Vercel 演示地址，没有写「官网 / 线上体验 / 正式上线」。
- [ ] 若提到 `v0.2.0`，tag/Release 已存在；否则改成「治理改动已合并」。
- [ ] 若提到演示数据，说明它仅保存在当前浏览器 `localStorage`，不是账号服务。
- [ ] 配图来自 `public/og-image.svg` 或真实本地录屏；画面不含密钥、真实账号或私人路径。
- [ ] 没有 star、fork、用户数、增长或性能数字；没有购买推广/刷互动。
- [ ] 发布后把可执行的反馈整理成 issue，并同步修正文档；不要把讨论只留在评论区。
