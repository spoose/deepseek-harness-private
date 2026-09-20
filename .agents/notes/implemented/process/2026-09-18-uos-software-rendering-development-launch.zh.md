# Agent Note: 显式选择的 UOS 软件渲染开发启动

Status: implemented

[English](2026-09-18-uos-software-rendering-development-launch.md) | 中文

## 问题

在一台经过验收的 UOS ARM64 主机上，Electron 44 会在厂商 VA-API 视频驱动初始化后崩溃。该主机提供 VA-API 1.14，而这一代 Electron 要求更新的 API。替换发行版的 `libva` 可能破坏厂商图形栈，把规避方式应用于所有 Linux 开发者则会让兼容主机无故失去硬件加速。

## 决策

Desktop 开发提供 `dev:desktop:uos` 与 `start:desktop:uos` 两条显式选择的 Linux 专用启动命令。它们为开发进程树设置 `LIBVA_DRIVER_NAME=disabled`，为 Electron 选择 X11 和 GTK 3，禁用 GPU 合成与硬件视频编解码，并禁用相关 VA-API Chromium 功能。普通开发命令保留 Electron 默认设置。

兼容模式既不修改 Chromium 沙箱参数，也不修改 dsh 命令沙箱。它只影响开发启动；Linux 打包与发布支持不属于本决策范围。

## 考虑过的替代方案

**让所有 Linux 启动都使用软件渲染。** 兼容的 Linux 主机会无故失去 GPU 和视频加速，特定主机的驱动缺陷也会变成产品默认行为。

**替换或升级 UOS `libva`。** 发行版将该库与厂商驱动栈绑定。替换它可能使本应用之外的桌面环境不稳定。

**禁用 Chromium 沙箱。** 崩溃发生在图形驱动初始化期间，经过验证的图形参数可以避开它。削弱进程隔离不能解决原因。

**降级 Electron。** 旧版 Electron 可以避开较新的 VA-API 要求，但也会放弃当前运行时和安全更新。进程内局部规避方式保留仓库选择的 Electron 代际。

## 影响

UOS 命令使用软件渲染和软件视频编解码，因此 WebGL、动画与视频工作负载可能变慢。即使其他 Linux 会话支持更新的路径，该模式也固定使用 X11 和 GTK 3。开发者必须显式选择；启动器会在非 Linux 主机上拒绝该模式。

单元测试固定全部注入参数、进程局部 VA-API 环境字段、默认命令不变性、Linux 主机要求，以及不存在沙箱禁用参数。在受影响的 UOS ARM64 主机上进行的验收负责验证安装厂商驱动时窗口可以启动。
