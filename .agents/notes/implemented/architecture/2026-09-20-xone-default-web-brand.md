# Agent Note: xOne as the default Web brand

Status: implemented

English | [中文](2026-09-20-xone-default-web-brand.zh.md)

## Problem

xOne is the only product identity shipped by this repository. Keeping its brand plugin as a separate Desktop profile bundle makes the Web and Desktop compositions express the same product differently. The browser profile installs that extra bundle explicitly, while a packaged Desktop must also include it as a package-set root and resolve its patch at runtime. If the package is present but its bundle root is absent from that runtime resolution, the token-usage plugin still loads from `dsh-web-app` while the xOne occupants do not.

## Decision

`@deepseek-ai/dsh-web-app` directly depends on `@deepseek-ai/dsh-client-ui-brand-xone` and mounts it as the `ui-brand-xone` browser row. This is the same composition mechanism used for `@deepseek-ai/dsh-client-ui-settings-token-usage`: the package remains an independent Cordis client plugin, while the Web bundle owns whether the product includes it.

The xOne package no longer declares `dsh.bundle.patch` or publishes `cordis.patch.yml`. Its Node half remains an inert Loader seat and its browser half continues to own the xOne locale dictionary and four brand Slot occupants described by the [xOne brand Slot package decision](2026-09-02-xone-brand-slot-package.md).

Desktop profiles contain only `dsh-base` and `dsh-web-app`. The offline package set reaches xOne through the Web bundle's production dependency closure and checks the plugin's Node and browser entry points. Web, macOS, and Linux Desktop therefore consume one default browser roster instead of repeating the brand choice in platform-specific profile layers.

The shipped `web` profile loader recognizes the exact former `dsh-base`, `dsh-web-app`, and xOne bundle tuple and replaces it with the current two-bundle template before bundle resolution. Desktop release application removes the same retired built-in xOne position before profile reconciliation and preserves any external plugin suffix. Other bundle lists and custom profile names remain user-owned.

## Alternatives considered

- **Keep xOne as a separate bundle and add the missing Desktop runtime root** — rejected because it preserves two composition paths for one product identity and lets Web and Desktop defaults drift again.
- **Inline the xOne occupants into `dsh-web-app`** — rejected because the existing plugin already owns locale registration, Slot lifecycle, and focused tests; direct composition does not require merging those implementation responsibilities.
- **Keep the official brand row and override it at runtime** — rejected because there is no second shipped product identity that needs runtime selection, and two mounted brand providers would compete for single-occupant Slots.

## Consequences

- `dsh --profile web` and every Desktop profile use xOne without an extra profile layer.
- Packaged Desktop resolution needs no standalone xOne bundle root; dependency traversal still includes and verifies the plugin tarball.
- Existing installation-owned Web and Desktop profiles migrate before they can resolve xOne as a bundle; customized bundle lists remain unchanged.
- A future second product identity requires an explicit composition decision rather than silently reusing the removed overlay mechanism.
- The Web application continues to own the two root-relative SVG routes used by the plugin.
