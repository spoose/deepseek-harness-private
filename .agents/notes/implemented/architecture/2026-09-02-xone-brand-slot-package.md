# Agent Note: xOne brand Slot package

Status: implemented

English | [中文](2026-09-02-xone-brand-slot-package.zh.md)

## Problem

An xOne deployment needs different sidebar and blank-conversation branding from the official Web client. Editing `ui-brand-official` makes xOne behavior depend on the `official` client build profile, while editing the sidebar or conversation owners mixes deployment identity into generic UI packages. Either approach makes upstream changes overwrite local branding and obscures which composition owns the deployed identity.

## Decision

`@deepseek-ai/dsh-client-ui-brand-xone` owns the xOne browser presentation. Its client half registers the `brand.xone` typed locale dictionary, fills `sidebar.brand.mark`, `sidebar.brand.name`, `conversation.hero.brand.mark`, and `conversation.hero.brand.title` through their declarations, and registers the four occupants under one effect. Its Node half remains an inert Loader seat, and it contributes no service or configuration. The conversation package owns the title slot and retains its localized generic headline as the fallback.

The stable Web app composition continues to mount `ui-brand-official`. The xOne package also declares `dsh.bundle.patch`; when applied after `@deepseek-ai/dsh-web-app`, its patch disables the stable `ui-brand-official` row and inserts the package itself as `ui-brand-xone`. A custom `xone-web` profile stacks `dsh-base`, `dsh-web-app`, and `dsh-client-ui-brand-xone` in that order. The xOne plugin has no client build-profile gate, so local and official client builds select the same identity when that profile is used.

The Web application owns `/jushu-logo.svg` and `/bloub-nuage-attentif-bleu-anime.svg` under `apps/web/public`. The plugin references those stable root routes rather than adding an asset loader or embedding SVG source in JavaScript.

## Alternatives considered

- **Modify `ui-brand-official`** — rejected because it changes the meaning of the official package and keeps xOne behavior coupled to `DSH_CLIENT_BUILD_PROFILE=official`.
- **Put xOne copy directly in the conversation locale** — rejected because it would replace the generic fallback for every composition; the owner change is limited to declaring a title slot around the existing fallback.
- **Replace the official row inside `dsh-web-app`** — rejected because that makes every shipped `web` profile an xOne deployment and creates a recurring upstream merge conflict.
- **Add a general brand configuration service** — rejected because one deployed identity needs three fixed occupants, and no runtime switching requirement justifies a new service, schema, or state layer.
- **Bundle SVG data inside the plugin** — rejected because the current client-plugin pipeline has no general image-asset publication path, while the Web app already owns public static files.

## Consequences

- The stable Web bundle and official brand dependency remain unchanged; the xOne package's patch is the only profile-level customization.
- Slot declaration removal and plugin teardown withdraw the four occupants together, preventing a mixed brand during reload.
- Another application that mounts the package must provide both SVG routes; the plugin intentionally does not duplicate or encode those files.
- The existing hero fish animation and localized generic headline remain fallbacks when the xOne occupants are absent.
