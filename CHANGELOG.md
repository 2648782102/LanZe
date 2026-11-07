# 变更日志

本文件按「待发布 → 历史里程碑」组织，历史部分依据仓库 `git log` 归纳，并非逐条完整提交记录。历史基线停在 42 次提交，首个提交为 `74b4186`（2022-06-03），最后一段历史基线提交为 `b4ea7f4`（2024-08-18）；v0.2.0 之前没有 Git tag 或已发布 Release。历史提交信息中的 `1.0`、`1.1`、`2.0.0` 是开发标记，不代表本仓库存在对应正式发行版。

## [Unreleased]

> 记录 `v0.3.0` 之后、尚未发布的改动。

### Changed

- GitHub 仓库 About 已更新为「青瓷数字诗馆」描述，移除无关的 `element-plus` topic，清空失效 Vercel homepage，并补上 `static-site`、`design-system`、`github-actions`；已通过公开 API 回读确认。

## [v0.3.0] — 2026-11-07（已发布）

> 本段汇总 `v0.2.0` 之后合并到 `main` 的视图重构、体验完善与工程验证；`v0.3.0` 已打 tag 并发布 Release，CI、Browser E2E 与本地验证均通过。`v0.2.0` 仍是独立历史 Release。

### Added — CI Browser E2E 与音源错误态

- 新增 `.github/workflows/browser-e2e.yml`：在 Ubuntu / Node 22 安装 Chromium，通过 `browser-actions/setup-chrome@v2` 的 `chrome-path` 输出设置 `CHROME_PATH`，构建后执行 `npm run smoke:browser`；Documentation checks 同步把该文件列为必检 workflow。
- `scripts/smoke.browser.mjs` 支持 `CHROME_PATH`、Linux Chromium 常见路径和 `--no-sandbox`，并断言吸底播放器状态的 `role="status"` 与初始文案；同一脚本保留桌面/窄屏、诗句源拦截、收藏、登录、发布、控制台/网络错误与 CLS 预算检查。
- `src/components/AudioDock.vue` 为不可达自定义音源或播放失败增加「音源不可达」状态、错误描边和重试入口；加载成功后自动恢复状态，不阻断业务页面。

### Changed — 青瓷数字诗馆：完全重构

- 确立并写入 [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) 的目标模式：冷白瓷面、青灰线框、铜金索引色，以及「一首诗一展厅」的信息架构；明确拒绝三折经卷、通用卡片矩阵、轮播、暖纸朱印与伪造社区数据。
- 视图层重建为六类页面：今日展厅、诗词索引、读诗详情、我的诗卷、写作台、登录/注册；旧 URL 统一重定向，不再保留 36 个旧 `.vue` 页面与占位栏目。
- 新增 `src/views/`、`src/components/` 中的自有壳层、图标、列表行、通知、响应式导航与原生音频控件；新增 `src/styles/base.css` 作为唯一设计 token 与基础样式入口。
- 移除旧 UI 套件、动画运行时、APlayer、滑块验证码与 Nanoid 的界面依赖；播放器改为原生 `<audio>`，反馈改为自有通知组件。
- 重构核心交互：整首读诗、按长度分行的词牌标题、朗读、收藏持久化、最近阅读、体裁/关键词检索、资料编辑、草稿自动保存、实时作品预览与发布。
- 扩充本地演示诗目到 22 首；`useLibrary` 统一管理诗目、收藏、最近阅读与 URL 查询状态。
- `scripts/smoke.browser.mjs` 改为按新语义 DOM 验证今日展厅、本地收藏、桌面/窄屏搜索、原生音源、登录与作品发布；补充步骤化报错和 `localStorage` 访问保护。
- 运行时改为按可见字符生成的 WOFF2 宋体子集，展品图与登录封面按实际展示尺寸缩放压缩；声明字体度量覆盖与图片尺寸，避免 14 MB 历史字体和大图进入产物或造成替换抖动。Vite vendor 分包同步收敛为 Vue / data 两类。
- 重绘 `public/og-image.svg` 并按青瓷展厅视觉渲染 `public/og-image.png`（1200×630）；同步 README、架构/开发/FAQ/宣发/素材清单与贡献入口。展示图是当前设计的衍生插画，不是运行截图；保留 27 项单测与 CI/冒烟入口，不宣称新增后端或线上服务。
- 收敛首屏性能与布局稳定性：移除悬浮层 `backdrop-filter`、简化路由过渡与换诗动效、固定诗笺最小高度、给图片声明宽高、限制通知数量，并清理每次请求都提前构造本地兜底数据的无用开销。
- CI 改为拒绝旧 UI 套件回归，并校验 WOFF2 子集、压缩展品图与现有音频组件路径；不再要求已移除的 Bootstrap/Font Awesome 依赖和 `src/pages/Audio.vue`。
- 移除约 27 MB 未被当前源码引用的历史 TTF、JPG、PNG、WebP 与旧 logo；`src/assets/` 运行时素材收缩为 WOFF2 子集与两张压缩展品图，历史来源仍可由 Git 追溯。
- 修复应用壳层全局 `position: relative` 覆盖固定定位的问题：页头、播放器、移动导航与通知层恢复 `sticky` / `fixed`；播放器成为可收起的吸底控件，浏览器冒烟增加视口内固定定位断言。
- 按历史提交 `45b1308` 的白色诗词摘录卡恢复首页余韵区：只保留一张卡片，等比沿用白色窄卡、旋转「收藏」角标、竖排诗句/作者、水墨扇舟图与悬浮高光；历史 `piaoYiSong` / `hongLei` 字体与 `fanzou.png` 经过 WOFF2 子集化和展示尺寸压缩，不重新引入旧 TTF、旧 UI 套件或三卡行。浏览器冒烟改为校验单卡竖排、图片尺寸、收藏持久化与换句交互，设计契约同步记录这一明确例外。
- 修复首页摘录卡只读固定 `demoExcerpts`、换句几乎不变且不走任何诗句源的问题：新增可配置的 `src/services/poetrySource.js`，默认请求历史同款随机古诗词接口，记录来源状态；超时、失败、空数据、重复诗句或显式 `VITE_POETRY_SOURCE=false` 时回退内置摘录并提示。摘录收藏按内容持久化，浏览器冒烟拦截诗句源并验证异步收敛、换句与来源状态；CI/构建/单测仍不依赖外部网络。
- 细化历史摘录卡视觉：保持白卡比例、单卡构图、竖排诗句与水墨扇舟图不变，为长诗句增加分级字号和字距，收敛旋转角标的裁切感、悬浮高光与整块亮红收藏态，并补上键盘焦点、低饱和朱砂收藏态和减少动效规则。
- 按截图复核继续增加历史摘录卡左右内边距：诗句右缘与扇舟图右缘都向卡内收，浏览器冒烟增加右侧留白下限断言，避免长诗句重新贴边。

### Changed — 文档、发布素材与素材证据

- README、贡献/安全政策、架构/开发/部署/FAQ/路线图/素材清单同步为当前 27 项单测、自有组件、可配置诗句源、CI Browser E2E、不可达音源状态与 v0.3.0 发布说明；不把静态部署写成已验证线上 Demo。
- `RELEASE_NOTES.md`、`ANNOUNCEMENT.md`、`SOCIAL_POSTS.md` 重写为当前设计、验证边界和后续贡献入口；`SOCIAL_POSTS.md` 仍是草稿，不自动群发，不含增长数字或付费推广。
- `.github/workflows/publish.yml` 改由 `v0.3.0` tag push 触发，Release 标题与 checkout ref 跟随真实 tag；不覆盖 `v0.2.0` 历史 Release。
- `docs/THIRD_PARTY_ASSETS.md` 补当前 WOFF2 子集、压缩展品图、摘录卡字体/图片、自制媒体、展示图与 favicon 的 SHA-256；明确哈希只是身份证据，授权仍未核验。

### Known limitations

- 当前不提供经维护者验证的线上 Demo、托管后端或账号服务；默认演示状态只保存在当前浏览器。
- CI Browser E2E 只覆盖 Chromium 关键链路；跨浏览器矩阵、视觉截图回归、真实后端契约与完整无障碍审计仍是后续事项。
- 历史字体、图片、favicon、诗词文本与首页第三方诗句源的来源/授权仍需逐项核验；MIT 不自动覆盖第三方素材。
- GitHub 展示中的失效 homepage、未启用 Pages、社交预览与在线欢迎帖正文仍需按实际写权限核对，不在仓库文档里伪造完成状态。

## [v0.2.0] — 2026-11-06

> 本版本把 2024 年代码基线升级为可本地运行、可复现构建、带演示数据与单测的开源前端，并补齐治理文档和 GitHub 展示素材。

### Added

- 重写 `README.md`：明确项目定位、本地演示、实际环境变量、项目结构、部署入口、路线图、许可证与致谢；删除失效线上演示承诺。
- 新增 MIT `LICENSE`，版权归属 `2022-2026 LanZe contributors`。
- 新增 `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、`CHANGELOG.md`。
- 新增 `docs/ARCHITECTURE.md`、`docs/DEVELOPMENT.md`、`docs/DEPLOYMENT.md`、`docs/ROADMAP.md`、`docs/FAQ.md`、`docs/PROMOTION.md` 与维护巡检记录。
- 新增 GitHub issue 模板、PR 模板、Node 20/22 CI、手动 GitHub Pages workflow 与 tag 触发的发布 workflow。
- 新增 `public/og-image.svg` 作为 README hero / GitHub 展示素材候选。
- 新增由仓库 SVG 渲染并目检过的 `public/og-image.png`（1200×630）作为社交预览图候选；记录尺寸、哈希与渲染方式，但不宣称已在 GitHub 设置中上传。
- 新增 `RELEASE_NOTES.md`、`ANNOUNCEMENT.md`、`SOCIAL_POSTS.md` 作为 v0.2.0 Release、Discussions 与社交文案素材。
- 升级 Vite 到 6.4.5 并添加 `@vitejs/plugin-vue`，改为 ESM 配置、`"type": "module"` 与相对 `base: './'`。
- 新增 `src/config/runtime.js`、`src/data/`、`src/services/`、`src/composables/`、`src/utils/`：统一公开配置、本地演示数据、浏览器存储、会话、响应归一化与查询解析。
- 新增 `npm run test`（23 个 `node --test` 单测，其中 5 项覆盖演示 API 的随机摘录、分类回退、搜索边界与作品去重）、`npm run lint`、`npm run preview`、`npm run smoke`、可选的 `npm run smoke:browser` 与 `.env.example`。
- 新增 `src/composables/useLottieSource.js` 与两份本地动画 JSON；Lottie 不再依赖历史外部 JSON 地址。

### Changed

- `.gitignore` 仅追加 `.env`、`.env.*`、`!.env.example`、测试/覆盖率产物与日志忽略项，未删除既有规则。
- 文档统一将历史 MemFire/Vercel 地址与旧 README 中的「项目展示地址」视为历史资料，不再作为可用链接展示。
- `src/apis/request.js` 改为优先请求 `VITE_API_BASE_URL`，失败或返回无效数据时自动降级到本地演示数据；`src/apis/env.js` 不再硬编码 `http://localhost:5565/`。
- 修复路由守卫、未定义 `scroll` / `next()`、Cookie 字符串/对象混用、固定假用户、`ElMessage` 未导入、脆弱的 `node_modules` 引用、详情/列表 JSON 解析与分页修改原数组。
- 清理历史硬编码 Supabase URL / anon key，改为可选的 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`，缺失时使用本地兼容适配器。
- 补充 `lang="zh-CN"`、页面描述和关键交互 `aria-label`，移除冲突 Lottie CDN 并改用本地 `@lottiefiles/lottie-player`。
- CI 统一使用 `npm ci`、`npm run build`、`npm run test --if-present`，Documentation checks 执行 `npm run lint`；不假定 CommonJS。
- Element Plus 改为按实际标签显式注册，反馈组件使用组件子路径导入；Vite 配置增加 Vue / Element / data / Lottie vendor 分包。
- 统一使用 `@lottiefiles/lottie-player` 播放本地动画 JSON，移除 `lottie-web` 与 `vue3-lottie` 两套重复运行时。
- Bootstrap 5.1.1 与 Font Awesome 5.13.0 从历史 CDN 改为精确锁定版本的本地依赖；移除未使用的 Popper/Bootstrap JS 外链，`npm run smoke` 覆盖本地图标字体并拒绝两个旧 CDN 域名。
- `src/pages/Audio.vue` 默认改用 `public/media/` 下由仓库生成的 WAV 演示音与 SVG 封面；移除 5 条硬编码第三方音乐/封面链接，自定义音源仅在 `VITE_AUDIO_SOURCE=custom` 且提供有效 `VITE_AUDIO_TRACKS` 时启用。无效 JSON、空列表等配置会回退本地演示音并显示可读提示；新增 `src/config/audio.js` 的 3 个配置单测，CI 与 lint 拒绝默认播放列表重新引入第三方媒体域。
- 新增可选的 Chrome/CDP 点击流冒烟：在独立临时 profile 中检查首页本地演示音源、文库导航、桌面/窄屏搜索、窄屏布局、演示登录滑块验证、作品发布与作品页回读，同时要求无控制台异常与失败请求；它仍是本机可选脚本，不加入 CI 矩阵，也不替代跨浏览器/真实后端 E2E。

### Known limitations

- 当前没有可验证的线上 Demo，也没有随仓库附带的完整后端；默认使用浏览器本地演示数据，配置 `VITE_API_BASE_URL` 后可连接自建 API。
- 演示账号与作品只保存在当前浏览器 `localStorage`，不提供真实密码安全或跨设备同步。
- 第三方字体、图片与诗词文本仍需持续核查来源和授权；自定义音源、第三方素材授权与 MIT 边界见 `docs/THIRD_PARTY_ASSETS.md`。
- 已完成首轮手工分包，构建不再出现单个 JS chunk 超过 500 kB 的警告；可选本机浏览器冒烟已覆盖主要演示交互，但尚未形成跨浏览器、真实后端与 CI 强制的完整 E2E。

## 历史里程碑（依据 git log）

### 2022-06：初版与基础页面

- `74b4186`（2022-06-03）初版提交；随后数日集中修复图标/搜索框布局、路由模式与静态部署白屏问题。
- `ccb3266`（2022-06-04）起陆续完善摘录展示；`60ee730`（2022-06-10）标记为 `1.0版本`。
- `f4b0cac`（2022-06-24）标记为 `1.1.0`，同期处理 HTTP/HTTPS 与跨域调试；`fd89ad1`（2022-06-30）以 `2.0.0` 为提交信息大幅补充登录、个人中心、设置与头像资源。

### 2022-07 至 2022-08：模块扩张

- `56fa107`（2022-07-06）重构茶楼/茶社命名，扩展个人中心、作品发布、登录与古诗分类页面。
- `377bf00`（2022-07-21）新增轮播图、字体、音频播放器与更多路由；`af63a10`（2022-08-04）整理组件与古诗分类资源。
- `e2c87ea`（2022-08-04）添加初版说明文档；`4d4a59c`（2022-08-13）更新样式、资源与页面结构。

### 2022-10 至 2022-11：后端形态调整

- `19d4b76`（2022-10-17）提交信息为「替换后端为无服务器函数」，相关组件与 vite 代理配置发生较大变化。
- `ac295ea`（2022-10-18）继续调整登录与音频等页面；`cf9be40`（2022-11-05）补充字体、背景图、分类内容与个人资料编辑。

### 2023：滚动与部署修正

- `547a48c`（2023-09-23）解决垂直滚动不重置问题，并更新摘录、详情与 README。
- `022def4`（2023-12-20）修复部署时图片缺失；`a20ff39`、`9c9af96` 移除介绍页与对应路由。

### 2024：请求层集中化尝试

- `b4ea7f4`（2024-08-18）新增/调整 `src/apis/` 下的 Axios 封装、登录与诗词 API 列表，更新多个页面与 `vite.config.js`；`src/apis/env.js` 将业务接口基础地址写为 `http://localhost:5565/`。
- 该提交是重写文档前的最近提交；旧 README 中的托管与展示说明自此未再更新。

### 2026-11-06：重新启动开源治理与工程现代化

- 以 `b4ea7f4` 为事实基线，升级构建工具、实现本地演示数据、补齐测试与治理文档；不把历史提交信息中的版本号当作已发布 Release。
- 详细的发布文案与 GitHub 展示清单见 `RELEASE_NOTES.md`、`ANNOUNCEMENT.md`、`SOCIAL_POSTS.md`、`docs/PROMOTION.md`。
