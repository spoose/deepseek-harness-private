/** Electron process overrides for opt-in Linux development compatibility modes. */

import {
  desktopElectronSwitchArguments,
  resolveDesktopLinuxSoftwareRendering,
} from '../src/linux-software-rendering.ts'

/** Child-process changes for one Desktop development launch. */
export interface DesktopDevelopmentElectronOverrides {
  readonly args: readonly string[]
  readonly environment: Readonly<NodeJS.ProcessEnv>
}

/**
 * Resolve the process-local workaround for Linux hosts with an incompatible VA-API driver.
 * @param enabled - Whether the caller selected software rendering for this launch.
 * @param platform - Host platform, replaceable by tests.
 * @returns Electron arguments and environment fields to add to the child process.
 * @throws {Error} When software rendering is selected on a non-Linux host.
 */
export function resolveDesktopDevelopmentElectronOverrides(
  enabled: boolean,
  platform: NodeJS.Platform = process.platform,
): DesktopDevelopmentElectronOverrides {
  if (!enabled) return { args: [], environment: {} }
  if (platform !== 'linux') {
    throw new Error('desktop development: --linux-software-rendering requires a Linux build host')
  }
  const resolved = resolveDesktopLinuxSoftwareRendering(platform)
  if (resolved === undefined) throw new Error('desktop development: Linux software rendering did not resolve')
  return {
    args: desktopElectronSwitchArguments(resolved.switches),
    environment: resolved.environment,
  }
}
