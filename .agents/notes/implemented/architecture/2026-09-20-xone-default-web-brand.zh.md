# Agent Note: xOne 作为默认 Web 品牌

Status: implemented

[English](2026-09-20-xone-default-web-brand.md) | 中文

## 问题

xOne 是本仓库交付的唯一产品身份。继续把其品牌插件作为独立 Desktop profile bundle，会让 Web 与 Desktop 组合以不同方式表达同一产品：浏览器 profile 显式安装这个额外 bundle，而打包后的 Desktop 还必须把它列为 package-set 根并在运行时解析其 patch。如果包已存在但该 bundle 根未进入运行时解析，token usage 插件仍能从 `dsh-web-app` 加载，而 xOne 占位不会生效。

## 决策

`@deepseek-ai/dsh-web-app` 直接依赖 `@deepseek-ai/dsh-client-ui-brand-xone`，并把它挂载为 `ui-brand-xone` 浏览器配置行。这与 `@deepseek-ai/dsh-client-ui-settings-token-usage` 使用相同的组合机制：该包仍是独立的 Cordis 客户端插件，Web bundle 则拥有产品是否包含它的决定。

xOne 包不再声明 `dsh.bundle.patch`，也不再发布 `cordis.patch.yml`。其 Node 侧仍是无行为的 Loader 席位，浏览器侧继续拥有 [xOne 品牌 Slot 包决策](2026-09-02-xone-brand-slot-package.zh.md)所述的 xOne locale 字典与四个品牌 Slot 占位。

Desktop profile 只包含 `dsh-base` 与 `dsh-web-app`。离线 package set 通过 Web bundle 的生产依赖闭包获得 xOne，并检查插件的 Node 与浏览器入口。Web、macOS 与 Linux Desktop 因而使用同一份默认浏览器名录，不再于各平台 profile 层重复选择品牌。

随附 `web` profile 的加载器会识别原来的 `dsh-base`、`dsh-web-app` 与 xOne 精确 bundle 元组，并在解析 bundle 前将其替换为当前的双 bundle 模板。Desktop 应用发布版本时，会在协调 profile 前移除同一处已废弃的内置 xOne 位置，并保留其后的所有外部插件。其他 bundle 列表与自定义 profile 名称仍由用户拥有。

## 考虑过的替代方案

- **保留 xOne 独立 bundle，并补上缺失的 Desktop 运行时根**——拒绝，因为这会为唯一产品身份保留两条组合路径，也会让 Web 与 Desktop 默认值再次产生漂移。
- **把 xOne 占位内联到 `dsh-web-app`**——拒绝，因为现有插件已经拥有 locale 注册、Slot 生命周期与聚焦测试；直接组合无需合并这些实现职责。
- **保留官方品牌配置行并在运行时覆盖**——拒绝，因为没有第二个需要运行时选择的交付产品身份，而且同时挂载两个品牌提供方会争用单占位 Slot。

## 后果

- `dsh --profile web` 与所有 Desktop profile 无需额外 profile 层即可使用 xOne。
- Desktop 打包解析不再需要独立 xOne bundle 根；依赖遍历仍会纳入并验证插件 tarball。
- 现有安装自有 Web 与 Desktop profile 会在把 xOne 解析为 bundle 前完成迁移；自定义 bundle 列表保持不变。
- 未来如增加第二个产品身份，需要显式作出组合决策，而不是隐式恢复已移除的 overlay 机制。
- Web 应用继续拥有插件使用的两个根相对 SVG 路由。
