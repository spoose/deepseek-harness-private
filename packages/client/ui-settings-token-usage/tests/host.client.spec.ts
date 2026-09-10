import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import {
  SettingsProvider, type SettingsNamespace,
} from '@deepseek-ai/dsh-settings'
import { apply } from '../src/index.ts'
import {
  DEFAULT_TOKEN_LIMIT, TOKEN_USAGE_SETTINGS_NAMESPACE,
} from '../src/token-usage-settings.ts'

class MemorySettings extends SettingsProvider {
  readonly writable = true
  protected load(): Promise<Record<string, unknown>> { return Promise.resolve({}) }
  protected persist(_ns: SettingsNamespace, _section: Record<string, unknown>): Promise<void> {
    return Promise.resolve()
  }
}

describe('ui-settings-token-usage host', () => {
  it('registers, validates, and disposes the durable token limit', async () => {
    const ctx = new Context()
    await ctx.plugin(MemorySettings).await()
    const fiber = ctx.plugin({ apply })
    await fiber.await()

    expect(ctx.settings.get(TOKEN_USAGE_SETTINGS_NAMESPACE)).toEqual({
      tokenLimit: DEFAULT_TOKEN_LIMIT,
    })
    await ctx.settings.update(TOKEN_USAGE_SETTINGS_NAMESPACE, { tokenLimit: 200_000 })
    expect(ctx.settings.get(TOKEN_USAGE_SETTINGS_NAMESPACE)).toEqual({ tokenLimit: 200_000 })
    await expect(ctx.settings.update(TOKEN_USAGE_SETTINGS_NAMESPACE, { tokenLimit: 0 })).rejects.toThrow()

    await fiber.dispose()
    expect(ctx.settings.describe().map(row => row.ns)).not.toContain(TOKEN_USAGE_SETTINGS_NAMESPACE)
    await ctx.fiber.dispose()
  })
})
