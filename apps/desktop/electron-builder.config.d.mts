import type { MacOSAfterSignContext } from './scripts/verify-macos-signature.mjs'

/** Electron-builder fields asserted by the Desktop release tests. */
export interface DesktopElectronBuilderConfig {
  readonly appId: string
  readonly directories: {
    readonly output: string
  }
  readonly files: readonly [
    string,
    string,
    string,
    string,
    { readonly from: string, readonly to: 'dsh', readonly filter: readonly ['**/*'] },
    { readonly from: string, readonly to: 'dsh/node_modules', readonly filter: readonly ['**/*'] },
  ]
  readonly asarUnpack: readonly string[]
  readonly extraResources: readonly [{ readonly from: string, readonly to: 'runtime' }]
  readonly mac: {
    readonly identity: string | undefined
    readonly forceCodeSigning: boolean
    readonly notarize: boolean
    readonly signIgnore: readonly string[]
  }
  readonly dmg: {
    readonly sign: boolean
    readonly writeUpdateInfo: boolean
  }
  readonly linux: {
    readonly category: string
    readonly executableArgs: readonly string[]
    readonly executableName: 'deepseek-harness'
    readonly maintainer: string
    readonly syncDesktopName: true
    readonly target: readonly ['deb']
    readonly vendor: string
  }
  readonly nsis: {
    readonly include: string
  }
  readonly artifactBuildCompleted: (artifact: { readonly file: string }) => Promise<void> | undefined
  readonly afterSign: (context: MacOSAfterSignContext) => Promise<void>
  readonly publish: readonly [{ readonly provider: 'generic', readonly url: string }] | null
}

/**
 * Create electron-builder configuration from one release environment.
 * @param env - Packaging environment.
 * @param hostPlatform - Build-host platform used when no explicit target is present.
 * @param hostArch - Build-host architecture used when no explicit target is present.
 * @returns electron-builder configuration.
 */
export function createElectronBuilderConfig(
  env?: NodeJS.ProcessEnv,
  hostPlatform?: NodeJS.Platform,
  hostArch?: string,
): DesktopElectronBuilderConfig

declare const electronBuilderConfig: DesktopElectronBuilderConfig

export default electronBuilderConfig
