# 展示与宣发清单

> **状态：仓库内素材与 GitHub About 候选文案已更新，线上展示待核对。** `v0.2.0` 与 `v0.3.0` 均为已发布 Release；`RELEASE_NOTES.md`、`ANNOUNCEMENT.md`、`SOCIAL_POSTS.md` 已改为当前 `v0.4.0` 文案。失效 homepage 已清空；GitHub About 描述、社交预览图、Pages、在线欢迎帖正文、社交平台短帖、外部社区投稿和付费推广仍须按实际写权限与线上回读核对。最后整理：2026-11-07。

## 1. 推荐仓库定位

### 仓库描述（GitHub About，不超过 350 字）

简体中文主版本：

```text
兰泽诗词（LanZe）是一个开源的中文古诗词前端：用 Vue 3、Vite 与自有组件呈现「青瓷数字诗馆」——今日展厅、单张历史摘录卡、9,350 篇离线馆藏、收藏、创作、我的诗卷与三段本地声景。始于 2022 年，2026 年重构为可本地安装、可复现构建、带 39 项单测与 CI Browser E2E 的社区维护仓库；支持离线馆藏/mock 约定、MIT 许可与中文贡献文档。当前不承诺线上 Demo 或托管后端，欢迎从文档、素材授权、跨浏览器回归与前端稳定性开始贡献。
```

可选英文短版：

```text
An open-source Vue 3 frontend for classical Chinese poetry, rebuilt as a “Celadon Poetry Room”: a daily reading room, one restored excerpt card, 9,350 offline poems, saved poems, a writing desk and a personal collection, with three reproducible local soundscapes. Locally buildable, documented in Chinese, MIT-licensed, with 39 unit tests and Chromium CI E2E. No hosted backend or public demo is promised.
```

### Topics 建议

主 agent 可在 GitHub About → Topics 中按需添加（GitHub 建议数量有限，按相关性排序）：

```text
vue3, vite, javascript, frontend, chinese-poetry, poetry, classical-chinese, chinese-literature, open-source, static-site, design-system, mit-license, docs, github-actions, browser-testing, chinese, education, web-app
```

优先组合：`vue3, vite, chinese-poetry, poetry, frontend, javascript, open-source, static-site, design-system, github-actions`。移除与当前实现无关的 `element-plus`，不要为曝光添加无关热门标签。

### About / README 展示要点

- Website 字段：已清空历史失效 Vercel 域名；在 GitHub Pages 实际部署并验证前继续**留空**，不要填历史 MemFire 地址。
- Social preview：仓库已提供 `public/og-image.svg` 与由它渲染、目检过的 `public/og-image.png`（1200×630）。上传 GitHub Social preview 需要浏览器中的仓库设置写权限；在设置页实际保存并回读前，不把它写成已展示。
- README 首屏：项目定位 → 当前状态表 → 快速开始 → 本地演示/变量 → 路线图 → 许可证。不要在首屏堆砌 star/badge 或虚假在线体验。
- Badges：保留 MIT、CI、Browser E2E、Vue 3、Changelog 与 v0.4.0 Release；CI / E2E badge 的 workflow 文件名必须与 `.github/workflows/ci.yml`、`.github/workflows/browser-e2e.yml` 一致。
- About 勾选/展示：README、License、Activity、Discussions（若启用）；不承诺「production-ready」「official demo」「hosted API」。

## 2. 仓库侧动作清单（交给主 agent）

| 顺序 | 动作 | 依据文件 | 执行前核对 |
| --- | --- | --- | --- |
| 1 | 合并代码与文档改动，确认 `npm ci && npm run build && npm run test --if-present && npm run lint && npm run smoke && npm run smoke:browser` 通过 | `README.md`、`.github/workflows/ci.yml`、`.github/workflows/browser-e2e.yml` | CI 三 job 与独立 Browser E2E 均为绿色 |
| 2 | 设置 About 描述、Website（留空或已验证 Pages URL）、topics、社交预览图 | 本文件第 1 节、`public/og-image.svg`、`public/og-image.png` | 不沿用旧展示域名 |
| 3 | 启用 Discussions（如尚未启用），发布欢迎帖 | `ANNOUNCEMENT.md` | 将占位日期/链接替换为真实值 |
| 4 | 创建 tag `v0.4.0` 与 GitHub Release，不覆盖历史 Release | `RELEASE_NOTES.md`、`.github/workflows/publish.yml` | 只描述已合并内容；tag 与 CI/Browser E2E 通过 |
| 5 | 确认 CI 与 Pages 权限；Pages 按需手动触发（workflow 含 configure/upload/deploy 标准步骤） | `.github/workflows/ci.yml`、`.github/workflows/pages.yml`、`docs/DEPLOYMENT.md` | 不自动部署到失效域名；首次运行前在 Settings → Pages 选 GitHub Actions |
| 6 | 给适合新人的 issue 加 `good first issue` / `help wanted` 标签 | `.github/ISSUE_TEMPLATE/*` | 先写清复现步骤或预期结果，避免空任务 |
| 7 | 发布一条 Release/Discussion 公告，再按平台节奏发布短帖 | `SOCIAL_POSTS.md` | 不夸大 star、用户数、线上 Demo 或后端能力 |

**执行记录：** `v0.2.0` 的第 3、4、6 项与 v0.2.0 Release/Discussion 已完成；`v0.3.0` 的第 1、4、6 项已完成。`v0.4.0` 的仓库文案、Release notes、欢迎帖文案、短帖草稿与发布 workflow 已同步到 39 项单测、9,350 篇离线馆藏和三段本地声景；`main` 推送、CI/Browser E2E、tag/Release 与 GitHub About 线上回读须在保存后逐项补齐。Website 已清空；`public/og-image.png` 已生成但社交预览未确认上传；Pages 未启用；在线 Discussion #1 正文仍为 v0.2.0 首版；短帖仍为草稿，外部社交媒体未发布。

### 社交预览图渲染复核

- 来源：`public/og-image.svg`（1200×630），SHA-256 `f3f1d2dc1af474ed3af7d2c513e6c688b296386da285f3c28d1551a870eeda04`。
- 产物：`public/og-image.png`，1200×630 PNG，SHA-256 `34acbf01d0fbc94a5db478dcc99c7358921eaac5c413f0dbb8151b0349bfce4c`。
- 本机使用 Chrome 按 1200×630 视口加载 SVG 并截图；画面按青瓷展厅的冷白瓷面、青灰线框、铜金索引色与馆藏诗意图绘制，已目检标题、诗句、页边规则线、GitHub 地址与四边留白，无裁切或缺失字形。Quick Look 的 `-s 1200` 会生成 1200×1200 方图，不适合作为社交预览图。
- 两张图都是当前设计衍生插画，不是运行截图，且仍是仓库内待上传素材；在 GitHub Settings → Social preview 实际上传并回读前，不把「社交预览已更新」写成事实。当前二进制哈希也记录在 `docs/THIRD_PARTY_ASSETS.md`。

## 3. GitHub Discussions 欢迎帖

已发布 v0.2.0 欢迎帖：[欢迎参与兰泽诗词的重新整理 👋](https://github.com/2648782102/LanZe/discussions/1)。分类 `Announcements`，由 tag 发布 workflow 幂等创建并避免重复发帖。正文同步会比对现有内容；Actions 默认令牌对 `updateDiscussion` 缺少写权限时，workflow 会保留原帖并输出 warning，不把它误报为已更新。2026-11-06 06:30 巡检读取公开 Discussions REST 数据，确认线上欢迎帖正文仍是首版「新增 14 个单测和静态检查」；[`ANNOUNCEMENT.md`](../ANNOUNCEMENT.md) 才是仓库内 v0.4.0 当前文案，不把该帖写成已同步。后续在线更新需维护者明确授权且具备 Discussions 写权限的令牌，或人工编辑；浏览器人工修改公开帖还须在最终保存前单独确认；不重复发帖。

欢迎帖应引导四类讨论：文档勘误、本地复现、mock/API 契约、素材授权；明确「暂无线上 Demo」与「社区维护、不承诺响应 SLA」。

### 新人入口

已创建 3 个范围明确、带验收标准的 open issue，均标记 `good first issue` 与 `help wanted`：

- [#2 为本地演示 API 补充边界单测](https://github.com/2648782102/LanZe/issues/2)（当前 39 项单测包含演示 API 的随机诗、分类、搜索与合并边界；保留资料回退、错误传播、存储降级等后续入口）
- [#3 复核浏览器回归、音源状态与展示一致性](https://github.com/2648782102/LanZe/issues/3)（CI Browser E2E、三段本地曲库与不可达音源状态已落地；保留跨浏览器/视觉回归、视觉截图、真实后端契约与 GitHub 展示核对）
- [#4 核验历史素材、favicon 与展示图授权](https://github.com/2648782102/LanZe/issues/4)（当前树已移除 Lottie JSON；保留字体/图片/favicon/诗词文本授权核验）

这些 issue 不设增长目标，也不把新人当作免费劳动力；每条都写明背景、最小范围、验收标准与边界。

## 4. Release 状态

历史发布：[v0.2.0 Release](https://github.com/2648782102/LanZe/releases/tag/v0.2.0)，标题「兰泽诗词 v0.2.0 · 本地可运行的开源前端」。该 Release 固定描述当时版本，不用当前 [`RELEASE_NOTES.md`](../RELEASE_NOTES.md) 覆盖。

当前发布：`v0.4.0 · 离线馆藏与声景曲库`，文案位于 `RELEASE_NOTES.md`；发布 workflow 仅由 `v0.4.0` tag push 触发。`v0.3.0` 的历史状态已回读：CI run `42354267725` 与 Browser E2E run `42354267756` 均为 success，publish run `42354434490` 为 success，公开 Release `437433058` 仍为正式发布；`v0.2.0` 保持独立历史 Release。v0.4.0 的最终 commit、CI/Browser E2E、publish 与公开 Release 回读结果须在 tag 实际推送后补记。

发布核对：

- [x] 合并后的 README 与 `LICENSE` 都为 MIT 且年份/贡献者一致。
- [x] CI / Browser E2E / Release badge 指向真实 workflow 或 Release；已发布 v0.3.0 的 27 项单测描述按历史文案保留。
- [x] `CHANGELOG.md` 的 `v0.3.0` 段对应已发布内容，`v0.4.0` 段记录当前改动，并保留新的 `Unreleased` 区。
- [x] 不写「线上 Demo 已恢复」「后端已上线」「已通过安全审计」等未验证表述。
- [x] 说明历史代码限制、第三方资源授权、Discussion #1 与后续路线图入口。

## 5. 宣发短帖（草稿，不自动发布）

文案：[`SOCIAL_POSTS.md`](../SOCIAL_POSTS.md)，包含 5 条中文与对应英文短版，适合 X/微博/即刻/小红书风格的改写起点。发布时：

- 附上仓库链接或已验证的 Release/Discussion 链接，不附历史失效 Demo。
- 强调「开源、古诗词、本地 `npm run dev` 可运行、Vue 3 现代前端栈、MIT、欢迎贡献」。
- 可配 `public/og-image.png` 或真实本地录屏；未录制前不要使用来源不明的截图。
- 不写具体 star 数、下载量、用户量、性能提升百分比，除非有可复核来源。
- 不同平台错开措辞，避免同一时段刷屏；发布后把有效反馈整理成 issue，而不是只在评论区讨论。

## 6. 社区投稿与曝光清单（尚未执行）

| 渠道 | 最小可执行动作 | 前置条件 | 可信度要求 |
| --- | --- | --- | --- |
| GitHub Discussions | 发布欢迎帖、置顶、建立 3–4 个讨论分类 | 仓库启用 Discussions、主 agent 有权限 | 链接到已合并文件，不宣称已发布服务 |
| GitHub Release | v0.4.0 notes 已整理，待 tag 发布并关联 CHANGELOG | tag、CI 与 Browser E2E 通过 | 逐项可验证；不覆盖 v0.2.0 / v0.3.0 |
| GitHub Topics / About | 设置描述、topics、社交预览图 | 合并完成 | 标签与项目实际相关 |
| 即刻 / 微博 / 小红书 | 从 `SOCIAL_POSTS.md` 选 1 条中文短帖，配 hero 图 | 人工确认文案与图片授权 | 不买量、不刷互动、不虚构数据 |
| X / Mastodon / LinkedIn | 从英文短帖选 1 条，附仓库链接 | 人工确认英文摘要 | 不夸大 production-ready |
| Vue / 前端中文社区 | 投一篇「旧项目现代化：治理先行」的技术短文 | 至少完成 Vite 升级或请求层收敛，避免只宣发 | 写明已知限制与复现命令 |
| 开源活动 / 高校社团 | 发布 3 个 `good first issue`（文档、测试、mock 数据） | issue 模板和标签已就位 | 提供验收标准，不把新人当免费劳动力 |
| 技术播客/ newsletter | 提交项目介绍与贡献入口 | 有一个可演示的本地录屏 | 说明项目由社区维护，无官方支持承诺 |
| 中文诗词/数字人文社区 | 讨论公版文本、授权和 UI 可访问性 | 授权清单至少起草 | 不把第三方语料称为本仓库原创 |

## 7. Demo 录屏脚本（建议，尚未录制）

时长 45–75 秒，不添加未经核实的字幕/数据：

| 时间 | 画面 | 口播/字幕要点 |
| --- | --- | --- |
| 0–8s | README 首屏、hero 图 | 「兰泽诗词：一个本地可运行的中文古诗词开源前端」 |
| 8–18s | 终端 `npm ci && npm run dev` | 「Node 20/22，按锁文件安装，启动本地开发服务器」 |
| 18–32s | 今日展厅与换诗 | 「一首诗一展厅；先安静读完，再进入索引」 |
| 32–45s | 诗词索引、搜索结果、窄屏布局 | 「以青瓷数字诗馆重排阅读、检索与创作流程」 |
| 45–58s | `npm run build && npm run test && npm run lint && npm run audio:verify && npm run smoke:browser`、CI / Browser E2E workflow | 「可复现构建，Node 20/22 CI；39 项单测、静态扫描、曲库校验与 Chromium 冒烟都在 workflow 中」 |
| 58–70s | CONTRIBUTING、ROADMAP、LICENSE | 「MIT、贡献指南、路线图；当前不承诺线上 Demo 或托管后端」 |

录制前检查：终端不出现密钥/私人路径；浏览器不使用真实账号；若第三方 API 不可用，切换到 mock 或明确标注「演示数据」；字幕不出现 star 数或「正式上线」。

## 8. 度量与复盘（不承诺增长目标）

发布后 24–72 小时可由主 agent 记录：CI 是否稳定、Discussion 是否有可转化 issue、文档链接是否失效、是否有授权/安全反馈、短帖是否带来可复现的构建问题。只记录可观察事实，不设「涨多少 star」这类目标，也不把曝光数字当作项目成功标准。

若发现 README/CI/Release 与最终代码不一致，先修仓库再更正对外文案；必要时在 Discussion 留言说明修订，不删除历史误导信息而不留痕。
