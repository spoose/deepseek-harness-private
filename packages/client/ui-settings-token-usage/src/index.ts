/** Host registration for the Token Usage settings namespace. */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import {
  TOKEN_USAGE_SETTINGS_NAMESPACE, TokenUsageSettingsSchema,
} from './token-usage-settings.ts'

/**
 * Register the durable token-limit section when the optional settings service is composed.
 * @param ctx - Host Cordis context.
 */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(
      TOKEN_USAGE_SETTINGS_NAMESPACE,
      TokenUsageSettingsSchema,
    )
  })
}
