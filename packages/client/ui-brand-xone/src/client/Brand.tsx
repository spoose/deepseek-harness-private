import type { HeroBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SidebarBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { NS } from './locales.ts'

/** Render the xOne sidebar mark at the host-requested size. */
export function XOneSidebarBrandMark({ size }: SidebarBrandMarkOwnerProps) {
  return <img src="/jushu-logo.svg" width={size} height={size} alt="" />
}

/** Render the animated xOne hero mark with the host's geometry class. */
export function XOneHeroBrandMark({ size, className }: HeroBrandMarkOwnerProps) {
  return (
    <img
      src="/bloub-nuage-attentif-bleu-anime.svg"
      width={size}
      height={size}
      className={className}
      alt=""
    />
  )
}

/** Render the xOne product name in the expanded sidebar. */
export function XOneBrandName({ t }: PropsLocale<typeof NS>) {
  return <span>{t('brand.name')}</span>
}

/** Render the xOne blank-session headline. */
export function XOneHeroBrandTitle({ t }: PropsLocale<typeof NS>) {
  return t('hero.title')
}
