# 第三方素材与外链清单

> **状态：来源整理，授权未核验。** 本文件只记录当前仓库可观察到的素材类别、路径与外链，不把「已下载」「能访问」写成「已获得 MIT 或其他再分发许可」。截至 2026-11-06，除仓库贡献者提供的代码/文档外，以下项目仍需逐项核查来源、许可、署名要求与商用边界。

## 核对方法

```bash
rg -n 'https?://' index.html src --glob '!src/config/*.test.js'
find src/assets public -type f -print
```

构建与冒烟命令不依赖这些外部站点：`npm ci && npm run build && npm run test && npm run lint && npm run smoke`。

## 仓库内二进制与数据素材

| 类别 | 当前位置 | 可观察来源 | 授权状态 | 后续动作 |
| --- | --- | --- | --- | --- |
| 字体 | `src/assets/ZiTi/*.ttf`（4 个 TTF） | 2022–2024 年历史提交；文件名含 `piaoYiSong`、`hongLei`、`FangZhengSong`、`maoKen` | 未核验 | 核对字体厂商、授权书与是否允许嵌入/再分发；优先转换为授权明确的 WOFF2 子集 |
| 图片 | `src/assets/**/*.jpg`、`*.png`、`*.webp` | 历史提交；部分文件名与诗词分类、头像、轮播图有关 | 未核验 | 按文件查找原始出处、许可与人物/美术权利；无法确认时替换 |
| OG / favicon | `public/og-image.svg`、`public/og-image.png`、`public/favicon.ico` | SVG 与 1200×630 PNG 为 2026 年仓库内展示素材；favicon 来自历史提交 | SVG/PNG 由仓库贡献者提供；favicon 未核验 | 确认 favicon 来源；如需在线启用社交预览图，具备仓库设置写权限后按 `docs/PROMOTION.md` 上传并回读 |
| 诗词文本 | `src/data/poems.js`、历史页面中的静态文本 | 2022–2024 年历史内容与 2026 年演示数据 | 未核验 | 标注公版依据、底本与校勘来源；现代作品必须取得作者许可 |
| Lottie 动画 | `src/assets/lottieJSON/qieHuan.json`、`tanqiu.json` | 历史仓库内文件 | 未核验 | 核对作者/导出来源与是否允许再分发 |
| Lottie 动画 | `src/assets/lottieJSON/fanHui.json`、`login.json` | 2026-11-06 从历史页面引用的 LottieFiles CDN 地址下载并保存 | **仅完成本地化，授权未核验** | 查 LottieFiles 页面、作者与 License；无法确认时替换为自制/明确授权动画 |

两份下载动画的原始引用曾用 `https://assets9.lottiefiles.com/packages/lf20_gigyrcoy.json` 与 `https://assets6.lottiefiles.com/packages/lf20_ucbyrun5.json`。保存 JSON 只是消除运行时外链依赖，不代表取得版权许可。

## 运行时外链

| 类别 | 当前位置 | 域名 / 用途 | 风险与状态 | 后续动作 |
| --- | --- | --- | --- | --- |
| 样式与图标包 | `package.json` / `package-lock.json` | npm：`bootstrap@5.1.1`（MIT）、`@fortawesome/fontawesome-free@5.13.0`（CC BY 4.0 / SIL OFL 1.1 / MIT 组合） | 已精确锁定版本；上游许可证已由 npm 元数据核对，整体第三方素材授权仍以 `docs/THIRD_PARTY_ASSETS.md` 为准 | 构建产物中的字体/图标按上游许可证保留版权与许可说明；继续检查实际使用图标集合 |
| 默认演示音源与封面 | `public/media/lanze-demo.wav`、`public/media/lanze-demo-cover.svg` | 2026-11-06 由本仓库脚本生成的合成 PCM 音与原创 SVG | 由仓库贡献者提供；不引入第三方录音或美术素材 | 保持默认离线可用；如替换仍需记录生成方式与权利来源 |
| 可选自定义音源 | `src/config/audio.js`、`VITE_AUDIO_TRACKS` | 部署者显式提供的音轨 URL / 封面 URL | 默认不含任何第三方媒体域；启用后版权、热链与隐私政策由配置者负责 | 仅在授权明确时设置 `VITE_AUDIO_SOURCE=custom`，无效配置自动回退到本地演示音 |
| 徽章 | `README.md` | `img.shields.io`、GitHub Actions badge | 文档展示外链；不参与运行时核心功能 | 可保留，但离线文档不应依赖其加载 |
| 文档链接 | 全仓库 | GitHub、Vue、Vite 等官方/项目链接 | 属说明性链接 | 定期检查失效链接，不把其承诺视为本项目能力 |

## 与 MIT 许可证的关系

`LICENSE` 覆盖本仓库贡献者提供的代码与文档。它不自动覆盖第三方字体、图片、音乐、诗词文本、动画 JSON、CDN 脚本，也不代表这些服务运营方为本仓库背书。二次发布、商用或打包离线分发前，应逐项补齐来源、许可、署名与替换记录；无法确认的材料默认替换或移除。

## 待办

- [ ] 为每类素材补「来源 URL / 作者 / License / 下载日期 / 文件哈希 / 是否允许再分发」字段。
- [ ] 核查两份 LottieFiles 动画的具体授权；若无法确认，替换为自制或明确许可作品。
- [ ] 核查 4 个 TTF 字体是否允许 Web 嵌入与仓库再分发，并评估 WOFF2 子集化。
- [ ] 继续检查锁定版本 Bootstrap / Font Awesome 随构建产物分发的字体、图标与许可证文件是否完整。
- [x] 默认音乐演示已提供离线、仓库自制的音源与封面；继续补自定义音源失败时的可读状态。
