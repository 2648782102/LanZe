# 兰泽诗词 · LanZe

<p align="center">
  <img src="public/og-image.svg" alt="兰泽诗词：以现代前端重新打开的古诗词社区界面" width="720" />
</p>

<p align="center">
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <a href="https://github.com/2648782102/LanZe/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/2648782102/LanZe/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://vuejs.org/"><img alt="Vue 3" src="https://img.shields.io/badge/Vue-3-42b883.svg" /></a>
  <a href="CHANGELOG.md"><img alt="Changelog" src="https://img.shields.io/badge/changelog-keep%20a%20changelog-orange.svg" /></a>
</p>

> **English summary:** LanZe is a community-maintained Vue 3 frontend for reading, browsing and sharing classical Chinese poetry. It runs locally with built-in demo data, includes documentation, CI and tests, and does not promise a verified public demo or hosted account backend.

**简体中文**｜[English summary](#english-summary-1)

## 项目定位

兰泽诗词始于 2022 年，最初是一个以 Vue 3 + Vite 构建的古诗词学习与交流界面：随机摘录、分类文库、诗词搜索、茶楼创作、笃学、个人中心与音乐播放。2026 年重新整理后，本仓库的定位是：

1. **可本地运行的开源前端**：`npm ci` → `npm run dev`，无需依赖历史托管平台即可查看界面。
2. **可替换的数据适配层**：`VITE_API_BASE_URL` 优先连接自建 API；未配置或失败时自动降级到仓库内演示数据。
3. **对新人友好的中文开源项目**：提供清晰的贡献、行为、安全、部署和发布文档，而不是只留下一份旧 README。

这不是一个已经上线运营的诗词社区，也不提供经维护者验证的线上 Demo、账号服务、数据库或正式内容审核。旧 README 中的 MemFire Cloud 展示地址和 README/代码里的若干 Vercel 地址均属**历史链接**，请不要把它们当作当前可用服务。没有后端时，页面使用本地演示数据；演示账号与作品仅保存在当前浏览器 `localStorage`。

## 当前状态（2026-11-06）

| 项目 | 状态 |
| --- | --- |
| 历史基线 | 原 `main` 停在 `b4ea7f4`（2024-08-18）；2026-11-06 起进行现代化维护 |
| 前端构建 | Vue 3 + Vue Router 4（hash 模式）+ Element Plus + Vite 6（ESM 配置） |
| 在线 Demo | 不承诺；旧展示地址仅保留在 `CHANGELOG.md` 与 `docs/FAQ.md` 的事实说明中 |
| 后端/账号 | 仓库不附带完整后端；默认使用本地演示数据，配置 `VITE_API_BASE_URL` 后可连接自建 API |
| 测试 | `npm run test` 含 17 个 `node --test` 单测；CI 在 Node 20/22 执行构建与测试 |
| 许可 | [MIT](LICENSE)，`Copyright (c) 2022-2026 LanZe contributors` |
| 发布 | `v0.2.0` 的 Release notes 与 Discussions 欢迎帖见 `RELEASE_NOTES.md`、`ANNOUNCEMENT.md` |

## 主要特性

- 📜 **摘录与随机诗句**：卡片式摘录、切换动画、收藏态演示与详情页入口。
- 🏛 **分类文库**：唐诗、宋词、元曲、南唐、花间集、诗经/楚辞等分类界面与鉴赏入口。
- 🔎 **搜索与详情**：按关键词检索并跳转到搜索结果/详情；默认检索仓库内演示数据，也可接自建 API。
- 🍵 **茶楼与创作**：现代诗、精选诗文、飞花接龙、作品发布等社区界面原型。
- 👤 **个人中心**：登录/注册/资料/作品/收藏/设置等页面，演示态由浏览器本地存储支持。
- 🎵 **音乐播放**：APlayer 默认加载仓库自制 WAV / SVG 演示资源；可通过公开配置接入授权明确的自定义音源。
- 📱 **响应式布局**：包含移动端底部导航与大屏布局，仍需持续无障碍/布局回归。
- 🧩 **现代前端栈**：Vue 3、Vue Router 4、Element Plus、Axios、Lottie，配合 Vite 6 构建与 17 项单测。
- 📚 **开源治理**：MIT、贡献/行为/安全政策、变更日志、CI、issue/PR 模板、发布与宣发文案。

「特性」描述的是仓库中已有界面与默认演示数据能力，不等于提供线上账号、持久化服务或正式内容审核。逐项可信度见 `docs/FAQ.md`。

## 技术栈

| 层次 | 当前实现 |
| --- | --- |
| 视图 | Vue 3、Vue Router 4（当前 hash history）、Element Plus、Element Plus Icons |
| 构建 | Vite 6 + `@vitejs/plugin-vue`，`package.json` 使用 `"type": "module"`，`base: './'` |
| 语言 | JavaScript / Vue SFC；npm 脚本使用 `node --test` 与 ESM |
| 数据 | `src/config/runtime.js` 统一公开配置，`src/apis/request.js` 在真实 API 与 `src/services/mockApi.js` 之间切换 |
| 动效与媒体 | 本地 `@lottiefiles/lottie-player`、仓库内 Lottie JSON、APlayer 与 `public/media/` 自制演示音源/封面 |
| 样式 | 组件内 CSS、Element Plus、锁定版本的本地 Bootstrap 5.1.1 / Font Awesome 5.13.0 |
| 字体与素材 | `src/assets/` 下的字体、图片与背景；授权审查见 `docs/FAQ.md` |
| 工具链 | npm、Node.js 20/22、GitHub Actions、`npm run test`、`npm run lint` |
| 部署 | `vite build` 产物，可部署到 GitHub Pages / Vercel / Netlify 等静态托管 |

## 快速开始

### 环境要求

- Node.js **20 或 22**（CI 矩阵同款）；较新的 Node 24 本地可能可用，但不作为最低承诺。
- npm（随 Node 分发）；仓库使用 `package-lock.json`，优先 `npm ci`。
- 现代浏览器；首次启动若依赖预构建较慢，请等待 Vite 输出本地地址。
- 可选：一个兼容项目 API 契约的自建后端，或使用演示数据/mock 模式。

### 安装与运行

```bash
git clone https://github.com/2648782102/LanZe.git
cd LanZe
npm ci
npm run dev
```

打开终端输出的地址（默认 `http://127.0.0.1:5173/`；端口被占用时以 Vite 输出为准）。

### 构建、测试与预览

```bash
npm run build        # 生成 dist/
npm run test         # 17 个 node --test 单测
npm run lint         # 静态检查：失效后端地址、硬编码服务与脆弱引用
npm run preview      # 预览 dist/
npm run smoke        # 预览服务与入口静态资源 HTTP 冒烟
```

CI 在 Node 20/22 执行 `npm ci && npm run build && npm run test --if-present`；`--if-present` 保留为兼容旧工作流的兜底写法。

### 本地演示 / mock 模式

v0.2.0 已实现数据来源切换和无需联网账号的演示数据：

- `VITE_USE_MOCK=true`：显式使用仓库内演示数据，跳过外部 API 请求。
- `VITE_USE_MOCK=false` 且配置 `VITE_API_BASE_URL`：优先调用自建 API；失败或返回无效数据时自动降级并给出一次提示。
- 未配置 `VITE_API_BASE_URL` 时默认启用演示数据；演示账号为 `demo / lanze2026`。

演示账号、注册账号和发布的作品仅写入当前浏览器 `localStorage`，不提供真实密码安全、跨设备同步或线上账号服务。细节见 `docs/DEVELOPMENT.md`。

## 环境变量

前端只放公开配置。所有 `VITE_` 变量都会被构建进浏览器产物，**不得**放服务端密钥、数据库口令、`service_role`、私人令牌或用户数据。

| 变量 | 必填 | 示例 | 说明 |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | 否 | `/api/` | 业务 API 前缀；运行时自动补全末尾斜杠。生产环境建议使用同源 `/api/`，由托管平台反向代理 |
| `VITE_API_TIMEOUT` | 否 | `4000` | 远端请求超时（毫秒） |
| `VITE_USE_MOCK` | 否 | `true` | 未配置 API 时自动为 `true`；显式关闭后才会请求远端 |
| `VITE_SUPABASE_URL` | 否 | `https://example.supabase.co` | 可选；需与 `VITE_SUPABASE_ANON_KEY` 同时配置，否则使用本地适配器 |
| `VITE_SUPABASE_ANON_KEY` | 否 | 公开 anon key | 可选公开配置；不要放服务端密钥或 `service_role` |
| `VITE_AUDIO_SOURCE` | 否 | `local` | `local` 使用仓库自制演示音源；仅在确认授权后设置为 `custom` |
| `VITE_AUDIO_TRACKS` | 否 | JSON 数组 | `custom` 模式下的音轨列表；每项至少含 `url`，可选 `name`、`artist`、`cover` |

默认情况下音乐播放器只请求 `public/media/` 内的本地资源，不加载第三方音乐或封面。若设置为 `VITE_AUDIO_SOURCE=custom`，`VITE_AUDIO_TRACKS` 必须是 JSON 数组，例如：

```dotenv
VITE_AUDIO_SOURCE=custom
VITE_AUDIO_TRACKS=[{"name":"示例","artist":"作者","url":"/media/example.mp3","cover":"/media/example.svg"}]
```

音源与封面的版权、可用性、防盗链与隐私政策由配置者自行负责；配置缺失或 JSON 无效时自动回退到本地演示音。`VITE_` 变量会进入浏览器产物，不要填入私密地址或凭据。

可创建 `.env.local`（已被 `.gitignore` 忽略）：

```dotenv
VITE_USE_MOCK=true
# 如需连接自建 API，再填写公开地址；不要在这里填写生产密钥
# VITE_API_BASE_URL=/api/
```

配置契约与 `.env.example` 一致；不要把 `.env` 或 `.env.local` 提交到仓库。

## 项目结构

```text
LanZe/
├── .github/                 # CI、Pages workflow、issue/PR 模板
├── docs/                    # 架构、开发、部署、路线图、FAQ、素材、宣发与巡检
├── public/                  # favicon、SVG/PNG 展示素材与本地演示音源/封面
├── src/
│   ├── apis/                # Axios 请求封装与业务 API 列表
│   ├── assets/              # 字体、图片、Lottie JSON
│   ├── components/          # 可复用组件
│   ├── composables/         # 会话、路由切换等组合式函数
│   ├── config/              # 运行时环境变量解析
│   ├── data/                # 本地演示诗词与演示用户
│   ├── function/            # Supabase 兼容适配器
│   ├── pages/               # 路由页面：首页/摘录、文库、茶楼、笃学、个人中心等
│   ├── router/              # Vue Router 配置（当前 hash 模式）
│   ├── services/            # 演示数据 API 与浏览器存储
│   ├── utils/               # 响应归一化、查询解析、lint 与单测
│   ├── App.vue              # 根组件
│   └── main.js              # 应用入口与全局插件
├── index.html               # Vite HTML 入口（本地 favicon 与全局样式）
├── vite.config.js           # ESM 构建配置（base './'）
├── package.json             # npm 脚本与依赖
├── README.md                # 本文件
├── docs/THIRD_PARTY_ASSETS.md # 第三方素材与外链来源清单（授权待核验）
├── CONTRIBUTING.md          # 贡献指南
├── CODE_OF_CONDUCT.md       # 行为准则
├── SECURITY.md              # 安全政策
├── CHANGELOG.md             # 变更日志
├── LICENSE                  # MIT
├── RELEASE_NOTES.md         # v0.2.0 Release notes
├── ANNOUNCEMENT.md          # GitHub Discussions 欢迎帖
└── SOCIAL_POSTS.md          # 中英文宣发短帖素材
```

`src/pages/` 下既有可用页面，也有占位页和被注释的历史实现；请以 `src/router/index.js` 的实际路由为准，不要从目录名推断线上能力。

## 演示与截图

仓库提供 `public/og-image.svg` 作为文档 hero，并提供由它渲染的 `public/og-image.png`（1200×630）作为 GitHub 社交预览候选。它们不是运行截图，也不包含真实用户数据；上传与核验步骤见 `docs/PROMOTION.md`。

本地演示建议录屏脚本：

1. `npm ci && npm run dev`，等待页面出现在浏览器。
2. 打开首页/摘录，展示内置随机诗句与切换动画。
3. 进入文库分类、搜索结果、茶楼与个人中心，展示响应式布局。
4. 在窄屏或浏览器设备模拟器中重复首页与底部导航。
5. 回到终端运行 `npm run build && npm run test`，展示可复现构建与单测。

在未实际录制、未验证托管地址之前，不要写「在线 Demo：…」。历史地址仅作为迁移背景记录。

## 部署

`npm run build` 产出静态文件 `dist/`。当前项目使用 hash history，因此不需要为每条子路由配置 history fallback；若未来切换到 history 模式，托管平台必须把未知路径回退到 `index.html`。

| 平台 | 构建命令 | 发布目录 | 关键配置 |
| --- | --- | --- | --- |
| GitHub Pages | `npm ci && npm run build` | `dist` | 使用 `.github/workflows/pages.yml` 手动 workflow；项目站点需设置正确的 `base`，不要自动部署到已失效域名 |
| Vercel | `npm run build` | `dist` | Framework: Vite；用环境变量或 rewrites 配置 `/api/`；不要沿用历史 Vercel 函数域名 |
| Netlify | `npm run build` | `dist` | Publish directory `dist`；用 redirects/proxy 指向自建 API；设置公开 `VITE_` 变量 |
| 任意静态服务器 | `npm run build` | `dist` | 用 HTTPS 托管静态文件；后端同源代理或显式配置 CORS |

完整步骤、环境变量与回滚建议见 `docs/DEPLOYMENT.md`。静态部署只发布前端；未配置 API 时会自动使用浏览器本地演示数据，不会产生跨设备账号或作品同步。

## 路线图

简要版本（完整优先级与验收标准见 `docs/ROADMAP.md`）：

- **v0.2.0（当前）**：Vite 6、本地演示数据、17 项单测、lint、README/许可证/治理文档、CI、模板、发布与宣发文案；Element Plus 按需注册、手工 vendor 分包、Lottie 动画、核心样式/图标与默认演示音源本地化。
- **v0.3.x（工程优化）**：补充浏览器端交互 E2E、完善错误/空状态、完善自定义音源回退并核验第三方素材授权。
- **v0.4.x（体验与内容）**：响应式与无障碍回归、素材授权清单、演示录屏、可选后端契约。
- **后续（社区化）**：按真实贡献推进 i18n、内容版本依据与社区讨论，不预设交付期限。

路线图是公开计划，不是交付期限或商业承诺。

## 贡献

欢迎文档、设计、前端、测试、诗词内容与开源治理方向的贡献。请先阅读：

- [贡献指南](CONTRIBUTING.md)：环境、验证清单、PR 规范
- [行为准则](CODE_OF_CONDUCT.md)：协作约定
- [安全政策](SECURITY.md)：私密报告流程与已知风险
- [开发文档](docs/DEVELOPMENT.md)：变量、QA、常见故障
- [架构文档](docs/ARCHITECTURE.md)：边界、数据流与迁移方向

最简单的一次贡献：修正一处文档与源码不一致的地方，并在 `CHANGELOG.md` 的 `Unreleased` 区留下一行。

## 许可证

本项目采用 [MIT License](LICENSE)，`Copyright (c) 2022-2026 LanZe contributors`。这不自动覆盖 `src/assets/` 内第三方字体/图片、自定义音源配置、上游 npm 包中的字体/图标或诗词文本可能适用的独立授权；二次发布与商用前请自行核查来源，详见 `docs/THIRD_PARTY_ASSETS.md` 与 `docs/FAQ.md`。

## 致谢

- 感谢 2022–2024 年间的原作者与早期贡献者留下的界面、素材、路由和 `git` 历史。
- 感谢 Vue.js、Vite、Element Plus、Axios、Lottie、APlayer 等开源项目及其维护者；默认演示音源与封面由本仓库生成，其他历史素材来源仍在核验。
- 感谢所有通过 issue、Discussion、PR、文档勘误与本地验证参与社区维护的人。
- 第三方诗词/音乐/字体服务与上游 npm 包仅按实际用途被提及，不代表其运营方或作者与本仓库有隶属或背书关系。

## English summary

LanZe (兰泽诗词) is a Chinese-language, community-maintained Vue 3 frontend for exploring classical Chinese poetry. It began in 2022 and was reorganised in 2026 around a modest goal: make the repository installable, buildable, testable, documented and easy to contribute to.

```bash
npm ci
npm run dev
npm run build
npm run test
npm run lint
npm run smoke
```

The app includes poetry excerpts, category browsing, search, a community/creation area, a personal centre and a player prototype. It uses Vite 6, built-in local demo data, 14 unit tests and a configurable API layer: `VITE_API_BASE_URL` takes priority when configured, with automatic fallback to demo data. No public demo, hosted backend, account service or commercial support is promised; historical MemFire/Vercel links should be treated as migration context only. The code is MIT-licensed to `2022-2026 LanZe contributors`; third-party assets may have separate terms. See `CONTRIBUTING.md`, `docs/DEVELOPMENT.md` and `docs/ROADMAP.md` before opening a PR.
