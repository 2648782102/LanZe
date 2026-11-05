# 欢迎参与兰泽诗词的重新整理 👋

大家好，兰泽诗词（LanZe）是一个始于 2022 年的中文古诗词前端：摘录、文库、搜索、茶楼创作、笃学、个人中心与音乐播放界面，由 Vue 3 + Vite + Element Plus 构建。过去一段时间仓库停在 2024 年的最后一次提交，README 里还留着已无法验证的历史托管/演示地址。

`v0.2.0` 从「让仓库重新变得清楚、可复现、可参与」开始，而不是先承诺一个线上产品。

### 这一轮做了什么

- 升级到 Vite 6，补齐 `build` / `preview` / `test` / `lint` 脚本，新增 23 个单测和静态检查。
- 重写 README，补齐 MIT 许可、贡献指南、行为准则、安全政策、变更日志、架构/开发/部署/路线图/FAQ 文档。
- 增加 issue/PR 模板、Node 20/22 CI 与手动 GitHub Pages workflow。
- 实现本地演示数据层：不配置后端也能体验摘录、分类文库、搜索、登录、注册、改密、个人资料与作品发布；远端 API 不可用时会自动降级。
- 清理历史硬编码的 Supabase 配置，修复若干运行时错误，补充 `lang="zh-CN"` 与关键交互无障碍标签。
- Element Plus 改为按需注册并按 Vue / Element / data / Lottie 手工分包；Lottie 动画 JSON 改为仓库本地文件，移除两套重复运行时。
- 新增 `npm run smoke`：启动预览服务并检查首页与入口静态资源，已接入 Node 20/22 CI。
- 新增可选的 `npm run smoke:browser`：在本机 Chrome 独立 profile 中检查首页/文库、桌面与窄屏搜索、窄屏导航、演示登录滑块验证、作品发布与作品页回读；不把本机可选冒烟写成 CI 强制或跨浏览器 E2E。
- 新增第三方素材与外链来源清单，明确授权仍待核验；不把下载或本地化行为写成已获得许可。
- Bootstrap 与 Font Awesome 改为锁定版本的本地依赖，移除未使用的 Bootstrap/Popper JS 外链；构建冒烟会检查本地图标字体并拒绝旧 CDN。
- 音乐播放器默认加载仓库自制的本地演示音源与封面，不再默认访问第三方音乐平台；自定义音源需要显式配置并自行核验授权。
- 发布 v0.2.0 Release notes 和中英文宣发短帖草稿；外部社区宣发仍以真实、克制、可复核为前提。

### 先从本地开始

```bash
git clone https://github.com/2648782102/LanZe.git
cd LanZe
npm ci
npm run dev
```

建议 Node.js 20 或 22。默认无需配置即可使用仓库内演示数据；可使用演示账号 `demo / lanze2026` 体验登录、资料与作品发布。验证构建与测试：

```bash
npm run build
npm run test
npm run lint
npm run smoke
```

**当前不承诺线上 Demo，也不附带托管后端或账号服务**；旧 README 中的 MemFire 地址与代码里的历史 Vercel 链接仅作为迁移背景。演示账号和作品只保存在当前浏览器 `localStorage`，不是真实账号服务，请不要输入真实密码。

### 想参与，可以从哪里开始

1. **文档勘误**：发现 README / docs 与源码不一致，开一个 `Docs` issue 或直接提最小 PR。
2. **本地复现**：用 Node 20/22 跑一遍 `npm ci && npm run build && npm run test && npm run lint && npm run smoke`，报告环境差异。
3. **演示数据 / API 契约**：讨论 `VITE_USE_MOCK`、`VITE_API_BASE_URL`、错误态与真实 API 的兼容边界。
4. **工程优化**：为大包建立长期按需加载策略、完善不可达自定义音源的状态，并补充端到端交互测试。
5. **素材与内容**：按 `docs/THIRD_PARTY_ASSETS.md` 核查字体、图片、诗词文本、Lottie 与自定义音源的来源和授权。
6. **体验改进**：响应式、无障碍、空状态、加载失败提示；优先小而可验证的改动。

请先看贡献指南和路线图：

- https://github.com/2648782102/LanZe/blob/main/CONTRIBUTING.md
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

路线图的近期重点是把可选本机冒烟进一步沉淀为 CI 可复现的浏览器 E2E、完成第三方素材授权核验、补强不可达自定义音源的状态与可选后端契约。具体进展以 `CHANGELOG.md`、PR 和 Release 为准。若你希望看到某个方向，欢迎在评论里写下「想解决的问题 + 最小验收标准」。

谢谢每一位愿意把旧项目重新打开的人。愿卷帙常新，也愿讨论保持耐心与清晰。
