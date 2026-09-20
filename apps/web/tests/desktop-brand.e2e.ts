/** Keyless browser evidence for the xOne brand in the shared Web composition. */
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'
import { DESKTOP_PROFILE_BUNDLES } from '../../desktop/src/core-package-set.ts'
import { compareOrRefreshGolden, launchWebScaffold, watchConsole, webSnapshotMode } from './scaffold.ts'
import { newEnglishPage } from './support.ts'

it('renders the default xOne brand with both packaged images', async () => {
  expect(DESKTOP_PROFILE_BUNDLES).toEqual([
    '@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app',
  ])
  const scaffold = await launchWebScaffold()
  try {
    const browser = await chromium.launch()
    try {
      const page = await newEnglishPage(browser)
      const console = watchConsole(page)
      await page.goto(scaffold.authenticatedUrl, { waitUntil: 'load' })
      const sidebar = page.getByText('xOneAI Workspace', { exact: true })
      const hero = page.getByText('Ask One', { exact: true })
      await sidebar.waitFor({ state: 'visible' })
      await hero.waitFor({ state: 'visible' })
      expect(await page.getByText('Into the Unknown', { exact: true }).count()).toBe(0)
      const sources = ['/jushu-logo.svg', '/bloub-nuage-attentif-bleu-anime.svg']
      for (const src of sources) {
        const image = page.locator(`img[src="${src}"]`)
        await image.waitFor({ state: 'visible' })
        await page.waitForFunction((source) => {
          const image = document.querySelector<HTMLImageElement>(`img[src="${source}"]`)
          return image?.complete === true && image.naturalWidth > 0
        }, src)
      }
      const snapshot = [
        `Sidebar: ${await sidebar.innerText()}`,
        `Hero: ${await hero.innerText()}`,
        ...sources.map(src => `Image: ${src}`),
      ].join('\n')
      await compareOrRefreshGolden(
        fileURLToPath(new URL('./expected/desktop-brand/brand.expected.md', import.meta.url)),
        snapshot,
        webSnapshotMode(),
      )
      expect(console.pageErrors).toEqual([])
    } finally {
      await browser.close()
    }
  } finally {
    await scaffold.close()
  }
})
