# 欢迎参与兰泽诗词的重新整理 👋

大家好，兰泽诗词（LanZe）是一个始于 2022 年的中文古诗词前端。`v0.2.0` 先把仓库整理成可本地安装、可复现构建、可用演示数据体验的开源项目；当前 `main` 又按「青瓷数字诗馆」目标模式重做了信息架构与视图层。这里仍然不是一个已经上线的诗词社区，也不承诺线上 Demo、托管后端或账号服务。

### 当前版本做了什么

- 用 Vue 3 自有组件重建今日展厅、诗词索引、读诗详情、我的诗卷、写作台与登录页面；移除旧 UI 套件、动画运行时和占位栏目，旧 URL 统一重定向。
- 保留一张按历史样式等比还原的白色摘录卡：竖排诗句、作者、水墨扇舟图、旋转收藏角标与悬浮高光；补上分级字号、右侧留白、键盘焦点和减少动效规则。
- 摘录卡接入可配置诗句源，失败、超时、重复或空内容会回退仓库内置摘录并标注来源；`VITE_POETRY_SOURCE=false` 可完全关闭外部请求。
- 播放器成为可收起的吸底控件，默认只加载仓库自制 WAV / SVG 资源；无效配置、不可达 URL 或播放失败都有可读状态，不会让业务页面白屏。
- 移除约 27 MB 未引用历史素材，换为 WOFF2 子集和压缩展品图；显式声明尺寸、固定诗笺高度、限制通知数量并以 CLS 预算约束布局抖动。
- 保留 27 项 `node --test` 单测和 `npm run lint`；新增独立 Browser E2E workflow，由 CI 安装 Chromium 后验证桌面/窄屏、摘录卡、搜索、收藏、吸底播放器、演示登录、作品发布、控制台/网络错误与布局位移。
- 同步 README、设计系统、架构/开发/部署/FAQ/路线图、贡献与安全文档；`docs/THIRD_PARTY_ASSETS.md` 记录当前二进制 SHA-256，但明确哈希不是授权证明。
- 重绘 `public/og-image.svg` / `public/og-image.png` 作为当前设计的衍生展示插画，不是运行截图。

### 先从本地开始

```bash
git clone https://github.com/2648782102/LanZe.git
cd LanZe
npm ci
npm run dev
```

建议 Node.js 20 或 22。默认无需配置即可使用仓库内演示数据；可使用演示账号 `demo / lanze2026` 体验登录、资料与作品发布。验证构建与检查：

```bash
npm run build
npm run test
npm run lint
npm run smoke
npm run smoke:browser
```

`npm run smoke:browser` 需要本机 Chrome / Chromium；CI 会自动安装。演示账号和作品只保存在当前浏览器 `localStorage` / Cookie，**不是真实账号服务**，请不要输入真实密码。

### 想参与，可以从哪里开始

1. **文档勘误**：发现 README / docs 与源码不一致，开一个 `Docs` issue 或直接提最小 PR。
2. **本地复现**：用 Node 20/22 跑完整命令，报告不同浏览器或系统上的可复现差异。
3. **演示数据 / API 契约**：讨论 `VITE_USE_MOCK`、`VITE_API_BASE_URL`、错误态与真实 API 的兼容边界。
4. **工程优化**：补跨浏览器/视觉回归、真实后端契约、可访问性审计或更细的性能基线；不要为了改而改视觉。
5. **素材与内容**：按 `docs/THIRD_PARTY_ASSETS.md` 核查字体、图片、favicon、诗词文本、历史 Lottie 来源与授权；无法确认时提出最小替换方案。
6. **体验改进**：响应式、键盘焦点、空状态、加载失败提示；优先小而可验证的改动。

3 个 `good first issue` / `help wanted` 入口已按当前状态整理：#2 演示 API 边界、#3 浏览器回归与跨浏览器/视觉扩展、#4 素材授权核验。它们不设增长目标，也不把新人当作免费劳动力。

请先看：

- https://github.com/2648782102/LanZe/blob/main/CONTRIBUTING.md
- https://github.com/2648782102/LanZe/blob/main/docs/DESIGN_SYSTEM.md
- https://github.com/2648782102/LanZe/blob/main/docs/ROADMAP.md
- https://github.com/2648782102/LanZe/blob/main/docs/THIRD_PARTY_ASSETS.md

如果不确定提案是否合适，欢迎在本帖下用一两句话说明目标与约束；可执行的讨论会尽量整理成 issue。

### 几个边界

- 这是社区维护项目，不承诺固定响应时间、商业支持或线上 SLA。
- 不刷 star、不虚构用户数据、不把历史失效演示站写成「官方 Demo」。
- 浏览器里的 `VITE_` 变量不是秘密；服务端密钥、私人 token、真实用户数据不要提交，也不要贴在 Discussion。
- 安全问题请使用 GitHub 私密漏洞报告入口或按 [安全政策](SECURITY.md) 沟通，不要在公开帖贴 PoC。
- 对第三方内容保持来源意识：MIT 覆盖本仓库贡献者提供的代码/文档，不自动覆盖外链或外部素材。

### 接下来

路线图的近期重点是跨浏览器/视觉回归、素材授权核验、可选后端契约和内容版本依据。具体进展以 `CHANGELOG.md`、PR 和 Release 为准；仓库自有 GitHub 渠道发布前会核对实际状态，不进行付费推广或外部社区群发。

谢谢每一位愿意把旧项目重新打开的人。愿卷帙常新，也愿讨论保持耐心与清晰。
