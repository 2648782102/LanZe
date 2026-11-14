# 浏览器验证闭环

本仓库不再只靠手写 CDP 片段和肉眼截图。统一浏览器能力层位于 `scripts/browser/lab.mjs`，复用系统 Chrome；`npm run verify:render` 是日常验证闭环入口。

## 现有能力

- 启动本地 `vite preview` 与系统 Chrome（Playwright `executablePath`），无需下载额外浏览器内核。
- 桌面 1280×800、deviceScaleFactor=2，走 `page.goto` / `document.fonts.ready` / 稳定等待，不用临时手写 WebSocket。
- 截图：整页视口、指定元素（自动 boundingBox + padding），输出目录默认 `/tmp/lanze-render-lab`。
- 真实输入：`page.mouse.down/move/up` 驱动摘录卡拖拽，而不是只合成 PointerEvent。
- 状态采集：关键元素几何、computed style、console error、pageerror、requestfailed。
- 网络：拦截请求、忽略旧外链曲目的 `ERR_ABORTED`，但保留其他网络错误为失败条件。
- 线上闭环：禁缓存打开 GitHub Pages，截品牌区；与本地构建的品牌区做 `pixelmatch` 像素比较，要求 `mismatches === 0`。
- 多路由覆盖：今日、寻诗、登录、写作、诗卷；每条路由留整页截图和几何数据。

## 用法

```bash
npm run build
npm run verify:render
```

输出在 `/tmp/lanze-render-lab/`：

- `local-*.png`：本地关键页面
- `online-today.png`、`online-brand.png`：线上真实渲染
- `diff-brand.png`：像素差异图
- `local-audio-expanded.png`：展开态播放器
- 终端 JSON：几何坐标、对比 `ratio`、真实拖拽后的卡片/提示几何

若线上与本地品牌区有像素差异、浏览器控制台报错、或非预期网络失败，脚本会非零退出。

## 依赖

`playwright`、`pixelmatch`、`pngjs` 均为 devDependencies；Chrome 使用 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`。这套能力不下载 Chromium/Firefox/WebKit 内核，因此**跨浏览器验证仍缺失**。

## 仍然缺失

- Firefox / Safari / WebKit / iOS 真机。
- 基准图版本化与 CI artifact 上传（当前只比较线上/本地同一时刻，不比较历史 baseline）。
- 录屏与合成帧捕获（动画流畅度仍由 `measure-excerpt-switch.mjs` 的 rAF 间隔近似）。
- a11y tree / axe / Lighthouse。
- 可见浏览器交互（`cua_repl`）尚未纳入本脚本；需要时用系统工具另行打开。

## 与既有脚本的关系

- `npm run smoke:browser`：业务链路、登录/发布/收藏/搜索/播放器/摘录卡契约。
- `npm run inspect:spacing`：多路由间距探针，输出 `<8px` 的贴边项。
- `npm run capture:brand`：品牌区局部截图（旧手写 CDP 工具，保留作快速核对）。
- `npm run verify:render`：真实渲染、真实输入、线上/本地像素一致性与浏览器错误闭环。
