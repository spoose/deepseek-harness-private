/** Token usage preferences stored in the Host user-settings document. */

import z from '@deepseek-ai/schemastery'

/** Settings namespace owned by the Token Usage plugin. */
export const TOKEN_USAGE_SETTINGS_NAMESPACE = 'ui-token-usage'

/** Field carrying the displayed token limit. */
export const TOKEN_LIMIT_FIELD = 'tokenLimit'

/** Token limit used when the user-settings document has no override. */
export const DEFAULT_TOKEN_LIMIT = 100_000

/** Durable Token Usage section shared by the Host schema and browser scope. */
export interface TokenUsageSettings {
  /** Positive integer token limit displayed by the Token Usage page. */
  tokenLimit: number
}

/** Durable Token Usage schema; the browser scope also validates its wire value against it. */
export const TokenUsageSettingsSchema: z<TokenUsageSettings> = z.object({
  [TOKEN_LIMIT_FIELD]: z.number().step(1).min(1).default(DEFAULT_TOKEN_LIMIT),
})
