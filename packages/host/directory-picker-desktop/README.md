---
description: "Adaptive native-or-browse directory selection for the embedded Desktop renderer, including Linux fallback when zenity and kdialog are unavailable."
kind: "package-reference"
---

# @deepseek-ai/dsh-host-directory-picker-desktop

English | [中文](README.zh.md)

## Summary

`dsh-host-directory-picker-desktop` gives the local Desktop renderer a working directory picker without requiring a system dialog program. It uses the native picker when the host can serve one and otherwise mounts the in-app browser picker. Choose it only for an embedded renderer running on the same machine as the Host.

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

Mount this package in the Desktop composition; it has no configuration fields.

```yaml
- name: '@deepseek-ai/dsh-host-directory-picker-desktop'
```

Linux uses the native interaction only when `DISPLAY` or `WAYLAND_DISPLAY` is present and `zenity` or `kdialog` is executable on `PATH`. Otherwise it uses the in-app browser interaction. macOS and Windows use the native interaction unless the process was launched through SSH.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The plugin treats the embedded renderer as a loopback-local client and delegates host probing and dual-face Loader mounting to [`directory-picker-auto`](../directory-picker-auto/README.md). The resolved backend and matching client surface share the plugin fiber's lifetime.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Adaptive web-host picker](../directory-picker-auto/README.md) — shared probing and Loader mounting.
- [Directory-picker capability](../directory-picker/README.md) — the backend contract.
- [Browse backend](../directory-picker-browse/README.md) — fallback interaction inside the renderer.
- [Native backend](../directory-picker-native/README.md) — operating-system dialog interaction.

-----

<a id="model-experience"></a>
## Model Experience

None, as Desktop directory selection changes only the GUI interaction and registers nothing model-facing.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

These constraints follow from resolving one local interaction at process startup.

- **The client must be local** — this package assumes the renderer and Host run on the same machine; web and remote compositions use [`directory-picker-auto`](../directory-picker-auto/README.md).
- **Detection runs once** — installing or removing `zenity` or `kdialog` changes the selected Linux interaction only after Desktop restarts.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>

**Runtime invariant:** The plugin owns one boot-time pair of Loader entries; disposing its fiber removes both entries and their registered capability.
