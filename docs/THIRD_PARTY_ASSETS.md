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
| OG / favicon | `public/og-image.svg`、`public/favicon.ico` | SVG 为 2026 年仓库内展示素材；favicon 来自历史提交 | SVG 由仓库贡献者提供；favicon 未核验 | 确认 favicon 来源；如需上传社交预览图，先完成 PNG 转换与尺寸检查 |
| 诗词文本 | `src/data/poems.js`、历史页面中的静态文本 | 2022–2024 年历史内容与 2026 年演示数据 | 未核验 | 标注公版依据、底本与校勘来源；现代作品必须取得作者许可 |
| Lottie 动画 | `src/assets/lottieJSON/qieHuan.json`、`tanqiu.json` | 历史仓库内文件 | 未核验 | 核对作者/导出来源与是否允许再分发 |
| Lottie 动画 | `src/assets/lottieJSON/fanHui.json`、`login.json` | 2026-11-06 从历史页面引用的 LottieFiles CDN 地址下载并保存 | **仅完成本地化，授权未核验** | 查 LottieFiles 页面、作者与 License；无法确认时替换为自制/明确授权动画 |

两份下载动画的原始引用曾用 `https://assets9.lottiefiles.com/packages/lf20_gigyrcoy.json` 与 `https://assets6.lottiefiles.com/packages/lf20_ucbyrun5.json`。保存 JSON 只是消除运行时外链依赖，不代表取得版权许可。

## 运行时外链

| 类别 | 当前位置 | 域名 / 用途 | 风险与状态 | 后续动作 |
| --- | --- | --- | --- | --- |
| CSS / JS CDN | `index.html` | `cdn.staticfile.org`：Bootstrap 5.1.1、Popper 2.9.3 | 历史依赖；可用性、供应链与版本授权未在本轮核验 | 评估改为 npm 依赖并锁定版本，或清理未使用样式 |
| CSS CDN | `index.html` | `cdn.bootcss.com`：Font Awesome 5.13.0 | 历史依赖；图标授权与 CDN 可用性未核验 | 按实际图标替换为本地包/内联 SVG 或明确授权资源 |
| 音乐与封面 | `src/pages/Audio.vue` | `music.163.com` 音频外链、`music.126.net` 封面外链 | 第三方平台资源；可用性、版权与热链政策不在本仓库控制范围 | 改用明确授权音频/封面，或提供可关闭的演示占位 |
| 徽章 | `README.md` | `img.shields.io`、GitHub Actions badge | 文档展示外链；不参与运行时核心功能 | 可保留，但离线文档不应依赖其加载 |
| 文档链接 | 全仓库 | GitHub、Vue、Vite 等官方/项目链接 | 属说明性链接 | 定期检查失效链接，不把其承诺视为本项目能力 |

## 与 MIT 许可证的关系

`LICENSE` 覆盖本仓库贡献者提供的代码与文档。它不自动覆盖第三方字体、图片、音乐、诗词文本、动画 JSON、CDN 脚本，也不代表这些服务运营方为本仓库背书。二次发布、商用或打包离线分发前，应逐项补齐来源、许可、署名与替换记录；无法确认的材料默认替换或移除。

## 待办

- [ ] 为每类素材补「来源 URL / 作者 / License / 下载日期 / 文件哈希 / 是否允许再分发」字段。
- [ ] 核查两份 LottieFiles 动画的具体授权；若无法确认，替换为自制或明确许可作品。
- [ ] 核查 4 个 TTF 字体是否允许 Web 嵌入与仓库再分发，并评估 WOFF2 子集化。
- [ ] 将 Bootstrap / Font Awesome CDN 改为可锁定来源，或移除未使用部分。
- [ ] 对音乐演示提供可离线运行且授权明确的替代资源。
