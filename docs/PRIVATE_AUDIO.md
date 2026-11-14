# 本机私有音轨（不随仓库分发）

本目录说明只面向**本机开发 / 本地试听**。默认曲库和线上 Pages 使用 `public/media/` 下已署名的 CC BY 3.0 古筝节选，不依赖本文件。

早期版本播放器曾通过 `music.163.com` / `music.126.net` 外链播放以下曲目；这些是商业平台录音，本项目没有其复制或公开分发授权，因此**不要**把音频文件提交进 Git、打进生产构建或上传到公开站点。若你在本机合法持有对应音频，可用 `npm run audio:private` 仅在本机播放。

## 使用步骤

1. 创建 `public/media/private/`（已被 `.gitignore` 忽略）。
2. 把你自己持有的音频文件放进去，例如 `01.mp3` … `05.mp3`；封面图片可选。
3. 在同目录创建 `tracks.json`，按想要的顺序与曲名映射：

```json
[
  { "file": "01.mp3", "name": "少年不凡", "artist": "刘美麟", "mood": "旧版曲目 · 仅本机" },
  { "file": "02.mp3", "name": "浣纱歌 (伴奏)", "artist": "许多葵 / KasaYAYA / 齐栾 / 逆水寒", "mood": "旧版曲目 · 仅本机" },
  { "file": "03.mp3", "name": "卡农", "artist": "dylanf", "mood": "旧版曲目 · 仅本机" },
  { "file": "04.mp3", "name": "River Flows in You（你的心河）", "artist": "Yiruma", "mood": "旧版曲目 · 仅本机" },
  { "file": "05.mp3", "name": "Leaves in the Wind", "artist": "Isaac Shepard", "mood": "旧版曲目 · 仅本机" }
]
```

4. 运行：

```bash
npm run audio:private
```

脚本会生成被忽略的 `.env.local.audio`，以 `vite --mode local.audio` 启动开发服务器；播放器会按 `tracks.json` 显示曲目、切轨、进度和播放列表。

## 边界

- 不下载、不缓存、不提交任何第三方音频；脚本只读取本机目录。
- 不修改 `npm run dev` / `npm run build` / CI / Pages 的默认行为。
- `.gitignore` 忽略 `public/media/private/` 与 `.env.local.audio`。
- 公开部署或提交到仓库的音轨，必须换成授权清晰的素材并更新 `docs/THIRD_PARTY_ASSETS.md` 与 `public/media/AUDIO_CREDITS.md`。
