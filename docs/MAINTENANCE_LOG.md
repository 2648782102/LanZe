# 维护巡检记录

> 本文件记录 2026-11-06 的维护核对过程，供持续迭代时复核。它不是发布公告；下方「巡检 01」保留并行改造开始前的历史事实，「巡检 03」记录两个子任务完成后的集成状态。工作截止时间：`2026-11-06 08:00 Asia/Shanghai`。

## 巡检 01 — 2026-11-06 01:39–01:53 CST

### 仓库事实基线

- 路径：`/Users/flowli/Developer/LanZe`；分支 `main` 与 `origin/main` 同步；远程 `https://github.com/2648782102/LanZe.git`。
- HEAD：`b4ea7f4`（2024-08-18 18:47:20 +0800，提交信息「修改」）；首个提交 `74b4186`（2022-06-03 18:54:26 +0800）；共 42 次提交；无本地/远程 tag（按 `git tag -n`、`git branch -a` 检查）。
- `package.json`：脚本仅 `dev`、`build`；Vite `^1.0.0-rc.13`；无 `test`/`lint`/`preview`，无 `engines`、无 `"type": "module"`。
- `.gitignore` 原有 6 行：`node_modules`、`.DS_Store`、`dist`、`dist-ssr`、`*.local`、`.vercel`。
- `README.md` 旧版仍写 MemFire Cloud/MemFireDB 与 `http://app.memfiredb.com/caqm0ri5g6h17oismvp0/` 展示地址；已删除并重写。
- `src/apis/env.js` 硬编码 `http://localhost:5565/`；`vite.config.js` 有指向该地址的 `/api` 代理但请求层未使用 `/api` 前缀。
- `src/router/index.js` 使用 `createWebHashHistory()`，约 25 条路由，`isAush` 字段未被全局守卫使用。
- `src/pages/ZhaiLu/ZhaiLu.vue` 直连 `https://v1.jinrishici.com/all.json`；`src/function/supabase.js` 与 `src/components/UserLi.vue` 各有不同历史 Supabase 项目地址与硬编码 anon key。
- `src/pages/Home.vue` 的 `setup()` 返回未定义的 `scroll`，`afterEach` 中有未定义的 `next()`；搜索调用 `searchList`。
- `index.html` 引用 Bootstrap/Popper/Font Awesome/Lottie 等 CDN；`public/` 原仅有 `favicon.ico`。
- 无 `.github/`、无 `docs/`、无 `LICENSE`、无 `CONTRIBUTING.md`、无 `CODE_OF_CONDUCT.md`、无 `SECURITY.md`、无 `CHANGELOG.md`。

### 本轮写入范围

- 根目录：`README.md`、`LICENSE`、`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、`CHANGELOG.md`。
- `.gitignore`：仅追加 `.env`、`.env.*`、`!.env.example`、`coverage/`、`playwright-report/`、`test-results/`、`*.log`。
- `docs/`：`ARCHITECTURE.md`、`DEVELOPMENT.md`、`DEPLOYMENT.md`、`ROADMAP.md`、`FAQ.md`、`PROMOTION.md`、本文件。
- `.github/`：CI、手动 Pages（configure/upload/deploy 标准步骤）、issue/PR 模板。
- `public/`：仅新增 `og-image.svg`，未覆盖 `favicon.ico`。
- 发布草稿：`RELEASE_NOTES.md`、`ANNOUNCEMENT.md`、`SOCIAL_POSTS.md`。

### 未执行 / 明确留给主 agent

- 未执行 git commit、push、tag、PR、issue、Release、Discussion；未调用 GitHub API 或任何外部发布 API。
- 未修改 `package*.json`、`vite.config.js`、`index.html`、`src/**`、`node_modules/`、`dist/`。
- GitHub 侧 About 描述、topics、社交预览图、Discussions 启用/发帖、Release 发布、Pages 部署仍需主 agent 按 `docs/PROMOTION.md` 执行。
- 代码侧 Vite 升级、`test` 脚本、mock/API Adapter、密钥清理与运行时 bug 修复需并行子任务完成后再次核对文档。

### 待复核清单（截止 08:00 前持续检查）

- [ ] 若 `package.json` 新增 `test`/`lint`/`preview`/`engines` 或 `"type": "module"`，确认 README/CI/开发文档仍然成立。
- [ ] 若 `src/apis/env.js` 改为读取 `import.meta.env.VITE_API_BASE_URL`，确认 README 的变量表、`.env.example` 约定与实际变量名一致。
- [ ] 若 `vite.config.js` 的 `base`/代理或 Router history 模式变化，确认 `docs/DEPLOYMENT.md`、`docs/ARCHITECTURE.md`、Pages workflow 一致。
- [ ] 若 `index.html` 移除 CDN 或 `src/assets/` 素材变化，确认 FAQ/安全政策/致谢中的第三方资源说明仍然准确。
- [ ] 若创建 v0.2.0 tag/Release，确认 `CHANGELOG.md` 与 `RELEASE_NOTES.md` 不再标注「未发布候选」。
- [ ] 若主 agent 验证并启用 GitHub Pages，才在 About/Discussion 添加真实 URL；不恢复历史失效域名。
- [ ] 每次复核运行 `git diff --check`、检查工作流 YAML 与 Markdown 链接，并记录结果于下方。

## 巡检 02 — 待持续迭代

> 后续每次源码或主任务状态变化后追加：时间、观察到的 HEAD/脚本/变量变化、是否修订文档、验证命令与结果。若到 08:00 没有其他协作者改动，也要在最终答复中说明本轮以基线 `b4ea7f4` 为准。

### 验证 02A — 2026-11-06 01:53–01:58 CST

- `git diff --check` 通过；变更文件限定在授权路径；`.gitignore` 只追加条目，没有删除原行。
- Ruby Psych 解析 `.github/**/*.yml` 全部通过；四个 issue form 的 `name/body/type` 结构通过；Markdown 相对链接与 `public/og-image.svg` XML 通过。
- 模拟 CI 的 docs job：必需文件、MIT 一致性、README 历史演示地址检查均通过。
- 在宿主 Node 24 上执行 `npm ci && npm run build && npm run test --if-present` 成功，`dist/index.html` 存在；构建输出包含历史依赖的 esbuild/Lottie 警告与 npm audit 报告，属于代码/依赖侧已知事项，治理子任务不改 `package*.json`。
- 用 `npx node@20` 与 `npx node@22` 提供的二进制分别复跑 `npm run build` 与 `npm run test --if-present`，均成功；`--if-present` 在基线无 `test` 脚本时正常跳过。
- 修正过欢迎帖相对链接、两个 GitHub issue form 的 YAML 标量引用，以及 Pages 文档与 workflow 的部署步骤一致性；CI 的「失效演示检查」收窄为 README 中的历史端点，避免把「不承诺线上 Demo」这类正确表述误判为失败。

### 并行源码观察 02B — 2026-11-06 01:57 CST

- `git status` 出现新的未跟踪目录 `src/config/`、`src/data/`、`src/services/`、`src/utils/`，由另一个代码子任务写入；治理子任务**只读**，未修改这些 `src/**` 文件。
- 当前 `package.json` 仍只有 `dev`/`build`，Vite 仍为 `^1.0.0-rc.13`，`src/apis/env.js` 仍硬编码 `http://localhost:5565/`；未见 `package*.json`、`vite.config.js`、`index.html` 差异。
- 新 `src/config/runtime.js` 读取的变量为 `VITE_API_BASE_URL`、`VITE_API_TIMEOUT`、`VITE_USE_MOCK`、`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`；当时治理初稿使用另一变量名，属于**并行改造尚未收敛的历史差异**，已在巡检 03 统一。
- `src/data/poems.js`、`src/services/mockApi.js`、`src/utils/response.js` 等新文件显示代码侧正准备本地演示数据、浏览器存储与响应规范化；`src/services/mockApi.js` 提示演示账号 `demo / lanze2026`，但演示账号仅应留在浏览器本地，不应写入生产宣传或对外凭据清单。
- 待代码侧完成 `src/apis/` 与页面接入、并确定 mock 开关最终命名后，统一修订 README、`docs/DEVELOPMENT.md`、`docs/DEPLOYMENT.md`、`docs/ARCHITECTURE.md`、`docs/FAQ.md`、`docs/ROADMAP.md`、`CHANGELOG.md` 与发布草稿；该工作已在巡检 03 完成。

## 巡检 03 — 2026-11-06 02:11–02:25 CST

### 集成后的实际状态

- 代码侧子任务完成：Vite 升级到 `6.4.5`，`@vitejs/plugin-vue` `6.0.10`，`package.json` 为 `"type": "module"`，`vite.config.js` 使用 ESM 与 `base: './'`。
- 现有脚本：`dev`、`build`、`preview`、`test`、`lint`；`test` 为 `node --test` 的 14 个单测，`lint` 扫描失效后端地址、硬编码服务与脆弱引用。
- `src/config/runtime.js` 的最终变量名为 `VITE_API_BASE_URL`、`VITE_API_TIMEOUT`、`VITE_USE_MOCK`、`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`；`VITE_ENABLE_MOCK` 已从全部文档中替换。
- `src/apis/env.js` 不再硬编码 `http://localhost:5565/`；`src/apis/request.js` 优先请求真实 API，失败或返回无效数据时自动降级到 `src/services/mockApi.js`。
- 历史 Supabase 硬编码 key 已从源码移除，改为可选公开环境变量；Cookie 会话、路由守卫、`ElMessage`、`node_modules` 引用和 JSON 解析问题已修复。
- `index.html` 设置 `lang="zh-CN"` 与页面描述，移除冲突 Lottie CDN；本地使用 `@lottiefiles/lottie-player`。历史 Bootstrap/Popper/Font Awesome CDN 仍保留。
- 新增 `.github/workflows/publish.yml`：推送 `v0.2.0` tag 或手动触发时，从 `RELEASE_NOTES.md` 与 `ANNOUNCEMENT.md` 幂等创建 Release 与 Announcements 欢迎帖。

### 文档同步

- README、CHANGELOG、RELEASE_NOTES、ANNOUNCEMENT、SOCIAL_POSTS 与 `docs/` 已统一到最终实现：Vite 6、本地演示数据、演示账号 `demo / lanze2026`、14 项单测、lint、实际环境变量与已知限制。
- `docs/ARCHITECTURE.md`、`docs/DEVELOPMENT.md`、`docs/DEPLOYMENT.md`、`docs/FAQ.md`、`docs/ROADMAP.md` 删除「当前快照仍为 2024 基线 / 目标尚未实现」等过时表述，保留历史事实供迁移对照。
- `CONTRIBUTING.md` 与 `SECURITY.md` 的验证命令、安全边界和已知事项已同步；`docs/PROMOTION.md` 保留为发布/展示执行清单。

### 验证

- `npm ci`：成功，116 个包，0 vulnerabilities；npm 提示 esbuild/fsevents 安装脚本受本地策略关注，但不影响安装。
- `npm run build`：成功，Vite 6.4.5，约 14s；仍有大 chunk 与第三方 `eval` 的非阻断警告。
- `npm run test`：14/14 通过。
- `npm run lint`：通过。
- `git diff --check`：通过。
- 修复 `index.html` 中 `min-width:768` 缺少 `px` 的无效媒体查询条件。

### 待复核（后续小时巡检）

- [ ] 首次推送后确认 GitHub Actions 的 CI 在 Node 20/22 均绿色。
- [ ] 推送 `v0.2.0` tag 后确认 Release 与 Announcements 欢迎帖由 workflow 创建成功。
- [ ] 如启用 Pages，先验证 `https://2648782102.github.io/LanZe/` 静态资源无 404，再把仓库 homepage 指向已验证 URL；否则清空历史 `lan-ze.vercel.app`。
- [ ] 检查 issue/PR、Discussion 与 CI 失败；只修可复现、有边界的问题，不制造重复发布或外部群发。
