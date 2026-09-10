// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  bindSnapshotSelector, stubSettingsScope,
} from '@deepseek-ai/dsh-client-test-runtime'
import { TokenUsageSection } from '../src/client/TokenUsageSection.tsx'
import type { TokenUsageSectionProps } from '../src/client/TokenUsageSection.tsx'
import { en } from '../src/client/locales.ts'
import type { TokenUsageSettings } from '../src/token-usage-settings.ts'

afterEach(cleanup)

describe('TokenUsageSection', () => {
  it('uses the schema default before the first Host settings value arrives', () => {
    const settings = stubSettingsScope<TokenUsageSettings>()
    const props = {
      close: vi.fn(),
      t: (key: keyof typeof en) => en[key],
      useSettings: bindSnapshotSelector(settings.scope),
    } as unknown as TokenUsageSectionProps

    render(<TokenUsageSection {...props} />)

    expect(screen.getByText((100_000).toLocaleString())).toBeTruthy()
    expect(screen.getByText('68%')).toBeTruthy()
  })

  it('renders fixed usage against the current durable limit', () => {
    const settings = stubSettingsScope<TokenUsageSettings>()
    settings.publish({
      status: 'ready',
      value: { tokenLimit: 200_000 },
      revision: 0,
      writable: true,
    })
    const props = {
      close: vi.fn(),
      t: (key: keyof typeof en) => en[key],
      useSettings: bindSnapshotSelector(settings.scope),
    } as unknown as TokenUsageSectionProps
    const view = render(<TokenUsageSection {...props} />)

    expect(screen.getByRole('heading', { name: en.title })).toBeTruthy()
    expect(screen.getByText(en.description)).toBeTruthy()
    expect(screen.getByText((68_420).toLocaleString())).toBeTruthy()
    expect(screen.getByText((200_000).toLocaleString())).toBeTruthy()
    expect(screen.getByText('34%')).toBeTruthy()
    expect(view.container.querySelector('progress')).toMatchObject({ value: 68_420, max: 200_000 })
    expect(screen.getByRole('progressbar', { name: en.progress })).toBeTruthy()

    act(() => { settings.publish({ value: { tokenLimit: 120_000 }, revision: 1 }) })
    expect(screen.getByText((120_000).toLocaleString())).toBeTruthy()
    expect(screen.getByText('57%')).toBeTruthy()
  })
})
