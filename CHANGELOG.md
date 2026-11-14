# 变更日志

本文件按「待发布 → 历史里程碑」组织，历史部分依据仓库 `git log` 归纳，并非逐条完整提交记录。历史基线停在 42 次提交，首个提交为 `74b4186`（2022-06-03），最后一段历史基线提交为 `b4ea7f4`（2024-08-18）；v0.2.0 之前没有 Git tag 或已发布 Release。历史提交信息中的 `1.0`、`1.1`、`2.0.0` 是开发标记，不代表本仓库存在对应正式发行版。

## [Unreleased]

> 记录 `v0.4.0` 之后、尚未发布的改动。

### Changed

- 修复摘录卡轻拂拖动失效：新增的 `.legacy-card__turn` 无障碍按钮本身是 `<button>`，而 `startSwipe` 里的 `event.target.closest("button")` 会连带把它排除，导致指针按下后不进入拖拽。改为只排除收藏按钮 `.legacy-card__save`；该按钮同时移除 `@click`，点击统一由卡片冒泡处理，避免双触发。复测：轻拂 4/4 在松手前切换、`doubleTurnCounts [1,1,1]`、0 掉帧。
- 无障碍与性能门禁：新增 `npm run audit:a11y`（axe-core，5 路由 × 桌面/移动端，WCAG 2.1 A/AA），实测从 12 组违规降到 **0**：`--ink-faint` #809793→#586965、新增 `--brass-text` #8a6933 并替换 42 处正文用金色、`--celadon-deep`→#476c63、移动端底部导航文字 0.5→0.62 透明度；摘录卡由 `role="button"` 改为 `role="group"` + 内部真按钮 `.legacy-card__turn`，修掉 nested-interactive。新增 `npm run audit:perf`（LCP/CLS/首屏 JS-CSS gzip 预算）：实测 LCP 296ms、CLS 0、首屏 JS 64KB、CSS 10KB，均达标。两者已接入 Browser E2E workflow；`scripts/browser/lab.mjs` 支持 `CHROME_PATH`/`CHROME_BIN` 以便 CI 复用。新增 `useNotices` 单测，单测 41→43。
- 视觉体系收敛：新增字号阶梯（`--text-body/lead/title/heading/display`）、行高与卡片层级 token（`--card-border/-strong`、`--card-shadow/-raised`），把散落的 11/12/13px 硬编码替换为 token；三页 hero 统一使用 `--hero-pad-top/-bottom` 节奏（写作页由 34px 提到 58px）。诗途卡片改为实心浅底 + 阴影 + hover 抬升，与列表项的细线分隔形成层级差；账号卡与预览纸改用强边框 + 抬升阴影。写作页「预览不是出版定稿」并入顶部「预览 · 非定稿」，避免被固定播放器遮挡。
- 视觉核对发现桌面端固定播放器会压住写作页预览面板底部：`.preview-panel` 增加 `max-height` + 内部滚动，`.preview-sheet` 最小高度 520→420；同时把 `--fixed-layer-space` 扩展到 ≥821px（88px），并把 `App.vue` 中 `:where()` 选择器提权为真实类选择器，使其对 `collection`/`compose` 页生效。
- 响应式细查与修复：新增 `scripts/browser/responsive-sweep.mjs`（5 条路由 × 14 个断点 320–1920，检测横向溢出、贴边元素、触控目标 <24px、标题截断，输出截图与 JSON 报告）。实测发现 768–820px（平板竖屏）空白带：`poem-plinth` 的 `min-height: 440px` 到 560px 断点才解除、摘录区仍双列、`gallery__room` 拉伸居中，导致内容间约 600px 空白且展品图被底部导航遮盖。修复为 ≤768px 时摘录区改单列、`poem-plinth`/`gallery__room` 的最小高度归零并对齐起点；sweep 复测 70 项零问题。
- 最终定位品牌区不协调的根因：参考图里图形宽占三段总宽约 42%，此前只占 18%。把三柱加宽加满（38×30、柱宽 5px、间距 6px），使图形 : 中文 : LANZE 的比例与参考一致；真实内置浏览器与本地构建截图均已复核。
- 新增 `npm run capture:brand:1x1`（`scripts/browser/capture-brand-1x1.mjs`）：以 `.brand` 实际 bounding box 截 2x 品牌区并输出三段几何，修正此前按固定坐标裁切导致的错位截图；配合 `docs/BROWSER_VERIFICATION.md` 的内置浏览器优先流程使用。
- 品牌区按参考图实测坐标收敛（参考 382×114 @2x → CSS）：图形 26 宽、图形→中文 13、中文 44.8、中文→LANZE 16、LANZE 43.9，总宽 143.7 对上参考 142.5；柱宽 2→3px 让基准线与柱群匹配。新增 `npm run capture:brand:1x1`，用与参考完全相同的 191×57 CSS 裁切框截品牌区，避免此前因裁切框不同造成的「看起来更大/更右」误判；Browser E2E 品牌阈值同步为参考实测量级。
- 在 Codex 内置浏览器（`cua_repl` / IAB）里直接核对导航栏最左侧品牌区：启动本地 4399 端口、创建可见持久 tab、读取 AX 树与截图，并按真实渲染调整品牌三段比例（图形 42×36、中文 26px、LANZE 12px 下沉、段间 18/22px）；刷新同一内置 tab 后确认布局稳定。Browser E2E 的 `latinOffset` 上限同步放宽到 18px，`docs/BROWSER_VERIFICATION.md` 明确 UI 改动必须先经内置浏览器视觉判断。
- 补全 Chrome 验证能力：新增 `scripts/browser/lab.mjs` 统一封装系统 Chrome（Playwright `executablePath`）、本地 preview 启动、多路由稳定导航、整页/元素截图、真实鼠标拖拽、控制台/页面/网络错误收集、几何采样与 `pixelmatch` 像素比较；`npm run verify:render` 会同时截本地与线上 GitHub Pages，要求品牌区 `mismatches === 0` 且无浏览器错误，并输出 `/tmp/lanze-render-lab/` 下的截图、差异图与几何报告。新增 `docs/BROWSER_VERIFICATION.md` 说明能力边界与仍缺的跨浏览器/录屏/a11y 项；`playwright`、`pixelmatch`、`pngjs` 作为开发依赖加入，不下载额外浏览器内核。
- 复核「远端是否更新」：本地 HEAD、`origin/main`、Pages workflow 的 `head_sha` 一致为 `75d6c90`；线上 HTML/CSS/JS 与本地构建字节一致，禁用缓存打开线上 URL 实测 `brand__name=26px` 等旧值，证明不是部署问题而是上一版品牌比例仍不理想。随后按完整页头截图收敛品牌区：不把用户给的 2x 局部放大图尺寸直接套到 1x 页头，恢复克制的图形 34×32、中文 22px、LANZE 11px 下沉，保留段间 12/14px 的舒展关系；Browser E2E 品牌断言同步回到整页尺度。
- 真在浏览器里核对页头品牌区：用无头 Chrome 把当前品牌与参考局部图做 1:1 并排截图，发现中文字号、三根柱高与 LANZE 间距比例失衡；按参考重排为图形 42×36、中文 26px、LANZE 11px 下沉、段间 18/22px，并确认完整首页里品牌→导航 337px、导航→工具 432px 未受挤压。新增 `npm run capture:brand` 截图工具与 Browser E2E 品牌坐标断言，避免以后只看数值不看渲染。
- 主动排查并修复系统文案贴边：摘录卡「点击或轻拂换一句」原 `bottom:-12px` 压在卡片下缘（牌堆到提示 -0.6px），改为卡片下方 32px、净距 14px；移动端摘录区与下方文案间距由 30px 提到 44px，提示到下一块由 14px 提到 28px。新增 `npm run inspect:spacing` 无头浏览器探针，覆盖今日/登录/写作/诗卷/索引五条路由、桌面/移动端，自动报告垂直堆叠元素净距 <8px 的情况；Browser E2E 增加提示与卡片底边 ≥10px 的回归断言。
- 全站系统文案核对：去掉「等比还原 / 仓库内置 / 脚本合成 / 本地演示 / 演示账号 / 纯前端 / 自建 API / 旧版 / 外链直连 / 冒烟测试 / 请检查配置」等开发与防御性口吻，统一为诗馆产品语气；保留「内容留在此浏览器、不跨设备同步、不连接线上社区」等必要事实但改为克制表述。同步更新摘录来源标签、播放器曲目副标题与错误提示、登录/写作/诗卷/页脚/详情页说明、示例作品署名与 E2E 生成内容；古诗词正文不变。
- 按使用者决定恢复 2022 版播放器的**外链直连**用法：默认五首改为「少年不凡 / 浣纱歌 (伴奏) / 卡农 / River Flows in You（你的心河） / Leaves in the Wind」，直接请求 `music.163.com/song/media/outer/url` 与 `music.126.net` 封面，不下载、不提交音频文件；移除 lint 中对这些域名的默认禁令。`src/config/audio.js` 默认源标记为 `legacy`，`custom` 通道与 `public/media/` 下 CC BY 3.0 古筝备用素材保留。Browser E2E 改为校验 5 首外链、切轨与偏好，放行第三方媒体域名的 `ERR_ABORTED`；README / FAQ / 架构 / 开发 / 部署 / 素材清单同步为外链口径，并注明授权、签名、防盗链与失效风险由平台/部署者承担。
- 新增 `npm run audio:private` 本机私有音轨通道：把使用者自有且授权清晰的音频放入被忽略的 `public/media/private/`，可用同目录 `tracks.json` 恢复旧版曲名/作者/顺序（模板见 `docs/PRIVATE_AUDIO.md`），脚本生成同样被忽略的 `.env.local.audio` 并以 `vite --mode local.audio` 启动；不下载、不提交、不部署。README / FAQ / `.env.example` 同步说明本机私有音轨边界。
- 默认声景从脚本合成的 24 秒正弦波循环替换为真实开源录音：三段均节选自 Wikimedia Commons 上 Antti Luode 的 CC BY 3.0 古筝曲（`Guzheng Morning`、`Senor Guzheng and the Happy Monks`、`My name is Zheng Zheng GuZheng`），按主题重命名为「空山 · 松风 / 月色 · 瓷盏 / 晚舟 · 水纹」。新增 `scripts/import-audio-library.mjs` 可复现裁切 36 秒片段、降采样到 11.025 kHz 单声道 PCM、加淡入淡出，并写出 `audio-manifest.json`、`SHA256SUMS.txt` 与 `public/media/AUDIO_CREDITS.md` 署名；`npm run audio:generate` 指向新脚本，校验脚本改为从清单读取采样率/时长并强制检查每段署名。三段总大小约 2.3 MB，小于原合成曲库；README、FAQ、开发/架构/部署/素材清单同步为 CC BY 3.0 口径。
- 播放器组件删除后从零重建，并用无头浏览器把参考图与当前渲染做 1:1 像素叠图校准：卡片精确为 357×106 CSS，金色左线、贯穿箭头 rail、方形播放键、白底唱片封面、标题/副标题、右上时间/状态、缩进进度条、分隔线与单行控制行均按参考图坐标绝对定位，不再用多层 flex/grid 累加 padding 导致整体偏移。收起态重排为 192×60 的协调单行；箭头按面板固定右侧的交互方向修正为「收起用 `<` 向左展开、展开用 `>` 向右收回」。小屏控制行不换行。修正 `handleEnded` 里 `trackIndex` ref 未解包的问题；新增 `npm run compare:audio` / `npm run measure:audio` 像素与坐标诊断，E2E 增加箭头方向、区域不越界与展开尺寸稳定断言。
- 整体性能与架构优化：业务请求改用原生 `fetch`，会话改用原生 Cookie 适配器，移除 `axios`、`vue-cookies`、`@supabase/supabase-js` 与未被引用的 Supabase 适配器；首屏不再预加载 62KB 的 `data-vendor` chunk，npm 依赖由 75 个包降至 38 个且 `npm audit` 为 0 漏洞。
- 三张首屏位图（展品图、登录封面、摘录扇舟图）增加 AVIF 优先源并保留原 JPG/PNG 兜底；浏览器只下载 AVIF，单张资源最多从 439KB 降到 51KB。摘录卡图片标记为低优先级，不与首屏展品图争带宽。
- `ReadView` 的摘录牌堆状态抽取为 `useExcerptDeck()` composable，视图只保留展厅渲染与事件转发；新增 `sessionCookies` 单测并移除已废弃的 Supabase 配置用例，单测总数为 41。
- Vite 构建开启 manifest，并由轻量插件为首屏 `ReadView` 的 JS/CSS 注入 `modulepreload` / `preload`；`index.html` 保持哈希资源引用与 CLS 0。

### Added

- 摘录卡改为真正提前预载：首屏同步生成 6 句本地队列，远程源挂载时并行预取 4 句未来备用句；点击/轻拂只消费队首并自动补齐本地槽位，交互过程中不发起新的诗句请求。Browser E2E 增加预载深度、手势期间请求数不变与远程源 2.5 秒延迟用例。
- 摘录卡切换修复网络等待：下一句先由本地馆藏同步生成，`turn` 不再等待 `fetch` 或 `loadExcerptFromSource()`；远程诗句只在后台补充未来备用句，请求失败、超时或延迟都不阻塞点击/轻拂。Browser E2E 新增远程响应延迟参数，并在 `VITE_POETRY_SOURCE=remote` 且延迟 2.5 秒下通过完整流程。
- 摘录卡触发升级为「轻拂换笺」：保留点击、Enter/Space、方向键与外部按钮；新增鼠标/触屏横向轻拂，42px 位移或快速滑动触发换句。卡面、扇舟图、收藏角标与 hover 光泽保持静止，只有底部笔锋导轨跟随手势显示方向和进度；达到阈值后沿用「换笺落墨」动画。Browser E2E 覆盖手势进度、卡面零位移、连续点击与轻拂换句。
- 摘录卡升级为「换笺落墨」：保留点击触发、无拖拽。卡片增加角隅细线、更柔和的纸面层次与悬浮光泽；切换时宣纸薄笺横向掠过文字区、笔锋细线轻扫、旧句隐去、新句与落款错峰浮现，右下低饱和朱砂小印收束动画。卡面、扇舟图、收藏角标和 hover 悬浮不参与位移，卡片本体不重建；`prefers-reduced-motion` 直接换句。Browser E2E 覆盖动画层启动、连续点击换句与静态无拖拽契约。
- 摘录卡交互收束为静态点击：移除拖拽、纸幕、翻页、飞出、粒子与所有切换动画；点击卡片或「换一句」按钮即时切换诗句。历史白色卡构图、收藏角标、hover 光泽与悬浮过渡保留，收藏按钮继续独立可用。Browser E2E 改为验证静态卡面、无拖拽/纸幕层、点击换句与按钮续换。
- 摘录卡翻页彻底替换飞出效果：改为「纸幕覆写」——拖动阶段只让真实卡片轻度跟手，松手后 150ms 白色纸幕覆盖、覆盖期间静默换句、再用 220ms 淡出显示新句；不再动画化整张复杂卡面，不再在尾帧销毁/重建卡面，也不再使用 3D 翻转、粒子、书写滤镜或大位移飞离。CDP 尾帧事件从 26 次降到 14 次，连续录屏 33 帧覆盖 8–564ms 且无超过 60ms 空档。
- 摘录卡尾帧卡顿根因修复：上一版虽改为 WAAPI，但 `.is-committing .legacy-card__box--current` 仍以 `opacity: 0`、`visibility: hidden` 与 `transform: none !important` 覆盖动画，视觉上变成 460ms 静止后在结束帧突然跳到飞离位置。现在直接动画化当前真实卡面：提交前读取真实 `transform` 作为首帧，动画期间不再销毁/重建卡面，`finished` 后先静默交换父级数据、取消动画并回写样式；尾帧 DOM 事件从 37 次降到 26 次，不再移除/重建 `legacy-card__box--current`。CDP 录屏 40 帧覆盖 2–643ms、无超过 60ms 空档，Browser E2E 增加飞出中 hover lock、落定后诗句与透明度断言。
- 摘录卡翻页重写为「一张旧卡飞离、一张新卡静待」：删除人为 240ms 延迟、逐字书写、纸纹裂片与滤镜，松手后仅运行一条 460ms 的 `card-out` 位移动画，新卡只做透明度承接；动画完成由 `getAnimations().finished` 收束，静态预取与 hover lock 保持不变。CDP 动画探针显示整套动作只剩 2 个动画，连续帧 39 帧覆盖 20–647ms 且无空档，Browser E2E 改检单动画零延迟起飞与 460ms 时长。
- 摘录卡翻页重构为「合成器优先」：去掉 96 个逐格粒子节点与所有逐字 `filter: blur()`/`clip-path` 动画，旧卡用一条 520ms 的 3D 掀页关键帧与单层纸纹裂片离场，新句用 18ms 错峰的 opacity/位移显墨，出处随后淡入。飞出仍延迟 240ms 等新句写完，`getAnimations().finished` 精确收束；CDP 连续录屏 45 帧覆盖 1–739ms 且无超过 60ms 空档，动画事件从上百个降到 20 个。Browser E2E 改检纸纹裂片与轻量书写，保留跟手、静默预取、hover lock、触屏/按钮/键盘入口断言。
- 摘录卡末段再次复核：用 CDP 合成帧探针确认上一版卡顿来自飞出结束时同帧创建 30+ 个逐字 `filter: blur()` 动画，合成器集中提升图层造成停顿。毛笔效果收敛为整句单层动画，并在 180ms 内先完成显墨，旧卡与粒子延迟到书写完成后再飞离；提交窗口相应延长到 740ms，但飞出时长仍是 560ms。连续录屏探针显示 56 帧覆盖 12–945ms 且无超过 60ms 的空档，Browser E2E 增加「书写领先飞出」断言。
- 摘录卡末段卡顿定位为粒子双层动画与尾段 hover 过渡争抢主线程：镂空层改为静态瓷面，8×12 网格只保留 96 个错峰飞散动画，事件数量减半；提交用 `getAnimations().finished` 精确收束并锁住 hover 光泽/倾斜直至指针离开。Browser E2E 检查粒子数量、无镂空动画尾段 hover lock。
- 摘录卡提交链路重做为「静默落纸」：拖动开始即冻结当前句与预取句，左右方向只决定飞出方向，不再触发另一句数据加载；父级在动画结束前保持底层预取句不变，动画结束才交换当前句、清空并预取再下一句。Browser E2E 新增提交中段 incoming 文本与 transform 断言，覆盖鼠标、触屏、按钮和键盘连续三次换句。
- 摘录卡甩出改为统一的 560ms 线性多关键帧：释放瞬时速度决定飞出距离与旋转，位移、抬起、缩放和像素离散持续推进到末段，避免长尾缓停造成「卡一下」；像素粒子延迟收进 64ms 内并让飞散在动画结束前收束。新句按笔画权重逐字书写，`clip-path`、墨晕、偏锋和收锋共用同一时间轴，出处随后淡入；`prefers-reduced-motion` 仍直接换句。
- 摘录卡交互改为「连续进度 + 释放提交」：拖动不再在某个临界点突然触发整卡动画，而是连续推进跟手位移、底层新卡透明度与新旧文字淡入淡出；未达提交距离则弹性归位，松手达到距离/速度才提交。新卡始终位于原位且没有 transform，修掉向右拖动后新卡从右侧抖回中间的回弹感；旧卡改用提交瞬间的独立快照离场，内容更新由数据 watcher 在动画完成后收束，避免同一 DOM 既飞离又承载下一句。
- 破坏效果从六条横向裂片升级为 CSS3 离散像素：8×12 网格按稳定伪随机种子生成静态镂空底色、颜色、散射方向、旋转和错峰延迟，96 个粒子在旧卡飞离时离散；不引入 Canvas、WebGL 或第三方动画库，`prefers-reduced-motion` 直接换句。Browser E2E 改为验证拖动期间无提前切换、新卡 transform 恒为 `none`、释放后才提交、96 个粒子进入飞散动画且镂空层不产生额外动画；桌面/移动端关键帧复核。
- 摘录卡按「被破坏」的方向重做：移除卡内「掀开」按钮，拖动跟手阶段保持完整白卡，提前翻页后旧字淡出、卡面淡出并裂成六片不规则纸缘，各片按不同角度、速度、上下漂移与错峰甩离；下一句先整体淡入再逐字显墨，新卡同步落纸。卡面抽为 `ExcerptCardFace`，碎片按卡片实测尺寸生成，桌面鼠标、触屏、外部换句按钮与键盘共用同一动画；Browser E2E 验证按钮移除、六片裁切、撕裂帧、旧字淡出、新字淡入与减少动效回退。
- 摘录卡掀页进一步收口为连续手势：拖动状态在提前触发翻页后仍保留当前手指位移，飞离曲线叠加横向甩动速度，松手/取消不再回落或重复触发；阈值降至约 34–58px 等效位移，新卡落纸与显墨节奏同步收短。Browser E2E 增加翻页瞬间仍跟手、保留甩动动量断言，桌面与 390px 移动端关键帧复核一致。
- 摘录卡交互重做为连续「掀页」：预取并预渲染下一张白卡，拖动时上层卡用 `requestAnimationFrame` 跟手位移/抬起/翻转，底层新卡渐显；位移与甩动速度共同决定翻页，越过较小阈值后在拖动过程中即切换，不用等松手或等接口返回。桌面鼠标、触屏、按钮和键盘共用同一状态机与 `prefers-reduced-motion` 回退；Browser E2E 增加跟手位移、提前翻页、触屏拖动和连续换句断言。
- GitHub Pages 部署改为 `main` push 自动触发，并保留手动重跑；本轮排查发现旧 workflow 只有 `workflow_dispatch`，导致代码/CI 已更新但线上仍停留在 11 月 7 日的旧 artifact。手动 workflow `42874012307` 已重新部署 `7119087`，线上入口 JS/CSS 与本地构建哈希一致。
- 播放器改为明确的「声景签 / 声景卷」两态：所有视口冷启动收起、静默且不自动播放；显式展开后才显示稳定网格化的封面、曲序、进度、控制与播放列表，收起后回到不抢正文的夜青小签。Browser E2E 增加冷启动暂停、无 `autoplay`、展开不触发播放、两态尺寸与移动端静默断言。
- 登录左栏《越人歌》诗笺的两行顺序与几何排版收敛为两列完整竖排，出处同样竖排贴边；Browser E2E 增加原文顺序、两列高度与不拆字断言。
- 余韵区恢复并强化历史摘录卡的「拖走换句」：旧卡跟随指针掀起、越阈值后向左右飞离，底层新卡落纸并逐字显墨；「换一句」按钮与键盘方向键共用同一动画状态，保持单张白色卡片和历史构图不变。
- 前端表现补入「可游走的青瓷诗馆」一轮：首屏编排入场、动效 token、收藏/换诗/切轨/筛选/草稿/发布的解释性反馈，寻诗页三条真实馆藏诗路，读诗页词牌长题分行与上一首/下一首连续阅读，写作台草稿保存时间与同步预览反馈。
- Browser E2E 增加独立冷启动页面：用 `PerformanceObserver` 复核 CLS、播放器尺寸与固定层/内容相交，避免只在页面稳定后测量而漏掉异步路由造成的首帧位移。
- 本次保存补齐 `v0.4.0` 发布与展示文案、Node/npm `engines` 约束及发布 workflow；发布前用 `npm ci` 重建依赖并复核全部质量门。
- GitHub Pages 静态预览已启用并回读：手动 workflow `42376966164` 以 `6251b0d` 构建并部署成功，项目站点首页、入口 JS/CSS、馆藏清单与音频清单均返回 200；仓库 Website 已改为同一 Pages URL。
- GitHub 社交预览图已上传、在线 Discussion #1 已按 `ANNOUNCEMENT.md` 更新，About 描述与 Website 已公开 API 回读；外部短帖、社区投稿与付费推广仍未执行。

### Changed

- 取消桌面播放器悬停/聚焦自动展开、空闲自动收束与断点自动展开，统一由 handle 显式切换两态；收起签不再使用圆形按钮或隐藏正文的贴边条，展开卷沿用夜青、青瓷细线与铜金索引色，并保留 108px 固定层预算、36px 控件、24px 滑块和 `prefers-reduced-motion`。
- 登录页左栏诗句改为带细边框的竖排诗笺，两行《越人歌》与出处独立成列，不再被容器压成散开的横排字符；Browser E2E 增加真实 Pointer 拖动、掀卡状态、换句结果与登录竖排断言。
- 克制收口界面状态完整性：通知层、页脚与主内容统一到 820px 固定层断点；展开播放器补齐稳定展开状态与触控高度；关闭提示、进度条、快捷词和禁用按钮获得一致反馈。登录装饰区不再进入 Tab 顺序，账号切换与诗卷标签的 ARIA 语义按实际行为归位；历史白色摘录卡构图保持不变。
- 前端细节走查补齐文字排版契约：辅助文字统一提升至 11px 以上、收紧中文标签字距、优化标题与说明段落换行，寻诗长诗题改为两行完整显示；窄屏主内容增加固定层安全区，桌面播放器在键盘焦点停留时保持展开，并扩大播放器次级控件与关键链接的点击区域。历史白色摘录卡构图保持不变。
- `App.vue` 为主壳路由舞台预留一屏高度，修复桌面生产构建冷启动时页脚先占首屏再被异步页面推走的约 0.15 CLS；`SiteFooter` 不需要占位骨架，登录 bare 页不受最小高度影响。
- 本地声景播放器从 460px 左下大暗块改为桌面右下贴边声景索引：默认 92px 宽，悬停/键盘聚焦展开完整控件；窄屏收起态更薄，首页换诗箭头与底部导航不再被遮挡。通知层上移避开固定层。
- GitHub About 描述已由 27 项单测旧口径更新为 v0.4.0 当前事实：39 项单测、9,350 篇离线馆藏、三段本地声景；Website 不再使用未核验归属的 Vercel 地址。展示、部署、路线图、FAQ 与 README 同步为「已验证静态预览，不承诺托管后端或完整线上 Demo」。
- 已发布 `v0.4.0` Release 正文按发布时快照保留；后续展示状态以 GitHub 页面/公开 API、维护日志和本文件为准，避免把版本说明改写成持续更新的展示看板。
- 修正 `ANNOUNCEMENT.md` 中会在 Discussions 里解析错误的相对「安全政策」链接；CI 拒绝欢迎帖源文案再次出现相对链接，publish workflow 归一化已有正文的 CRLF 后比较并用同一规范正文写入。

## [v0.4.0] — 2026-11-07（当前版本）

> 本段汇总 `v0.3.0` 之后合并到 `main`、由同名 tag 发布的改动。`v0.2.0` 与 `v0.3.0` 仍是独立历史 Release。

### Added

- 以 `chinese-poetry/chinese-poetry@b8594f8` 的 MIT 授权选段重建业务诗库：16 个静态分卷、9,328 篇语料，与 22 首精校短章合计 9,350 篇；寻诗页改为朝代/体裁双轴筛选、分页与来源标注，读诗详情按馆藏分卷关联。分卷放在 `public/data/poetry/`，首包 JS 从约 4.6 MB 降至 35 KB，业务诗库不再依赖首页随机句 API。
- 新增馆藏分层加载、离线目录/分卷 SHA-256 校验清单与许可证文件、静态冒烟与 CI 语料完整性检查；Browser E2E 覆盖馆藏数量、分面与分页。
- 首页摘录卡默认改为纯本地：交替使用历史内置摘录与精校馆藏短句；`VITE_POETRY_SOURCE=remote` 才启用外部随机句接口。默认运行与 CI 不再依赖任何外部诗词服务。
- 新增一轮桌面与 320–1440px 多宽度前端走查：寻诗窄屏筛选改为可折叠面板，写作台支持访客预览并保留本机草稿，浏览器冒烟增加 320px 横向溢出与固定层避让断言。
- 将单段演示音升级为三段可复现生成的本地声景曲库：`npm run audio:generate` 输出 24 秒 22.05 kHz / 16-bit 单声道 PCM、原创 SVG 封面、清单与 SHA-256；`npm run audio:verify` 校验格式、时长和哈希。播放器加入封面、播放列表、切轨/自动续播、进度拖动、时间显示、音量/静音、状态色与浏览器本地偏好记忆。
- 新增曲库生成器、校验器与 3 项单测；`npm run test` 从 36 项增至 39 项。Browser E2E 增加播放列表、切轨、进度拖动与本机偏好回读。

### Changed

- GitHub topics 已移除无关的 `element-plus` 并补上 `static-site`、`design-system`、`github-actions`；发布时公开 API 回读显示 About 描述仍为 27 项单测旧口径、Website 字段为可访问但未核验归属的 Vercel 地址，因此当时的文档不把它们写成已完成展示。该口径后续已在 `Unreleased` 中更新。
- 收口移动端产品体验：窄屏播放器默认收起并与底部导航分层，缩小触控区但仍保留 44px 级主按钮；索引行、筛选容器、表单、页脚与摘录区按 320px 基线消除溢出，压缩解释性文案，减少首屏堆叠与页面留白。视口单位改用 `dvh`，补齐字体 accent token、路由首帧标题和固定层安全区留白，保持零页面级横向滚动和 CLS 0。
- 默认媒体资源由旧 8 秒 `lanze-demo.wav` 替换为三段本地声景；静态冒烟逐项请求曲库资源，CI 校验曲库哈希，lint 拒绝旧演示音文件名和第三方音乐域回到默认配置。自定义音源仍只在显式启用且授权明确时使用。

### Verification

- 干净环境 `npm ci` 后，`npm run lint`、`npm run audio:verify`、`npm run test`（39/39）、`npm run build`、`npm run smoke`（35 assets）、`npm run smoke:browser`（CLS 0.0000、控制台/网络错误 0）、`npm audit --omit=dev`（0 vulnerabilities）均通过。
- `54ca6b7` 的 CI run `42371607288` 与 Browser E2E run `42371607294` 均为 success；annotated tag `v0.4.0`、publish run `42371739156` 与公开 Release `437556989` 已回读。发布后的文档口径复核由维护记录补充。

## [v0.3.0] — 2026-11-07（已发布）

> 本段汇总 `v0.2.0` 之后合并到 `main` 的视图重构、体验完善与工程验证；`v0.3.0` 已打 tag 并发布 Release，CI、Browser E2E 与本地验证均通过。`v0.2.0` 仍是独立历史 Release。

### Added — CI Browser E2E 与音源错误态

- 新增 `.github/workflows/browser-e2e.yml`：在 Ubuntu / Node 22 安装 Chromium，通过 `browser-actions/setup-chrome@v2` 的 `chrome-path` 输出设置 `CHROME_PATH`，构建后执行 `npm run smoke:browser`；Documentation checks 同步把该文件列为必检 workflow。
- `scripts/smoke.browser.mjs` 支持 `CHROME_PATH`、Linux Chromium 常见路径和 `--no-sandbox`，并断言吸底播放器状态的 `role="status"` 与初始文案；同一脚本保留桌面/窄屏、诗句源拦截、收藏、登录、发布、控制台/网络错误与 CLS 预算检查。
- `src/components/AudioDock.vue` 为不可达自定义音源或播放失败增加「音源不可达」状态、错误描边和重试入口；加载成功后自动恢复状态，不阻断业务页面。

### Changed — 青瓷数字诗馆：完全重构

- 确立并写入 [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) 的目标模式：冷白瓷面、青灰线框、铜金索引色，以及「一首诗一展厅」的信息架构；明确拒绝三折经卷、通用卡片矩阵、轮播、暖纸朱印与伪造社区数据。
- 视图层重建为六类页面：今日展厅、诗词索引、读诗详情、我的诗卷、写作台、登录/注册；旧 URL 统一重定向，不再保留原有的 36 个旧 `.vue` 页面与占位栏目。
- 新增 `src/views/`、`src/components/` 中的自有壳层、图标、列表行、通知、响应式导航与原生音频控件；新增 `src/styles/base.css` 作为唯一设计 token 与基础样式入口。
- 移除旧 UI 套件、动画运行时、APlayer、滑块验证码与 Nanoid 的界面依赖；播放器改为原生 `<audio>`，反馈改为自有通知组件。
- 重构核心交互：整首读诗、按长度分行的词牌标题、朗读、收藏持久化、最近阅读、体裁/关键词检索、资料编辑、草稿自动保存、实时作品预览与发布。
- 扩充本地演示诗目到 22 首；`useLibrary` 统一管理诗目、收藏、最近阅读与 URL 查询状态。
- `scripts/smoke.browser.mjs` 改为按新语义 DOM 验证今日展厅、本地收藏、桌面/窄屏搜索、原生音源、登录与作品发布；补充步骤化报错和 `localStorage` 访问保护。
- 运行时改为按可见字符生成的 WOFF2 宋体子集，展品图与登录封面按实际展示尺寸缩放压缩；声明字体度量覆盖与图片尺寸，避免 14 MB 历史字体和大图进入产物或造成替换抖动。Vite vendor 分包同步收敛为 Vue / data 两类。
- 重绘 `public/og-image.svg` 并按青瓷展厅视觉渲染 `public/og-image.png`（1200×630）；同步 README、架构/开发/FAQ/宣发/素材清单与贡献入口。展示图是当前设计的衍生插画，不是运行截图；保留 27 项单测与 CI/冒烟入口，不宣称新增后端或线上服务。
- 收敛首屏性能与布局稳定性：移除悬浮层 `backdrop-filter`、简化路由过渡与换诗动效、固定诗笺最小高度、给图片声明宽高、限制通知数量，并清理每次请求都提前构造本地兜底数据的无用开销。
- CI 改为拒绝旧 UI 套件回归，并校验 WOFF2 子集、压缩展品图与现有音频组件路径；不再要求已移除的 Bootstrap/Font Awesome 依赖和 `src/pages/Audio.vue`。
- 移除约 27 MB 未被当前源码引用的历史 TTF、JPG、PNG、WebP 与旧 logo；`src/assets/` 运行时素材收缩为 WOFF2 子集与两张压缩展品图，历史来源仍可由 Git 追溯。
- 修复应用壳层全局 `position: relative` 覆盖固定定位的问题：页头、播放器、移动导航与通知层恢复 `sticky` / `fixed`；播放器成为可收起的吸底控件，浏览器冒烟增加视口内固定定位断言。
- 按历史提交 `45b1308` 的白色诗词摘录卡恢复首页余韵区：只保留一张卡片，等比沿用白色窄卡、旋转「收藏」角标、竖排诗句/作者、水墨扇舟图与悬浮高光；历史 `piaoYiSong` / `hongLei` 字体与 `fanzou.png` 经过 WOFF2 子集化和展示尺寸压缩，不重新引入旧 TTF、旧 UI 套件或三卡行。浏览器冒烟改为校验单卡竖排、图片尺寸、收藏持久化与换句交互，设计契约同步记录这一明确例外。
- 修复首页摘录卡只读固定 `demoExcerpts`、换句几乎不变且不走任何诗句源的问题：新增可配置的 `src/services/poetrySource.js`，默认请求历史同款随机古诗词接口，记录来源状态；超时、失败、空数据、重复诗句或显式 `VITE_POETRY_SOURCE=false` 时回退内置摘录并提示。摘录收藏按内容持久化，浏览器冒烟拦截诗句源并验证异步收敛、换句与来源状态；CI/构建/单测仍不依赖外部网络。
- 细化历史摘录卡视觉：保持白卡比例、单卡构图、竖排诗句与水墨扇舟图不变，为长诗句增加分级字号和字距，收敛旋转角标的裁切感、悬浮高光与整块亮红收藏态，并补上键盘焦点、低饱和朱砂收藏态和减少动效规则。
- 按截图复核继续增加历史摘录卡左右内边距：诗句右缘与扇舟图右缘都向卡内收，浏览器冒烟增加右侧留白下限断言，避免长诗句重新贴边。

### Changed — 文档、发布素材与素材证据

- README、贡献/安全政策、架构/开发/部署/FAQ/路线图/素材清单同步为当前 27 项单测、自有组件、可配置诗句源、CI Browser E2E、不可达音源状态与 v0.3.0 发布说明；不把静态部署写成已验证线上 Demo。
- `RELEASE_NOTES.md`、`ANNOUNCEMENT.md`、`SOCIAL_POSTS.md` 重写为当前设计、验证边界和后续贡献入口；`SOCIAL_POSTS.md` 仍是草稿，不自动群发，不含增长数字或付费推广。
- `.github/workflows/publish.yml` 改由 `v0.3.0` tag push 触发，Release 标题与 checkout ref 跟随真实 tag；不覆盖 `v0.2.0` 历史 Release。
- `docs/THIRD_PARTY_ASSETS.md` 补当前 WOFF2 子集、压缩展品图、摘录卡字体/图片、自制媒体、展示图与 favicon 的 SHA-256；明确哈希只是身份证据，授权仍未核验。

### Known limitations

- 当前不提供经维护者验证的线上 Demo、托管后端或账号服务；默认演示状态只保存在当前浏览器。
- CI Browser E2E 只覆盖 Chromium 关键链路；跨浏览器矩阵、视觉截图回归、真实后端契约与完整无障碍审计仍是后续事项。
- 历史字体、图片、favicon、诗词文本与首页第三方诗句源的来源/授权仍需逐项核验；MIT 不自动覆盖第三方素材。
- GitHub 展示中的失效 homepage、未启用 Pages、社交预览与在线欢迎帖正文仍需按实际写权限核对，不在仓库文档里伪造完成状态。

## [v0.2.0] — 2026-11-06

> 本版本把 2024 年代码基线升级为可本地运行、可复现构建、带演示数据与单测的开源前端，并补齐治理文档和 GitHub 展示素材。

### Added

- 重写 `README.md`：明确项目定位、本地演示、实际环境变量、项目结构、部署入口、路线图、许可证与致谢；删除失效线上演示承诺。
- 新增 MIT `LICENSE`，版权归属 `2022-2026 LanZe contributors`。
- 新增 `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、`CHANGELOG.md`。
- 新增 `docs/ARCHITECTURE.md`、`docs/DEVELOPMENT.md`、`docs/DEPLOYMENT.md`、`docs/ROADMAP.md`、`docs/FAQ.md`、`docs/PROMOTION.md` 与维护巡检记录。
- 新增 GitHub issue 模板、PR 模板、Node 20/22 CI、手动 GitHub Pages workflow 与 tag 触发的发布 workflow。
- 新增 `public/og-image.svg` 作为 README hero / GitHub 展示素材候选。
- 新增由仓库 SVG 渲染并目检过的 `public/og-image.png`（1200×630）作为社交预览图候选；记录尺寸、哈希与渲染方式，但不宣称已在 GitHub 设置中上传。
- 新增 `RELEASE_NOTES.md`、`ANNOUNCEMENT.md`、`SOCIAL_POSTS.md` 作为 v0.2.0 Release、Discussions 与社交文案素材。
- 升级 Vite 到 6.4.5 并添加 `@vitejs/plugin-vue`，改为 ESM 配置、`"type": "module"` 与相对 `base: './'`。
- 新增 `src/config/runtime.js`、`src/data/`、`src/services/`、`src/composables/`、`src/utils/`：统一公开配置、本地演示数据、浏览器存储、会话、响应归一化与查询解析。
- 新增 `npm run test`（23 个 `node --test` 单测，其中 5 项覆盖演示 API 的随机摘录、分类回退、搜索边界与作品去重）、`npm run lint`、`npm run preview`、`npm run smoke`、可选的 `npm run smoke:browser` 与 `.env.example`。
- 新增 `src/composables/useLottieSource.js` 与两份本地动画 JSON；Lottie 不再依赖历史外部 JSON 地址。

### Changed

- `.gitignore` 仅追加 `.env`、`.env.*`、`!.env.example`、测试/覆盖率产物与日志忽略项，未删除既有规则。
- 文档统一将历史 MemFire/Vercel 地址与旧 README 中的「项目展示地址」视为历史资料，不再作为可用链接展示。
- `src/apis/request.js` 改为优先请求 `VITE_API_BASE_URL`，失败或返回无效数据时自动降级到本地演示数据；`src/apis/env.js` 不再硬编码 `http://localhost:5565/`。
- 修复路由守卫、未定义 `scroll` / `next()`、Cookie 字符串/对象混用、固定假用户、`ElMessage` 未导入、脆弱的 `node_modules` 引用、详情/列表 JSON 解析与分页修改原数组。
- 清理历史硬编码 Supabase URL / anon key，改为可选的 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`，缺失时使用本地兼容适配器。
- 补充 `lang="zh-CN"`、页面描述和关键交互 `aria-label`，移除冲突 Lottie CDN 并改用本地 `@lottiefiles/lottie-player`。
- CI 统一使用 `npm ci`、`npm run build`、`npm run test --if-present`，Documentation checks 执行 `npm run lint`；不假定 CommonJS。
- Element Plus 改为按实际标签显式注册，反馈组件使用组件子路径导入；Vite 配置增加 Vue / Element / data / Lottie vendor 分包。
- 统一使用 `@lottiefiles/lottie-player` 播放本地动画 JSON，移除 `lottie-web` 与 `vue3-lottie` 两套重复运行时。
- Bootstrap 5.1.1 与 Font Awesome 5.13.0 从历史 CDN 改为精确锁定版本的本地依赖；移除未使用的 Popper/Bootstrap JS 外链，`npm run smoke` 覆盖本地图标字体并拒绝两个旧 CDN 域名。
- `src/pages/Audio.vue` 默认改用 `public/media/` 下由仓库生成的 WAV 演示音与 SVG 封面；移除 5 条硬编码第三方音乐/封面链接，自定义音源仅在 `VITE_AUDIO_SOURCE=custom` 且提供有效 `VITE_AUDIO_TRACKS` 时启用。无效 JSON、空列表等配置会回退本地演示音并显示可读提示；新增 `src/config/audio.js` 的 3 个配置单测，CI 与 lint 拒绝默认播放列表重新引入第三方媒体域。
- 新增可选的 Chrome/CDP 点击流冒烟：在独立临时 profile 中检查首页本地演示音源、文库导航、桌面/窄屏搜索、窄屏布局、演示登录滑块验证、作品发布与作品页回读，同时要求无控制台异常与失败请求；它仍是本机可选脚本，不加入 CI 矩阵，也不替代跨浏览器/真实后端 E2E。

### Known limitations

- 当前没有可验证的线上 Demo，也没有随仓库附带的完整后端；默认使用浏览器本地演示数据，配置 `VITE_API_BASE_URL` 后可连接自建 API。
- 演示账号与作品只保存在当前浏览器 `localStorage`，不提供真实密码安全或跨设备同步。
- 第三方字体、图片与诗词文本仍需持续核查来源和授权；自定义音源、第三方素材授权与 MIT 边界见 `docs/THIRD_PARTY_ASSETS.md`。
- 已完成首轮手工分包，构建不再出现单个 JS chunk 超过 500 kB 的警告；可选本机浏览器冒烟已覆盖主要演示交互，但尚未形成跨浏览器、真实后端与 CI 强制的完整 E2E。

## 历史里程碑（依据 git log）

### 2022-06：初版与基础页面

- `74b4186`（2022-06-03）初版提交；随后数日集中修复图标/搜索框布局、路由模式与静态部署白屏问题。
- `ccb3266`（2022-06-04）起陆续完善摘录展示；`60ee730`（2022-06-10）标记为 `1.0版本`。
- `f4b0cac`（2022-06-24）标记为 `1.1.0`，同期处理 HTTP/HTTPS 与跨域调试；`fd89ad1`（2022-06-30）以 `2.0.0` 为提交信息大幅补充登录、个人中心、设置与头像资源。

### 2022-07 至 2022-08：模块扩张

- `56fa107`（2022-07-06）重构茶楼/茶社命名，扩展个人中心、作品发布、登录与古诗分类页面。
- `377bf00`（2022-07-21）新增轮播图、字体、音频播放器与更多路由；`af63a10`（2022-08-04）整理组件与古诗分类资源。
- `e2c87ea`（2022-08-04）添加初版说明文档；`4d4a59c`（2022-08-13）更新样式、资源与页面结构。

### 2022-10 至 2022-11：后端形态调整

- `19d4b76`（2022-10-17）提交信息为「替换后端为无服务器函数」，相关组件与 vite 代理配置发生较大变化。
- `ac295ea`（2022-10-18）继续调整登录与音频等页面；`cf9be40`（2022-11-05）补充字体、背景图、分类内容与个人资料编辑。

### 2023：滚动与部署修正

- `547a48c`（2023-09-23）解决垂直滚动不重置问题，并更新摘录、详情与 README。
- `022def4`（2023-12-20）修复部署时图片缺失；`a20ff39`、`9c9af96` 移除介绍页与对应路由。

### 2024：请求层集中化尝试

- `b4ea7f4`（2024-08-18）新增/调整 `src/apis/` 下的 Axios 封装、登录与诗词 API 列表，更新多个页面与 `vite.config.js`；`src/apis/env.js` 将业务接口基础地址写为 `http://localhost:5565/`。
- 该提交是重写文档前的最近提交；旧 README 中的托管与展示说明自此未再更新。

### 2026-11-06：重新启动开源治理与工程现代化

- 以 `b4ea7f4` 为事实基线，升级构建工具、实现本地演示数据、补齐测试与治理文档；不把历史提交信息中的版本号当作已发布 Release。
- 详细的发布文案与 GitHub 展示清单见 `RELEASE_NOTES.md`、`ANNOUNCEMENT.md`、`SOCIAL_POSTS.md`、`docs/PROMOTION.md`。
