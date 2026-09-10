---
description: "xOne browser branding for the dsh Web sidebar and blank-conversation hero, including the required static image routes and Slot composition behavior."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-brand-xone

English | [中文](README.zh.md)

## Summary

This package applies the xOne identity to the Web client. It shows the xOne logo and product name in the sidebar, the animated Bloub image, and the xOne headline in a blank conversation. Choose it for an xOne deployment instead of the official brand package; it has no configuration or model-visible effect.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Add this package after the Web bundle. The package carries both its browser plugin and the profile patch that disables the official brand row before inserting xOne.

```sh
pnpm dsh plugin --profile xone-web add ./packages/bundle/web-app ./packages/client/ui-brand-xone
pnpm dsh --profile xone-web
```

The plugin accepts no configuration. The Web application must serve `/jushu-logo.svg` and `/bloub-nuage-attentif-bleu-anime.svg` from its public root.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The profile patch disables `ui-brand-official` and inserts this package as `ui-brand-xone`. The browser half registers the `brand.xone` locale dictionary, waits for `sidebar.brand.mark`, `sidebar.brand.name`, `conversation.hero.brand.mark`, and `conversation.hero.brand.title`, then registers all four occupants under one Cordis effect. Declaration removal or plugin teardown withdraws the complete set. The Node half is an inert Loader seat, and the image files remain Web application assets rather than JavaScript bundle data.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [ui-sidebar](../ui-sidebar/README.md) — declares the sidebar brand slots.
- [ui-conversation](../ui-conversation/README.md) — declares the blank-conversation hero slot.
- [Slot system standard](../../../.agents/notes/implemented/architecture/2026-07-22-slot-type-chain-implementation.md) — defines declaration-aware Slot registration.

-----

<a id="model-experience"></a>
## Model Experience

None, as this package contributes browser presentation only; nothing here reaches a model request.

#### KV Cache effect

None; the package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **Static assets are application-owned** — a composition that does not serve both root-relative SVG files renders broken images.
- **Layer order matters** — `dsh-web-app` must precede this package so the official row exists before the patch disables it.
- **The browser title is independent** — `DSH_CLIENT_TITLE` controls document title text outside the Slot system.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>

**Runtime invariant:** No companion is published. The brand occupants are presentation-only Slot registrations; the Slot registry owns entry identity and disposal, and this package's assembly tests assert the rendered occupants after registration, leaving no second observation to compare.
