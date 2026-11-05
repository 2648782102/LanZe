# 变更日志

本文件按「待发布 → 历史里程碑」组织，历史部分依据仓库 `git log` 归纳，并非逐条完整提交记录。截至本文件写入时，仓库共有 42 次提交，首个提交为 `74b4186`（2022-06-03），最近提交为 `b4ea7f4`（2024-08-18），未发现 Git tag 或已发布 Release。历史提交信息中的 `1.0`、`1.1`、`2.0.0` 是开发标记，不代表本仓库存在对应正式发行版。

## [v0.2.0] — 2026-11-06

> 本版本把 2024 年代码基线升级为可本地运行、可复现构建、带演示数据与单测的开源前端，并补齐治理文档和 GitHub 展示素材。

### Added

- 重写 `README.md`：明确项目定位、本地演示、实际环境变量、项目结构、部署入口、路线图、许可证与致谢；删除失效线上演示承诺。
- 新增 MIT `LICENSE`，版权归属 `2022-2026 LanZe contributors`。
- 新增 `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、`CHANGELOG.md`。
- 新增 `docs/ARCHITECTURE.md`、`docs/DEVELOPMENT.md`、`docs/DEPLOYMENT.md`、`docs/ROADMAP.md`、`docs/FAQ.md`、`docs/PROMOTION.md` 与维护巡检记录。
- 新增 GitHub issue 模板、PR 模板、Node 20/22 CI、手动 GitHub Pages workflow 与 tag 触发的发布 workflow。
- 新增 `public/og-image.svg` 作为 README hero / GitHub 展示素材候选。
- 新增 `RELEASE_NOTES.md`、`ANNOUNCEMENT.md`、`SOCIAL_POSTS.md` 作为 v0.2.0 Release、Discussions 与社交文案素材。
- 升级 Vite 到 6.4.5 并添加 `@vitejs/plugin-vue`，改为 ESM 配置、`"type": "module"` 与相对 `base: './'`。
- 新增 `src/config/runtime.js`、`src/data/`、`src/services/`、`src/composables/`、`src/utils/`：统一公开配置、本地演示数据、浏览器存储、会话、响应归一化与查询解析。
- 新增 `npm run test`（14 个 `node --test` 单测）、`npm run lint`、`npm run preview`、`npm run smoke` 与 `.env.example`。
- 新增 `src/composables/useLottieSource.js` 与两份本地动画 JSON；Lottie 不再依赖历史外部 JSON 地址。

### Changed

- `.gitignore` 仅追加 `.env`、`.env.*`、`!.env.example`、测试/覆盖率产物与日志忽略项，未删除既有规则。
- 文档统一将历史 MemFire/Vercel 地址与旧 README 中的「项目展示地址」视为历史资料，不再作为可用链接展示。
- `src/apis/request.js` 改为优先请求 `VITE_API_BASE_URL`，失败或返回无效数据时自动降级到本地演示数据；`src/apis/env.js` 不再硬编码 `http://localhost:5565/`。
- 修复路由守卫、未定义 `scroll` / `next()`、Cookie 字符串/对象混用、固定假用户、`ElMessage` 未导入、脆弱的 `node_modules` 引用、详情/列表 JSON 解析与分页修改原数组。
- 清理历史硬编码 Supabase URL / anon key，改为可选的 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`，缺失时使用本地兼容适配器。
- 补充 `lang="zh-CN"`、页面描述和关键交互 `aria-label`，移除冲突 Lottie CDN 并改用本地 `@lottiefiles/lottie-player`。
- CI 统一使用 `npm ci`、`npm run build`、`npm run test --if-present`；不假定 CommonJS。
- Element Plus 改为按实际标签显式注册，反馈组件使用组件子路径导入；Vite 配置增加 Vue / Element / data / Lottie vendor 分包。
- 统一使用 `@lottiefiles/lottie-player` 播放本地动画 JSON，移除 `lottie-web` 与 `vue3-lottie` 两套重复运行时。

### Known limitations

- 当前没有可验证的线上 Demo，也没有随仓库附带的完整后端；默认使用浏览器本地演示数据，配置 `VITE_API_BASE_URL` 后可连接自建 API。
- 演示账号与作品只保存在当前浏览器 `localStorage`，不提供真实密码安全或跨设备同步。
- 历史 Bootstrap / Font Awesome CDN、第三方字体/图片/音乐与诗词文本仍需持续核查来源和授权；MIT 不自动覆盖第三方素材。
- 已完成首轮手工分包，构建不再出现单个 JS chunk 超过 500 kB 的警告；尚未完成完整浏览器端 E2E。

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
