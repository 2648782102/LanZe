# 第三方素材与外链清单

> **状态：来源整理，授权未核验。** 本文件只记录当前仓库可观察到的素材类别、路径与外链，不把「已下载」「能访问」写成「已获得 MIT 或其他再分发许可」。截至 2026-11-07，除仓库贡献者提供的代码/文档外，以下项目仍需逐项核查来源、许可、署名要求与商用边界。

## 核对方法

```bash
rg -n 'https?://' index.html src --glob '!src/config/*.test.js'
find src/assets public -type f -print
```

构建与冒烟命令不依赖这些外部站点：`npm ci && npm run build && npm run test && npm run lint && npm run smoke`。

## 仓库内二进制与数据素材

| 类别 | 当前位置 | 可观察来源 | 授权状态 | 后续动作 |
| --- | --- | --- | --- | --- |
| 字体 | `src/assets/ZiTi/FangZhengSong.ttf` | 2022–2024 年历史提交；当前仅此一份被 `src/styles/base.css` 引用 | 未核验 | 核对字体厂商、授权书与是否允许 Web 嵌入/再分发；优先转换为授权明确的 WOFF2 子集 |
| 字体 | `src/assets/ZiTi/piaoYiSong.ttf`、`hongLei.ttf`、`maoKen.ttf` | 2022–2024 年历史提交；当前源码未引用 | 未核验 | 在授权核验完成前不要重新引入；可评估从仓库移除或保留为历史待核验素材 |
| 当前使用图片 | `src/assets/beijing/songci300.jpg`、`src/assets/LunBo/1.webp` | 历史提交；分别用于今日展厅视觉注释与登录封面 | 未核验 | 按文件查找原始出处、许可与人物/美术权利；无法确认时替换 |
| 历史图片 | `src/assets/beijing/**`、`src/assets/LunBo/**`、`src/assets/hoad/**`、`src/assets/logo.png` | 2022–2024 年历史提交；当前源码未引用 | 未核验 | 按文件查找原始出处、许可与人物/美术权利；无法确认时移除或替换 |
| OG / favicon | `public/og-image.svg`、`public/og-image.png`、`public/favicon.ico` | SVG 与 1200×630 PNG 为 2026-11-07 按当前青瓷展厅视觉绘制的展示素材；favicon 来自历史提交 | SVG/PNG 由仓库贡献者提供；favicon 未核验 | 确认 favicon 来源；如需在线启用社交预览图，具备仓库设置写权限后按 `docs/PROMOTION.md` 上传并回读 |
| 诗词文本 | `src/data/poems.js` | 2022–2024 年历史内容与 2026 年演示数据 | 未核验 | 标注公版依据、底本与校勘来源；现代作品必须取得作者许可 |

当前源码已移除旧 Lottie 动画运行时与 `src/assets/lottieJSON/*.json`。历史版本曾引用 `https://assets9.lottiefiles.com/packages/lf20_gigyrcoy.json` 与 `https://assets6.lottiefiles.com/packages/lf20_ucbyrun5.json`；这些地址及其授权问题属于历史发布背景，当前构建不加载它们。若未来恢复任何动画素材，必须先补齐来源、作者、License 与再分发依据。

## 运行时外链

| 类别 | 当前位置 | 域名 / 用途 | 风险与状态 | 后续动作 |
| --- | --- | --- | --- | --- |
| 运行时依赖 | `package.json` / `package-lock.json` | Vue、Vue Router、Axios、Vue Cookies、Supabase JS 与 Vite 工具链 | 当前不再引入 Bootstrap、Font Awesome、Element Plus、Lottie、APlayer 或滑块验证码；npm 包各自许可见 lock 元数据 | 升级时再次核对依赖许可与构建产物中的版权说明 |
| 默认演示音源与封面 | `public/media/lanze-demo.wav`、`public/media/lanze-demo-cover.svg` | 2026-11-06 由本仓库脚本生成的合成 PCM 音与原创 SVG | 由仓库贡献者提供；不引入第三方录音或美术素材 | 保持默认离线可用；如替换仍需记录生成方式与权利来源 |
| 可选自定义音源 | `src/config/audio.js`、`VITE_AUDIO_TRACKS` | 部署者显式提供的音轨 URL / 封面 URL | 默认不含任何第三方媒体域；启用后版权、热链与隐私政策由配置者负责 | 仅在授权明确时设置 `VITE_AUDIO_SOURCE=custom`，无效配置自动回退到本地演示音并显示提示 |
| 徽章 | `README.md` | `img.shields.io`、GitHub Actions badge | 文档展示外链；不参与运行时核心功能 | 可保留，但离线文档不应依赖其加载 |
| 文档链接 | 全仓库 | GitHub、Vue、Vite 等官方/项目链接 | 属说明性链接 | 定期检查失效链接，不把其承诺视为本项目能力 |

## 与 MIT 许可证的关系

`LICENSE` 覆盖本仓库贡献者提供的代码、文档与自绘 SVG。它不自动覆盖历史第三方字体、图片、诗词文本、已移除动画的旧来源或 CDN 脚本，也不代表这些服务运营方为本仓库背书。二次发布、商用或打包离线分发前，应逐项补齐来源、许可、署名与替换记录；无法确认的材料默认替换或移除。

## 待办

- [ ] 为每类素材补「来源 URL / 作者 / License / 下载日期 / 文件哈希 / 是否允许再分发」字段。
- [ ] 核查当前使用的宋体 TTF 是否允许 Web 嵌入与仓库再分发，并评估 WOFF2 子集化。
- [ ] 核查今日展厅与登录封面两张历史图片的来源、许可与美术权利；无法确认时替换。
- [ ] 盘点未被源码引用的历史字体、图片与头像文件，决定保留为历史待核验素材还是移除。
- [x] 默认音乐演示已提供离线、仓库自制的音源与封面；无效配置已有回退提示。
- [ ] 继续补自定义音源 URL 不可达时的播放器状态。
