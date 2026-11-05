# 兰泽诗词 v0.2.0 · 本地可运行的开源前端

兰泽诗词是一个始于 2022 年的中文古诗词前端。这个版本不宣称恢复线上社区，也不宣称托管后端已经上线；它把仓库整理成**可以本地安装、可以复现构建、可以用演示数据体验主要界面、可以按文档参与贡献**的开源项目。

### Highlights

- 🧩 升级到 Vite 6 与 `@vitejs/plugin-vue`，统一 ESM 配置、相对 `base: './'` 和 `dev` / `build` / `preview` 脚本。
- 🧪 新增 `npm run test`：14 个 `node --test` 单测覆盖运行配置、本地演示 API、响应归一化与查询解析；新增 `npm run lint` 静态检查。
- 📚 新增本地演示数据层：未配置 `VITE_API_BASE_URL` 或远端不可用时自动降级，摘录、分类文库、搜索、登录、注册、改密、个人资料与作品发布均可纯前端演示。
- 🔐 清理历史硬编码 Supabase 密钥并改为可选环境变量；显式管理 Cookie 会话，移除固定假用户与依赖 `$cookies` 全局对象的用法。
- 🛠 修复未定义的 `scroll` / `next()`、重复路由守卫、`ElMessage` 未导入、脆弱的 `node_modules` 样式引用和多处 JSON 解析问题。
- ♿ 设置 `lang="zh-CN"`、补充页面描述与关键交互 `aria-label`，移除冲突的 Lottie CDN，改用本地播放器依赖。
- 📦 Bootstrap 5.1.1 / Font Awesome 5.13.0 改为精确锁定的本地依赖；移除未使用的 Popper/Bootstrap JS 外链，构建产物自带图标字体。
- 📖 重写 README：项目定位、快速开始、环境变量、本地演示、项目结构、部署、路线图、MIT 与英文摘要。
- ⚖️ 新增 MIT 许可证、贡献指南、行为准则、安全政策、变更日志与 FAQ。
- 🧭 新增架构、开发、部署、路线图、FAQ 与展示清单；历史 MemFire / Vercel 地址仅作为迁移背景，不再宣称可用。
- ⚙️ 新增 Node 20 / 22 CI：`npm ci`、`npm run build`、`npm run test --if-present`；新增手动触发的 GitHub Pages workflow。
- 🧩 新增 bug / 功能 / 文档 / 内容勘误 issue 模板与 PR 模板。
- 🖼 新增 `public/og-image.svg` 作为 README hero 与社交预览素材候选，保留原 `favicon.ico`。

### 本地运行

```bash
git clone https://github.com/2648782102/LanZe.git
cd LanZe
npm ci
npm run dev
```

建议 Node.js 20 或 22。默认无需配置即可使用仓库内演示数据；可使用演示账号 `demo / lanze2026` 体验登录、资料与作品发布。演示账号和作品只保存在当前浏览器的 `localStorage`，不是真实账号服务。

```bash
npm run build
npm run test
npm run lint
npm run preview
```

## 环境变量

所有 `VITE_` 变量会进入浏览器产物，只能放公开配置，不能放服务端密钥或私人令牌。

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 空 | 自建 API 前缀；填写且 `VITE_USE_MOCK=false` 时优先请求远端，失败自动降级到本地演示数据 |
| `VITE_API_TIMEOUT` | `4000` | 远端请求超时（毫秒） |
| `VITE_USE_MOCK` | 未配置 API 时自动启用 | 显式启用/关闭本地演示数据 |
| `VITE_SUPABASE_URL` | 空 | 可选；需与 `VITE_SUPABASE_ANON_KEY` 同时配置 |
| `VITE_SUPABASE_ANON_KEY` | 空 | 可选公开 key；缺失时相关能力使用本地演示适配器 |

示例见 `.env.example`，不要把 `.env.local` 提交到仓库。

### 文档入口

- README：https://github.com/2648782102/LanZe/blob/main/README.md
- 贡献指南、行为准则、安全政策：https://github.com/2648782102/LanZe/tree/main
- 架构、开发、部署、路线图与 FAQ：https://github.com/2648782102/LanZe/tree/main/docs
- 变更日志：https://github.com/2648782102/LanZe/blob/main/CHANGELOG.md

### 已知限制

- 当前不提供经维护者验证的线上 Demo、托管后端或账号服务；静态部署只发布前端。
- 本地演示账号与作品数据仅保存在浏览器 `localStorage`，不提供真实密码安全或跨设备同步；真实部署必须配置后端与认证方案。
- Element Plus 已按需注册并按 Vue / Element / data / Lottie 手工分包；字体与图片等静态资源体积仍较大，后续可继续做懒加载。
- 未执行完整浏览器端交互 E2E；本版本验证覆盖构建、单测、静态扫描和开发服务器 HTTP 响应。
- Lottie 动画 JSON 与前端核心样式/图标已本地化；音乐与封面外链仍可能受第三方平台网络、防盗链或授权政策影响。
- 字体、图片、音乐、诗词文本与 CDN 资源可能有独立授权，MIT 不自动覆盖第三方素材。

### 致谢

感谢 2022–2024 年原作者与早期贡献者、Vue / Vite / Element Plus 等上游项目，以及所有参与文档、CI、模板与本地验证的人。第三方诗词/音乐/字体/CDN 服务不构成对本项目的背书。
