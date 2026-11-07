# 兰泽诗词 v0.3.0 · 青瓷数字诗馆

> 候选发布文案：只描述已合并到 `main`、经本地与 CI 验证的内容。`v0.2.0` 仍是独立的历史 Release，不被本次文案覆盖。

兰泽诗词是一个始于 2022 年的中文古诗词前端。`v0.3.0` 不是线上社区上线公告，而是把界面和信息架构重新整理为一间可本地运行的「青瓷数字诗馆」：先安静读完一首诗，再进入索引、收藏、创作与本地演示音源。后端、账号与线上 Demo 仍不属于本仓库承诺。

### Highlights

- 🏛 **完全重构界面**：用 Vue 3 自有组件替换旧 UI 套件与占位页面，收敛为今日展厅、诗词索引、读诗详情、我的诗卷、写作台、登录/注册六类页面；旧 URL 保留兼容重定向。
- 📜 **保留历史摘录卡**：按旧版白卡比例恢复单张竖排摘录卡、水墨扇舟图、旋转收藏角标与悬浮高光；增加分级字号、键盘焦点、低饱和收藏态、右侧留白和减少动效规则。
- 🔄 **可复核的诗句源**：首页摘录卡从 `VITE_POETRY_SOURCE_URL` 加载随机诗句，重复、空内容、超时或失败时回退内置摘录并显示来源状态；`VITE_POETRY_SOURCE=false` 可完全离线运行。
- 🎵 **吸底播放器与错误态**：原生 `<audio>` 默认加载仓库自制 WAV / SVG 资源，保持固定定位并可收起；无效自定义配置回退并提示，URL 不可达或播放失败时显示「音源不可达」并允许重试。
- ⚡ **性能与布局稳定性**：移除约 27 MB 未引用历史素材，改用 WOFF2 字体子集和按展示尺寸压缩的图片；声明字体度量/图片尺寸、固定诗笺高度、限制通知数量、移除悬浮层 `backdrop-filter`，浏览器冒烟以 CLS 0.05 为预算。
- 🧪 **27 项单测**：`node --test` 覆盖运行配置、音频播放列表、诗句源配置与回退、浏览器冒烟数据、演示 API 边界、响应归一化和查询解析，不依赖真实后端或外部网络。
- 🤖 **CI Browser E2E**：Node 20/22 CI 继续验证构建、单测、lint 与静态资源；独立 `Browser E2E` workflow 安装 Chromium，并用 CDP 在桌面/窄屏验证摘录卡、搜索、收藏、吸底音源、演示登录、作品发布、控制台/网络错误和布局位移。
- 📚 **文档与素材证据**：README、架构/开发/部署/设计/FAQ/路线图、贡献与安全文档同步到当前实现；`docs/THIRD_PARTY_ASSETS.md` 补当前二进制 SHA-256。哈希是身份证据，不代表第三方素材授权已核验。
- 🖼 重绘 `public/og-image.svg` 与 1200×630 `public/og-image.png`；两张图是当前设计的衍生插画，不是运行截图，也不是线上 Demo 证明。

### 本地运行

```bash
git clone https://github.com/2648782102/LanZe.git
cd LanZe
npm ci
npm run dev
```

建议 Node.js 20 或 22。默认无需配置即可使用仓库内演示数据；演示账号为 `demo / lanze2026`。演示账号、收藏和作品只保存在当前浏览器的 `localStorage` / Cookie，不是真实账号服务。

```bash
npm run build
npm run test
npm run lint
npm run smoke
npm run smoke:browser
```

`npm run smoke:browser` 需要本机 Chrome / Chromium；CI 的 Browser E2E workflow 会自动安装。Linux 或自定义安装路径可设置 `CHROME_PATH`。

### 环境变量

所有 `VITE_` 变量都会进入浏览器产物，只能放公开配置。业务 API 与首页诗句源分别由 `VITE_API_BASE_URL` / `VITE_USE_MOCK` 和 `VITE_POETRY_SOURCE*` 控制；默认播放器只使用仓库内资源，`VITE_AUDIO_SOURCE=custom` 才会读取 `VITE_AUDIO_TRACKS`。完整表格见 `README.md`、`.env.example` 与 `docs/DEPLOYMENT.md`。

### 文档入口

- README：https://github.com/2648782102/LanZe/blob/main/README.md
- 设计系统：https://github.com/2648782102/LanZe/blob/main/docs/DESIGN_SYSTEM.md
- 开发与部署：https://github.com/2648782102/LanZe/tree/main/docs
- 素材清单：https://github.com/2648782102/LanZe/blob/main/docs/THIRD_PARTY_ASSETS.md
- 变更日志：https://github.com/2648782102/LanZe/blob/main/CHANGELOG.md

### 已知限制

- 当前不提供经维护者验证的线上 Demo、托管后端或账号服务；静态部署只发布前端。
- 演示状态仅保存在当前浏览器，不提供真实密码安全、跨设备同步或内容审核。
- Browser E2E 当前覆盖 Chromium 的关键演示链路；跨浏览器矩阵、视觉截图回归、真实后端契约与完整无障碍审计仍属后续事项。
- 首页默认诗句源和可选自定义音源是外部服务/配置，本仓库不托管、不承诺 SLA；可分别关闭或替换。
- 历史字体、图片、favicon 与诗词文本的来源和授权仍需逐项核验；MIT 不自动覆盖第三方素材，`docs/THIRD_PARTY_ASSETS.md` 中的 SHA-256 不是许可证明。
- GitHub 展示中的失效 homepage、Pages 与社交预览若尚未完成线上回读，不把候选文案写成部署事实。

### 致谢

感谢 2022–2024 年原作者与早期贡献者留下的界面、素材和 Git 历史，感谢 Vue / Vite / Axios 等上游项目，以及参与文档、CI、视觉与本地验证的人。第三方诗词、字体、图片与音源服务不构成对本项目的背书。
