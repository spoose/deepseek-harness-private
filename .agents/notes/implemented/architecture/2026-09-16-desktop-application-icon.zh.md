# Agent Note: Desktop application icon

Status: implemented

[English](2026-09-16-desktop-application-icon.md) | 中文

## Problem

electron-builder 配置没有指定任何图标，因此每个 Desktop 目标都发布 Electron 的默认应用图标，而运行中的应用已经渲染 xOne 主视觉标识（[xOne 品牌 Slot 包](2026-09-02-xone-brand-slot-package.zh.md)）。操作系统层面的图标是 Desktop 唯一没有品牌的界面，而 Web 应用那份动画 SVG 标识按现状不能直接用作图标源。

## Decision

`apps/desktop/build/icon.png` 是所有目标的应用图标。`createElectronBuilderConfig` 通过 `mac.icon`、`win.icon` 与 `linux.icon` 指定它，electron-builder 则把这一张 1024×1024 PNG 转换成 macOS 的 `.icns` 与 Windows 的 `.ico` 形式。NSIS 安装器复用同一图标，因为未设置的 `nsis.installerIcon` 会回退到应用图标。

该 PNG 是 Web 应用 xOne 主视觉标识的一帧冻结结果，而这份标识由 `apps/web/public/bloub-nuage-attentif-bleu-anime.svg` 持有。`apps/desktop/src/main.ts` 为未打包的启动解析同一个文件，并把它应用到 macOS Dock 以及它构建的每个窗口，因为 electron-builder 只把图标嵌入已打包的 bundle，而本地打包构建需要发布签名与公证凭据。该开发路径从应用目录读取该文件，并在 `app.isPackaged` 为真时于读取前返回，因此已打包的 asar 不携带副本，Windows 与 macOS 转而从可执行文件和 bundle 读取图标。

## Regenerating the icon

源 SVG 仅通过 `transform-box: view-box` 下 `@keyframes oeil0` 与 `@keyframes oeil1` 的 `transform: matrix(…)` 声明来定位两只眼睛。不运行 CSS 动画的栅格化器会把两条眼睛路径渲染在未变换的坐标上，二者在那里重叠成一只眼睛，因此已提交的图像并不是源文件的普通转换结果。

重新生成需要读取每个关键帧的 `0%` 矩阵，把它写成对应眼睛路径的 `transform` 属性，删除 `<style>` 元素，再把结果栅格化为 1024×1024 的透明 PNG。已提交的这一帧对 `oeil0` 使用 `matrix(0.98,-0.1,0.08,0.99,-12.57,-7.95)`，对 `oeil1` 使用 `matrix(0.92,-0.03,0.08,0.99,30.73,-10.49)`。

## Alternatives considered

- **让 electron-builder 直接使用动画 SVG** — 否决，因为 electron-builder 接受 `.svg` 源并在不运行 CSS 动画的情况下栅格化它，结果是一只眼的标识；而且图标会随动画的每次修改而变化。
- **在打包期间栅格化随包分发的 Web 资源** — 否决，因为它消除了重复的栅格图，代价却是把栅格化器依赖和冻结帧步骤放进每个打包目标，而打包路径除此之外只消费已发布的输入。
- **为 macOS 单独设计一个方形图标** — 否决，因为它会在应用已经渲染的主视觉标识之外再放一个品牌标识，而该标识自身的透明边距已经符合平台安全区。

## Consequences

- 已打包的应用、其安装器以及开发期 Dock 都携带同一个与应用内品牌一致的图标。
- 该标识现在多了一个栅格形式的归属地。修改 Web SVG 会让 `build/icon.png` 过期，因此品牌变更必须按上面的方法重新生成 PNG。
