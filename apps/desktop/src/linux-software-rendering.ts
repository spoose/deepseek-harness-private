/** UOS-compatible Electron process settings for packaged Linux applications. */

/** One Chromium command-line switch with an optional value. */
export interface DesktopElectronSwitch {
  readonly name: string
  readonly value?: string
}

/** Software-rendering settings applied to one Linux Electron process. */
export interface DesktopLinuxSoftwareRendering {
  readonly switches: readonly DesktopElectronSwitch[]
  readonly environment: Readonly<NodeJS.ProcessEnv>
  readonly disableHardwareAcceleration: true
}

const SWITCHES: readonly DesktopElectronSwitch[] = [
  { name: 'ozone-platform', value: 'x11' },
  { name: 'gtk-version', value: '3' },
  { name: 'disable-gpu' },
  { name: 'disable-gpu-compositing' },
  { name: 'disable-accelerated-video-decode' },
  { name: 'disable-accelerated-video-encode' },
  { name: 'disable-features', value: 'VaapiVideoDecoder,VaapiVideoEncoder,UseChromeOSDirectVideoDecoder' },
]

/**
 * Resolve the packaged Linux compatibility settings without changing other platforms.
 * @param platform - Electron process platform, replaceable by tests.
 * @returns Software-rendering settings for Linux, or undefined for other platforms.
 */
export function resolveDesktopLinuxSoftwareRendering(
  platform: NodeJS.Platform = process.platform,
): DesktopLinuxSoftwareRendering | undefined {
  if (platform !== 'linux') return undefined
  return {
    switches: SWITCHES,
    environment: { LIBVA_DRIVER_NAME: 'disabled' },
    disableHardwareAcceleration: true,
  }
}

/**
 * Convert Chromium switch settings to executable arguments.
 * @param switches - Structured Chromium switches.
 * @returns Arguments accepted by the Electron executable.
 */
export function desktopElectronSwitchArguments(switches: readonly DesktopElectronSwitch[]): readonly string[] {
  return switches.map(({ name, value }) => `--${name}${value === undefined ? '' : `=${value}`}`)
}
