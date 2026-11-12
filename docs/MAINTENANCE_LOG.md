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

## 巡检 04 — 2026-11-06 02:38–03:10 CST

### 发布流程修复与验证

- `publish.yml` 原 Discussion 步骤把 `--jq --arg` 混用，导致 `gh api graphql` 报 `accepts 1 arg(s), received 4`。已改为 `jq -n` 构造 GraphQL 请求体、`curl` 直接 POST `https://api.github.com/graphql`、统一检查 `.errors[]` 并保留按标题查重的幂等逻辑。
- 本地用假 GraphQL 响应演练「首次创建」「重复运行」「GraphQL 错误」三条路径均符合预期；YAML、`bash -n`、`npm run lint`、`npm run test` 和 `git diff --check` 通过。
- 提交 `ab60d61 fix: create discussion with GraphQL request body` 后重新强制推送 `v0.2.0` tag，触发新 publish run `42086132389`。该 run 与同 commit 的 CI run `42086116449` 均为 success。
- Release `v0.2.0` 为正式发布、非草稿，标题与 body 与 `RELEASE_NOTES.md` 一致；Discussions 欢迎帖创建于 `https://github.com/2648782102/LanZe/discussions/1`，日志给出 `D_kwDOHcVN884Aq2tn`。当前无 open issue 或 PR。
- `https://2648782102.github.io/LanZe/` 返回 404，Pages 未启用；历史 homepage `https://lan-ze.vercel.app` 仍留在仓库 About 中，本轮没有可用的 GitHub 写元数据 API 或浏览器交互通道，未伪造部署或清空结果。

### 前端体积与离线资源治理

- Element Plus 从 `app.use(ElementPlus)` 全量插件改为按实际 `el-*` 标签显式注册；`ElMessage` / `ElMessageBox` 改用组件子路径导入；Element Plus Icons 仅在使用 `<Picture />` 的两个页面局部注册。
- `vite.config.js` 增加 Vue / Element / data / Lottie vendor 的 `manualChunks`；入口 JS 从基线 1,841.31 kB 降到约 9.97 kB，Element vendor 从 916.95 kB 降到 306.83 kB，构建不再出现 >500 kB 的单个 JS chunk 警告。
- 移除重复的 `lottie-web` 与 `vue3-lottie` 运行时，统一使用 `@lottiefiles/lottie-player`。新增 `src/composables/useLottieSource.js`，把本地动画 JSON 转成 Blob URL；两份历史 LottieFiles 外链动画已保存为 `src/assets/lottieJSON/fanHui.json` 与 `login.json`，首页与个人中心原有动画改走同一播放器。
- `npm install --package-lock-only --ignore-scripts` 后 `npm audit` 为 0 vulnerabilities；`npm run build`（无大 chunk 警告）、`npm run test`（14/14）、`npm run lint`、`git diff --check` 通过；`npm run preview` 的首页与全部入口 JS/CSS 静态资源均返回 200。
- README、CHANGELOG、`RELEASE_NOTES.md`、`ANNOUNCEMENT.md`、`docs/ROADMAP.md` 已同步；`docs/PROMOTION.md` 更新为已发布/未执行状态清单。历史 Bootstrap / Font Awesome CDN 与音乐外链仍保留，第三方素材授权尚未逐项核验。

### 待复核（后续小时巡检）

- [ ] 下一轮提交并推送后确认 GitHub CI 在 Node 20/22 仍为绿色。
- [ ] 若有可用的仓库元数据写通道，清空失效 homepage；若启用 Pages，先实测 `https://2648782102.github.io/LanZe/` 静态资源无 404。
- [ ] 可用时补一次浏览器端交互回归：按需注册的 Element 组件、路由切换动画、登录/资料/音乐/Lottie 页面。
- [ ] 继续整理第三方字体、音乐、CDN 与历史 LottieFiles JSON 的来源和授权；不把下载行为误写成已获得授权。

## 巡检 05 — 2026-11-06 02:51–03:00 CST

- `385a91f` 推送后，GitHub CI run `42087961232` 在 Node 20、Node 22 和 Documentation checks 三项均为 success；仓库无 open issue/PR，工作区与 `origin/main` 同步。
- 核对发现公开 Release body 仍是早先的 v0.2.0 文案，尚未包含本轮 vendor 分包与 Lottie 本地化；仓库内 `RELEASE_NOTES.md` 已更新，准备通过幂等发布 workflow 同步。
- 新增 `scripts/smoke.mjs` 与 `npm run smoke`：启动 Vite preview，解析 `dist/index.html` 中的本地 JS/CSS 入口并逐项请求；本地验证 7 个静态资源均返回 200。CI 的 Node 20/22 build job 现在会执行该冒烟脚本。
- README、`CONTRIBUTING.md`、`docs/DEVELOPMENT.md`、`docs/DEPLOYMENT.md`、`CHANGELOG.md` 已补充 `npm run smoke` 命令与验收说明；`npm run build`、`npm run smoke`、`npm run test`（14/14）、`npm run lint`、YAML、`git diff --check` 均通过。
- `383d3a9` 推送后，CI run `42088476064` 与 publish run `42088486521` 均 success；Release body 与本地 `RELEASE_NOTES.md` 内容一致（仅末尾换行差异），Discussions 欢迎帖按标题查重未重复创建。
- 新增 `docs/THIRD_PARTY_ASSETS.md`：按字体、图片、诗词、Lottie、音乐/CDN 分类记录来源线索与「授权未核验」状态；明确下载 LottieFiles JSON 不等于获得许可。修正 `docs/DEVELOPMENT.md` 中「部分 Lottie JSON 仍为外链」的过时表述，并让 CI 检查该清单文件存在。

## 巡检 06 — 2026-11-06 03:00–03:10 CST

- 本地用假 GraphQL 响应演练欢迎帖「首次创建」「已有则更新」「GraphQL 错误」三条路径，并核对 GitHub 官方 `UpdateDiscussionInput` 字段；`npm ci`、`npm run build`、`npm run smoke`、`npm run test`（14/14）、`npm run lint`、`npm audit --omit=dev`、YAML、Markdown 本地链接与 `git diff --check` 均通过。
- `1e21786` 推送并强制更新 `v0.2.0` tag 后，Release 仍为正式发布且 body 与 `RELEASE_NOTES.md` 一致；新 publish run `42089909542` 的 Release 步骤 success，但 `updateDiscussion` 被 GitHub Actions 默认令牌以 `Resource not accessible by integration` 拒绝，Discussion 正文未被改写，也没有重复创建。
- 这是平台权限边界，不是 GraphQL schema 错误：即使 workflow 声明 `discussions: write`，安装令牌仍不能修改他人/既有讨论正文。将发布步骤改为先读取现有正文并比对：一致则跳过；存在差异才尝试更新；更新受限时保留原帖并输出显式 warning，使 publish run 不再因不可控权限而整单失败。
- `docs/PROMOTION.md` 同步为真实状态：欢迎帖已发布且幂等防重复，自动正文同步受令牌权限限制；未把旧帖正文宣称为已经更新。后续如需在线同步，应配置由维护者明确授权、具备 Discussions 写权限的令牌，或人工编辑欢迎帖。
- `f9c5b67` 的 CI run `42090691325` 在 Node 20、Node 22 与 Documentation checks 三项均 success；publish run `42090702226` success。日志明确输出「现有讨论因 GITHUB_TOKEN 无法更新而保持不变」的 warning，Release 更新成功且没有重复创建欢迎帖。
- 已在 GitHub 创建 3 个带 `good first issue` / `help wanted` 标签、附验收标准的 open issue：#2 演示 API 边界单测、#3 历史 CDN 收敛、#4 Lottie/favicon 授权核验；并把入口写入 `docs/PROMOTION.md`。这些是仓库内真实贡献入口，不涉及外部社区群发或增长数字。
- Pages 仍为 `has_pages=false`；官方 `actions/configure-pages@v5` 的 `enablement` 需要非 `GITHUB_TOKEN`、具备 `administration:write` / `pages:write` 的令牌，而当前可用写通道不包含该权限。未伪造线上 Demo，也没有把失效 homepage 改成未验证 URL。

## 巡检 07 — 2026-11-06 03:10–03:20 CST

- 清理 `index.html` 中的 Bootstrap 5.1.1、Popper 2.9.3、Bootstrap JS 与 Font Awesome 5.13.0 四个历史 CDN 引用；精确安装 `bootstrap@5.1.1` 与 `@fortawesome/fontawesome-free@5.13.0`，仅按需引入 CSS，未使用的 Popper/Bootstrap JS 不再进入页面。
- `npm run smoke` 扩展为检查构建后 HTML 不含 `cdn.staticfile.org` / `cdn.bootcss.com`、favicon 可访问，并解析 CSS 中的本地字体/图标 URL 逐项请求；本轮构建冒烟覆盖 24 个本地静态资源且全部返回 200。CI docs job 增加旧 CDN 与依赖版本锁定的防护。
- README、CHANGELOG、RELEASE_NOTES、ANNOUNCEMENT、ARCHITECTURE、DEVELOPMENT、DEPLOYMENT、FAQ、ROADMAP、`docs/THIRD_PARTY_ASSETS.md` 与 CONTRIBUTING 同步为「核心样式/图标本地化，音乐/封面外链仍待核验」；第三方清单记录两款上游包的许可证元数据，不把整站素材称为已完成授权审计。
- 官方 Pages 文档确认默认 `GITHUB_TOKEN` 不能通过 `configure-pages` 的 `enablement` 启用站点；本轮没有管理员级 PAT/App 令牌，因此不触发未经配置的部署，也不改动 homepage。

## 巡检 08 — 2026-11-06 03:16–03:35 CST

- 复核 `95aa9a3` 的 CI run `42092069028` 与 tag publish run `42092192996` 均为 success；公开 Release body 已包含 Bootstrap / Font Awesome 本地化说明，并移除了旧版「历史 CDN 仍可能受网络环境影响」表述。前一轮记录的 Discussion 默认令牌写权限边界仍成立，publish run 不因不可控权限而失败。
- 默认播放器移除 5 条 `music.163.com` / `music.126.net` 硬编码音轨与封面，改为读取 `public/media/lanze-demo.wav` 与 `public/media/lanze-demo-cover.svg`：WAV 为仓库脚本合成的 8 秒单声道 PCM，SVG 为仓库内原创封面；默认构建不请求第三方音乐平台。
- 新增 `src/config/audio.js` 与 3 个配置单测：仅 `VITE_AUDIO_SOURCE=custom` 且 `VITE_AUDIO_TRACKS` 为有效 JSON 数组时启用自定义音源，无效或空配置自动回退本地演示音；自定义音源的授权、可用性与隐私政策明确由配置者负责。
- `npm run smoke` 新增本地演示音源/封面 HTTP 检查及构建 JS 中第三方媒体域扫描，覆盖 26 个本地静态资源；CI docs job 与 `npm run lint` 增加对应防护。README、CHANGELOG、RELEASE_NOTES、ANNOUNCEMENT、CONTRIBUTING、SOCIAL_POSTS、`docs/` 与 `.env.example` 同步为 17 项单测、默认离线音源和可选自定义配置。
- 本地验证：`npm run test`（17/17）、`npm run lint`、`npm run build`、`npm run smoke`（26 assets）、`npm audit --omit=dev`（0 vulnerabilities）、YAML 解析、Markdown 本地链接检查、默认媒体域检查均通过。`git diff --check` 仅报告 `SOCIAL_POSTS.md` 既有的 Markdown 双空格硬换行格式，未新增其它空白错误；历史日志中的「14 项单测」按当时事实保留。
- `bbeddbb` 推送后 CI run `42094156948` 在 Node 20、Node 22 与 Documentation checks 三项均 success；新增 `Reject third-party media defaults` 步骤通过。强制更新 `v0.2.0` tag（annotated object `9081f6e`）触发 publish run `42094320355`，Release 与 Discussion 两个步骤均 success；公开 Release body 已同步为 17 项单测、本地演示音源与 `VITE_AUDIO_*` 说明。
- #3 已更新为「复核本地化依赖、默认音源与浏览器回归」，写入默认音源本地化现状、自定义配置边界、17 项单测与浏览器回归验收标准，保留字体/Lottie/favicon 授权和可选音源错误态作为真实贡献入口；`docs/PROMOTION.md` 的 issue 入口同步。Discussion 正文自动同步仍受 Actions 默认令牌权限限制，未声称欢迎帖已更新。
- 本轮再次核对：当前可用 GitHub 连接具备 issue/文件写入但没有仓库 metadata 写权限，本机也无 GitHub HTTPS token；`homepage` 仍是失效 `lan-ze.vercel.app`，Pages 仍 `has_pages=false` 且项目站点返回 404。没有伪造线上 Demo、清空 homepage 或触发未经配置的 Pages 部署。
- 将 `public/og-image.svg` 用本机 WebKit 按 1200×630 视口渲染并缩放到目标尺寸，目检标题/诗句/底部署名无裁切，生成 `public/og-image.png`（369 KB，SHA-256 已写入 `docs/PROMOTION.md`）。README、CHANGELOG 与素材清单同步；社交预览上传仍因缺少仓库设置写通道而未执行。
- 用本机 Chrome 157 与临时隔离 profile 做了一次真实 CDP 冒烟：`#/home` 显示三条本地演示摘录与一个「兰泽 · 本地演示音」播放器，点击「文库」进入 `#/gushi` 并显示唐诗三百/宋词三百等分类，控制台错误、未捕获异常、失败网络请求均为 0。检查沉淀为可选 `npm run smoke:browser`，使用 CDP WebSocket 与临时 profile，不覆盖日常浏览器状态；CI 仍只运行无浏览器依赖的脚本。
- `0a8b017` 的 CI run `42095302758` 与 `385bb13` 的 CI run `42095805722` 均为 success；后者三项 job 包含 Node 20/22 构建、17 项单测、构建冒烟与文档防护。再次强制更新 `v0.2.0` tag（annotated object `f9294f8`）触发 publish run `42095964071`，Release 与 Discussion 步骤均 success；公开 Release body 已加入可选 Chrome 点击流说明，并把「未执行完整 E2E」收窄为「未执行覆盖登录/发布全链路的完整 E2E」。

## 巡检 09 — 2026-11-06 03:49–04:18 CST

- 复核当前时间、干净工作区、`main...origin/main`、公开仓库 metadata 与最新 CI/publish/Release/open issues；`42096153386` CI 与 `42095964071` publish 仍为 success，3 个 open issue 无新增外部贡献或评论。未认证 REST 写请求确认 repository metadata PATCH 返回 401、Pages GET 返回 404、workflow dispatch 返回 401，因此仍未清空失效 homepage、启用 Pages 或上传社交预览；没有伪造部署展示。
- 将可选 `npm run smoke:browser` 从首页→文库点击流扩展为真实 CDP 回归：桌面 1280×800 与窄屏 390×844 搜索、窄屏底部导航切换、本地演示音源挂载、演示账号滑块验证登录、作品发布写入 `localStorage`、作品页回读，并清理临时 Cookie/演示数据。新增 `src/config/demoBrowser.node.js` 与 1 个单测，`npm run test` 从 17 项增至 18 项。
- README、CHANGELOG、RELEASE_NOTES、ANNOUNCEMENT、CONTRIBUTING、SOCIAL_POSTS、`docs/DEVELOPMENT.md`、`docs/DEPLOYMENT.md`、`docs/FAQ.md`、`docs/ROADMAP.md` 同步为 18 项单测与新的浏览器冒烟边界；仍明确该脚本不进入 CI 矩阵，不覆盖真实后端、跨浏览器或正式 E2E 套件。历史巡检中的旧数字与当时状态按事实保留。
- 本地验证：`npm run test`（18/18）、`npm run lint`、`npm run build`、`npm run smoke`（26 assets）、`npm run smoke:browser`（桌面/窄屏/登录/发布链路，控制台与网络错误 0）均通过；`git diff --check` 无新增空白错误。
- 04:16 复核 publish run `42101440222` 为 success，Release body 已与当时的 `RELEASE_NOTES.md` 同步为 18 项单测与登录/发布冒烟边界；`c300419` 的 CI run `42101345370` 仍为 success。公开 repo metadata 仍显示 `homepage=https://lan-ze.vercel.app`、`has_pages=false`。

## 巡检 10 — 2026-11-06 04:16–04:30 CST

- 按 #2 的验收方向补充 5 项本地演示 API 边界单测：随机摘录索引/环绕/缺参、分类命中与未命中回退、搜索空关键字/大小写/空格、发布作品去重与合并数据去重。`npm run test` 从 18 项增至 23 项；测试不依赖网络、真实浏览器或用户数据，并清理演示存储。
- `src/pages/Audio.vue` 为无效 `VITE_AUDIO_TRACKS`（JSON 解析失败、空列表等）增加一次可读回退提示；默认播放器仍只加载仓库自制音源/封面。自定义音源 URL 本身不可达时的状态保留在 #3 与路线图，不夸大为已解决。
- README、CHANGELOG、RELEASE_NOTES、ANNOUNCEMENT、CONTRIBUTING、SOCIAL_POSTS、`docs/ARCHITECTURE.md`、`docs/DEVELOPMENT.md`、`docs/FAQ.md`、`docs/ROADMAP.md`、`docs/THIRD_PARTY_ASSETS.md`、`.env.example` 与 `docs/PROMOTION.md` 同步为 23 项单测、无效配置回退提示及后续贡献边界；历史巡检中的旧数字仍按当时事实保留。
- #2 更新为已完成核心边界与新的最小 PR 入口，#3 更新为 23 项单测、无效配置提示与不可达 URL/CI E2E 入口；仍保留 `good first issue` / `help wanted`，没有关闭或虚构外部贡献。
- 本地验证：`npm run test`（23/23）、`npm run lint`、`npm run build`、`npm run smoke`（26 assets）、`npm run smoke:browser`（桌面/窄屏/登录/发布链路，控制台与网络错误 0）均通过。GitHub 展示限制不变：当前连接无仓库 metadata / Pages / Social preview 写通道，未清空失效 homepage、启用 Pages 或上传社交预览。

## 巡检 11 — 2026-11-06 05:30–05:40 CST

- 05:30 复核时间与线上状态：工作区干净且 `origin/main`、tag `v0.2.0` 均指向 `b66113d`；最新 CI run `42103450836`、publish run `42103883506` 仍为 success；公开 Release body 与 `RELEASE_NOTES.md` 一致（仅末尾换行差异），含 23 项单测与无效音源回退提示。3 个 open issue 无新评论、无 open PR；`homepage=https://lan-ze.vercel.app`、`has_pages=false`、项目站点仍 404。
- 文档写「CI 等价步骤含 `npm run lint`」，但 `.github/workflows/ci.yml` 的 Documentation checks job 只做 shell 文本检查，未运行 Node 静态扫描。现给该 job 加 `actions/setup-node@v4`（Node 20）与 `npm run lint`，让 CI badge 覆盖真实的 lint 脚本，不依赖 `npm ci`，也不改变 Node 20/22 build 矩阵。
- README、CHANGELOG、RELEASE_NOTES、ANNOUNCEMENT、SOCIAL_POSTS、`docs/DEVELOPMENT.md`、`docs/FAQ.md`、`docs/ROADMAP.md`、`docs/PROMOTION.md` 同步为「Node 20/22 build job 跑测试与构建冒烟，Documentation checks 跑 lint」；仍明确可选本机 Chrome 冒烟不进入 CI，不替代跨浏览器/真实后端 E2E。历史巡检按当时事实保留。

## 巡检 12 — 2026-11-06 06:30–06:35 CST

- 时间距 08:00 截止约 1 小时 25 分钟。工作区干净，`main` / `origin/main` / tag `v0.2.0` 均指向 `9534ccc`；最新 CI run `42113851165` 与 publish run `42114011561` 均 success，公开 Release `v0.2.0` 仍是正式发布。3 个 open issue 无新评论、无 open PR；`homepage=https://lan-ze.vercel.app`、`has_pages=false`，项目 Pages 地址仍 404。
- 通过 GitHub connector 读取 publish job `127548703281` 的日志：GITHUB_TOKEN 具备 `Contents: write` / `Discussions: write`，但 `updateDiscussion` 仍被 `Resource not accessible by integration` 拒绝；workflow 按既有设计输出 warning 并保留原帖，Job success 不代表欢迎帖正文已更新。
- 公开 Discussions REST 数据回读确认 Discussion #1 的 `updated_at=2026-11-05T18:38:21Z`，正文仍是首版「新增 14 个单测和静态检查」。仓库内 `ANNOUNCEMENT.md` 已为 23 项单测、Documentation checks 执行 lint、本地音源与素材清单等当前文案；`docs/PROMOTION.md` 精确记录「线上欢迎帖未同步」，不声称已更新、不重复发帖。
- 浏览器控制通道超时，且编辑公开帖子属于需 action-time 确认的外部内容写入；本轮不绕过确认、不尝试未授权 PATCH，也不把 CUA 超时写成已编辑。仅做文档状态修订；`RELEASE_NOTES.md` / `ANNOUNCEMENT.md` 未改动，因此不 retag、不重发 Release。

## 收尾 — 2026-11-06 08:00 CST

- 维护窗口结束。最后一次复核：`main` 与 `origin/main` 同步于 `fd2effb`，`v0.2.0` tag 仍指向 `9534ccc` 的发布内容；最新 CI run `42123080088` 三项 job 均 success，公开 Release `v0.2.0`（id `435565910`）仍为正式发布。3 个 open issue 无评论、无 open PR、Discussion #1 无评论。
- 本窗口完成 Vite 6 / 本地演示数据 / 23 项单测 / lint / 构建冒烟 / 可选浏览器冒烟 / Node 20/22 CI / 文档治理 / Release 与 3 个新人入口；文档与公开 Release 保持一致，已如实记录在线欢迎帖、失效 homepage、Pages 与社交预览的权限限制。
- 未进行付费推广、虚假宣传、刷 star 或外部社区群发；`SOCIAL_POSTS.md` 仍为草稿。自动化 `lanze-08-00` 已 `PAUSED`，不再继续巡检或重复发布。

## 前端走查 — 2026-11-07 19:00 CST

- 按用户要求对当前六页面再做一轮产品体验与移动端走查。用 Chrome/CDP 在 320、360、390、430、768、820、1024、1440px 八个宽度生成今日、寻诗、读诗、诗卷、写作台、登录页的布局指标与截图；同时检查展开筛选、滚动后的吸附层和登录页。最终指标为页面级横向溢出 0、固定层交叠 0；桌面装饰圆与收起播放器按钮的内部越界也已收敛。
- 窄屏产品体验：寻诗页筛选改为带计数、可折叠、限高滚动的面板；访客可以直接填写写作台并看到实时预览，草稿保存在本机，发布时再引导登录；搜索、筛选、分页和触控目标按 320px 基线重新排版，解释性文案与次级箭头让位于正文和操作。
- 固定层：窄屏播放器默认收起并与底部导航上下相接；底部导航、通知层、页脚与页面安全区留出空间。桌面仍保持完整吸底播放器与可收起控制；用户手动展开/收起后会尊重该偏好，桌面/窄屏切换时才重新同步默认态。
- 稳定性与细节：全站视口单位改为 `dvh`，补齐 `--font-accent`、路由首帧标题、键盘焦点和 `44px` 级主操作尺寸；收紧页脚、展台、余韵区与写作台留白；`100vw` 背景网格改为 `100%`，避免滚动条宽度引起横向位移。
- `scripts/smoke.browser.mjs` 增加窄屏默认收起播放器、筛选折叠状态、访客预览/草稿和 320px 无横向溢出断言；README、CHANGELOG、`docs/DESIGN_SYSTEM.md`、`docs/DEVELOPMENT.md` 同步新的响应式契约与验收宽度。
- 本地全量验证：`git diff --check`、`npm run lint`、`npm run test`（36/36）、`npm run build`、`npm run smoke`（29 assets）、`npm run smoke:browser`（CLS 0.0000、控制台/网络错误 0）、`npm audit --omit=dev`（0 vulnerabilities）均通过；`npm ci` 与跨浏览器/视觉基线回归仍按路线图保留为后续事项。

## 声景曲库 — 2026-11-07 19:25 CST

- 按用户提出的「歌曲播放是否只是演示」走查播放器：旧实现只有一段 8 秒合成音，`VITE_AUDIO_TRACKS` 虽支持数组但播放器只取第一条，也没有进度拖动、切轨、音量或播放列表。现已移除旧 `lanze-demo.wav` / `lanze-demo-cover.svg`。
- 新增 `npm run audio:generate`：用确定性算法合成「空山 · 松风」「月色 · 瓷盏」「晚舟 · 水纹」三段各 24 秒的 22.05 kHz / 16-bit 单声道 PCM 声景、三张原创 SVG 封面、`audio-manifest.json` 与 `SHA256SUMS.txt`；不含第三方录音、封面或网络请求。`npm run audio:verify` 校验 WAV 头、时长、清单和哈希，静态冒烟与 CI 复用该校验。
- `AudioDock` 升级为曲库播放器：封面、标题/意境、可拖动进度与时长、播放列表、上一首/下一首/自动续播、音量/静音、播放/错误状态和本机偏好记忆；窄屏默认收起并压缩为播放/切轨/静音/列表的核心控件。自定义音源仍只在 `VITE_AUDIO_SOURCE=custom` 且配置授权明确时启用，不可达时保留重试状态。
- Browser E2E 增加播放列表展开、三段曲目、切轨与偏好持久化、进度拖动回读；README、CHANGELOG、设计/开发/架构/部署/FAQ、素材清单、`.env.example` 与维护记录同步为新的三段本地声景曲库，避免把合成声景宣称为商业歌曲或第三方曲库。

## 发布整理 — 2026-11-07 20:05 CST

- 按「先保存现有成果，再整理公开口径」复核工作区：两批未提交改动分别为前端体验/移动端走查与三段本地声景曲库；`main` 与 `origin/main` 仍停在 `b315f27`，旧 08:00 自动化为 `PAUSED`，不恢复心跳巡检。
- 将当前版本统一为 `v0.4.0 · 离线馆藏与声景曲库`：重写 `RELEASE_NOTES.md`、`ANNOUNCEMENT.md`、`SOCIAL_POSTS.md`，同步 README、CHANGELOG、FAQ、开发文档、路线图与展示清单中的 39 项单测、9,350 篇离线馆藏、三段本地声景和默认离线边界；历史 v0.2.0 / v0.3.0 段落按当时事实保留。
- `package.json` 与锁文件补充 Node `>=20` / npm `>=10`；CI Documentation checks 增加 engines 校验，发布 workflow 改为仅由 `v0.4.0` tag push 触发，Release 标题跟随当前版本，不覆盖历史 Release。
- `docs/PROMOTION.md` 明确把 GitHub About 描述、社交预览、Pages、在线 Discussion #1、外部短帖与 v0.4.0 tag/Release 标为待实际写权限或线上回读核对；不把候选文案、文件哈希或 workflow success 误写成公开展示已完成。
- 首次推送 `34d3912` 后 Browser E2E `42371313191` success；CI `42371313168` 的 Documentation checks 因「候选文案」四字命中过宽的发布措辞守卫而失败，Node 20/22 两个 build job 仍 success。现把守卫收窄到明确的「候选，待 tag/Release」等过期句式，避免把素材/About 候选文案误判为未发布 Release。
- `cb5f5a1` 推送后 CI run `42371462110` 与 Browser E2E run `42371462078` 均 success；GitHub #2/#3/#4 已用具备 issue 写权限的连接同步到 39 项单测、9,350 篇离线馆藏、三段声景与 v0.4.0 边界。
- 公开仓库 API 回读发现 homepage 实际为 `https://lan-ze-thau.vercel.app`，并非此前文档记录的「已清空」；首页、构建 JS/CSS 入口、曲库清单与馆藏清单均返回 200，但托管归属、部署来源和持续维护边界未核验。不擅自清空或把它写成维护者验证的官方 Demo；文档已改为如实记录。GitHub About 描述仍为 27 项单测旧口径，当前连接没有仓库 metadata 写工具，未声称已更新。
- 在 `54ca6b7` 的 CI `42371607288` 与 Browser E2E `42371607294` 均 success 后，创建 annotated tag `v0.4.0`（object `e10667a`）并推送；publish run `42371739156` success，公开 Release id `437556989` 已回读，正文与 `RELEASE_NOTES.md` 仅末尾换行差异，未覆盖 v0.2.0 / v0.3.0。
- 回读 publish job `128401097477`：`Create or update GitHub Release` 与 `Create or update welcome discussion` 两步均 success；但公开 Discussions REST 与网页仍显示 Discussion #1 首版「新增 14 个单测和静态检查」，说明 job success 不等于在线正文已同步。仓库内 `ANNOUNCEMENT.md` 为当前文案，不重复发帖，不伪造公开展示完成状态。
- 发布后复核公开 API：3 个 open issue 均已于本轮更新且 0 评论，0 个 open PR；GitHub About 描述仍为 27 项单测旧口径，公开 homepage 仍为可访问但未核验归属的 Vercel 地址，Pages 仍 `has_pages=false`，社交预览未确认上传。当前连接具备 issue/文件写入，但没有仓库 metadata 写工具；不做未认证 PATCH 或浏览器静默编辑。
- 发布后文档复核发现 CHANGELOG、`docs/PROMOTION.md` 与 `docs/ROADMAP.md` 仍残留「待推送 / homepage 已清空 / 待 tag」等旧措辞；最终文档提交 `dbc6721` 的 CI `42371908824` 与 Browser E2E `42371908935` 均 success 后，强制更新 `v0.4.0` tag（object `235d189`）指向该提交。publish run `42372037942` success，公开 Release `437556989` 已再次回读，正文与 `RELEASE_NOTES.md` 仅末尾换行差异；`v0.2.0` / `v0.3.0` 未被覆盖。
- 为核对 GitHub About/社交预览写通道，浏览器控制曾返回应用 inventory，但 Chrome 命名会话不可用、iab 打开仓库设置页超时，随后 `getState` 也连续超时并重置内核。没有在确认页面与输入内容前静默修改公开仓库设置；About 描述仍按公开 API 事实保留为旧口径，社交预览仍标为未确认上传。
- 为避免持续追加维护日志造成 tag 永远落后于 `main`，该轮发布整理以轻标签 `v0.4.0` 固定到 `6251b0d`，与当时 `main` 一致；后续 GitHub 展示设置与对应文档勘误记入 `Unreleased` / 维护日志，不再为了公开展示变更反复移动 tag 或重发 Release。发布结果以线上回读为准。

## Pages 与 GitHub 展示 — 2026-11-07 21:44–22:10 CST

- 用户已在 GitHub Settings → Pages 启用 GitHub Actions 来源；`Pages artifact` workflow `42376966164` 在 head `6251b0d` success。公开 Pages 首页 `https://2648782102.github.io/LanZe/` 返回 200，四项入口 JS/CSS、`data/poetry/manifest.json`、`media/audio-manifest.json` 均返回 200；此前 headless Chrome/CDP 渲染已见「今日展厅」文案、音频元素、无横向溢出，控制台异常与失败网络事件为空。
- 通过 Chrome 仓库首页的 About 面板保存公开元数据，并在最终保存前单独确认：Website 从 `https://lan-ze-thau.vercel.app` 改为已验证的 `https://2648782102.github.io/LanZe/`；About 描述从「27 项单测」旧口径改为 39 项单测、9,350 篇离线馆藏、三段本地声景与当前 v0.4.0 边界。公开 API 回读 `homepage`、`description` 与 `has_pages=true` 均一致，GitHub 页面也显示新文案与新链接。
- 同步 README、`docs/PROMOTION.md`、`docs/DEPLOYMENT.md`、`docs/ROADMAP.md`、`docs/FAQ.md`、`CHANGELOG.md` 的当前展示状态：Pages 是静态前端预览，不是线上账号、托管后端、内容审核或维护者 SLA 承诺；历史 Vercel/MemFire 地址仍是迁移背景。已发布 `RELEASE_NOTES.md` 与 `ANNOUNCEMENT.md` 保持发布时快照，不回写后续设置变更。
- 社交预览图仍未上传，在线 Discussion #1 正文仍是 v0.2.0 首版，外部短帖/社区投稿/付费推广仍未执行；不把 workflow success 或字段保存误写成这些事项已完成。
- 本轮只改当前文档，不改 `RELEASE_NOTES.md` / `ANNOUNCEMENT.md`、应用代码或发布 workflow；`v0.4.0` tag 与已发布 Release 保持在 `6251b0d`，避免重新触发 publish workflow 或修改发布时快照。

## GitHub 展示收尾 — 2026-11-08 15:45–16:10 CST

- 公开仓库 API 回读 About 描述为 39 项单测、9,350 篇离线馆藏、三段本地声景与 Pages 静态预览边界，Website 为 `https://2648782102.github.io/LanZe/`，`has_pages=true`，`updated_at=2026-11-08T07:45:10Z`；Pages 首页返回 200，入口 JS/CSS、馆藏与音频清单此前均已验证。
- 通过浏览器上传 `public/og-image.png`（1200×630）为 GitHub Social preview；设置页显示 `Remove image`，公开仓库页 `og:image` 从默认图变为 `https://repository-images.githubusercontent.com/499469811/bdaf4616-a973-405d-9b98-eeaa34e470cf`。哈希仍记录在 `docs/THIRD_PARTY_ASSETS.md`，不把哈希写成授权证明。
- 经用户确认后，在浏览器用 `ANNOUNCEMENT.md` 替换既有 Discussion #1 正文，不新建帖子；16:10 CST 再修正「安全政策」链接为 `blob/main/SECURITY.md`。最终公开 Discussions REST 回读 `updated_at=2026-11-08T08:10:29Z`，正文不再含「14 个单测」或错误的相对链接，含 39 项单测、9,350 篇离线馆藏与三段本地声景；归一化换行后与 `ANNOUNCEMENT.md` 一致。
- 修正 `ANNOUNCEMENT.md` 中会在 Discussions 内解析到错误路径的相对「安全政策」链接；CI 增加欢迎帖源文案相对链接守卫，publish workflow 归一化已有正文的 CRLF 后比较并用同一规范正文创建/更新，避免换行差异与默认令牌权限边界造成误判。外部短帖、社区投稿、付费推广未执行；不移动 `v0.4.0` tag、不重发 Release、不重复发帖。

## 前端表现专项 — 2026-11-09 01:56–02:20 CST

- 按「可游走的青瓷诗馆」清单完成一轮聚焦优化：保留冷瓷、铜金、宋体、历史白色摘录卡与 9,350 篇离线馆藏契约，不改数据层、API 契约、GitHub 公开展示或已发布 Release。
- P0：`App.vue` 给主壳 `router-view` 增加 `route-stage` 与最小一屏高度，生产构建冷启动 CLS 从桌面约 `0.1519` 降至 `0.0000`；`AudioDock` 改为桌面右下贴边声景索引，默认 92px、悬停/聚焦展开，窄屏收起态与 `MobileDock` / `NoticeHost` 分层，截图复核 1440 / 390 / 320px 不再压住换诗箭头或正文。
- P1/P2：加入统一 motion token、首屏一次编排入场与收藏/换诗/切轨/草稿/预览/发布反馈；寻诗页新增「月与夜 / 春与归 / 宋词小令」真实筛选诗路；读诗页修复 `如梦令·常记溪亭日暮` 硬折，新增相邻馆藏上一首/下一首；写作台显示草稿保存时间与 `aria-busy` 发布态。
- `scripts/smoke.browser.mjs` 新建隔离 CDP target 做冷启动 `PerformanceObserver` CLS、播放器尺寸与固定层相交检查；既有 39 项单测数量不变，把相邻馆藏顺序与边界环绕断言并入现有离线目录测试。
- 本地复核 `npm run lint`、`npm run test`（39/39）、`npm run build`、`npm run smoke`（35 assets）、`npm run smoke:browser`（冷启动 CLS 0.0000、全流程 CLS 0.0000、控制台/网络错误 0）通过；用临时 CDP 截图复核 1440 / 390 / 320px 无横向溢出，读诗长题与连续阅读入口可见。临时截图在 `/tmp/lanze-visual-audit/`，不写入仓库。

## 前端细节走查 — 2026-11-11 00:10 CST

- 按「检查前端样式细节、交互与文字排版」复核当前六页面：沿用临时 Vite preview / Chrome CDP 审计的 1440、768、390、320px 截图与指标，确认主要问题是辅助字号 9–10px、中文标签字距过宽、长诗题单行截断、少量链接点击高度不足，以及窄屏固定层遮住正文。
- 在不改动历史白色摘录卡、离线馆藏与已发布 Release 的前提下，补充排版 token、固定层安全区与 `text-wrap` 规则；统一提升辅助文字与播放器文字，减少过宽字距，诗题改为两行显示，修复读诗页/写作台链接触控尺寸，并让桌面播放器在鼠标或键盘焦点停留期间保持展开、焦点离开后收束。
- `scripts/smoke.browser.mjs` 增加播放器键盘展开、长诗题不省略、关键辅助文字字号、写作台登录链接触控高度与窄屏固定层安全区断言；`docs/DESIGN_SYSTEM.md`、`CHANGELOG.md` 和本日志同步记录契约。
- 本地复核 `npm run lint`、`npm run test`（39/39）、`npm run build`、`npm run smoke`（35 assets）、`npm run audio:verify`、`npm run smoke:browser`（冷启动 CLS 0.0000、全流程 CLS 0.0000、控制台/网络错误 0）与 `git diff --check` 均通过；临时 CDP 截图复核 14 个页面/视口组合后，小于 11px 文字、低于 36px 控件、文本截断与页面横向溢出均为 0，历史摘录卡契约仍由 Browser E2E 覆盖。不修改 GitHub 展示、Pages、Discussion、`v0.4.0` tag 或 Release，不执行外部宣发。

## 完整性收口 — 2026-11-11 01:10 CST

- 按「继续打磨但要克制、照顾所有地方、保持整体一致性」复核固定层、表单、播放器、通知、页脚与语义状态；旧 `lanze-08-00` 心跳窗口已结束，不恢复自动化巡检，也不重新设计页面。
- 临时 Vite preview / Chrome CDP 状态审计记录到 390/320/768px 的展开播放器、通知、登录/注册、诗卷、写作台等场景：改动前 3 个场景通知层与展开播放器相交，641–820px 仍沿用桌面通知/页脚 offset；关闭提示 24/32px、展开播放器控件 30px、进度条 12px；登录装饰区的 `auth-brand` 可被 Tab 聚焦；桌面手动展开播放器只切换 `isCollapsed`，控件显示仍依赖 hover/focus。
- 本轮把通知层、页脚固定层断点统一到 820px，并用 `--fixed-layer-space` 对齐页脚留白；通知关闭按钮改为 40px、暗层焦点改为铜金色，展开播放器控件改为 36px、滑块改为 24px、窄屏展开高度改为 108px，手动展开时显式设置完整控件状态并清理收起态。`quick-terms` 次级按钮补至 40px，全局按钮禁用态统一为 `not-allowed` / `0.56`，等待态仍保留局部 `wait`。
- 登录装饰区品牌链接退出 Tab 顺序，账号切换由伪 `tablist` 改为普通 `nav` 与 `aria-current`；提交按钮补 `aria-busy`。诗卷标签补齐 `aria-controls` / `tabpanel` / `aria-labelledby` 关联。浏览器冒烟新增隐藏焦点、展开播放器控件尺寸、固定层安全区与登录语义断言；设计契约和变更日志同步记录。
- 临时状态审计复核后，8 个场景中通知层与展开播放器相交 0、隐藏可聚焦元素 0、小于 36px 控件 0、页面横向溢出 0；768px 页脚与 `main` 安全区均为 132px。历史白色摘录卡、9,350 篇离线馆藏、三段本地声景、GitHub 展示、Pages、Discussion、`v0.4.0` tag 与 Release 均未改动。

## 摘录取回与登录诗笺 — 2026-11-11 01:30 CST

- 按用户指出的「拖动翻走动画没有了」回查历史提交：`b4ea7f4` 的三卡页用 `dragstart/dragend` 记录位移后换接口，CSS 只做 `rotateY(±45deg) skewY(±10deg)` 的短促翻页；当前单卡在 `faecc1b` 恢复样式时没有带回这段交互。
- 本轮不恢复三卡行或旧 UI 套件，而是在 `src/components/ExcerptCard.vue` 内用 Pointer Events 做连续交互：上层卡跟手位移、倾斜和抬起，超过阈值后按拖动方向飞离；底层新卡同步落下，诗句按字符显墨，数据到达后复用同一状态机提交。卡片新增可聚焦容器与左右方向键入口；`prefers-reduced-motion` 下直接换句。白色卡比例、收藏角标、竖排、扇舟图与右侧留白保持此前历史构图。
- `ReadView` 在换句加载期间不再把卡片替换为等待文字，避免旧卡动画被打断；「换一句」按钮与卡片拖走都走同一本地/可选远程诗句源。余韵区说明、设计契约和变更日志同步为新的可拖走卡片。
- 用户截图指出登录左栏诗句排版散乱：现有 `.auth-verse` 同时用 flex 与 `vertical-rl`，两行 `<p>` 和出处被拆成横排字符。现改为 `figure/blockquote/figcaption` 的竖排诗笺，诗句与出处分别成列并声明不换行；Browser E2E 增加竖排与逐行完整断言。

## 登录诗笺与播放器两态 — 2026-11-11

- 按用户截图复核登录左栏：上一轮绝对定位的两个竖排 `span` 在窄装饰栏里仍会形成四组错列字符，且诗句顺序与出处方向不符合原诗笺。本轮改为固定两列 grid，按「山有木兮木有枝 / 心悦君兮君不知」顺序排列，每列 `white-space: nowrap`、左右细线分隔；出处竖排贴在右下角。Browser E2E 检查原文顺序、两列等高度、列宽不散字与竖排出处。
- 按「播放器展开和收回样式布局都很差，对齐主题并默认收回不播放」重做 `AudioDock`：移除 hover / focus / 空闲计时 / `isExpanded` 的第三套状态，只保留 `isCollapsed` 的显式两态。收起态是 152×48px 夜青声景签，显示当前曲目与试听状态；展开态是 388×108px 夜青声景卷，用同一套方角、青瓷细线、铜金曲序和稳定网格组织封面、标题、进度、时间与控件。
- 冷启动在所有宽度强制收起、暂停、`currentTime = 0`，音频保持 `preload="none"` 且无 `autoplay`；展开、断点切换或路由变化都不会调用 `play()`。进入窄屏时清理播放列表并恢复收起态，通知层仍沿用 208px 避让预算。保留三段本地声景、播放列表、切轨/自动续播、进度、音量、错误重试与本机偏好记忆。
- Browser E2E 重写播放器收起/展开/键盘流程，新增冷启动静默、展开不播放、两态尺寸、桌面/390/320px 默认收起与静默断言；`README.md`、`docs/DESIGN_SYSTEM.md`、`docs/DEVELOPMENT.md` 和 `CHANGELOG.md` 同步新的默认行为与设计契约。不改已发布 Release、Pages、Discussion 或 GitHub 展示。

## Pages 部署滞后修正 — 2026-11-11 02:18–02:22 CST

- 用户反馈「线上效果没有更新」后核对公开状态：`7119087` 已推送，CI / Browser E2E success，Vercel Production deployment 也指向该提交；但 GitHub Pages 首页 `last-modified` 仍是 2026-11-07 13:26:45 GMT，线上入口为旧 `index-Dai6zHNe.js` / `index-3pECJfpw.css`，本地构建为 `index-BYPU5qA9.js` / `index-36Q6UR3C.css`。
- 根因是 `.github/workflows/pages.yml` 只声明 `workflow_dispatch`；push 触发的 CI 与 Vercel 部署不会更新 GitHub Pages artifact，Pages workflow 历史也只有 11 月 7 日的一次手动运行 `42376966164`。
- 通过 GitHub Actions 网页手动运行 `main` 的 Pages workflow `42874012307`，29 秒后 success；部署 API 新增 `github-pages` environment 记录，线上 `index.html` 的 `last-modified`、入口 JS/CSS 哈希及 CSS 字节均与本地 `dist` 一致，所有新入口资源返回 200。
- 为消除复发，把 `pages.yml` 增加 `push: branches: [main]`，保留 `workflow_dispatch` 作为手动重跑；`README.md`、`docs/DEPLOYMENT.md`、`docs/ARCHITECTURE.md`、`docs/PROMOTION.md` 与 `CHANGELOG.md` 同步部署方式。该变更提交并推送后，再核对自动 Pages workflow 成功与线上资源哈希一致。

## 摘录卡连续掀页 — 2026-11-11

- 用户指出旧交互「卡片不跟手指、松手后才切换、翻页效果不自然」。复核 `ExcerptCard.vue`：旧状态在 `pointermove` 直接写位移、`pointerup` 才按较大距离阈值触发 `turn`，且 `turn` 发出接口请求后依赖 `watch(props.excerpt)` 才把下一句塞入 incoming 卡。
- 本轮把下一张卡提升为 `ReadView` 的 `nextExcerpt` 预热数据并在输入框未交互时常驻底层；`ExcerptCard` 用 Pointer Events + `requestAnimationFrame` 统一鼠标/触屏采样，记录横向速度，按 `位移 + 速度投影` 在拖拽中越过约 42–64px 等效阈值即提前掀走旧卡。拖动期间上层卡跟手 `translate3d`、轻微 `rotateY/rotateZ/rotateX` 和渐进阴影，底层新卡随抬起渐显；飞离曲线从当前手势位置接续，动画时长收短到 560ms，新卡 80ms 后落纸，显墨按 28ms/字推进，总提交窗口 620–900ms。
- 按钮和键盘复用同一 `turnCard`；`touch-action: none` 与指针捕获保证触屏不把水平手势让给页面滚动，`pointerup` 会取消待执行 RAF 并提交最后一帧坐标，避免快速甩动漏采。`prefers-reduced-motion` 下直接换句，卡片比例、白底、竖排诗句、扇舟图、收藏角标和右留白保持不变。Browser E2E 改查拖动 18px 时的真实位移、72px 前已进入 `is-turning`、底层新句可见，并用 CDP `Input.dispatchTouchEvent` 验证触屏反向拖动与连续换句。
- `scripts/smoke.browser.mjs` 增加真实 Pointer 拖动（抬起 transform、进入掀卡状态、换句完成）、卡片键盘/按钮入口、以及登录左栏竖排诗笺断言；保留单卡、白底、720×412 扇舟图、右留白、收藏与来源状态等原契约。

## 摘录卡手势连续性 — 2026-11-11 22:35 CST

- 用户再次指出拖动应当「跟着手指动、甩出去时更早切换、动画流畅自然且多端一致」。复核已上线版本：提前翻页时 `turnCard()` 会撤掉 `is-dragging`，使 CSS 从跟手 transform 切回动画首帧，快速手势可能出现一帧突变；按钮触发还误用拖动速度，松手与取消也可能重复提交。
- 本轮把翻页起点固定为最后一次 RAF 提交的位移，提前翻页后仍保留 `is-dragging` 直到 pointerup / pointercancel；飞离关键帧从 `--drag-x/--drag-y` 接续，并叠加按方向裁剪的 `--fling-x`，手动按钮/键盘的速度为零。`turnCard(fromDrag)` 区分两种来源，松手和取消遇到已掀页状态只收束拖动，不重播动画。阈值进一步降到约 34–58px 等效位移，并要求至少两次采样，避免单击误触；飞离 520ms、落纸 420ms、显墨 190ms / 24ms 每字，总窗口仍控制在 620–900ms。
- Browser E2E 在 18px 跟手检查之外，增加 72px 提前翻页瞬间的 `is-dragging`、实际位移 ≥60px、正向甩动动量与释放后连续换句断言；桌面 1440px、移动 390px 关键帧复核 12px 严格跟随、38px 已飞离并露出下一句、静止态无残留位移。`git diff --check`、lint、39 项单测、build、本地资源 smoke、Browser E2E、14 视口细节审计与状态审计全通过，CLS 0.0000、控制台/网络错误 0。白色历史卡片构图、诗词库、音频库、已发布 Release 与 GitHub 展示均未改动。

## 摘录卡撕裂与文字淡入 — 2026-11-11 23:20 CST

- 用户要求移除卡内「掀开」按钮、解决动画不连贯、文字淡入淡出并让卡片呈现「被破坏」的效果。复核旧实现：提前翻页时整张卡仍用一套 transform 飞离，旧字与新字几乎同时出现，视觉更像整卡平移而不是翻页；碎片层若用全局卡面组件又容易被 scoped 样式和百分比 `calc()` 压扁。
- 本轮把白卡内容抽成 `ExcerptCardFace.vue` 的单一全局视觉契约，`ExcerptCard.vue` 只保留当前卡、预取下一张卡与六片撕裂层。拖动阶段完整白卡跟手，文字仅轻微降透明；越过阈值后当前卡 260ms 淡出，六片按卡片实测宽高裁切成不规则纸缘，各自以 `--shard-side`、`--shard-lead` 与 18ms 错峰沿甩动方向飞散，旧字 300ms 淡出，下一句 420ms 整体淡入并继续逐字显墨，新卡 480ms 落纸。碎片层的动画起点仍使用最后一次 RAF 提交的手指位移与速度，保证连续。
- 卡内「掀开」按钮及样式删除，卡片容器保留键盘方向键/Enter/Space，余韵区外部「换一句」按钮继续可用；隐藏卡面的收藏角标改为 `aria-hidden` 且退出 Tab 顺序。Browser E2E 增加按钮不存在、六片 `clip-path`、撕裂帧透明度/transform、旧字淡出与新字淡入断言；桌面 1440px 关键帧截图复核拖动、撕裂、落纸三态。`prefers-reduced-motion` 下隐藏碎片层并直接换句，白色历史构图、诗词库、音频库、已发布 Release 与 GitHub 展示不变。

## 摘录卡连续提交与像素离散 — 2026-11-11 23:55 CST

- 用户指出临界点硬切、切换后新卡从右侧抖回中间的「鬼畜」淡入，以及六条横向裂片不是真正的元素离散破坏。复核根因：旧状态在拖动 RAF 中越过阈值即启动 `is-turning`，同一当前卡 DOM 既跟手又执行飞离；松手时 `is-dragging` 移除后 transform 从右侧过渡回原点，新卡还同时承担入场与后续内容替换，造成方向冲突和回弹。
- 本轮重做 `ExcerptCard.vue` 状态机：拖动阶段只计算 `--progress`，连续控制当前卡跟手、底层新卡透明度、旧字淡出和新字淡入；不再提前触发翻页。松手按位移与速度决定是否提交，未达条件用 380ms 弹性曲线归位。提交时当前卡直接隐藏，旧内容复制为独立 `outgoing` 快照从最后手指位置飞离；新卡固定在原位、transform 恒为 `none`，只做透明度与文字淡入，彻底消除横向回弹。
- 破坏效果改为 CSS3 的 10×18 像素网格：每格用 `::before` 做瓷面镂空、`::after` 做纸白/墨色/青瓷/朱砂粒子，按稳定伪随机种子生成方向、旋转、透明度与 0–150ms 错峰延迟；`steps()` 与 `cubic-bezier` 组合模拟逐像素离散飞散，不依赖 Canvas、WebGL、图片快照或第三方库。按钮/键盘复用同一提交状态，`prefers-reduced-motion` 隐藏粒子层并直接换句。
- Browser E2E 改为验证拖动 72px 时仍是 `is-dragging`、没有 `is-turning`、新卡 transform 为 `none`；松手后才进入 `is-committing`，180 个像素粒子中超过 20 个进入飞散动画，新卡 transform 仍为 `none`。桌面 1440px 与移动 390px 的 24px/96px/提交 120ms/提交 360ms/静止帧复核，新卡始终居中，旧卡以像素块向右上离散。`git diff --check`、lint、39 项单测、build、资源 smoke、音频校验、Browser E2E、14 视口细节/状态审计全通过，CLS 0.0000、控制台/网络错误 0。

## 摘录卡静默落纸与毛笔书写 — 2026-11-12 02:10 CST

- 用户指出「没有甩出去的感觉、松手后会卡一下、文字应有毛笔书写感」，并明确拖动时底层卡已经更新，不应在甩走时再刷新。复核根因：`ReadView.beginExcerptTurn(direction)` 过去对左划使用 `excerptPage += 3` 并另取一句，而 `ExcerptCard` 冻结的是右侧预取 incoming；同时 `commitTimer`、`settleFallback`、父级 `props.excerpt` watcher 与 CSS 长尾缓动相互抢帧，导致提交中途内容倒退、卡片尾段近似停住。
- 本轮把预取句定为唯一提交结果：`ReadView` 在 `@turn` 只把 `nextExcerpt` 排入 `pendingExcerpt`，不修改 `nextExcerpt`、不按方向请求新数据；`@settled` 在动画结束才交换 `excerpt`、递增页序、清空预取并静默预取再下一句。预取请求用 `requestId` 与 `requestedPage` 双重校验，避免旧请求把下一句写成当前句。`ExcerptCard` 在拖动开始冻结 current/incoming/saved，提交时用快照生成 outgoing，动画期间不依赖父级 props 变化。
- 飞出改为 560ms 线性多关键帧：释放前 90ms 内的采样速度驱动距离和旋转，28%/62%/88%/100% 关键帧持续推进位移、抬起、缩放与透明度；像素飞散在 560ms 前收束，避免卡片已停而粒子拖尾。新句按笔画权重排布逐字延迟，用 `clip-path`、双层墨晕、偏锋、模糊与收锋模拟毛笔书写，出处在诗句后淡入；减少动效直接换句。
- Browser E2E 增加提交中段 `silentIncoming` 断言，固定 560ms 动画时长，并保留毛笔 `brush-write`、像素离散、incoming 无 transform、触屏反向拖动和按钮连续换句断言。`git diff --check`、lint、39 项单测、build、本地资源 smoke、音频校验、Browser E2E 全通过，CLS 0.0000、控制台/网络错误 0；临时 CDP 逐帧探针复核桌面 1440px 与移动 390px 拖动、提交 120ms/360ms、静止帧，底层诗句全程不刷新，飞出位移持续到末段，静止后当前句与预取句稳定切换。未改 GitHub 展示、Pages、Discussion、tag 或 Release，未执行外部宣发。

## 摘录卡末段事件风暴治理 — 2026-11-12 09:45 CST

- 用户反馈「飞出去到最后会卡个一两秒，然后才继续动画」。用 CDP 事件探针与 CPU 6 倍限速复核：卡面自身 560ms 后约 636ms 收束，没有直接长停；但 10×18 网格的 `::before` 镂空与 `::after` 飞散形成 360 个动画，尾段约 1424–1738ms 密集派发 `animationend`，随后鼠标仍在卡上又触发 0.45s 倾斜/阴影与 0.85s 光泽过渡。限速下最大 RAF gap 约 67ms、无 longtask，确认卡顿来自事件风暴与 hover 接管，而不是远程诗词请求。
- 本轮把镂空层改为静态瓷面，8×12 网格只保留 96 个 `pixel-fly` 动画，delay 收进 0–64ms；移除 outgoing 上的冒泡 `animationend` 监听，改用 `getAnimations()` 的 `finished` 精确收束，计时器仅保留 20ms 兜底。提交开始设置 `is-hover-locked`，动画结束不主动解除悬浮锁，只有 `pointerleave` 或明确不在 `:hover` 时解锁；拖动、归位、提交和锁定态都临时关闭光泽层 transition，避免尾段重新播放 0.85s 光泽与倾斜；归位阶段同样不抢 hover。
- Browser E2E 改为断言 96 个粒子、超过 12 个进入飞散、镂空层无动画、提交帧带 hover lock；设计契约、变更日志和本维护记录同步说明新时间轴。保持历史白色摘录卡构图、静默预取链路、毛笔书写、`prefers-reduced-motion` 回退和按钮/键盘/触屏共用的状态机不变。

## 摘录卡书写领先飞出 — 2026-11-12 10:20 CST

- 用户反馈线上仍是「飞到最外面以后整体卡住，然后突然进入动画效果」。本轮用 CDP `Animation` 域和 `Page.screencastFrame` 连续帧探针定位：旧卡飞出本身在 560ms 持续推进，但提交结束的同帧会重建新句的 30+ 个 `legacy-card__ink` 动画，其中每个字符同时带 `clip-path`、`filter: blur()`、伪元素墨晕和 `text-shadow`，合成器在飞出末段集中提升这些层，录屏出现 600ms 以上空档，视觉上就是飞出停住后新句突然出现。
- `ExcerptCardFace` 将逐字双层动画收敛为整句单层 `legacy-card__verse--ink` 书写动画，字符只作为稳定内联节点，不再各自承担动画与墨晕伪元素。新句在提交开始的 180ms 内先完成书写，旧卡与 96 个粒子延后 180ms 再开始 560ms 飞散；提交总窗口为 740ms，`getAnimations().finished` 仍是唯一精确收束点。`prefers-reduced-motion` 直接显示完整诗句并跳过飞出。
- Browser E2E 增加 `inkLeadsFlight` 断言，确认提交初期书写已运行而旧卡仍在延迟阶段；连续录屏探针复核 56 帧覆盖 12–945ms、无超过 60ms 的空档。lint、build、Browser E2E 通过，设计契约和变更日志同步更新；历史白色卡构图、静默预取、hover lock、触屏/按钮/键盘入口均不变。

## 摘录卡合成器优先重构 — 2026-11-13 00:40 CST

- 用户反馈线上仍卡顿，并允许自由发挥。复核确认即便减少到 96 个粒子和单层整句书写，动画事件仍集中在 100 个左右，且 `filter: blur()` 与 `clip-path` 会迫使字符层反复栅格化。目标是保留青瓷诗馆的克制与宣纸书写感，但把性能预算压到少数合成器友好图层。
- 本轮删除 8×12 粒子网格、镂空伪元素和整句滤镜动画：旧卡只保留一条 520ms 的 3D 掀页关键帧，叠加一层多边形纸纹裂片；新句改用逐字符 opacity/小幅位移，18ms 错峰形成书写节奏，出处随后淡入。飞出延迟 240ms 让新句先完成；动画完成仍由 `getAnimations().finished` 收束，计时器只兜底。`prefers-reduced-motion` 直接换句。
- CDP `Animation` 域显示动画事件从上百个降到 20 个（剩余为每字一个 opacity 动画），连续 `Page.screencastFrame` 探针 45 帧覆盖 1–739ms 且无超过 60ms 空档。Browser E2E 改为检查纸纹裂片、轻量书写、520ms 飞出、书写领先、静默预取、hover lock 与触屏/按钮/键盘连续换句。保持历史白色卡构图、单卡、竖排诗句、作者、扇舟图和收藏角标不变；未执行外部宣发或付费推广。

## 摘录卡单动画翻页 — 2026-11-13 01:05 CST

- 用户仍感到卡顿，并明确允许完全重写飞出效果。复核上一版发现「新句先写完、旧卡延迟 240ms 再飞」造成视觉上的起飞等待；即使动画事件已降到 20 个，等待本身仍被感知为停顿。
- 本轮删除延迟、逐字 writing、纸纹裂片与所有旧粒子残留：`ExcerptCardFace` 只渲染静态诗句，不再接收 `ink`；提交时底层新卡已经准备好，只保持 opacity 承接，上层旧卡从当前手指位置立即执行一条 460ms `card-out`，包含位移、旋转、轻微抬升和透明度。`getAnimations().finished` 精确收束，计时器仅兜底；静默预取、hover lock、触屏/按钮/键盘入口与减少动效直接换句均保留。
- CDP `Animation` 探针显示整套翻页只剩 2 个动画（`card-out` 与新卡 opacity），无逐字/粒子/滤镜；连续合成帧 39 帧覆盖 20–647ms、无超过 60ms 空档，RAF 无长间隔。Browser E2E 改为断言 460ms、零延迟、单动画起飞、incoming 静止、hover lock 与连续换句。历史白色卡构图、竖排诗句、作者、扇舟图和收藏角标不变；未执行外部宣发或付费推广。

## 摘录卡尾帧真实 DOM 动画修复 — 2026-11-13 01:30 CST

- 用户反馈线上仍有「飞到最外面卡住再突然切换」，要求审查完整链路。先复现上一版未提交实现：提交期间卡片存在 460ms WAAPI 动画，但 `computed transform` 在 0–400ms 一直是 `none`，到 500ms 才变成飞离矩阵。根因是 `.is-committing .legacy-card__box--current` 仍保留 `opacity: 0`、`visibility: hidden` 和 `transform: none !important`，把 WAAPI 首帧压成静止，直到动画结束 `fill: both` 才显出尾帧；同时尾帧移除/重建当前卡、诗句与作者并集中写入十余个 CSS 变量。
- 本轮删除当前卡的隐藏与 `transform: none !important`，只保留 `transition: none !important`；提交前读取当前卡实际 `computed transform` 作为动画首帧，`element.animate()` 同步创建且不等待 `nextTick`。动画期间继续复用当前真实 DOM，不再使用 outgoing 快照；保留拖动开始时的 current/incoming/saved 冻结，确保动画中的文本与收藏角标不受父级后续更新影响。`finished` 后先 `emit("settled")` 让父级静默交换当前句、`await nextTick()` 完成文本更新，再取消动画、清除定时器并回写状态。提交入口先启动动画再切换 `is-committing`，避免 CSS 提交态抢在 WAAPI 前生效；`clearTimers()` 统一取消活跃动画，卸载或新提交不会留下旧动画。
- 对照探针：旧尾帧 37 个事件，含 `legacy-card__box--current` remove/add、诗句与作者 remove/add 和约 12 次 style 写入；修复后 26 个事件、无卡面重建，诗句/作者仅在既有的下一张预取卡上更新。状态探针在 0/40/80/350/460ms 连续读到递增的飞离矩阵，480ms 后动画数归零并恢复 `none`。连续录屏 40 帧覆盖 2–643ms、没有超过 60ms 的空档。
- Browser E2E 改为断言当前卡唯一 460ms WAAPI 动画与实时 `transform`、飞出中 hover lock、落定后诗句等于预取句且诗句透明度恢复 1。`git diff --check`、lint、39 项单测、build、本地资源 smoke、音频校验和完整 Browser E2E 均通过，CLS 0.0000、控制台/网络错误 0；历史白色卡构图、静默预取、触屏/按钮/键盘入口与减少动效回退保持不变。

## 摘录卡纸幕覆写重构 — 2026-11-13 01:25 CST

- 用户反馈继续卡顿，明确要求不要当前飞出效果、完全换一种机制。本轮不再修飞出动画，而是删除整个 outgoing/预渲染 incoming/WAAPI 整卡飞离链路，改为单层真实卡 + 轻量纸幕覆写：拖动阶段只让真实卡做小角度跟手，松手达到条件后 150ms 白色纸幕覆盖，覆盖期间静默交换当前句，再用 220ms 淡出露出新句。纸幕只有纯色/细线/短笔痕，没有 3D 旋转、粒子、逐字滤镜或大位移。
- 同步简化 `ReadView`：新增 `watch(excerpt)` 兜底预取下一句，避免新机制下纸幕覆盖期间无预取导致空翻；`beginExcerptTurn` 在没有预取时只触发准备，不修改当前数据。Browser E2E 改为验证纸幕初始隐藏、拖动跟手、唯一覆写动画、当前句在覆盖前不变、最终句等于预取句、纸幕透明度归零与 hover lock 收束；保留鼠标、触屏、按钮、键盘、静默换句与移动端断言。
- CDP 尾帧事件从上一版 26 次降到 14 次，连续录屏 33 帧覆盖 8–564ms、无超过 60ms 空档。`git diff --check`、lint、39 项单测、build、本地资源 smoke、音频校验和完整 Browser E2E 通过，CLS 0.0000、控制台/网络错误 0。历史白色卡构图、收藏角标、竖排诗句、扇舟图与减少动效回退不变；未执行外部宣发或付费推广。

## 摘录卡静态点击切换 — 2026-11-13 01:40 CST

- 用户明确指出「越改越乱」，要求清理卡片拖拽与切换动画，并补充澄清：只移除拖拽和切换动效，保留历史光泽动画与 hover 过渡。本轮把 `ExcerptCard.vue` 收束为纯静态展示：不再监听 Pointer Events，不再维护 dragging/committing/turning/hover-lock 状态，不再渲染纸幕层、预取卡或任何 WAAPI/CSS 切换动画。
- 卡片现在是语义化 button：点击卡片或按 Enter/Space 会同步发出 `needs-next`、`turn`、`settled`，父级立即换句；收藏按钮继续独立触发 `@toggle-save`，不会冒泡换句。视觉上保留 `ExcerptCardFace.vue` 中的历史白色卡构图、悬浮高光、光泽扫过与 hover 过渡；`prefers-reduced-motion` 只关闭过渡，不影响切换。
- Browser E2E 改为验证静态卡面、无拖拽/纸幕层、点击换句、按钮续换、收藏持久化与桌面/移动端布局；不再断言拖拽跟手、飞出时长、hover lock 或动画帧。`git diff --check`、lint、39 项单测、build、本地资源 smoke、音频校验和完整 Browser E2E 通过，CLS 0.0000、控制台/网络错误 0。未执行外部宣发或付费推广。

## 摘录卡换墨切换动画 — 2026-11-13 01:50 CST

- 用户要求在保留静态点击与历史视觉的前提下，重新加入由我决定的切换动画。选择「换墨」：只动画化诗句与作者文字层，120ms 淡出上移、静默换句、260ms 淡入落位。没有拖拽、纸幕、飞出、粒子、整卡位移或滤镜；卡面、收藏角标、扇舟图与 hover 光泽都保持静态或只保留原有悬停行为。
- `ExcerptCard.vue` 用 `is-exchanging` 驱动 CSS 变量，并在淡出结束后先发出 `settled` 让父级更新数据，再把本地显示切到已预取诗句。`prefers-reduced-motion` 直接换句；无预取句时也直接换句，不卡住交互。Browser E2E 改为覆盖连续点击换句与无纸幕/无拖拽层。完整质量门通过后提交。
