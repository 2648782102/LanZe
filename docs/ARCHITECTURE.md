# 架构说明

## 1. 文档目的与事实基线

本文描述 v0.2.0 的实际架构，并保留 `b4ea7f4`（2024-08-18）作为历史基线供迁移对照。2026-11-06 的维护已同时更新源码、构建配置、文档、CI 与模板。

- 历史基线共 42 次提交；首个提交 `74b4186`（2022-06-03）；v0.2.0 前无 Git tag。
- 当前 `package.json` 脚本：`dev`、`build`、`preview`、`test`、`lint`；Vite `^6.4.5`，`"type": "module"`。
- 当前源码形态：Vue 3 SFC + Vue Router 4 hash 模式 + Element Plus + Axios；`index.html` 保留 Bootstrap/Popper/Font Awesome CDN，Lottie 改为本地依赖。
- 当前没有随仓库附带的后端、数据库迁移、账号服务或可验证线上 Demo；默认数据源为浏览器本地演示数据。

## 2. 系统边界

```text
浏览器
  ├── Vite 构建的静态前端（Vue 3 / Router / Element Plus）
  │     ├── 本地打包资源：src/assets、public
  │     ├── 外部 CDN：Bootstrap / Popper / Font Awesome / 音乐封面；部分 Lottie JSON
  │     └── UI 状态：路由、收藏态、Lottie、搜索输入、播放器
  │
  └── 数据源（统一入口）
        ├── src/config/runtime.js → src/apis/env.js：公开环境变量
        ├── src/apis/request.js：优先请求 VITE_API_BASE_URL 对应的自建 API
        ├── src/services/mockApi.js + src/data/：未配置 API / 失败时自动降级
        └── src/function/supabase.js：仅在配置可选 Supabase 环境变量时启用，否则使用本地适配器

构建与治理（不在浏览器运行时内）
  ├── npm ci / npm run build / npm run test / npm run lint
  ├── GitHub Actions: .github/workflows/ci.yml
  └── GitHub Pages: .github/workflows/pages.yml（手动触发，产物 artifact）
```

仓库负责前端界面、构建配置、文档与 CI。它不负责托管第三方 API 的可用性，也不应保存生产密钥。任何后端都应通过公开、可替换的 HTTP 契约接入，而不是把数据库凭据打进浏览器包。

## 3. 运行时结构

| 目录/文件 | 当前职责 | 已知限制 |
| --- | --- | --- |
| `index.html` | Vite HTML 入口，挂载 `#app` | 头部含多个第三方 CDN、全局样式和固定 `overflow: hidden` |
| `src/main.js` | 创建 Vue app，注册 Router、Element Plus、图标与 Cookie 插件 | 仍保留全局插件；读取统一走 `src/composables/useSession.js` |
| `src/App.vue` | 根 `<router-view>` 与公用样式/字体声明 | 字体文件较大，授权与加载成本待审查 |
| `src/router/index.js` | 约 25 条 hash 路由；集中注册标题与切换守卫 | 无真实鉴权；部分占位/空白页仍注册 |
| `src/pages/Home.vue` | 外层布局、搜索、导航、Lottie 切换动画与底部组件 | 通过共享 composable 监听路由，不再在 `setup()` 重复注册守卫 |
| `src/pages/ZhaiLu/` | 三张摘录卡与切换/拖动刷新 | 使用 `poetry/random-excerpt` 演示数据；收藏态仍为界面演示 |
| `src/pages/WenKu/` | 分类文库、古诗卡片与结果页 | 分类数据来自统一请求层与演示数据，不再直连历史 Supabase 表 |
| `src/pages/ChaLou/` | 精选诗文、飞花、现代诗等社区栏目 | 用户条目使用统一演示资料，不再自建另一个 Supabase 客户端 |
| `src/pages/login/` 与 `src/pages/Personal/` | 登录、注册、资料、作品、收藏、设置等界面 | 会话结构由 `useSession` 统一；演示账号和作品仅存浏览器 `localStorage` |
| `src/pages/Audio.vue` | APlayer 播放器演示 | 音频/封面指向第三方 URL，可用性不在仓库控制范围 |
| `src/apis/request.js` | Axios + 本地演示数据双通道请求函数 | 远端返回无效数据时自动降级并提示一次 |
| `src/apis/env.js` | 从 `src/config/runtime.js` 导出 `baseUrl` 与运行配置 | 不再硬编码后端地址 |
| `src/apis/api/list.js`、`login.js` | 领域 API 函数 | 真实 API 契约由自建服务定义；本地演示路径见 `src/services/mockApi.js` |
| `src/function/supabase.js` | 可选 Supabase 兼容适配器 | URL / anon key 仅来自公开环境变量；缺失时使用本地适配器 |
| `src/config/`、`src/data/`、`src/services/`、`src/composables/`、`src/utils/` | 配置、演示数据、Mock API、会话/路由 composable、响应与查询工具 | 演示数据不提供真实账号安全 |
| `public/` | `favicon.ico` 与 `og-image.svg` 展示素材 | SVG 不是运行截图，也不包含真实用户数据 |

## 4. 当前数据流

### 4.1 搜索

`Home.vue` 输入关键词 → `searchList({ keyword })` → `request("poetry/search", "get", null, params)`。配置 `VITE_API_BASE_URL` 且 `VITE_USE_MOCK=false` 时请求远端；否则由 `mockSearchPoems()` 返回本地演示结果。

### 4.2 摘录

`ZhaiLu.vue` 在挂载、点击切换和拖动时调用 `PoetryRandom` / 摘录领域函数 → 统一请求层 → 本地演示诗词或自建 API。收藏仅切换组件内布尔样式，没有跨设备持久化。

### 4.3 文库分类

`GuShiDiv.vue` 按 `address` 调用分类领域函数 → 统一请求层返回演示/远端数据 → 把结果放进 `searchul` 路由的 query → `searchUl.vue` 渲染并做防御性 JSON 解析。

### 4.4 茶楼用户条目

`UserLi.vue` 挂载后通过演示/API 资料函数读取用户条目，头像映射到本地 `hoad*.jpg`。

### 4.5 登录/个人中心

`login.vue` 调用 `userLogin` 等 API；`useSession` 把规范化后的用户对象写入 Cookie，同时由 `mockApi` 把演示账号/作品写入浏览器存储。个人中心页面统一通过 `useSession` 读取，不再混用字符串和对象。

## 5. 已实现的数据适配架构

让每个外部依赖有清楚边界：

```text
pages/components
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

当前 `createWebHashHistory()` 使 `/#/home` 这类 URL 对静态托管友好，不需要服务器重写。若未来为 SEO/路径美观改到 `createWebHistory()`，所有部署平台都需要把未知路径回退到 `index.html`。

构建配置使用 `base: './'`，适合相对路径静态文件与 GitHub Pages 项目站点。`docs/DEPLOYMENT.md` 描述手动、可回滚的流程；CI 不自动发布到失效域名。

## 7. 安全与授权边界

- 历史代码中存在两处硬编码 anon key、多个历史外部域名和分散的 Axios 调用；v0.2.0 已清理源码中的硬编码 key 并统一请求入口。若历史部署仍使用这些凭据，应在服务端轮换或撤销。
- 浏览器中的 `VITE_` 变量不是秘密；私密配置只属于服务端环境。
- 字体、图片、音乐、诗词文本与 CDN 资源需要单独确认授权；MIT 只覆盖本仓库贡献者提供的代码/文档。
- 安全报告的私密流程见根目录 `SECURITY.md`。

## 8. 演进原则

- 保持可复现（`npm ci`/build/test/CI），再逐步优化可替换 Adapter 与功能体验。
- 每次收敛一个外部依赖，配套一个文档更新和一个验证命令。
- 保留历史事实，但不在 README 里宣传失效服务。
- 大型升级（Vite、Router 模式、后端契约）先写最小迁移说明与回滚步骤。
- 不改变「前端仓库」这一基本边界；新增后端应作为独立、可选组件讨论。
