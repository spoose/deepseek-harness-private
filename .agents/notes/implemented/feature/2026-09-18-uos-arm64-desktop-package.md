# Agent Note: Local UOS ARM64 Desktop package

Status: implemented

English | [中文](2026-09-18-uos-arm64-desktop-package.zh.md)

## Problem

The qualified UOS device is Linux ARM64 and cannot run Desktop artifacts built for macOS or x64. A source launch proves the application and native addon on that host, but operators also need an installable local artifact. The same device has an old vendor VA-API stack and may lack `zenity` or `kdialog`, so a package launched from the desktop menu cannot depend on development-shell flags or a separately installed dialog program.

## Decision

Desktop supports `linux-arm64` as a native-build target on a Linux ARM64 host. `package:desktop:linux:arm64` creates an unsigned DEB and `package:desktop:linux:arm64:dir` creates an unpacked application. Both targets isolate their preparation state under `.desktop-build/targets/linux-arm64/unsigned-artifacts/`, disable electron-builder publishing, and omit the release completion record. Linux automatic updates, signing, and upload commands remain unsupported.

Packaged Linux desktop entries pass X11, GTK 3, disabled GPU composition, disabled accelerated video codecs, and disabled VA-API feature switches on the Electron command line, before Chromium selects its Ozone platform. The main process also disables hardware acceleration and sets `LIBVA_DRIVER_NAME=disabled` before readiness. macOS and Windows packages retain their existing graphics settings. The [development launch decision](../process/2026-09-18-uos-software-rendering-development-launch.md) continues to own the opt-in source-launch command.

The Desktop profile mounts `@deepseek-ai/dsh-host-directory-picker-desktop`. It treats the embedded renderer as local and reuses the adaptive picker probe and paired Loader-entry mount. Linux uses the native picker only when a display and `zenity` or `kdialog` are available; otherwise it uses the in-app browse picker. The DEB therefore does not require either dialog program.

## Alternatives considered

**Build Linux ARM64 on macOS.** Electron's JavaScript can be cross-packaged, but this application prepares and validates a platform-specific Node runtime, native modules, and executable helpers. A native Linux ARM64 builder keeps those bytes and their libc assumptions observable on the target platform.

**Ship AppImage instead of DEB.** The target is a managed UOS installation with Debian package tooling. DEB provides the requested installation format and avoids maintaining a second Linux artifact before the first target is qualified.

**Require zenity as a DEB dependency.** This would restore the native dialog but make an otherwise functional application depend on a desktop utility that is absent on some UOS installations. The existing browse interaction provides the same directory-selection capability inside the renderer.

**Reuse the development launcher after installation.** A desktop-menu launch does not inherit `dev:desktop:uos`, so the VA-API workaround would be absent at the point where the packaged Electron process needs it.

## Consequences

The DEB is suitable for local UOS validation but is not a signed or update-enabled Linux release. Its renderer uses software rendering and software video codecs, which reduces performance for WebGL, animation, and video workloads. The directory picker remains usable without extra system packages, while installing `zenity` or `kdialog` restores the native Linux dialog after an application restart.

Target-resolution tests reject non-ARM64 Linux hosts and signed Linux invocations. Builder-config tests pin the DEB target, unsigned output root, stable executable name, desktop-name synchronization, and the startup arguments derived from the shared graphics switches. Main-process tests pin the same switches without sandbox-disabling flags. Real Loader composition tests cover Desktop startup without a webserver and the browse fallback when the Linux chooser probe fails.
