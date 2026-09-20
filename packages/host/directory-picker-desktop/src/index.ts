/** Adaptive directory-picker composition for an embedded Desktop renderer. */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/cordis-plugin-loader'
import { mountDirectoryPickerInteraction } from '@deepseek-ai/dsh-host-directory-picker-auto'

/** Cordis plugin name. */
export const name = 'directory-picker-desktop'

/** Entry tree used to mount the resolved backend and client surface. */
export const inject = ['loader']

/**
 * Resolve and mount the directory picker for a renderer embedded in the local application.
 * @param ctx - Cordis context carrying the injected Loader service.
 * @returns Nothing after the selected interaction finishes loading.
 */
export async function apply(ctx: Context): Promise<void> {
  await mountDirectoryPickerInteraction(ctx, '127.0.0.1')
}
