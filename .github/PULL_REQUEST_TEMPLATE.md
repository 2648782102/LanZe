## 这次改了什么

<!-- 一两句话说明目标；若只是文档/CI，也请写清受影响文件。 -->

关联 issue / Discussion：<!-- 例如 Closes #12；无则写「无」 -->

## 改动类型

- [ ] 文档 / 展示 / 宣发草稿
- [ ] CI / workflow / issue 模板
- [ ] 前端代码（页面、组件、样式）
- [ ] 构建配置 / 依赖 / 锁文件
- [ ] mock / API 适配
- [ ] 测试 / 可访问性
- [ ] 素材 / 内容 / 授权
- [ ] 其他：

## 事实核对

- [ ] 没有新增线上 Demo、托管后端、用户数或 star 数的虚假承诺。
- [ ] 没有提交密钥、Cookie、真实用户数据、`.env` 或 `dist/`。
- [ ] 历史 MemFire / Vercel 地址仅作为迁移背景，未写成可用服务。
- [ ] 如改动环境变量，README、`docs/DEVELOPMENT.md`、`docs/DEPLOYMENT.md` 与示例配置已同步。
- [ ] 如改动页面/路由/依赖，`README.md`、`docs/ARCHITECTURE.md`、`CHANGELOG.md` 已同步。
- [ ] 新增第三方素材已说明来源、授权与体积影响。

## 验证

```text
Node / npm 版本：
commit SHA：
mock / API 配置：

npm ci                    -> 通过 / 跳过 / 失败（说明）
npm run dev               -> 通过 / 跳过 / 失败（说明）
npm run build             -> 通过 / 跳过 / 失败（说明）
npm run test --if-present -> 通过 / 跳过 / 失败（说明）
npm run lint --if-present -> 通过 / 跳过 / 失败（说明）
```

手动检查的页面/宽度：<!-- 例如 /#/home、/#/wenku；375px、1440px -->

日志、截图或录屏（脱敏后）：<!-- 可拖入图片；不要粘贴私密信息 -->

## 破坏性变更与回滚

<!-- 是否改变命令、变量、路由、构建产物或部署方式？如何回滚？无则写「无」。 -->

## 给审阅者

<!-- 需要重点看的文件、尚未解决的问题、希望讨论的取舍。社区维护不承诺固定响应时间。 -->
