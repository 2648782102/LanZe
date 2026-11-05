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
