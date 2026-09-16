# Agent Note: Desktop application icon

Status: implemented

English | [中文](2026-09-16-desktop-application-icon.zh.md)

## Problem

The electron-builder configuration named no icon, so every Desktop target shipped Electron's default application icon while the running application already rendered the xOne hero mark ([xOne brand Slot package](2026-09-02-xone-brand-slot-package.md)). The OS-level icon was the only unbranded Desktop surface, and the Web application's animated SVG mark cannot be used as an icon source as it stands.

## Decision

`apps/desktop/build/icon.png` is the application icon for every target. `createElectronBuilderConfig` names it through `mac.icon`, `win.icon`, and `linux.icon`, and electron-builder converts that single 1024×1024 PNG into the macOS `.icns` and Windows `.ico` forms. The NSIS installer reuses it because an unset `nsis.installerIcon` falls back to the application icon.

The PNG is a frozen frame of the Web application's xOne hero mark, which `apps/web/public/bloub-nuage-attentif-bleu-anime.svg` owns. `apps/desktop/src/main.ts` resolves the same file for an unpackaged launch and applies it to the macOS Dock and to every window it constructs, because electron-builder embeds the icon only into a packaged bundle and a local package build requires release signing and notarization credentials. That development path reads the file from the application directory and returns before the read while `app.isPackaged` is true, so the packaged asar carries no copy and Windows and macOS read the icon from the executable and bundle instead.

## Regenerating the icon

The source SVG positions both eyes only through `@keyframes oeil0` and `@keyframes oeil1` `transform: matrix(…)` declarations under `transform-box: view-box`. A rasterizer that does not run CSS animation renders both eye paths at their untransformed coordinates, where they overlap into one eye, so the committed image is not a plain conversion of the source.

Regenerating reads the `0%` matrix of each keyframe, writes it as the matching eye path's `transform` attribute, deletes the `<style>` element, and rasterizes the result to the 1024×1024 transparent PNG. The committed frame uses `matrix(0.98,-0.1,0.08,0.99,-12.57,-7.95)` for `oeil0` and `matrix(0.92,-0.03,0.08,0.99,30.73,-10.49)` for `oeil1`.

## Alternatives considered

- **Point electron-builder at the animated SVG** — rejected because electron-builder accepts `.svg` sources and rasterizes them without running CSS animation, which produced a one-eyed mark, and because the icon would then change with every edit to the animation.
- **Rasterize the bundled Web asset during packaging** — rejected because it removes the duplicated raster at the cost of a rasterizer dependency and a frame-freezing step inside every packaging target, while the packaging path otherwise consumes released inputs.
- **Author a separate square icon for macOS** — rejected because it would place a second brand mark beside the hero mark the application already renders, and the mark's own transparent margin already fits the platform safe area.

## Consequences

- The packaged application, its installers, and a development Dock carry one icon that matches the in-application brand.
- The mark now has a second home as a raster. An edit to the Web SVG leaves `build/icon.png` stale, so a brand change must regenerate the PNG with the recipe above.
