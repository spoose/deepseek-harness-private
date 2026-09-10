/** Token Usage settings page with a durable display limit and fixed usage example. */

import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {
  InjectFace, PropsLocale, PropsRuntime,
} from '@deepseek-ai/dsh-client-ui-slots'
import {
  DEFAULT_TOKEN_LIMIT, type TokenUsageSettings,
} from '../token-usage-settings.ts'

/** Registration-side dependencies of {@link TokenUsageSection}. */
export interface TokenUsageSectionInjected {
  hooks: {
    /** Host-backed settings snapshot for the Token Usage namespace. */
    settings: SettingsScope<TokenUsageSettings>
  }
}

/** Props supplied by the Settings slot renderer. */
export type TokenUsageSectionProps =
  PropsRuntime<'settings.section'>
  & PropsLocale<'settings.tokenUsage'>
  & InjectFace<TokenUsageSectionInjected>

const USED_TOKENS = 68_420

/**
 * Render fixed usage against the current durable token limit.
 * @param props - settings owner props, settings hook, and localized copy.
 * @returns the Token Usage section tree.
 */
export function TokenUsageSection({ t, useSettings }: TokenUsageSectionProps) {
  const tokenLimit = useSettings(snapshot => snapshot.value?.tokenLimit ?? DEFAULT_TOKEN_LIMIT)
  const percent = Math.round((USED_TOKENS / tokenLimit) * 100)

  return (
    <section aria-labelledby="token-usage-title">
      <h2 id="token-usage-title">{t('title')}</h2>
      <p>{t('description')}</p>

      <dl>
        <div>
          <dt>{t('used')}</dt>
          <dd>{USED_TOKENS.toLocaleString()}</dd>
        </div>
        <div>
          <dt>{t('limit')}</dt>
          <dd>{tokenLimit.toLocaleString()}</dd>
        </div>
      </dl>

      <progress
        aria-label={t('progress')}
        value={USED_TOKENS}
        max={tokenLimit}
      />

      <p>{percent}%</p>
    </section>
  )
}
