---
description: "无需配置用量提供方，即可在独立 dsh Web 设置页中检查固定 Token 用量数据与 Host 持久化显示限额。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-settings-token-usage

[English](README.md) | 中文

## 概述

`dsh-client-ui-settings-token-usage` 让你在 Web 设置中对照 Host 持久化 Token 限额查看固定用量示例。开发或评审设置导航、且没有提供方账户或用量 API 时可选择本包。该页面读取限额，但不编辑设置。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

Web bundle 将本包挂载为浏览器插件；打开设置并选择 **Token 用量**。

### 最小配置

```yaml
- id: ui-settings-token-usage
  name: '@deepseek-ai/dsh-client-ui-settings-token-usage'
```

本包不接受配置字段。

Host 将 `ui-token-usage.tokenLimit` 注册为正整数，默认值为 `100000`。页面读取当前解析值，但不提供编辑控件。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

Host 入口注册 `ui-token-usage` 设置 schema。浏览器入口通过 `ctx.settingsScope` 绑定该命名空间，把它的 observable 注入一个有序的 `settings.section` 条目，并注册本地化字典。React 组件用固定用量值与持久化限额进行呈现，不拥有 store、Remote 方法或 Session 事件。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

- [ui-settings](../ui-settings/README.zh.md)——设置 slot 声明。
- [ui-settings-general](../ui-settings-general/README.zh.md)——设置 shell 与常规设置分区。
- [Web 客户端架构](../../../docs/subsystems/web-client.zh.md)——浏览器包加载与渲染。

-----

<a id="model-experience"></a>
## 模型体验

无。这个仅在浏览器运行的 mock 不注册任何面向模型的内容。

#### KV Cache 影响

无。本包既不组装也不发送提供方请求。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>

该页面有意仅用于呈现和设置传输验证。

- **固定用量**——显示的用量不代表任何会话、账户、提供方或计费周期，且不会刷新。
- **只读限额**——页面显示解析后的 `tokenLimit`，但不提供修改控件。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文——点击展开</summary>

无。

</details>

**运行时不变式：** 不发布伴生入口。该分区只是呈现型设置页；持久化显示限额由 Host 设置命名空间负责，条目释放由 Slot 注册表负责，本包的测试在注册后断言该投影，因此没有第二个可比较的观测。
