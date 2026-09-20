import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

interface DesktopPackageMetadata {
  readonly author?: unknown
  readonly desktopName?: unknown
  readonly homepage?: unknown
}

describe('desktop package metadata', () => {
  it('provides the homepage and author required by Linux DEB metadata', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as DesktopPackageMetadata

    expect(manifest).toMatchObject({
      author: 'DeepSeek AI',
      desktopName: 'deepseek-harness',
      homepage: 'https://github.com/deepseek-ai/deepseek-harness',
    })
  })
})
