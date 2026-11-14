# 第三方素材与外链清单

> **状态：来源整理，授权未核验。** 本文件只记录当前仓库可观察到的素材类别、路径与外链，不把「已下载」「能访问」写成「已获得 MIT 或其他再分发许可」。截至 2026-11-07，除仓库贡献者提供的代码/文档外，以下项目仍需逐项核查来源、许可、署名要求与商用边界。WOFF2 子集、压缩展品图与旧原图来自同一历史素材，压缩或子集化不等于取得新授权。

## 核对方法

```bash
rg -n 'https?://' index.html src --glob '!src/config/*.test.js'
find src/assets public -type f -print
```

构建、单测、静态冒烟与 CI Browser E2E 不依赖这些外部站点：CI 运行 `npm ci && npm run build && npm run test && npm run lint && npm run smoke`，Browser E2E 执行 `npm run smoke:browser`；浏览器冒烟通过 CDP 拦截诗句源请求并注入固定响应，仍会检查其它运行时网络错误。

## 仓库内二进制与数据素材

> 当前 `src/assets/` 保留全局字体子集、两张压缩展品图，以及为历史摘录卡生成的两个字体子集与一张缩放扇舟图。约 27 MB 未引用的历史 TTF、JPG、PNG、WebP 与旧 logo 已从工作树移除；它们仍可通过 Git 历史追溯，原文件不进入当前构建产物。

| 类别 | 当前位置 | 可观察来源 | 授权状态 | 后续动作 |
| --- | --- | --- | --- | --- |
| 当前使用字体 | `src/assets/fonts/LanZeSong-subset.woff2` | 由 Git 历史中的 `src/assets/ZiTi/FangZhengSong.ttf` 按仓库可见字符生成的 WOFF2 子集；`src/styles/base.css` 只引用该文件 | 未核验；子集化不改变原字体授权 | 核对字体厂商、授权书、Web 嵌入与再分发条款；无法确认时替换为授权明确的字体 |
| 当前使用图片 | `src/assets/exhibit/songci300-768.jpg`、`auth-cover-960.jpg`、`src/assets/excerpt/fanzou-720.png` | 前两者由 Git 历史中的 `src/assets/beijing/songci300.jpg` 与 `src/assets/LunBo/1.webp` 缩放压缩；后者由历史 `src/assets/beijing/fanzou.png` 等比缩放，用于还原旧版摘录卡 | 未核验；缩放不改变原图授权 | 按原图查找原始出处、许可与人物/美术权利；无法确认时替换 |
| 历史摘录卡字体 | `src/assets/excerpt/piaoYiSong-excerpt.woff2`、`hongLei-excerpt.woff2` | 由历史 `src/assets/ZiTi/piaoYiSong.ttf` 与 `hongLei.ttf` 按摘录卡可见字符生成的 WOFF2 子集 | 未核验；子集化不改变原字体授权 | 核对字体厂商、Web 嵌入与再分发条款；无法确认时替换为授权明确的字体 |
| 已移除的历史素材 | `src/assets/ZiTi/*.ttf`、`src/assets/beijing/**`、`src/assets/LunBo/**`、`src/assets/hoad/**`、`src/assets/logo.png` | 2022–2024 年历史提交；原始文件仍可从 Git 历史追溯，当前仅按可见字符或展示尺寸重新派生所需子集 | 未核验 | 如需追溯来源或验证授权，先查阅历史提交；不要把原始大文件原样重新引入构建产物 |
| OG / favicon | `public/og-image.svg`、`public/og-image.png`、`public/favicon.ico` | SVG 与 1200×630 PNG 为 2026-11-07 按当前青瓷展厅视觉绘制的展示素材；favicon 来自历史提交 | SVG/PNG 由仓库贡献者提供；favicon 未核验 | PNG 已上传为 GitHub Social preview 并回读公开 `og:image`；确认 favicon 来源，后续替换按 `docs/PROMOTION.md` 执行 |
| 精校短章 | `src/data/poems.js` | 2022–2024 年历史内容与 2026 年演示数据 | 未核验 | 标注公版依据、底本与校勘来源；现代作品必须取得作者许可 |
| 离线馆藏分卷 | `public/data/poetry/*.json` | `chinese-poetry/chinese-poetry@b8594f81a89752241442f2ce267d6f66f96704ee` 的 16 个选段，共 9,328 篇；许可证见 `public/data/poetry/LICENSE.chinese-poetry.txt` | 上游仓库 MIT；诗词底本/校勘与作品公版状态按用途另行核对 | 保留上游版权与许可证；繁简、异体、断句及长篇截取按上游形态标注 |

当前源码已移除旧 Lottie 动画运行时与 `src/assets/lottieJSON/*.json`。历史版本曾引用 `https://assets9.lottiefiles.com/packages/lf20_gigyrcoy.json` 与 `https://assets6.lottiefiles.com/packages/lf20_ucbyrun5.json`；这些地址及其授权问题属于历史发布背景，当前构建不加载它们。若未来恢复任何动画素材，必须先补齐来源、作者、License 与再分发依据。

## 运行时外链

| 类别 | 当前位置 | 域名 / 用途 | 风险与状态 | 后续动作 |
| --- | --- | --- | --- | --- |
| 运行时依赖 | `package.json` / `package-lock.json` | Vue、Vue Router 与 Vite 工具链；业务请求与 Cookie 均使用浏览器原生能力 | 当前不再引入 Axios、Vue Cookies、Supabase JS、Bootstrap、Font Awesome、Element Plus、Lottie、APlayer 或滑块验证码；npm 包各自许可见 lock 元数据 | 升级时再次核对依赖许可与构建产物中的版权说明 |
| 默认本地声景与封面 | `public/media/lanze-{qingshan,yuese,wanzhou}.wav`、对应 `-cover.svg`、`audio-manifest.json` | 2026-11-07 由 `scripts/generate-audio-library.mjs` 确定性合成的三段 24 秒 PCM 声景与原创 SVG | 由仓库贡献者提供；不引入第三方录音或美术素材；清单和 SHA-256 随仓库分发 | 修改音轨后运行 `npm run audio:generate && npm run audio:verify`，同步更新校验清单与本节记录 |
| 可选自定义音源 | `src/config/audio.js`、`src/components/AudioDock.vue`、`VITE_AUDIO_TRACKS` | 部署者显式提供的音轨 URL / 封面 URL | 默认不含任何第三方媒体域；启用后版权、热链与隐私政策由配置者负责 | 仅在授权明确时设置 `VITE_AUDIO_SOURCE=custom`；无效配置自动回退并显示提示，不可达 URL 显示状态并允许重试 |
| 首页诗句源 | `src/services/poetrySource.js`、`VITE_POETRY_SOURCE_URL` | 默认关闭；显式 `VITE_POETRY_SOURCE=remote` 时才请求 `https://v1.jinrishici.com/all.json` | 第三方服务不随仓库托管，授权与稳定性未核验；不承诺 SLA；默认构建不请求 | 可保持 `VITE_POETRY_SOURCE=local`，或换成自建兼容接口；公开部署前核查服务条款与内容授权 |
| 徽章 | `README.md` | `img.shields.io`、GitHub Actions badge | 文档展示外链；不参与运行时核心功能 | 可保留，但离线文档不应依赖其加载 |
| 文档链接 | 全仓库 | GitHub、Vue、Vite 等官方/项目链接 | 属说明性链接 | 定期检查失效链接，不把其承诺视为本项目能力 |

## 与 MIT 许可证的关系

`LICENSE` 覆盖本仓库贡献者提供的代码、文档与自绘 SVG。它不自动覆盖历史第三方字体、图片、诗词文本、已移除动画的旧来源或 CDN 脚本，也不代表这些服务运营方为本仓库背书。二次发布、商用或打包离线分发前，应逐项补齐来源、许可、署名与替换记录；无法确认的材料默认替换或移除。

## 当前二进制 SHA-256

以下哈希记录当前工作树文件的字节身份，便于素材替换、审计与回归核对；哈希不是许可证明，也不改变上表的「授权未核验」状态。

| 文件 | SHA-256 |
| --- | --- |
| `src/assets/fonts/LanZeSong-subset.woff2` | `dfb124c02a09fe03bcd0f8d4d3125c50637758b716a7b81b9f0eb00516e6acd8` |
| `src/assets/exhibit/auth-cover-960.jpg` | `a865b2b2efc4d0bffc279f32b6d1ea9caa2d6b92d244a1b62b0cbb71414d0709` |
| `src/assets/exhibit/songci300-768.jpg` | `842d925768d917352d63b21b9b30a6764c33998148361d0a2a25ced84a793588` |
| `src/assets/excerpt/fanzou-720.png` | `4263cece79f59c55b7287151ff718638221e74056d15e8c49aca1adb5a4d9316` |
| `src/assets/excerpt/hongLei-excerpt.woff2` | `a79c5335d19afac98f4f2caae7e7b9c2ec38f70b2965dd5978c053c7a75fbe21` |
| `src/assets/excerpt/piaoYiSong-excerpt.woff2` | `f12990c619ed3431193fa804dc6f703bf1a648526cdb3760bf2f306a8a4cbb39` |
| `public/media/lanze-qingshan.wav` | `882d62323454a600cd93f057e1a96989fc97959e7d1be8ee0e2df8656bbd46d0` |
| `public/media/lanze-qingshan-cover.svg` | `b21a04a303f2e4014ebfcdfb02713442caea9f37b7889a63eb189c4681e70a46` |
| `public/media/lanze-yuese.wav` | `14ca7693c83aa1985973d3da466a69bad28889fac87c5780bbb87da81a8c5752` |
| `public/media/lanze-yuese-cover.svg` | `1706484bf5eadec140047c6866d7fc5c2853a0e7319fe4731ea4399fca3485bc` |
| `public/media/lanze-wanzhou.wav` | `47dfd5afee68bdcb12faa75ecb04b171872056c8ff6783d76d646cb795b927d2` |
| `public/media/lanze-wanzhou-cover.svg` | `d27f58df3acb6412ae0c4e69bedbb05050426f2a64a0e7ddca494172ba093534` |
| `public/og-image.png` | `34acbf01d0fbc94a5db478dcc99c7358921eaac5c413f0dbb8151b0349bfce4c` |
| `public/og-image.svg` | `f3f1d2dc1af474ed3af7d2c513e6c688b296386da285f3c28d1551a870eeda04` |
| `public/favicon.ico` | `44a67fa9fa240e75a263991a80936224e047603dd7a0b7189813b4938218fe0a` |

离线馆藏分卷的 SHA-256、条目数与上游固定提交记录在 `public/data/poetry/manifest.json`、`SHA256SUMS.txt` 和各分卷 JSON；`scripts/download-poetry-corpus.mjs` 使用固定 commit 重建目录、manifest、分卷与校验清单，`scripts/verify-poetry-corpus.mjs` 由 CI、静态冒烟和单测复用。上游 MIT 许可证原文随 `public/data/poetry/LICENSE.chinese-poetry.txt` 分发；这些记录只说明字节身份、文件清单与许可证，不代替诗词底本的校勘核验。

## 待办

- [ ] 为每类素材补「来源 URL / 作者 / License / 下载日期 / 文件哈希 / 是否允许再分发」字段。
- [ ] 核查当前 WOFF2 子集对应的历史宋体是否允许 Web 嵌入、子集化与仓库再分发。
- [ ] 核查今日展厅与登录封面压缩图对应的历史原图来源、许可与美术权利；无法确认时替换。
- [x] 已从当前工作树移除未被源码引用的历史字体、图片与头像文件；原始文件仍可由 Git 历史追溯。
- [x] 默认音乐演示已升级为三段离线、仓库自制的声景与封面；清单、哈希和无效配置回退提示齐备。
- [x] 自定义音源 URL 不可达时，播放器显示可读状态并允许重试，不影响业务页面。
- [x] 首页诗句源默认关闭；只有显式启用远程接口时才需要核查服务条款、内容版权与公开部署隐私边界。
