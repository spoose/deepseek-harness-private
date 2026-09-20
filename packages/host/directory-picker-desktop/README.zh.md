---
description: "为内嵌 Desktop renderer 自适应选择原生或应用内目录交互，包括 Linux 缺少 zenity 与 kdialog 时的自动回退。"
kind: "package-reference"
---

# @deepseek-ai/dsh-host-directory-picker-desktop

[English](README.md) | 中文

## 概述

`dsh-host-directory-picker-desktop` 为本地 Desktop renderer 提供无需强制安装系统对话框程序的目录选择功能。宿主能够提供原生选择器时，它使用原生交互；否则挂载应用内浏览选择器。仅当内嵌 renderer 与 Host 运行在同一台机器上时选择本包。

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

在 Desktop 组合中挂载本包；它没有配置字段。

```yaml
- name: '@deepseek-ai/dsh-host-directory-picker-desktop'
```

Linux 仅在存在 `DISPLAY` 或 `WAYLAND_DISPLAY`，且 `PATH` 上的 `zenity` 或 `kdialog` 可执行时使用原生交互；否则使用应用内浏览交互。除非进程通过 SSH 启动，macOS 与 Windows 使用原生交互。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

本插件把内嵌 renderer 视为仅回环访问的本地客户端，并把宿主探查与双侧 Loader 挂载委托给 [`directory-picker-auto`](../directory-picker-auto/README.zh.md)。判定出的后端与匹配的 client 界面共用本插件 fiber 的生命周期。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

- [自适应 Web 宿主选择器](../directory-picker-auto/README.zh.md)——共用的探查与 Loader 挂载。
- [目录选择能力](../directory-picker/README.zh.md)——后端约定。
- [浏览后端](../directory-picker-browse/README.zh.md)——renderer 内的回退交互。
- [原生后端](../directory-picker-native/README.zh.md)——操作系统对话框交互。

-----

<a id="model-experience"></a>
## 模型体验

无。Desktop 目录选择只改变 GUI 交互，不注册任何面向模型的内容。

#### KV Cache 影响

无；本包既不组装也不发送提供方请求。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>

这些约束来自进程启动时只判定一次本地交互。

- **客户端必须位于本机**——本包假定 renderer 与 Host 运行在同一台机器上；Web 与远程组合使用 [`directory-picker-auto`](../directory-picker-auto/README.zh.md)。
- **探测只运行一次**——安装或移除 `zenity` 或 `kdialog` 后，只有重启 Desktop 才会改变 Linux 上选定的交互。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者的工作上下文——点击展开</summary>

无。

</details>

**运行时不变式：** 本插件持有启动时的一对 Loader 条目；处置其 fiber 会移除两个条目及其注册的能力。
