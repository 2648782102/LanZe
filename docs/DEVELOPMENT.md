# 开发文档

## 1. 准备环境

| 项目 | 要求 |
| --- | --- |
| Node.js | 20 或 22（与 `.github/workflows/ci.yml` 一致） |
| npm | 随 Node 分发；仓库使用 `package-lock.json` |
| 浏览器 | 日常开发：最新版 Chrome / Edge / Firefox / Safari 之一；浏览器冒烟：Chrome / Chromium |
| 编辑器 | 任意；建议启用 Vue / ESLint / EditorConfig 相关插件 |
| 端口 | `vite.config.js` 默认 `127.0.0.1:5173`；被占用时 Vite 自动换端口 |

检查版本：

```bash
node -v
npm -v
git status --short --branch
```

## 2. 首次安装

```bash
git clone https://github.com/2648782102/LanZe.git
cd LanZe
npm ci
npm run dev
```

`npm ci` 会按锁文件重建依赖；**不要**在 CI 或干净环境用 `npm install` 代替它，也不要提交 `node_modules/`。当前 Vite 6 在 Node 20/22 下已通过 `npm ci`、构建和测试验证。若本地策略禁用了依赖安装脚本并导致 esbuild 二进制缺失，先确认是否使用了 `--ignore-scripts`，再按实际错误运行 `npm rebuild esbuild`。

## 3. 日常命令

```bash
npm run dev                  # 开发服务器
npm run build                # 生产构建，输出到 dist/
npm run test                 # 39 个 node --test 单测
npm run lint                 # 静态扫描失效后端地址、硬编码服务与脆弱引用
npm run preview              # 预览构建产物
npm run smoke                # 启动预览服务并检查首页与入口静态资源
npm run smoke:browser        # Chrome / Chromium 桌面、窄屏、登录与发布冒烟
```

CI 的等价步骤是：

```bash
npm ci
npm run build
npm run test
npm run lint
npm run smoke
npm run smoke:browser
```

`npm run smoke:browser` 使用临时 Chrome / Chromium profile 与 CDP，在 1280×800、390×844 和 320×720 下验证今日展厅、单张历史摘录卡及竖排/扇舟图/收藏/换句、本地诗目收藏与吸底音源、桌面/窄屏搜索、窄屏筛选折叠、访客草稿、窄屏导航与 320px 无横向溢出，再完成演示登录、作品发布与诗卷回读；脚本要求控制台错误、未捕获异常、意外失败请求为 0，并统计非用户输入引起的 CLS（预算 0.05），结束后清理临时 Cookie 和 `localStorage` 演示数据。独立的 `.github/workflows/browser-e2e.yml` 在 Ubuntu 用 `browser-actions/setup-chrome@v2` 安装 Chromium，并通过 action 的 `chrome-path` 输出设置 `CHROME_PATH` 后运行同一脚本。本机也可用 `CHROME_PATH`、`BROWSER_SMOKE_PORT`、`BROWSER_SMOKE_DEBUG_PORT` 覆盖；脚本仍不覆盖真实后端、跨浏览器矩阵或视觉截图回归。

CI 的 Node 20/22 build job 使用 `npm run test --if-present` 以兼容外部旧流程，Documentation checks job 执行 `npm run lint`；Browser E2E job 执行构建与 `npm run smoke:browser`。本地开发建议直接运行上述全部命令。

## 4. 配置与 `.env`

参照 `README.md` 的「环境变量」表与 `.env.example` 创建可选的 `.env.local`。`.gitignore` 已忽略 `.env`、`.env.*`，并保留 `!.env.example`；示例文件只含占位值，不含真实凭据。

推荐本地演示配置：

```dotenv
VITE_USE_MOCK=true
# 连接自建 API 时才配置，例如：
# VITE_API_BASE_URL=/api/
```

核对顺序：

1. 打开 `package.json`，确认实际脚本名与 README/CI 一致。
2. 打开 `src/config/runtime.js`、`src/config/poetrySource.js` 与 `src/config/audio.js`，确认 `VITE_API_BASE_URL`、`VITE_API_TIMEOUT`、`VITE_USE_MOCK`、`VITE_POETRY_SOURCE*` 与音源变量的解析规则；业务请求与会话分别使用 `src/apis/request.js` 和 `src/services/sessionCookies.js` 的原生实现。需要重建默认声景时运行 `npm run audio:generate && npm run audio:verify`。
3. 打开 `src/apis/request.js`，确认远端优先、失败降级与提示逻辑。
4. 搜索 `http://`、`https://` 与 `createClient(`，确认页面是否仍有绕过请求层的外部调用或外部素材。
5. 若源码与文档不一致，以源码事实修文档；若属于现代化遗漏，开 issue 说明。

未配置 `VITE_API_BASE_URL` 时默认启用本地演示数据；`VITE_USE_MOCK=true` 可显式强制演示模式。演示账号为 `demo / lanze2026`，账号和作品只保存在当前浏览器 `localStorage`。

## 5. 本地后端 / mock

### 方案 A：演示数据（推荐给文档与 UI 贡献者）

- 行为：未配置业务 API 时，今日展厅使用 22 首精校短章；寻诗与读诗详情从 `public/data/poetry/` 按需加载 16 个分卷，共 9,328 篇 MIT 授权选段，合计 9,350 篇离线馆藏。首页摘录卡默认也只用本地摘录；显式开启 `VITE_POETRY_SOURCE=remote` 时才请求随机句接口，业务诗库不依赖它。
- 演示数据不能包含真实用户、私人内容、生产密钥或未授权转载的全文数据集。
- UI 应明确标注「演示数据」，并覆盖加载、空结果、请求失败三种状态。
- 验收：断开外部业务 API 后首页、文库与搜索结果页仍可展示仓库内演示数据；播放器默认使用 `public/media/` 的三段本地声景/封面，冷启动收起、暂停且 `currentTime` 为 0，显式展开后切轨、进度、音量与偏好记忆可用，自定义音源不可达时不应导致业务功能白屏。

### 方案 B：自建 API

当前 `src/apis/api/` 中使用的相对接口路径：

| 函数 | 方法 | 相对路径 | 参数/数据 |
| --- | --- | --- | --- |
| `PoetryRandom` | GET | `poetry/random` | 无 |
| `searchList` | GET | `poetry/search` | `keyword` |
| `PoetryClass` | GET | `poetry/poetry-class` | 分类参数 |
| `userLogin` | POST | `user/login` | 登录表单 |
| `userReg` | POST | `user/reg` | 注册表单 |
| `userUpdate` | POST | `user/update` | 修改密码表单 |

这些路径同时有本地演示实现，但不是已发布的稳定后端规范。自建服务应明确返回结构、状态码、CORS、限流、错误体与鉴权方式，并用 OpenAPI 或示例 JSON 固定契约。生产环境优先同源 `/api/` 代理，避免把任意第三方域暴露给浏览器。

### 方案 C：可选自定义音源

播放器默认只加载 `public/media/` 下由 `scripts/generate-audio-library.mjs` 生成的三段 WAV 声景与 SVG 封面。每段 24 秒、22.05 kHz / 16-bit 单声道 PCM，清单与 SHA-256 由生成脚本同步写出；`npm run audio:verify` 和静态冒烟会核对文件头、时长、资源清单与哈希。界面只使用自有 CSS/SVG 图标，冷启动为收起、静默的声景签；只有用户显式展开或播放后才进入完整声景卷，展开动作本身不调用 `play()`。完整态提供播放列表、切轨、自动续播、进度拖动、音量/静音与本机偏好记忆。只有设置 `VITE_AUDIO_SOURCE=custom` 并提供有效 `VITE_AUDIO_TRACKS` JSON 时才会启用自定义音源，其可用性、速率限制、内容授权与隐私政策由配置者负责。无效 JSON 或空列表自动回退到本地声景并显示一次可读提示；URL 不可达或播放失败时播放器显示「声景不可达」，点击播放按钮会重新加载并重试，业务页面保持可用。CI 不依赖第三方站点返回成功。逐项记录见 `docs/THIRD_PARTY_ASSETS.md`。

## 6. 开发约定

- 组件只调用 `src/apis/api/*.js` 的领域函数；不要在模板/组件里拼接完整外部 URL。
- 异步操作设置加载、成功、空数据、失败四态；不要吞掉 Promise rejection。
- 用户态结构集中定义，避免一处写字符串、另一处读 `user.id`。
- 路由与旧地址重定向集中在 `src/router/index.js`；不要在页面 `setup()` 中反复注册路由守卫。
- 不向全局 `window` 追加未声明依赖；`scroll` 等标识符必须显式定义。
- 样式优先局部作用域；调整 `index.html` 的全局 `overflow`/媒体查询时同时检查移动端滚动。
- 不要在仓库中保存 `.env`、`dist/`、日志、真实 Cookie 或用户数据。
- 新增资源时在 `docs/THIRD_PARTY_ASSETS.md` 记录来源、许可与大小；大字体/图片优先做性能与授权评估；默认播放列表不得重新引入第三方媒体域。

## 7. 手动 QA 清单

每次代码 PR 至少完成一组：

### 构建与控制台

- [ ] `npm ci` 成功；`git status` 没有锁文件意外改动。
- [ ] `npm run dev` 启动；浏览器控制台无新增 `Uncaught` / 404 静态资源错误。
- [ ] `npm run build`、`npm run test`、`npm run lint` 成功。
- [ ] 修改构建配置后，`npm run smoke` 成功。
- [ ] 修改首页/摘录卡片/导航/播放器/登录/发布链路/路由后 `npm run smoke:browser` 成功。
- [ ] `dist/` 未被提交；`.env*` 未出现在 diff 中。

### 页面路径

- [ ] `/#/` 今日展厅展示整首诗、词牌长题分行与单张历史样式余韵摘录卡；换诗、摘录收藏/换句、朗读可操作。
- [ ] `/#/explore` 关键词检索、体裁筛选、URL 查询同步与空状态。
- [ ] `/#/poem/demo-jingyesi` 诗笺、标签、相关诗目与复制链接。
- [ ] `/#/collection` 收藏、最近阅读、作品、资料编辑与退出登录。
- [ ] `/#/compose` 草稿自动保存、实时预览、校验与发布链路。
- [ ] `/#/login` 演示账号与表单错误；不提交真实账号。
- [ ] 桌面宽度、390px 与 320px 移动宽度，各检查一次布局、焦点、筛选/表单和底部固定层。

### 数据边界

- [ ] 设置 `VITE_USE_MOCK=true` 后，业务请求不再访问外部 API。
- [ ] 设置 `VITE_API_BASE_URL=/api/` 后，请求路径没有重复斜杠或跨域失败。
- [ ] 断网/后端关闭时，业务页面降级到本地演示数据而不是白屏。
- [ ] 网络面板中没有 `service_role`、私人 token 或真实用户数据。

## 8. 常见故障

| 现象 | 排查 |
| --- | --- |
| `npm ci` 后 esbuild 二进制不可用 | 检查是否使用 `--ignore-scripts`；按实际错误运行 `npm rebuild esbuild` |
| 页面打开即白屏 | 查看控制台、自定义音源配置是否阻断、hash 路径是否正确、`index.html` 是否加载 `/src/main.js` |
| 搜索没有远端结果 | 检查 `VITE_USE_MOCK`、`VITE_API_BASE_URL` 与超时；默认会自动降级到演示数据 |
| 摘录为空或来源不对 | 默认应为「仓库内置摘录」；若显式开启远程源，检查 `VITE_POETRY_SOURCE`、`VITE_POETRY_SOURCE_URL`、超时与页面来源状态 |
| GitHub Pages 子路径资源 404 | 检查 `base: './'` 与发布目录；hash 路由本身不需要 rewrite |
| `npm run test` 失败 | 查看 `node --test` 输出；CI 使用 `npm run test --if-present` 兜底 |
| `npm run smoke:browser` 找不到浏览器 | 安装 Chrome / Chromium，或用 `CHROME_PATH` 指向可执行文件；CI 使用 setup-chrome action 的输出 |
| Vite 配置因模块类型报错 | `vite.config.js` 使用 ESM 导出，与 `"type": "module"` 一致；CI 只跑 npm 脚本 |

## 9. 提交前检查

```bash
git status --short
git diff --check
npm run build
npm run test
npm run lint
npm run smoke
npm run smoke:browser
```

同时阅读 `CONTRIBUTING.md`、`CHANGELOG.md` 与 `docs/DEPLOYMENT.md`（若改动影响构建/部署）。跨 `package*.json`、`vite.config.js`、`index.html`、`src/**` 与文档的改动，请在 PR 中说明验证范围和同步结果。
