# Agent Note: xOne 品牌 Slot 包

Status: implemented

[English](2026-09-02-xone-brand-slot-package.md) | 中文

本文记录的独立 profile bundle 组合方式已由 [xOne 默认 Web 品牌决策](2026-09-20-xone-default-web-brand.zh.md)取代。包的 Slot 与资源所有权仍然有效。

## 问题

xOne 部署需要与官方 Web 客户端不同的侧栏和空白会话品牌。修改 `ui-brand-official` 会使 xOne 行为依赖 `official` 客户端构建 profile，而修改侧栏或会话所有者则会把部署身份混入通用 UI 包。两种做法都会让上游改动覆盖本地品牌，并模糊部署身份的组合所有者。

## 决策

`@deepseek-ai/dsh-client-ui-brand-xone` 拥有 xOne 浏览器呈现。其客户端侧注册 `brand.xone` typed locale 字典，通过声明填充 `sidebar.brand.mark`、`sidebar.brand.name`、`conversation.hero.brand.mark` 与 `conversation.hero.brand.title`，并在同一个 effect 下注册四个填充项。其 Node 侧保留为无行为的 Loader 席位，不贡献服务或配置。会话包拥有标题 slot，并保留其本地化通用标题作为回退。

稳定 Web 应用组合继续挂载 `ui-brand-official`。xOne 包还声明 `dsh.bundle.patch`；应用在 `@deepseek-ai/dsh-web-app` 之后时，其 patch 禁用稳定的 `ui-brand-official` 配置行，并把本包自身作为 `ui-brand-xone` 插入。自定义 `xone-web` profile 按顺序叠放 `dsh-base`、`dsh-web-app` 与 `dsh-client-ui-brand-xone`。xOne 插件没有客户端构建 profile 条件，因此使用该 profile 时，本地和 official 客户端构建会选择同一个身份。

Web 应用在 `apps/web/public` 下拥有 `/jushu-logo.svg` 与 `/bloub-nuage-attentif-bleu-anime.svg`。插件引用这些稳定根路径，不新增资源加载器，也不把 SVG 源码嵌入 JavaScript。

## 考虑过的替代方案

- **修改 `ui-brand-official`**——拒绝，因为这会改变官方包的含义，并使 xOne 行为继续耦合到 `DSH_CLIENT_BUILD_PROFILE=official`。
- **把 xOne 文案直接写入会话 locale**——拒绝，因为这会替换每个组合的通用回退；所有者改动仅限于在现有回退外声明标题 slot。
- **在 `dsh-web-app` 内替换官方配置行**——拒绝，因为这会让每个随附的 `web` profile 都变成 xOne 部署，并产生持续的上游合并冲突。
- **新增通用品牌配置服务**——拒绝，因为一个部署身份只需要三个固定填充项，没有运行时切换需求来证明新增服务、schema 或状态层的必要性。
- **在插件中捆绑 SVG 数据**——拒绝，因为当前客户端插件流水线没有通用图片资源发布路径，而 Web 应用已经拥有 public 静态文件。

## 后果

- 稳定 Web bundle 和官方品牌依赖保持不变；xOne 包的 patch 是唯一的 profile 级定制。
- Slot 声明移除和插件卸载会一并撤回四个填充项，防止重载期间出现混合品牌。
- 挂载本包的其他应用必须提供两个 SVG 路由；插件有意不复制或编码这些文件。
- xOne 填充项缺席时，现有首屏鱼动画和本地化通用标题仍作为回退可用。
