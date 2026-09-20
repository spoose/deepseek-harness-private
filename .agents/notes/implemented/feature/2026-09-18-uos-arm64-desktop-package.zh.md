# Agent Note: 本地 UOS ARM64 Desktop 安装包

Status: implemented

[English](2026-09-18-uos-arm64-desktop-package.md) | 中文

## Problem

验收用 UOS 设备是 Linux ARM64，不能运行面向 macOS 或 x64 构建的 Desktop 产物。源码启动已经验证该宿主上的应用与原生 addon，但操作者还需要可安装的本地产物。同一设备带有旧版厂商 VA-API 栈，并且可能缺少 `zenity` 或 `kdialog`，因此从桌面菜单启动的安装包不能依赖开发 shell 参数或另行安装的对话框程序。

## Decision

Desktop 支持在 Linux ARM64 宿主上原生构建 `linux-arm64` 目标。`package:desktop:linux:arm64` 生成未签名 DEB，`package:desktop:linux:arm64:dir` 生成未打包应用。两个目标都把准备状态隔离在 `.desktop-build/targets/linux-arm64/unsigned-artifacts/` 下，禁止 electron-builder 发布，并省略发布完成记录。Linux 自动更新、签名与上传命令仍不受支持。

打包后的 Linux 桌面条目会在 Chromium 选择 Ozone 平台前，通过 Electron 命令行传入 X11、GTK 3、禁用 GPU 合成、禁用硬件视频编解码与禁用 VA-API 功能的开关。主进程还会在 ready 前禁用硬件加速并设置 `LIBVA_DRIVER_NAME=disabled`。macOS 与 Windows 安装包保留既有图形设置。[开发启动决策](../process/2026-09-18-uos-software-rendering-development-launch.zh.md)继续负责源码启动时显式选择的命令。

Desktop profile 挂载 `@deepseek-ai/dsh-host-directory-picker-desktop`。它把内嵌 renderer 视为本地客户端，并复用自适应选择器的探查和成对 Loader 条目挂载。Linux 仅在存在显示会话且 `zenity` 或 `kdialog` 可用时使用原生选择器；否则使用应用内浏览选择器。因此 DEB 不要求任一对话框程序。

## Alternatives considered

**在 macOS 上构建 Linux ARM64。** Electron 的 JavaScript 可以交叉打包，但本应用会准备并验证平台专用的 Node 运行时、原生模块与可执行辅助程序。原生 Linux ARM64 构建器使这些字节及其 libc 假设在目标平台上保持可观察。

**用 AppImage 代替 DEB。** 目标是使用 Debian 包工具的受管 UOS 安装环境。DEB 提供所需安装格式，也避免在首个目标完成验收前维护第二种 Linux 产物。

**把 zenity 声明为 DEB 必装依赖。** 这会恢复原生对话框，但会让本来可用的应用依赖某些 UOS 安装中不存在的桌面工具。既有浏览交互可在 renderer 内提供相同的目录选择能力。

**安装后继续使用开发启动器。** 桌面菜单启动不会继承 `dev:desktop:uos`，因此打包后 Electron 进程需要 VA-API 规避设置时不会得到这些参数。

## Consequences

该 DEB 适合本地 UOS 验证，但不是已签名或启用更新的 Linux 发布版。其 renderer 使用软件渲染与软件视频编解码，因此 WebGL、动画和视频负载的性能会下降。目录选择器无需额外系统包也能使用；安装 `zenity` 或 `kdialog` 后，重启应用即可恢复 Linux 原生对话框。

目标解析测试会拒绝非 ARM64 Linux 宿主和签名 Linux 调用。构建器配置测试固定 DEB 目标、未签名输出根目录、稳定的可执行文件名、桌面名称同步，以及从共享图形开关生成的启动参数。主进程测试固定同一组开关，并确认不含禁用沙箱的参数。真实 Loader 组合测试覆盖无 webserver 的 Desktop 启动，以及 Linux 选择器探查失败时的浏览回退。
