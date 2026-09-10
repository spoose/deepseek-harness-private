/** Token Usage Settings plugin, browser half. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { TokenUsageSection } from './TokenUsageSection.tsx'
import type { TokenUsageSectionInjected } from './TokenUsageSection.tsx'
import { en, zh, type TokenUsageKey } from './locales.ts'
import {
  TOKEN_USAGE_SETTINGS_NAMESPACE, type TokenUsageSettings,
} from '../token-usage-settings.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Token Usage mock copy. */
    'settings.tokenUsage': TokenUsageKey
  }
}

/** Dictionary namespace owned by this plugin. */
const NS = 'settings.tokenUsage'

/** Services required by the browser registration and settings subscription. */
export const inject = ['slots', 'locale', 'settingsScope']

/**
 * Register the localized Token Usage settings section.
 * @param ctx - client Cordis context.
 */
export function apply(ctx: ClientContext): void {
  const scope = ctx.settingsScope.bind<TokenUsageSettings>({
    namespace: TOKEN_USAGE_SETTINGS_NAMESPACE,
  })
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-settings-token-usage: dictionaries')
  const t = ctx.locale.bind(NS)
  const injected = (): TokenUsageSectionInjected => ({ hooks: { settings: scope } })

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'token-usage',
    order: 30,
    label: () => t('nav'),
    locale: NS,
    inject: injected,
  }, TokenUsageSection))
}
