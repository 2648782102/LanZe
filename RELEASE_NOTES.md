# 兰泽诗词 v0.4.0 · 离线馆藏与声景曲库

> 发布文案只描述已合并到 `main`、经本地与 CI 验证的内容。`v0.2.0` 与 `v0.3.0` 是独立历史 Release，不被本说明覆盖。

`v0.4.0` 继续延续「青瓷数字诗馆」的设计契约：把内容、阅读体验和默认媒体都收回仓库内，让 `npm ci && npm run dev` 不依赖外部诗词接口、第三方音乐平台或线上账号服务。它仍不是线上社区上线公告。

### Highlights

- 📚 **离线馆藏**：用固定上游提交的 MIT 授权选段重建业务诗库，16 个静态分卷、9,328 篇语料与 22 首精校短章合计 9,350 篇；按朝代/体裁双轴筛选、关键词检索、分页和来源标注。分卷按需加载，首包 JS 从约 4.6 MB 降至 35 KB。
- 📜 **本地摘录**：首页单张历史白色摘录卡保留原有构图，默认交替使用内置摘录与精校馆藏短句；只有显式设置 `VITE_POETRY_SOURCE=remote` 才请求可选随机句接口，失败时回退并标注来源。
- 📱 **移动端走查**：在 320–1440px 复核六类页面；窄屏筛选面板可折叠，写作台支持访客预览与本机草稿，吸底播放器默认收起并与底部导航分层。固定层避让、焦点态、安全区与 `dvh` 视口规则同步收敛，浏览器冒烟断言零横向溢出与 CLS 预算。
- 🎵 **三段声景曲库**：`npm run audio:generate` 确定性生成「空山 · 松风」「月色 · 瓷盏」「晚舟 · 水纹」三段 24 秒 PCM WAV、原创 SVG 封面、清单与 SHA-256；`npm run audio:verify` 校验格式、时长和哈希。播放器提供封面、播放列表、切轨、自动续播、进度拖动、音量/静音、错误重试与本机偏好记忆。
- 🔒 **默认离线**：业务诗库、摘录卡与默认播放器都不请求第三方服务；自定义音源和远程诗句源必须显式启用，授权、可用性与隐私边界由配置者负责。
- 🧪 **39 项单测**：覆盖离线馆藏、曲库校验、演示 API 边界、诗句源配置/回退、运行时配置与响应归一化；Node 20/22 CI、静态冒烟与独立 Chromium Browser E2E 共同验证主要演示链路。
- 🧰 **工程约束**：`package.json` 明确 Node `>=20` / npm `>=10`，CI 拒绝旧 UI 套件、旧演示音文件、第三方音乐域和过期发布措辞回归。
- 📝 **文档与展示**：README、架构/开发/部署/设计/FAQ/路线图、发布说明、欢迎帖与宣发草稿按当前实现同步；素材哈希继续作为身份证据，不冒充授权证明。

### 本地运行

```bash
git clone https://github.com/2648782102/LanZe.git
cd LanZe
npm ci
npm run dev
```

建议 Node.js 20 或 22、npm 10 或更高。默认无需配置即可使用离线馆藏和演示数据；演示账号为 `demo / lanze2026`。演示账号、收藏、作品与播放器偏好只保存在当前浏览器 `localStorage` / Cookie，不是真实账号服务。

```bash
npm run build
npm run test
npm run lint
npm run audio:verify
npm run smoke
npm run smoke:browser
```

`npm run smoke:browser` 需要本机 Chrome / Chromium；CI 的 Browser E2E workflow 会自动安装。Linux 或自定义安装路径可设置 `CHROME_PATH`。

### 环境变量

所有 `VITE_` 变量都会进入浏览器产物，只能放公开配置：

- `VITE_API_BASE_URL` / `VITE_USE_MOCK`：可选自建业务 API 与演示数据开关。
- `VITE_POETRY_SOURCE` / `VITE_POETRY_SOURCE_URL`：默认 `local`，显式设为 `remote` 才会请求可选随机句接口。
- `VITE_AUDIO_SOURCE` / `VITE_AUDIO_TRACKS`：默认使用仓库内三段声景；只有 `custom` 且 JSON 有效时才加载配置者提供的音轨。

完整表格见 `README.md`、`.env.example` 与 `docs/DEPLOYMENT.md`。

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
- 历史字体、图片、favicon、诗词底本/校勘与可选第三方内容服务的来源和授权仍需逐项核验；MIT 不自动覆盖第三方素材，`docs/THIRD_PARTY_ASSETS.md` 中的 SHA-256 不是许可证明。
- GitHub 展示中的 Pages、社交预览与在线 Discussion #1 正文仍按实际写权限核对；本说明不把它们写成部署或同步事实。

### 致谢

感谢 2022–2024 年原作者与早期贡献者留下的界面、素材和 Git 历史，感谢 Vue / Vite / Axios 与 `chinese-poetry` 上游项目，以及参与文档、CI、视觉与本地验证的人。第三方诗词、字体、图片与可选内容服务不构成对本项目的背书。
