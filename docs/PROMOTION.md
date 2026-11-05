# 展示与宣发清单

> **状态：可执行，但尚未执行。** 本文件由治理子任务写入，不代表已经调用 GitHub API、修改仓库设置、创建 Release/Discussion、发布社交媒体或投放任何内容。所有对外动作由主 agent 在合并后统一核对并执行。最后整理：2026-11-06。

## 1. 推荐仓库定位

### 仓库描述（GitHub About，不超过 350 字）

简体中文主版本：

```text
兰泽诗词（LanZe）是一个开源的中文古诗词前端：用 Vue 3 + Vite + Element Plus 呈现摘录、文库、搜索、茶楼创作、笃学与个人中心。项目始于 2022 年，2026 年重新整理为可本地安装、可复现构建、可逐步替换数据源的社区维护仓库；支持演示数据/mock 约定、MIT 许可与中文贡献文档。当前不承诺线上 Demo 或托管后端，欢迎从文档、CI、前端稳定性与诗词内容体验开始贡献。
```

可选英文短版：

```text
An open-source Vue 3 frontend for classical Chinese poetry: excerpts, category browsing, search, community prototypes and a personal centre. Locally buildable, documented in Chinese, MIT-licensed, and moving toward configurable APIs with demo data. No hosted backend or public demo is promised.
```

### Topics 建议

主 agent 可在 GitHub About → Topics 中按需添加（GitHub 建议数量有限，按相关性排序）：

```text
vue3, vite, element-plus, javascript, frontend, chinese-poetry, poetry, classical-chinese, chinese-literature, open-source, hacktoberfest, static-site, axios, lottie, mit-license, docs, github-actions, chinese, education, web-app
```

优先组合：`vue3, vite, element-plus, chinese-poetry, poetry, frontend, javascript, open-source, static-site, mit-license`。`hacktoberfest` 仅在维护者准备参与相关活动且 issue 已标记时使用；不要为曝光添加与项目无关的热门标签。

### About / README 展示要点

- Website 字段：在 GitHub Pages 实际部署并验证前**留空**；不要填历史 MemFire 地址或失效 Vercel 域名。
- Social preview：把 `public/og-image.svg` 转成平台接受的 PNG 后上传；若直接上传 SVG 不被接受，保留仓库内 SVG 作为文档 hero。
- README 首屏：项目定位 → 当前状态表 → 快速开始 → 本地演示/变量 → 路线图 → 许可证。不要在首屏堆砌 star/badge 或虚假在线体验。
- Badges：保留 MIT、CI、Vue 3、Changelog；发布后方可增加 Release badge。CI badge 的 workflow 文件名必须与 `.github/workflows/ci.yml` 一致。
- About 勾选/展示：README、License、Activity、Discussions（若启用）；不承诺「production-ready」「official demo」「hosted API」。

## 2. 仓库侧动作清单（交给主 agent）

| 顺序 | 动作 | 依据文件 | 执行前核对 |
| --- | --- | --- | --- |
| 1 | 合并治理与代码改动，确认 `npm ci && npm run build && npm run test --if-present` 通过 | `README.md`、`.github/workflows/ci.yml` | CI 在 Node 20/22 均为绿色 |
| 2 | 设置 About 描述、Website（留空或已验证 Pages URL）、topics、社交预览图 | 本文件第 1 节、`public/og-image.svg` | 不沿用旧展示域名 |
| 3 | 启用 Discussions（如尚未启用），发布欢迎帖 | `ANNOUNCEMENT.md` | 将占位日期/链接替换为真实值 |
| 4 | 创建 tag `v0.2.0` 与 GitHub Release | `RELEASE_NOTES.md` | 只描述已合并内容；不要把 git log 的 `2.0.0` 当旧 Release |
| 5 | 确认 CI 与 Pages 权限；Pages 按需手动触发（workflow 含 configure/upload/deploy 标准步骤） | `.github/workflows/ci.yml`、`.github/workflows/pages.yml`、`docs/DEPLOYMENT.md` | 不自动部署到失效域名；首次运行前在 Settings → Pages 选 GitHub Actions |
| 6 | 给适合新人的 issue 加 `good first issue` / `help wanted` 标签 | `.github/ISSUE_TEMPLATE/*` | 先写清复现步骤或预期结果，避免空任务 |
| 7 | 发布一条 Release/Discussion 公告，再按平台节奏发布短帖 | `SOCIAL_POSTS.md` | 不夸大 star、用户数、线上 Demo 或后端能力 |

**本子任务没有执行以上任何 GitHub 侧动作，也没有调用发布 API。**

## 3. GitHub Discussions 欢迎帖

草稿：[`ANNOUNCEMENT.md`](../ANNOUNCEMENT.md)。建议分类 `Announcements`，标题「欢迎参与兰泽诗词的重新整理」。发帖前替换占位符、确认 Release/tag 是否存在，并补充维护者希望使用的联系/决策方式。

欢迎帖应引导四类讨论：文档勘误、本地复现、mock/API 契约、素材授权；明确「暂无线上 Demo」与「社区维护、不承诺响应 SLA」。

## 4. Release v0.2.0

草稿：[`RELEASE_NOTES.md`](../RELEASE_NOTES.md)。建议 tag/release 名 `v0.2.0`，标题「兰泽诗词 v0.2.0 · 开源治理与本地演示基线」。

发布前检查：

- [ ] 合并后的 README 与 `LICENSE` 都为 MIT 且年份/贡献者一致。
- [ ] CI badge 指向真实 workflow；`npm run test --if-present` 的结果与 Release 描述一致。
- [ ] `CHANGELOG.md` 的 `Unreleased` 已转成对应发布条目或明确标注为候选。
- [ ] 不写「线上 Demo 已恢复」「后端已上线」「已通过安全审计」等未验证表述。
- [ ] 说明历史代码限制、第三方资源授权与后续路线图入口。

## 5. 宣发短帖（草稿，不自动发布）

文案：[`SOCIAL_POSTS.md`](../SOCIAL_POSTS.md)，包含 5 条中文与对应英文短版，适合 X/微博/即刻/小红书风格的改写起点。发布时：

- 附上仓库链接或已验证的 Release/Discussion 链接，不附历史失效 Demo。
- 强调「开源、古诗词、本地 `npm run dev` 可运行、Vue 3 现代前端栈、MIT、欢迎贡献」。
- 可配 `public/og-image.svg` 转出的图片或真实本地录屏；未录制前不要使用来源不明的截图。
- 不写具体 star 数、下载量、用户量、性能提升百分比，除非有可复核来源。
- 不同平台错开措辞，避免同一时段刷屏；发布后把有效反馈整理成 issue，而不是只在评论区讨论。

## 6. 社区投稿与曝光清单（尚未执行）

| 渠道 | 最小可执行动作 | 前置条件 | 可信度要求 |
| --- | --- | --- | --- |
| GitHub Discussions | 发布欢迎帖、置顶、建立 3–4 个讨论分类 | 仓库启用 Discussions、主 agent 有权限 | 链接到已合并文件，不宣称已发布服务 |
| GitHub Release | 发布 v0.2.0 notes，关联 CHANGELOG | tag 与 CI 通过 | 逐项可验证 |
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
| 18–32s | 首页/摘录卡片切换 | 「摘录、文库、搜索、茶楼等界面；演示数据可替换外部 API」 |
| 32–45s | 文库分类、搜索结果、窄屏布局 | 「保留原有中文视觉，逐步收敛数据层与错误态」 |
| 45–58s | `npm run build && npm run test --if-present`、CI workflow | 「可复现构建，Node 20/22 CI；测试脚本存在才执行」 |
| 58–70s | CONTRIBUTING、ROADMAP、LICENSE | 「MIT、贡献指南、路线图；当前不承诺线上 Demo 或托管后端」 |

录制前检查：终端不出现密钥/私人路径；浏览器不使用真实账号；若第三方 API 不可用，切换到 mock 或明确标注「演示数据」；字幕不出现 star 数或「正式上线」。

## 8. 度量与复盘（不承诺增长目标）

发布后 24–72 小时可由主 agent 记录：CI 是否稳定、Discussion 是否有可转化 issue、文档链接是否失效、是否有授权/安全反馈、短帖是否带来可复现的构建问题。只记录可观察事实，不设「涨多少 star」这类目标，也不把曝光数字当作项目成功标准。

若发现 README/CI/Release 与最终代码不一致，先修仓库再更正对外文案；必要时在 Discussion 留言说明修订，不删除历史误导信息而不留痕。
