# UOS ARM64 本地开发与 DEB 打包指南

## 摘要

本指南用于在 UOS ARM64 设备上安装开发环境、启动 DeepSeek Harness Desktop，并生成本地未签名 DEB。该流程适用于从 macOS 通过 ZIP 传入的源码目录，也适用于通过 Git 拉取的完整仓库。

xOne 插件从 Web 默认组合进入 macOS/UOS 包并在 Desktop renderer 中完成渲染的完整路径见 [xOne 插件 Web 与 Desktop 流程图](XONE_PLUGIN_WEB_DESKTOP_FLOW.md)。

## 目录

- [开发改造摘要](#开发改造摘要)
- [运行、未打包目录和 DEB 对比](#运行未打包目录和-deb-对比)
- [从 macOS 生成源码 ZIP](#从-macos-生成源码-zip)
- [在 UOS 解压源码](#在-uos-解压源码)
- [前置条件](#前置条件)
- [安装 Node.js](#1-安装-nodejs)
- [安装 pnpm](#2-安装-pnpm)
- [安装系统目录选择器](#3-可选安装系统目录选择器)
- [安装项目依赖](#4-安装项目依赖)
- [启动 ZIP 源码目录](#5-启动-zip-源码目录)
- [后续日常启动](#6-后续日常启动)
- [生成本地 DEB](#7-生成本地-deb)
- [UOS 兼容模式](#uos-兼容模式)
- [问题与处理](#问题与处理)
- [交付边界](#交付边界)

## 开发改造摘要

项目为 UOS ARM64 增加了独立的 `linux-arm64` Desktop 目标。构建路径、Electron 平台参数和架构参数都按该目标解析，打包器只接受原生 Linux ARM64 主机，并生成 DEB 而不是 AppImage。

Linux ARM64 当前只支持本地未签名产物。它使用独立的 `unsigned-artifacts` 输出目录，不生成自动更新元数据、发布完成记录或上传任务；DEB 元数据包含项目主页、作者和同步的 `desktopName`，macOS 与 Windows 的签名、公证、更新和上传目标保持原有范围。

开发启动和安装后的 Linux 应用共用一组软件渲染设置：强制 X11 与 GTK 3，禁用 GPU、GPU 合成、硬件视频编解码和 VA-API Chromium 功能，并设置 `LIBVA_DRIVER_NAME=disabled`。开发模式由 `dev:desktop:uos` 显式启用；打包应用只在 Linux 且 `app.isPackaged` 时自动启用，因此不会改变 macOS 打包应用的启动行为。

Desktop profile 使用自适应目录选择器。Linux 同时具备图形会话以及可执行的 `zenity` 或 `kdialog` 时使用系统窗口，否则自动挂载应用内目录浏览器；DEB 不把 `zenity` 或 `kdialog` 声明为强制依赖。

构建流程会在 UOS 上准备 Linux ARM64 Node.js、pnpm、dsh 运行时和原生 `system.node`。来自 macOS 的 `node_modules`、`.node` 文件和构建输出不参与 Linux 包，所有依赖必须在 UOS ARM64 上重新安装和编译。

## 运行、未打包目录和 DEB 对比

三种命令使用同一份源码，但交付目的不同。

| 方式 | ZIP 源码命令 | 输出 | 依赖源码环境 | 适用场景 |
| --- | --- | --- | --- | --- |
| 源码运行 | `DSH_CLIENT_COMMIT_HASH=0000000 pnpm run dev:desktop:uos` | 直接启动开发进程，不生成安装文件 | 是；需要 Node.js、pnpm、源码和 `node_modules` | 开发、日志排查、快速功能验证 |
| 未打包目录 | `DSH_CLIENT_COMMIT_HASH=0000000 pnpm run package:desktop:linux:arm64:dir` | electron-builder 生成的应用目录 | 生成时需要；运行目录用于安装前检查 | 验证资源、运行时和应用目录是否完整 |
| DEB | `DSH_CLIENT_COMMIT_HASH=0000000 pnpm run package:desktop:linux:arm64` | 可由 UOS 安装器或 `apt` 安装的 `.deb` | 生成时需要；安装后不依赖源码、Node.js 或 pnpm | 安装测试、设备间交付 |

三种方式都必须在 Linux ARM64 上执行。macOS 负责开发和生成源码 ZIP，但不能直接生成本项目的 Linux ARM64 DEB。

## 从 macOS 生成源码 ZIP

先在 macOS 的项目根目录检查待打包文件。`--others` 会包含未被忽略的未跟踪文件，因此它能带上尚未提交的新文件，也可能带上无关文件。

```bash
cd /Users/zhihe/deepseek-harness
git status --short
```

使用 Git 文件清单生成 ZIP，避免递归收集被忽略的 `node_modules`、构建输出和 `.git`。`zip -y` 保留仓库中的符号链接。

```bash
set -o pipefail

zip_path="../deepseek-harness-uos-$(date +%Y%m%d-%H%M%S).zip"

git -c core.quotepath=false ls-files --cached --others --exclude-standard |
  zip -q -y "$zip_path" -@

unzip -t "$zip_path"
shasum -a 256 "$zip_path"
```

ZIP 生成在项目目录的上一级，例如 `/Users/zhihe/deepseek-harness-uos-20260918-163000.zip`。`core.quotepath=false` 防止 Git 转义非 ASCII 路径，传输 ZIP 时同时保存 `shasum` 输出供 UOS 对照。

如果源码已经提交并推送到 Git 远程仓库，可以在 UOS 使用 `git clone --branch <分支> <仓库地址>`，不需要生成 ZIP，也不需要后续的占位提交哈希。

## 在 UOS 解压源码

先校验收到的文件；UOS 的 `sha256sum` 结果必须与 macOS 的 `shasum -a 256` 相同。

```bash
cd "$HOME/Desktop/electron"
sha256sum deepseek-harness-uos-*.zip

mkdir -p dhsuos91816
unzip deepseek-harness-uos-*.zip -d dhsuos91816
cd dhsuos91816

ls package.json pnpm-lock.yaml
```

该 ZIP 以项目内相对路径保存文件，不额外包含顶层目录，因此解压时需要通过 `-d` 指定新的项目目录。

## 前置条件

- 设备架构为 ARM64（`aarch64`）。
- UOS 能访问 Node.js 和 npm 软件源。
- `zenity` 或 `kdialog` 是可选依赖；缺失时应用使用内置目录浏览器。
- 项目源码中不包含从 macOS 复制的 `node_modules`。
- 以下命令从项目根目录执行；示例目录是 `$HOME/Desktop/electron/dhsuos91816`。

检查设备架构：

```bash
uname -m
```

结果应为：

```text
aarch64
```

安装 Git 与常用原生构建工具；ZIP 开发可以用提交哈希环境变量绕过 Git，但 DEB 构建仍建议保留完整工具链：

```bash
sudo apt update
sudo apt install -y git build-essential python3
```

## 1. 安装 Node.js

项目支持 Node.js `^22.19.0 || >=24.0.0`。桌面运行时固定使用 Node.js 24.17.0，因此 UOS 开发环境也使用该版本。

使用 `curl` 下载并校验官方 Linux ARM64 压缩包：

```bash
cd /tmp

curl -LO https://nodejs.org/download/release/v24.17.0/node-v24.17.0-linux-arm64.tar.gz
curl -LO https://nodejs.org/download/release/v24.17.0/SHASUMS256.txt

grep ' node-v24.17.0-linux-arm64.tar.gz$' SHASUMS256.txt | sha256sum -c -

mkdir -p "$HOME/.local/node-v24.17.0"

tar -xzf node-v24.17.0-linux-arm64.tar.gz \
  -C "$HOME/.local/node-v24.17.0" \
  --strip-components=1
```

如果系统没有 `curl`，使用 `wget` 下载这两个文件：

```bash
cd /tmp

wget https://nodejs.org/download/release/v24.17.0/node-v24.17.0-linux-arm64.tar.gz
wget https://nodejs.org/download/release/v24.17.0/SHASUMS256.txt
```

为当前终端配置 Node.js：

```bash
export PATH="$HOME/.local/node-v24.17.0/bin:$HOME/.local/bin:$PATH"

node -v
npm -v
```

`node -v` 应输出 `v24.17.0`。Node.js 官方压缩包已经包含 npm，不需要单独安装 npm。

将 PATH 永久写入 Bash 配置：

```bash
grep -qxF 'export PATH="$HOME/.local/node-v24.17.0/bin:$HOME/.local/bin:$PATH"' "$HOME/.bashrc" \
  || printf '\nexport PATH="$HOME/.local/node-v24.17.0/bin:$HOME/.local/bin:$PATH"\n' >> "$HOME/.bashrc"

source "$HOME/.bashrc"
```

## 2. 安装 pnpm

仓库固定使用 pnpm 11.7.0。将它安装到当前用户目录，不要使用 `sudo npm install --global`：

```bash
npm install --global pnpm@11.7.0 --prefix "$HOME/.local"

export PATH="$HOME/.local/bin:$PATH"

pnpm --version
```

版本输出应为：

```text
11.7.0
```

如果 `pnpm --version` 报告 `pnpm: command not found`，重新加载 Bash 配置：

```bash
source "$HOME/.bashrc"
export PATH="$HOME/.local/node-v24.17.0/bin:$HOME/.local/bin:$PATH"
```

## 3. 可选：安装系统目录选择器

Desktop 会在启动时自动选择目录交互。`PATH` 中存在 `zenity` 或 `kdialog` 时使用系统目录窗口；两者都不存在时使用应用内目录浏览器，因此不安装也能选择文件夹。

希望使用系统目录窗口时，UOS 可以安装 `zenity`：

```bash
sudo apt update
sudo apt install -y zenity

command -v zenity
zenity --version
```

如果设备使用 KDE 并且系统软件源不提供 `zenity`，可以改装 `kdialog`。安装完成后必须退出并重新启动 Desktop 进程，应用只会在启动时探查目录选择器。DEB 不会强制安装这两个可选程序。

## 4. 安装项目依赖

进入项目根目录并确认锁文件存在：

```bash
cd "$HOME/Desktop/electron/dhsuos91816"

ls package.json pnpm-lock.yaml
```

安装锁文件指定的依赖：

```bash
pnpm install --frozen-lockfile
```

安装完成后会出现类似输出：

```text
Done in 29.9s using pnpm v11.7.0
```

npm 输出新版本通知不影响项目运行，不需要为此升级 npm。

## 5. 启动 ZIP 源码目录

ZIP 通常不包含 `.git` 目录。构建脚本需要一个提交哈希，因此本地开发时为 ZIP 源码提供七位十六进制占位值：

```bash
cd "$HOME/Desktop/electron/dhsuos91816"

DSH_CLIENT_COMMIT_HASH=0000000 pnpm run dev:desktop:uos
```

该占位值只适用于本地开发，不能用于正式发布。正式产物应使用源码对应的真实 Git 提交哈希。

如果项目通过 `git clone` 获取并保留了 `.git`，直接运行：

```bash
pnpm run dev:desktop:uos
```

## 6. 后续日常启动

Node.js、pnpm 和项目依赖只需首次安装。之后打开终端并运行：

```bash
source "$HOME/.bashrc"
cd "$HOME/Desktop/electron/dhsuos91816"
DSH_CLIENT_COMMIT_HASH=0000000 pnpm run dev:desktop:uos
```

依赖或 `pnpm-lock.yaml` 发生变化后，重新执行：

```bash
pnpm install --frozen-lockfile
```

## 7. 生成本地 DEB

DEB 必须在原生 Linux ARM64 上构建，不能在 macOS 上直接生成本项目的 Linux ARM64 安装包。先确认架构和应用 ID：

```bash
uname -m
export DSH_DESKTOP_APP_ID=local.xone.desktop
```

Git checkout 直接运行：

```bash
pnpm run package:desktop:linux:arm64
```

从 macOS 传入且不带 `.git` 的 ZIP 使用本地占位提交哈希：

```bash
DSH_CLIENT_COMMIT_HASH=0000000 \
pnpm run package:desktop:linux:arm64
```

该命令会完成正式客户端构建、准备 Linux ARM64 Node.js 与 dsh 运行时，再调用 electron-builder 生成 DEB。产物目录是：

```text
apps/desktop/.desktop-build/targets/linux-arm64/unsigned-artifacts/
```

只想验证解包后的应用目录时运行：

```bash
DSH_CLIENT_COMMIT_HASH=0000000 \
pnpm run package:desktop:linux:arm64:dir
```

安装生成的 DEB 时，把路径替换为目录中的实际文件名：

```bash
sudo apt install ./apps/desktop/.desktop-build/targets/linux-arm64/unsigned-artifacts/*.deb
```

当前 Linux ARM64 目标只生成本地未签名产物，不写自动更新配置或上传完成记录，也没有 Linux 上传命令。正式发布前还需在目标 UOS 机器上完成安装、首次启动、目录选择、原生模块和卸载验证。

## UOS 兼容模式

`dev:desktop:uos` 只在 Linux 上启用以下 Electron 设置：

- 使用 X11 和 GTK3。
- 禁用 GPU 渲染与 GPU 合成。
- 禁用硬件视频编码和解码。
- 禁用 `VaapiVideoDecoder`、`VaapiVideoEncoder` 和 `UseChromeOSDirectVideoDecoder`。
- 设置 `LIBVA_DRIVER_NAME=disabled`，阻止 Electron 加载不兼容的 VA-API 驱动。

该模式绕开 UOS 设备上的旧版华为／海思 VA-API 驱动。不要手动替换系统 `libva`，因为它通常与厂商图形驱动绑定。该模式不添加 `--no-sandbox`，Electron 沙箱保持启用。

DEB 将同一组 Chromium 开关写入安装后的桌面启动项，确保 Electron 在选择 Ozone 平台前收到 `--ozone-platform=x11`。主进程负责设置 `LIBVA_DRIVER_NAME=disabled`。Linux 的可执行文件、图标和桌面条目统一使用 `deepseek-harness`；这些设置不影响 macOS 或 Windows 产物。

软件渲染会降低 WebGL、视频会议、大量 Canvas 动画和高清视频播放的性能。普通桌面界面不依赖这些功能时，可以继续使用该模式。

## 问题与处理

本节按终端现象给出当前处理方式。

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `/usr/bin/env: “node”: 没有那个文件或目录` | Node.js 已解压，但其 `bin` 不在当前 PATH | 执行 `export PATH="$HOME/.local/node-v24.17.0/bin:$HOME/.local/bin:$PATH"`，然后执行 `hash -r` |
| `pnpm: command not found` | `$HOME/.local/bin` 不在当前 PATH | 重新加载 `~/.bashrc`，或执行上述 PATH 命令 |
| 使用了 `pnpm -version` | 版本参数少了一个短横线 | 使用 `pnpm --version` |
| `Command "install--frozen-lockfile" not found` | `install` 与 `--frozen-lockfile` 之间缺少空格 | 使用 `pnpm install --frozen-lockfile`；不需要删除已经下载的依赖 |
| `spawnSync git ENOENT` | 系统没有 Git，或 ZIP 没有 `.git` 且未提供提交哈希 | 安装 Git；ZIP 本地验证同时设置 `DSH_CLIENT_COMMIT_HASH=0000000` |
| `Unsupported platform: darwin-*` 或 `linux-x64` | workspace 包含其他系统和架构的原生包 | 当前平台为 `linux-arm64` 时可忽略这些警告 |
| `Failed to create bin ... apps/cli/lib/bin.js` | 新解压源码尚未生成 `lib` | 完成安装后继续执行开发或打包命令；构建阶段会生成该文件 |
| `Please specify project homepage` | Desktop 的 `package.json` 缺少 DEB/FPM 要求的 `homepage` 元数据 | 使用包含 `homepage` 与 `author` 的当前源码重新打包；已经生成的 `linux-arm64-unpacked` 目录不等于 DEB |
| `directory picker failed` 并要求安装 `zenity` 或 `kdialog` | 运行的是未包含自适应回退的旧源码或旧安装包 | 重新构建当前源码；新版本缺少系统选择器时使用应用内目录浏览器 |
| `font-antialiasing` GTK 警告 | UOS GNOME schema 没有对应键 | 窗口能打开时可以忽略；它不是 VA-API 段错误的原因 |
| 安装后的旧 DEB 从菜单启动时出现 Wayland／海思 DRM 日志并段错误 | Ozone 在主进程 JavaScript 执行前已经选择 Wayland，运行时追加 X11 参数过晚 | 使用包含 Linux `executableArgs` 的当前源码重新构建和安装；新桌面条目会在进程启动时传入 X11 与软件渲染参数 |
| VA-API 初始化后段错误 | 实机的华为／海思 VA-API 驱动与 Electron 44 硬件视频路径不兼容 | 使用 `dev:desktop:uos`；当前 DEB 会自动启用同一组软件渲染设置，不要替换系统 `libva` |

以下警告表示 workspace 中存在其他操作系统或 CPU 架构的软件包，可以忽略：

```text
Unsupported platform: darwin-arm64
Unsupported platform: darwin-x64
Unsupported platform: linux-x64
```

以下输出表示 Linux ARM64 原生模块已经成功编译：

```text
build: built linux-arm64/bin/glibc/system.node
```

首次启动会继续执行 TypeScript 和桌面端构建，可能需要几分钟。终端没有返回命令提示符时，构建或 Electron 进程仍在运行，不要按 `Ctrl+C`。

## 交付边界

- 不要把 macOS 的 `node_modules` 传到 UOS；macOS 原生模块不能在 Linux ARM64 上运行。
- 使用本指南的 `git ls-files` 命令生成 ZIP；它排除 Git 忽略的 `node_modules`、`.desktop-build`、构建输出和 macOS 临时文件。
- UOS 每次收到新的源码和锁文件后，都应在 UOS 上运行 `pnpm install --frozen-lockfile`。
- ZIP 不包含 `.git`，所以本地运行和打包使用 `DSH_CLIENT_COMMIT_HASH=0000000`；Git checkout 使用真实提交哈希，不设置该变量。
- 当前流程可以生成本地未签名 DEB，但不构成 Linux 正式发布、签名或自动更新流程。
