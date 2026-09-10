---
description: "Fixed Token Usage data with a Host-persisted display limit for checking a dedicated dsh Web Settings page without a usage provider."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-settings-token-usage

English | [中文](README.zh.md)

## Summary

`dsh-client-ui-settings-token-usage` lets you inspect a fixed usage example against a Host-persisted token limit in Web Settings. Choose it when developing or reviewing the Settings navigation without a provider account or usage API. The page reads the limit but does not edit settings.

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

The Web bundle mounts the package as a browser plugin; open Settings and select **Token usage**.

### Minimal configuration

```yaml
- id: ui-settings-token-usage
  name: '@deepseek-ai/dsh-client-ui-settings-token-usage'
```

The package accepts no configuration fields.

The Host registers `ui-token-usage.tokenLimit` as a positive integer with a default of `100000`. The page reads the current resolved value and exposes no editing control.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The Host entry registers the `ui-token-usage` settings schema. The browser entry binds that namespace through `ctx.settingsScope`, injects its observable into one ordered `settings.section` entry, and registers localized dictionaries. The React component renders the persisted limit with a fixed usage value and owns no store, Remote method, or Session event.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [ui-settings](../ui-settings/README.md) — the Settings slot declarations.
- [ui-settings-general](../ui-settings-general/README.md) — the Settings shell and General section.
- [Web Client architecture](../../../docs/subsystems/web-client.md) — browser package loading and rendering.

-----

<a id="model-experience"></a>
## Model Experience

None, as the browser-only mock registers nothing model-facing.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

The page is intentionally limited to presentation and settings-transport verification.

- **Fixed usage** — the displayed usage does not represent a session, account, provider, or billing period and does not refresh.
- **Read-only limit** — the page displays the resolved `tokenLimit` but has no control for changing it.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>

**Runtime invariant:** No companion is published. The section is a presentation-only Settings page; the Host settings namespace owns the persisted display limit and the Slot registry owns entry disposal, and this package's tests assert the projection after registration, leaving no second observation to compare.
