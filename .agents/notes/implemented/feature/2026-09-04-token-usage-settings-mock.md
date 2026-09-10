# Agent Note: Token usage settings mock

Status: implemented

English | [中文](2026-09-04-token-usage-settings-mock.zh.md)

## Problem

Settings navigation work needs a visible Token Usage page before an account-level usage service or provider API has an owned data contract. Connecting a presentation experiment to session projections or credentials would give fixed demonstration values false product meaning.

## Decision

`dsh-client-ui-settings-token-usage` contributes the `token-usage` Settings section after the existing product sections. Its Host entry registers the `ui-token-usage` namespace with a positive integer `tokenLimit` whose schema default is `100000`. The browser entry binds that namespace through `ctx.settingsScope` and injects the observable into the component. The settings provider persists user overrides.

The component renders a fixed used-token value against the resolved limit. The package defines no usage Remote method, store, or Session event, so the fixed value has no account or session meaning. The invariant companion is empty because the settings service owns namespace registration, validation, and persistence.

## Alternatives considered

**Read the session token projection.** Rejected because session usage and account quota are different facts, while the mock presents a quota-style limit.

**Add the page to `ui-settings-general`.** Rejected because a whole Settings page is a feature-owned `settings.section` contribution and can be removed by removing its plugin row.

**Keep the limit fixed in the component.** Rejected because a feature-owned settings namespace exercises the real persistence path without asserting that the mock usage came from an account provider.

## Consequences

The page exercises the real browser plugin, Settings composition, and user-settings persistence paths without creating a premature usage API. The limit can vary by user settings, while the used-token value remains non-operational and must be replaced together with the package contract when a real usage owner exists.
