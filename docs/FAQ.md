# 常见问题

## 项目与定位

### 兰泽诗词是什么？

一个始于 2022 年的中文古诗词前端项目。当前仓库由 Vue 3、Vue Router、自有组件、Vite 6 与原生浏览器 API 组成，包含今日展厅、诗词索引、读诗详情、我的诗卷、写作台与登录等界面。2026 年已补齐本地演示数据、单测、lint、治理文档、CI 与发布素材，目标是让它可复现、可贡献、可逐步替换数据源。

### 这是一个完整的诗词社区产品吗？

不是。仓库不附带经维护者验证的线上服务、账号系统、数据库、内容审核或运营支持。登录、搜索结果、作品发布、用户头像等能力默认使用浏览器本地演示数据，也可配置 `VITE_API_BASE_URL` 连接自建 API；请把它当作一个本地可运行的前端与开源协作对象。

### README 为什么没有「完整线上 Demo」？

旧 README 写过 `http://app.memfiredb.com/caqm0ri5g6h17oismvp0/`，代码里也散落过 MemFire/Vercel 域名。治理时无法验证它们仍可用，且与当前仓库代码是否一致也不清楚，因此删除了旧「项目展示地址」承诺。当前 GitHub Website 指向已验证的 GitHub Pages 静态预览 `https://2648782102.github.io/LanZe/`；它只发布前端、静态馆藏与本地声景，不提供账号、数据库、内容审核或维护者 SLA，所以 README 不把它写成完整线上 Demo。若未来有维护者明确托管后端并验证，需要同时记录托管者、commit、部署方式与回滚步骤。

### 为什么历史提交里写着 `1.0`、`2.0.0`，但 Release 叫 v0.2.0？

`git log` 中的 `1.0版本`、`2.0.0` 等是 2022 年开发提交信息；v0.2.0 之前仓库没有对应 Git tag 或 GitHub Release。v0.2.0 是 2026 年这轮「工程现代化 + 治理 + 文档 + CI」的可追溯发布编号，不代表功能倒退。详细的提交归纳见 `CHANGELOG.md`。

## 安装与运行

### 需要哪个 Node 版本？

建议 Node.js 20 或 22，与 `.github/workflows/ci.yml` 一致。当前 Vite 6 已在这两个版本及本地 Node 24 上完成构建与测试验证。

### 为什么是 `npm ci` 而不是 `npm install`？

仓库有 `package-lock.json`。`npm ci` 从锁文件做干净、可复现安装，是本地与 CI 的共同基线。若锁文件和 `package.json` 不一致，请一起修复，不要只提交其中一个。

### `npm run dev` 后打开哪个地址？

以终端输出为准。当前默认 `http://127.0.0.1:5173/`，端口被占用时 Vite 会分配其他端口。页面使用 hash 路由，例如 `http://127.0.0.1:5173/#/`、`http://127.0.0.1:5173/#/explore`。

### 测试与 lint 怎么运行？

`npm run test` 执行 39 个 `node --test` 单测，`npm run lint` 执行静态扫描。Node 20/22 build job 使用 `npm run test --if-present` 以兼容外部旧流程，Documentation checks job 执行 `npm run lint`；独立 Browser E2E workflow 安装 Chromium 并运行 `npm run smoke:browser`。

### 首次启动遇到 esbuild 二进制错误？

检查安装时是否用了 `--ignore-scripts`；Vite 6 的 esbuild 依赖安装脚本负责放置平台二进制。可按实际错误运行 `npm rebuild esbuild`。更多排查见 `docs/DEVELOPMENT.md`。

## 数据与功能

### 搜索/登录/文库没有配置后端时还能用吗？

可以。未配置 `VITE_API_BASE_URL` 时会自动使用 `src/data/` 与 `src/services/mockApi.js` 的本地演示数据；`VITE_USE_MOCK=true` 可显式强制演示模式。配置自建 API 后优先请求远端，失败或返回无效数据时自动降级。

### `VITE_API_BASE_URL` 和 `VITE_USE_MOCK` 是怎么配合的？

`src/config/runtime.js` 统一解析它们：未配置 API 时 `useMock` 默认为 `true`；配置 API 且 `VITE_USE_MOCK=false` 时 `src/apis/request.js` 请求远端；远端失败会自动回到演示数据。其余变量见 `.env.example`。

### 当前版本还连接 Supabase 吗？

不连接。运行时登录、资料与发布默认全部走浏览器本地演示数据；历史 Supabase 适配器与 SDK 依赖已删除。若要接入真实后端，请通过 `VITE_API_BASE_URL` 配置同源反向代理，并在服务端管理凭据。任何 `service_role`、数据库口令或私人 token 都绝不能加 `VITE_` 前缀或提交到仓库。详见 `SECURITY.md`。

### 诗句、音乐或图标为什么有时不显示？

业务诗库由 22 首精校短章与 `public/data/poetry/` 的 16 个 MIT 授权分卷组成，共 9,350 篇，按朝代、体裁与字句在浏览器内检索；分卷按需加载，不请求外部诗词 API。语料附带 `SHA256SUMS.txt`、`manifest.json` 与上游许可证，CI、静态冒烟和单测会核对分卷数量、条目数与文件哈希。默认声景与封面来自 `public/media/` 的三段 CC BY 3.0 古筝节选及原创 SVG，由 `npm run audio:generate` 裁切生成并按 SHA-256 校验，署名见 `public/media/AUDIO_CREDITS.md`；图标由仓库内 SVG 组件绘制。首页历史摘录卡默认只用内置摘录与精校馆藏短句，不请求外部服务；显式设置 `VITE_POETRY_SOURCE=remote` 后才使用 `VITE_POETRY_SOURCE_URL`，失败、超时或返回空内容时回退并显示来源状态。只有显式配置 `VITE_AUDIO_SOURCE=custom` 时，自定义音源才可能受网络、CORS、地区限制、防盗链或服务变更影响，且不在本仓库控制范围内；无效 JSON 或空列表会回退本地声景并显示提示，URL 不可达或播放失败时播放器显示「声景不可达」并允许重试。首页摘录卡的随机句接口是可选增强，不是业务诗库；CI 不依赖外部服务。

### 能把早期版本那几首网易云音乐下载下来放进项目吗？

不建议，也不能作为默认或随仓库分发。早期 `src/pages/Audio.vue` 引用的是 `music.163.com` / `music.126.net` 外链，指向商业平台录音；仓库从未持有这些音频的授权，下载后提交会引入版权与分发风险，外链本身也带签名、会失效（其中两首现已 404）。如果只想在本机听自己合法取得的文件，可把它们放进 `public/media/private/`，运行 `npm run audio:private`；该目录与 `.env.local.audio` 均被 `.gitignore` 忽略，不进入 Git、不改变默认曲库、不部署到 Pages。公开部署或提交到仓库的音频，仍须使用授权清晰的素材并按 `docs/THIRD_PARTY_ASSETS.md` 记录署名。

### 收藏、登录态、个人资料会保存吗？

收藏、最近阅读、写作草稿、演示登录资料与发布作品会写入当前浏览器 `localStorage`，会话对象写入 Cookie。它们只用于本地演示，不是线上账号服务或跨设备持久化。不要输入真实密码或个人信息；演示账号为 `demo / lanze2026`。

## 部署与 GitHub 展示

### 可以部署到 GitHub Pages / Vercel / Netlify 吗？

可以部署 `npm run build` 的静态产物。当前 hash 路由不需要 history fallback；若未来切换 history 模式则需配置 `index.html` rewrite。`vite.config.js` 使用相对 `base: './'`，适合 GitHub Pages 项目站点。本仓库已启用 GitHub Actions 来源并实测 `https://2648782102.github.io/LanZe/` 的入口资源；Pages workflow 仍是手动触发，不会自动发布到旧域名。步骤见 `docs/DEPLOYMENT.md`。

### 为什么 CI 用 `npm run test --if-present`？

`--if-present` 是兼容旧工作流的兜底写法；当前 `package.json` 已定义 `test` 脚本，所以 CI 会实际执行 41 个单测，不假定任何模块格式或测试框架；静态扫描由 Documentation checks job 执行。

### 仓库 About、topics、Release、Discussion 在哪里维护？

GitHub About 描述、Website 与 topics 在仓库首页的 About 面板维护；当前描述与 Pages Website 已通过公开 API 回读。`v0.2.0` / `v0.3.0` 是历史 Release，`v0.4.0` 的发布说明与仓库内欢迎帖文案分别位于 `RELEASE_NOTES.md`、`ANNOUNCEMENT.md`，发布与展示清单见 `docs/PROMOTION.md`。在线 Discussion #1 已按 `ANNOUNCEMENT.md` 更新并经公开 API 回读；发布 workflow 默认令牌仍可能无法更新既有正文，Actions success 不等于正文已同步。后续展示变更以仓库页面/公开 API、`CHANGELOG.md` 和维护日志为准，不回写已发布 Release 快照。

## 许可与内容

### 项目使用什么许可证？

MIT，见 `LICENSE`：`Copyright (c) 2022-2026 LanZe contributors`。与 README 保持一致。

### 字体、图片、音乐和诗词文本也是 MIT 吗？

不一定。MIT 覆盖本仓库贡献者提供的代码与文档；`src/assets/` 中的 WOFF2 字体子集与压缩展品图派生自历史素材，上游 npm 包内的资源、自定义音源配置和精校短章也可能有独立授权。`public/media/` 的默认声景/封面节选自 Antti Luode 的 CC BY 3.0 古筝录音，署名见 `public/media/AUDIO_CREDITS.md`；`public/data/poetry/` 的馆藏分卷来自 `chinese-poetry/chinese-poetry` 的 MIT 授权选段，已固定提交并随附上游许可证，但诗词底本与校勘仍需按用途核对。二次发布、商用或重新分发前，仍需逐项核查其余素材来源与许可，不清楚的素材应替换或移除。贡献指南也要求新增素材时说明来源。

### 可以提交真实诗词语料吗？

先确认版权状态、来源、许可、篇幅与署名要求。公版古籍文本也不等于所有点校、注释、排版或数字化版本都可自由使用。建议先开 issue 说明数据来源，并提交可审计的小规模示例或生成规则。

## 参与贡献

### 不会写代码可以参与吗？

可以。文档勘误、术语统一、演示录屏脚本、可访问性检查、素材授权整理、FAQ 补充、中英文文案校对都很需要。请从 `CONTRIBUTING.md` 的验证清单开始，哪怕是修正一个失效链接也有价值。

### 发现安全问题怎么报告？

优先使用 GitHub 私密漏洞报告入口；不要在公开 issue 粘贴 PoC、真实凭据或用户数据。完整流程见 `SECURITY.md`。

### 我想改 `package.json` / `src/**`，可以吗？

可以，但请先开 issue 或在 PR 说明目标与验证范围，并同步 README、CI、开发文档与变更日志。跨源码与文档的改动尤其需要一起核对；最终以 `main` 分支为准。
