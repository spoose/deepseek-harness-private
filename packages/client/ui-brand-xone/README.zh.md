---
description: "dsh Web 侧栏与空白会话首屏的 xOne 浏览器品牌，包括所需静态图片路由和 Slot 组合行为。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-brand-xone

[English](README.md) | 中文

## 概述

本包为 Web 客户端应用 xOne 身份。它在侧栏显示 xOne 图标与产品名称，并在空白会话显示 Bloub 动画图像与 xOne 标题。`dsh-web-app` 默认挂载本包；本包没有配置，也没有模型可见影响。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [延伸阅读](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

`dsh-web-app` 直接依赖本包，并把它作为普通浏览器插件挂载：

```yaml
- id: ui-brand-xone
  name: '@deepseek-ai/dsh-client-ui-brand-xone'
```

本插件不接受配置。其他 Web 组合也可以直接挂载同一配置行，但其应用必须从 public 根目录提供 `/jushu-logo.svg` 与 `/bloub-nuage-attentif-bleu-anime.svg`。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现内部机制——点击展开</summary>

默认 Web bundle 以 `ui-brand-xone` 插入本包。浏览器侧注册 `brand.xone` locale 字典，等待 `sidebar.brand.mark`、`sidebar.brand.name`、`conversation.hero.brand.mark` 与 `conversation.hero.brand.title`，随后在同一个 Cordis effect 下注册四个填充项。声明移除或插件卸载会撤回整组填充项。Node 侧是无行为的 Loader 席位，图片文件保留为 Web 应用资源，而不写入 JavaScript bundle 数据。

</details>

-----

<a id="further-exploration"></a>
## 延伸阅读

- [ui-sidebar](../ui-sidebar/README.zh.md)——声明侧栏品牌 slot。
- [ui-conversation](../ui-conversation/README.zh.md)——声明空白会话首屏 slot。
- [Slot 系统标准](../../../.agents/notes/implemented/architecture/2026-07-22-slot-type-chain-implementation.zh.md)——定义声明感知的 Slot 注册。

-----

<a id="model-experience"></a>
## 模型体验

无，因为本包只贡献浏览器呈现；其中没有内容进入模型请求。

#### KV Cache 影响

无；本包既不组装也不发送提供方请求。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>

- **静态资源由应用拥有**——未从根路径提供两个 SVG 文件的组合会渲染损坏的图片。
- **浏览器标题独立控制**——`DSH_CLIENT_TITLE` 在 Slot 系统之外控制文档标题文本。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者的工作上下文——点击展开</summary>

无。

</details>

**运行时不变式：** 不发布伴生入口。品牌占位是纯呈现型 Slot 注册；条目身份与资源释放由 Slot 注册表负责，本包的装配测试在注册后断言已渲染的占位，因此没有第二个可比较的观测。
