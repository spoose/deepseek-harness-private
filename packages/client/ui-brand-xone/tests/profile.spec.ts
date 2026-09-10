/** The xOne package must carry one parseable Web-brand replacement layer. */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as yaml from 'js-yaml'
import { entryListSchema } from '@deepseek-ai/cordis-plugin-include'

describe('xOne brand profile layer', () => {
  it('disables the official brand row before inserting the xOne plugin', () => {
    const root = fileURLToPath(new URL('..', import.meta.url))
    const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
      dsh?: { bundle?: { patch?: string }; client?: unknown }
    }
    expect(manifest.dsh?.bundle?.patch).toBe('./cordis.patch.yml')
    expect(manifest.dsh?.client).toBeDefined()

    const parsed = yaml.load(
      readFileSync(resolve(root, manifest.dsh!.bundle!.patch!), 'utf8'),
      { schema: entryListSchema },
    )
    expect(parsed).toEqual([
      { id: 'ui-brand-official', disabled: true },
      {
        insert: [{
          id: 'ui-brand-xone',
          name: '@deepseek-ai/dsh-client-ui-brand-xone',
        }],
      },
    ])
  })
})
