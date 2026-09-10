// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { apply, inject } from '../src/client/index.ts'
import {
  XOneBrandName,
  XOneHeroBrandMark,
  XOneHeroBrandTitle,
  XOneSidebarBrandMark,
} from '../src/client/Brand.tsx'

afterEach(cleanup)

const HOLES = [
  'sidebar.brand.mark',
  'sidebar.brand.name',
  'conversation.hero.brand.mark',
  'conversation.hero.brand.title',
] as const

async function bench(declare = true) {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  ctx.provide('locale', new LocaleRuntime(ctx))
  const slots = ctx.get('slots') as SlotRegistry
  const declareHoles = () => slots.register({
    name: 'root',
    children: Object.fromEntries(HOLES.map(name => [name, { kind: 'single', scope: 'root' }])),
  } as never, () => null)
  const disposeHoles = declare ? declareHoles() : undefined
  return { ctx, slots, declareHoles, disposeHoles }
}

describe('xOne browser-brand plugin', () => {
  it('declares only the slot service it uses', () => {
    expect(inject).toEqual(['slots', 'locale'])
  })

  it('fills declarations before or after apply and removes every occupant on teardown', async () => {
    const before = await bench()
    const fiber = before.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(1)

    before.disposeHoles?.()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(0)
    before.declareHoles()
    await Promise.resolve()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(1)

    await fiber.dispose()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(0)

    const after = await bench(false)
    await after.ctx.plugin({ inject: [...inject], apply }).await()
    for (const hole of HOLES) expect(after.slots.entries(hole)).toHaveLength(0)
    after.declareHoles()
    await Promise.resolve()
    for (const hole of HOLES) expect(after.slots.entries(hole)).toHaveLength(1)
  })

  it('renders the sidebar and hero assets at their requested sizes', () => {
    const name = render(<XOneBrandName t={() => 'xOneAI工作台'} />)
    expect(name.getByText('xOneAI工作台')).toBeTruthy()
    name.unmount()

    const title = render(<XOneHeroBrandTitle t={() => '问问小one'} />)
    expect(title.getByText('问问小one')).toBeTruthy()
    title.unmount()

    const sidebar = render(<XOneSidebarBrandMark size={24} />)
    expect(sidebar.container.querySelector('img')?.getAttribute('src')).toBe('/jushu-logo.svg')
    sidebar.unmount()

    const hero = render(<XOneHeroBrandMark size={34} className="hero-mark" />)
    const image = hero.container.querySelector('img')
    expect(image?.getAttribute('src')).toBe('/bloub-nuage-attentif-bleu-anime.svg')
    expect(image?.getAttribute('width')).toBe('34')
    expect(image?.className).toBe('hero-mark')
  })
})
