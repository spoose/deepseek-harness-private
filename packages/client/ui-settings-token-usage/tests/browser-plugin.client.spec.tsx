// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { resolveSlotLabel } from '@deepseek-ai/dsh-client-ui-slots'
import {
  stubSettingsScope, usePinnedBrowserLanguages,
} from '@deepseek-ai/dsh-client-test-runtime'
import { apply, inject } from '../src/client/index.ts'
import { TokenUsageSection } from '../src/client/TokenUsageSection.tsx'
import type { TokenUsageSectionInjected } from '../src/client/TokenUsageSection.tsx'
import type { TokenUsageSettings } from '../src/token-usage-settings.ts'

usePinnedBrowserLanguages('zh-CN')
afterEach(cleanup)

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const locale = new LocaleRuntime(ctx)
  const settings = stubSettingsScope<TokenUsageSettings>()
  const bind = vi.fn(() => settings.scope)
  ctx.provide('locale', locale)
  ctx.provide('settingsScope', { bind } as never)
  return { bind, ctx, locale, settings, slots: ctx.get('slots') as SlotRegistry }
}

function declare(slots: SlotRegistry): () => void {
  return slots.register({
    name: 'root',
    children: { 'settings.section': { kind: 'list', scope: 'root' } },
  } as never, () => null)
}

describe('ui-settings-token-usage browser plugin', () => {
  it('declares only the services used by the contribution', () => {
    expect(inject).toEqual(['slots', 'locale', 'settingsScope'])
  })

  it('follows the settings declaration, locale, reload, and teardown', async () => {
    const b = await bench()
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(b.bind).toHaveBeenCalledWith({ namespace: 'ui-token-usage' })
    expect(b.slots.entries('settings.section')).toHaveLength(0)

    const stop = declare(b.slots)
    await vi.waitFor(() => { expect(b.slots.entries('settings.section')).toHaveLength(1) })
    const entry = b.slots.entries('settings.section')[0]!
    expect(entry.component).toBe(TokenUsageSection)
    expect(entry.options).toMatchObject({ id: 'token-usage', order: 30 })
    expect(entry.locale).toBe('settings.tokenUsage')
    const injected = (entry.inject as unknown as () => TokenUsageSectionInjected)()
    expect(injected.hooks.settings).toBe(b.settings.scope)
    expect(resolveSlotLabel(entry.options.label)).toBe('Token 用量')

    b.locale.setLocale('en')
    expect(resolveSlotLabel(entry.options.label)).toBe('Token usage')

    stop()
    expect(b.slots.entries('settings.section')).toHaveLength(0)
    declare(b.slots)
    await vi.waitFor(() => {
      expect(b.slots.entries('settings.section')[0]?.component).toBe(TokenUsageSection)
    })

    await fiber.dispose()
    expect(b.slots.entries('settings.section')).toHaveLength(0)
    await b.ctx.fiber.dispose()
  })
})
