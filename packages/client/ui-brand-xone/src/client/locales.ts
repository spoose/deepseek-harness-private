/** xOne brand dictionary namespace. */
export const NS = 'brand.xone'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'brand.name': 'xOneAI工作台',
  'hero.title': '问问小one',
} as const

/** English dictionary, key-identical to the Chinese source of truth. */
export const en: Record<XOneBrandKey, string> = {
  'brand.name': 'xOneAI Workspace',
  'hero.title': 'Ask One',
}

/** Key domain of the xOne brand namespace. */
export type XOneBrandKey = keyof typeof zh
