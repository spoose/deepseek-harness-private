# Agent Note: Token 用量设置 mock

Status: implemented

[English](2026-09-04-token-usage-settings-mock.md) | 中文

## Problem

在账户级用量服务或提供方 API 拥有明确的数据契约之前，设置导航开发需要一个可见的 Token 用量页面。若把呈现实验连接到会话投影或凭据，固定演示值就会获得虚假的产品含义。

## Decision

`dsh-client-ui-settings-token-usage` 在现有产品分区之后贡献 `token-usage` 设置分区。它的 Host 入口注册 `ui-token-usage` 命名空间，其中正整数 `tokenLimit` 的 schema 默认值为 `100000`。浏览器入口通过 `ctx.settingsScope` 绑定该命名空间，并把 observable 注入组件。设置提供方持久化用户覆盖值。

组件使用解析后的限额呈现固定的已用 Token 值。本包不定义用量 Remote 方法、store 或 Session 事件，因此固定值不具有账户或会话含义。invariant companion 为空，因为设置服务拥有命名空间注册、验证和持久化。

## Alternatives considered

**读取会话 Token 投影。** 否决，因为会话用量与账户配额是不同事实，而这个 mock 呈现的是配额式上限。

**把页面加入 `ui-settings-general`。** 否决，因为完整的设置页应由功能自己的 `settings.section` 贡献，并且删除其插件条目即可移除。

**把限额固定在组件内。** 否决，因为功能自己的设置命名空间可以覆盖真实持久化路径，同时不声称 mock 用量来自账户提供方。

## Consequences

该页面在不提前创建用量 API 的情况下覆盖真实的浏览器插件、设置组合与用户设置持久化路径。限额可随用户设置变化，而已用 Token 值仍不是运行数据；真正的用量拥有方出现时，必须连同本包契约一起替换它。
