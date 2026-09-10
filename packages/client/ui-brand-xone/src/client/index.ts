/** xOne occupants for the generic browser-brand slots. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { XOneBrandName, XOneHeroBrandMark, XOneHeroBrandTitle, XOneSidebarBrandMark } from './Brand.tsx'
import { en, NS, zh, type XOneBrandKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** xOne browser-brand copy. */
    'brand.xone': XOneBrandKey
  }
}

/** Required services: the UI slot and locale registries. */
export const inject = ['slots', 'locale']

/**
 * Fill all xOne brand slots as one declaration-aware registration set.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-brand-xone: dictionaries')
  ctx.slots.inject('sidebar.brand.mark', () =>
    ctx.slots.inject('sidebar.brand.name', () =>
      ctx.slots.inject('conversation.hero.brand.mark', () =>
        ctx.slots.inject('conversation.hero.brand.title', function* () {
          yield ctx.slots.register({ name: 'sidebar.brand.mark' }, XOneSidebarBrandMark)
          yield ctx.slots.register({ name: 'sidebar.brand.name', locale: NS }, XOneBrandName)
          yield ctx.slots.register({ name: 'conversation.hero.brand.mark' }, XOneHeroBrandMark)
          yield ctx.slots.register({ name: 'conversation.hero.brand.title', locale: NS }, XOneHeroBrandTitle)
        }))))
}
