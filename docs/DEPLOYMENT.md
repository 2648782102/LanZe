# 部署文档

## 1. 原则

`npm run build` 生成的是**静态前端**。部署前端不等于自动获得后端、账号、诗词数据库或已验证的线上 Demo。所有公开环境变量都会进入浏览器产物；需要保密的配置应留在你自己的 API 服务端。

当前仓库使用 `createWebHashHistory()`，形如 `https://example.com/#/explore` 的路由不需要服务器 rewrite。若未来切换 history 模式，必须配置 `index.html` fallback。`vite.config.js` 使用 `base: './'`，适合相对路径的 GitHub Pages 项目站点；部署后仍需实测静态资源路径。

## 2. 发布前清单

- [ ] `node -v` 为 20 或 22（或与最终 `package.json` 的 `engines` 一致）。
- [ ] `npm ci && npm run build && npm run test && npm run lint && npm run smoke` 通过。
- [ ] 桌面/窄屏与登录发布冒烟 `npm run smoke:browser` 通过；本机需 Chrome / Chromium，CI 的 Browser E2E workflow 在 Ubuntu 自动安装同款浏览器并执行同一脚本。
- [ ] 明确本次部署是「仅前端 + 浏览器本地演示数据」还是「前端 + 自建 API」。
- [ ] 生产环境变量只含公开配置；`VITE_USE_MOCK` 按需求设置，避免把演示数据误写成正式账号服务。若使用默认首页诗句源，确认其服务条款、隐私边界与 CSP；离线部署设置 `VITE_POETRY_SOURCE=false`。
- [ ] 若关闭 mock，`VITE_API_BASE_URL` 指向可访问的 HTTPS API 或同源 `/api/`；后端已配置 CORS/鉴权/限流。远端失败时前端会自动降级。
- [ ] MemFire/Vercel 历史地址不再作为生产依赖；源码中不再包含历史硬编码 anon key。
- [ ] WOFF2 字体子集、压缩展品图、自定义音源/封面与诗词文本的使用符合其授权与隐私要求；默认 `VITE_AUDIO_SOURCE=local` 使用仓库自制演示资源，自定义音源不可达时会显示可重试状态，默认 `VITE_POETRY_SOURCE` 会请求第三方公开诗句接口。
- [ ] 记录 commit SHA、构建命令、变量清单与回滚方式。

## 3. GitHub Pages（手动 workflow）

仓库提供 `.github/workflows/pages.yml`，它是 `workflow_dispatch` 手动触发，不在 push 时自动发布，也不绑定任何历史失效域名。流程：

1. 使用 Node 20 与 `npm ci` 安装依赖。
2. 运行 `npm run build`。
3. 校验 `dist/index.html` 存在。
4. 通过 `actions/configure-pages` 配置 Pages，`actions/upload-pages-artifact` 上传 `dist/`。
5. 通过 `actions/deploy-pages` 部署到当前仓库的 GitHub Pages 环境；输出 `page_url` 为平台生成的地址。

在 GitHub 仓库侧需要完成的配合事项：

- 在 Settings → Pages 中选择 **GitHub Actions** 作为来源，并确认 workflow 具有 `pages: write` / `id-token: write` 权限；不要启用指向旧 MemFire 地址的自定义域。
- 确认 `github-pages` environment 与分支保护规则允许该 workflow 部署；若组织策略禁止，先只运行 CI 并把 Pages 产物作为 artifact 审阅，不要绕过权限。
- 项目站点地址为 `https://<owner>.github.io/<repo>/`；当前保留 hash 路由与相对资源 `base: './'`，首次部署后按下方清单实测。
- 首次部署后用浏览器访问首页、刷新一个子路由、打开开发者工具确认静态资源没有 404。

回滚：重新运行 workflow 指向上一个已知良好 commit，或在 Pages 设置中恢复上一份 artifact；若只是环境变量错误，修正变量后重新构建，保留旧构建编号便于对照。

## 4. Vercel

通用步骤（不沿用历史 `lanze-node.vercel.app` / `lan-ze-user.vercel.app` 函数域名）：

1. Import 仓库，Framework Preset 选 **Vite**（若自动识别失败，手动设置）。
2. Build Command：`npm run build`；Output Directory：`dist`；Install Command：`npm ci`。
3. 在项目环境变量中设置 `VITE_API_BASE_URL`、`VITE_USE_MOCK` 等公开变量；不要把服务端 token 加 `VITE_` 前缀。
4. 如果使用同源 `/api/`，在 `vercel.json` 或平台函数中把 `/api/*` rewrite 到你自己的后端；CORS 与鉴权由后端负责。
5. 部署后检查首页、资源路径、搜索失败提示与浏览器控制台。

历史提交曾尝试「无服务器函数」，但本仓库当前不附带可部署的函数目录；请把它视为迁移背景，不要假设旧函数仍存在。

## 5. Netlify

1. 新建 site from Git，Build command：`npm run build`；Publish directory：`dist`。
2. 设置 Node 版本为 20 或 22，安装命令保持 `npm ci`。
3. 在 Environment variables 中配置公开 `VITE_` 变量。
4. 若需要同源 API，在 `netlify.toml` 或平台 Redirects 中配置 `/api/*` 代理；重定向规则不应影响 hash 路由。
5. 若未来改为 history 路由，添加 `/* /index.html 200` fallback。
6. 用 Deploy previews 验证 PR；发布后确认 404、CSP、资源加载与 mock 开关。

## 6. 任意静态服务器 / 容器

```bash
npm ci
npm run build
# 将 dist/ 内容发布到 Nginx / Caddy / S3 + CDN / 对象存储静态站点
```

- 用 HTTPS 提供静态文件；不要把 `dist/` 提交进 Git。
- 若 API 与前端不同源，后端需允许站点 Origin；优先同源 `/api/` 反向代理。
- 缓存 `index.html` 时使用较短 TTL，静态资源可长缓存并带内容哈希。
- 默认音源、封面、核心样式、WOFF2 字体子集与 SVG 图标均随构建产物本地分发；只有显式启用 `custom` 音源时，才需要把相应域加入 CSP 白名单，且不可达时的状态不会阻断业务页面。首页默认诗句源若保留，也需在 CSP 中允许 `VITE_POETRY_SOURCE_URL` 的 `connect-src`；设置 `VITE_POETRY_SOURCE=false` 可完全关闭此请求。

## 7. 环境变量与构建矩阵

| 变量 | 仅前端/mock | 前端 + 自建 API |
| --- | --- | --- |
| `VITE_USE_MOCK` | `true` | `false`（建议） |
| `VITE_API_BASE_URL` | 可不填 | `https://api.example.com/` 或 `/api/` |
| `VITE_API_TIMEOUT` | `4000` | 按后端响应时间调整 |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | 可不填 | 仅在确认权限与 RLS 后填写公开配置 |
| `VITE_POETRY_SOURCE` / `VITE_POETRY_SOURCE_URL` / `VITE_POETRY_SOURCE_TIMEOUT` | `false` / 空 / `4000`（完全离线） | 按服务条款选择默认或自建兼容接口，并配置对应 CSP |
| `VITE_AUDIO_SOURCE` / `VITE_AUDIO_TRACKS` | `local` / 空 | `custom` 时填写已核验授权的公开音轨 JSON |

平台构建时变量是在**构建阶段**注入，修改后需要重新构建。不同平台的环境（Production / Preview / Development）应分别配置；不要把生产 API 地址写进 Preview 的公开 demo，除非该 demo 也经过授权。

## 8. 部署验收

- [ ] 根路径可以访问，静态资源无 404；刷新 `/#/explore` 仍可打开。
- [ ] 浏览器控制台没有敏感信息、重复请求或阻断的第三方脚本导致白屏。
- [ ] 演示模式下今日展厅/诗词索引/搜索有本地数据；关闭 mock 且后端不可用时自动降级并给出提示。
- [ ] 移动端宽度下导航与滚动可用。
- [ ] README / Release 中没有把本次部署写成「官方线上 Demo」，除非维护者实际验证并明确声明。
- [ ] 记录部署 URL、commit SHA、构建日志链接与回滚步骤；如为该 GitHub 仓库启用 Pages，更新 About / Discussion 后再对外发布。

## 9. 不做的事

- 不自动部署到旧 MemFire Cloud 展示地址或任何未验证自定义域。
- 不在 CI 中运行需要私密凭据的发布步骤。
- 不把历史 anon key 当作生产凭据继续使用。
- 不把自定义音源、第三方诗词/字体服务承诺为 SLA 或本仓库托管内容。
