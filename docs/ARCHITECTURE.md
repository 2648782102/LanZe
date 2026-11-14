# 架构说明

## 1. 文档目的与事实基线

本文描述当前 `main` 的实际架构，并保留 `b4ea7f4`（2024-08-18）作为历史基线供迁移对照。2026-11-07 的完全重构已同步更新源码、构建配置、设计契约、文档、CI 与冒烟脚本。

- 历史基线共 42 次提交；首个提交 `74b4186`（2022-06-03）；v0.2.0 前无 Git tag。
- 当前 `package.json` 脚本：`dev`、`build`、`preview`、`test`、`lint`；Vite `^6.4.5`，`"type": "module"`。
- 当前源码形态：Vue 3 SFC + Vue Router 4 hash 模式 + 自有组件/CSS token + 原生 `fetch`；已移除旧 UI 套件、动画运行时、第三方播放器、Axios、Vue Cookies 与 Supabase JS 依赖。
- 当前没有随仓库附带的后端、数据库迁移、账号服务或可验证线上 Demo；默认数据源为浏览器本地演示数据。

## 2. 系统边界

```text
浏览器
  ├── Vite 构建的静态前端（Vue 3 / Router / 自有组件）
  │     ├── 本地打包资源：src/assets、public
  │     ├── 三段 CC BY 3.0 古筝节选 / 原创封面 / 署名清单；自定义音源由可选配置提供
  │     └── UI 状态：路由、收藏态、最近阅读、搜索输入、原生音频
  │
  └── 数据源（统一入口）
        ├── src/config/runtime.js → src/apis/env.js：公开环境变量
        ├── src/apis/request.js：优先请求 VITE_API_BASE_URL 对应的自建 API
        ├── src/services/mockApi.js + src/data/：未配置 API / 失败时自动降级
        └── src/composables/useExcerptDeck.js：首页三层摘录牌堆的预载队列、收藏与来源状态

构建与治理（不在浏览器运行时内）
  ├── npm ci / npm run build / npm run test / npm run lint
  ├── GitHub Actions: ci.yml、browser-e2e.yml、publish.yml
  └── GitHub Pages: .github/workflows/pages.yml（main push 自动部署，可手动重跑）
```

仓库负责前端界面、构建配置、文档与 CI。它不负责托管第三方 API 的可用性，也不应保存生产密钥。任何后端都应通过公开、可替换的 HTTP 契约接入，而不是把数据库凭据打进浏览器包。

## 3. 运行时结构

| 目录/文件 | 当前职责 | 已知限制 |
| --- | --- | --- |
| `index.html` | Vite HTML 入口，挂载 `#app` | 本地 favicon、页面描述与社交预览元数据 |
| `src/main.js` | 创建 Vue app，注册 Router 与 Cookie 插件 | 会话读取统一走 `src/composables/useSession.js` |
| `src/App.vue` | 展馆壳层：页头、瓷面网格、页脚、移动端导航、音源与通知 | 登录/注册页使用 `bare` 路由元数据隐藏壳层 |
| `src/router/index.js` | 六类主页面与旧 URL 重定向 | 无真实鉴权；旧路由只作兼容入口 |
| `src/views/ReadView.vue` | 今日展厅：整首诗、单张历史样式余韵摘录卡、收藏、换诗与朗读 | 词牌长题按视觉规则分行；摘录收藏只存当前浏览器 |
| `src/components/ExcerptCard.vue` | 历史摘录卡：旋转收藏角标、竖排诗句/作者、扇舟图与悬浮高光 | 等比还原旧版视觉；历史字体/图片以子集和压缩资产加载，不恢复旧 UI 套件 |
| `src/views/ExploreView.vue` | 诗词索引：关键词、体裁、结果列表与空状态 | URL 查询同步搜索/筛选条件 |
| `src/views/PoemView.vue` | 读诗详情：正文、笺注、相关诗目与操作 | 旧 `details` query 走 legacy 归一化 |
| `src/views/CollectionView.vue` | 我的诗卷：收藏、最近阅读、本地作品与资料 | 数据只存当前浏览器 |
| `src/views/ComposeView.vue` | 写作台：草稿、实时预览与本地发布 | 未登录时重定向到登录 |
| `src/views/AuthView.vue` | 登录与注册 | 表单校验、演示账号与本地会话 |
| `src/components/AudioDock.vue` | 原生音频播放器 | 默认加载 `public/media/` 三段古筝节选；支持播放列表、切轨、进度、音量与偏好记忆；无效自定义配置显示回退提示，不可达 URL 显示状态并允许重试 |
| `src/apis/request.js` | 原生 `fetch` + 本地演示数据双通道请求函数 | 远端返回无效数据时自动降级并提示一次 |
| `src/services/poetrySource.js` | 首页历史摘录卡的独立诗句源适配器 | 默认读取仓库内摘录与精校短句；显式开启后才请求随机诗句接口，失败或超时回退并显示来源状态 |
| `src/apis/env.js` | 从 `src/config/runtime.js` 导出 `baseUrl` 与运行配置 | 不再硬编码后端地址 |
| `src/apis/api/list.js`、`login.js` | 领域 API 函数 | 真实 API 契约由自建服务定义；本地演示路径见 `src/services/mockApi.js` |
| `src/services/sessionCookies.js` | 原生 Cookie 会话读写 | 仅存演示账号/资料，带 1 天 max-age 与 SameSite=Lax |
| `src/config/`、`src/data/`、`src/services/`、`src/composables/`、`src/utils/` | 配置、演示数据、Mock API、会话/诗库/通知、响应与查询工具 | 演示数据不提供真实账号安全 |
| `src/styles/base.css`、`docs/DESIGN_SYSTEM.md` | 唯一设计 token 与目标模式契约 | 页面组件可局部扩展，但不应重建另一套视觉语言 |
| `public/` | `favicon.ico`、展示素材与本地演示音源 | OG 图是当前设计衍生插画，不是运行截图 |

## 4. 当前数据流

### 4.1 诗库与检索

`useLibrary` 通过 `loadCatalog()` 读取 `public/data/poetry/manifest.json` 和 16 个静态分卷，再由 `getLibraryPage()` 做关键词、朝代、体裁筛选与分页；`ExploreView` 把这些状态同步到 URL query。未配置业务 API 时始终使用离线馆藏，首页摘录卡与业务诗库互不依赖。

首页历史摘录卡是单句装饰，由 `src/services/poetrySource.js` 单独加载。它与业务诗库、`VITE_API_BASE_URL` 解耦，默认只交替读取 `demoExcerpts` 与精校馆藏短句；显式设置 `VITE_POETRY_SOURCE=remote` 后才读取 `VITE_POETRY_SOURCE_URL`，接口不可达时回退本地并在界面标注实际来源。

### 4.2 收藏、最近阅读与详情

收藏与最近阅读由 `useLibrary` 写入当前浏览器 `localStorage`；详情页通过路由 `id` 或旧版 query 归一化出诗笺；旧 `details` 地址重定向到 `/poem/legacy`。

### 4.3 会话与作品

登录/注册通过统一请求层调用本地演示 API；`useSession` 写入 Cookie。写作台先自动保存草稿，发布后写入 `lanze_demo_works`，再刷新诗库并回到「我的诗卷」。

### 4.4 通知与音源

`useNotices` 提供统一的成功、提示与错误反馈；`src/apis/request.js` 的远端降级提示也复用该通道。`AudioDock` 使用原生 `<audio>` 加载开放授权古筝节选曲库，提供播放列表、切轨、进度、音量与偏好记忆；无效自定义配置时给出回退提示，音源不可达时显示可复核状态并允许重试。

### 4.5 登录/个人中心

`AuthView` 调用 `userLogin` / `userReg` 等 API；`useSession` 把规范化后的用户对象写入 Cookie，同时由 `mockApi` 把演示账号/作品写入浏览器存储。`CollectionView` 统一通过 `useSession` 读取，不再混用字符串和对象。

## 5. 已实现的数据适配架构

让每个外部依赖有清楚边界：

```text
views/components
      ↓ 只调用领域函数，不拼完整 URL
src/apis/api/*.js
      ↓
src/apis/request.js  ← 超时、错误、统一消息、可观测日志
      ↓
data source adapter
      ├── mock（VITE_USE_MOCK=true 或未配置 API，本地演示数据）
      └── http（VITE_API_BASE_URL，自建 API 或同源 /api/ 代理）
```

实现规则：

1. **一个配置入口**：`VITE_API_BASE_URL` 只负责业务 API 前缀；第三方诗句源使用单独可选变量或显式 Adapter。
2. **一个开关**：`VITE_USE_MOCK` 控制演示数据；未配置 API 时自动启用，构建产物不包含真实用户数据。
3. **一个错误模型**：请求失败统一返回可展示的错误态，组件不吞异常、不无限 loading。
4. **一个登录态模型**：用户对象结构、持久化位置和读取函数集中定义；移除固定假用户。
5. **无前端密钥**：`anon`/public key 若保留也必须来自公开构建配置并做权限评估；`service_role` 等永远不进前端。
6. **静态部署与 API 解耦**：前端可在任何静态托管运行，`/api/` 由宿主代理；不绑定已失效的 MemFire/Vercel 域名。
7. **CI 不绑定模块格式**：workflow 只执行 npm 脚本；当前为 `"type": "module"`，workflow 不直接 `require()` 源码。

## 6. 路由与部署约束

当前 `createWebHashHistory()` 使 `/#/`、`/#/explore` 这类 URL 对静态托管友好，不需要服务器重写；`/home`、`/wenku` 等旧地址只做兼容重定向。若未来为 SEO/路径美观改到 `createWebHistory()`，所有部署平台都需要把未知路径回退到 `index.html`。

构建配置使用 `base: './'`，适合相对路径静态文件与 GitHub Pages 项目站点。`docs/DEPLOYMENT.md` 描述手动、可回滚的流程；CI 不自动发布到失效域名。

## 7. 安全与授权边界

- 历史代码中存在两处硬编码 anon key、多个历史外部域名和分散的 Axios 调用；v0.2.0 已清理源码中的硬编码 key 并统一请求入口。当前版本进一步移除 Supabase 适配器、Axios 与 Vue Cookies，仅保留原生浏览器能力；若历史部署仍使用这些凭据，应在服务端轮换或撤销。
- 浏览器中的 `VITE_` 变量不是秘密；私密配置只属于服务端环境。
- 字体、图片、自定义音源、诗词文本与 CDN 资源需要单独确认授权；MIT 只覆盖本仓库贡献者提供的代码/文档与仓库生成的默认演示资源。
- 安全报告的私密流程见根目录 `SECURITY.md`。

## 8. 演进原则

- 保持可复现（`npm ci`/build/test/CI），再逐步优化可替换 Adapter 与功能体验。
- 每次收敛一个外部依赖，配套一个文档更新和一个验证命令。
- 保留历史事实，但不在 README 里宣传失效服务。
- 大型升级（Vite、Router 模式、后端契约）先写最小迁移说明与回滚步骤。
- 不改变「前端仓库」这一基本边界；新增后端应作为独立、可选组件讨论。
