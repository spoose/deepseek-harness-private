import { describe, expect, it } from 'vitest'
import { resolveDesktopDevelopmentElectronOverrides } from '../scripts/development-electron.ts'

describe('desktop development Electron launch', () => {
  it('leaves the default launch unchanged', () => {
    for (const platform of ['darwin', 'linux', 'win32'] as const) {
      expect(resolveDesktopDevelopmentElectronOverrides(false, platform)).toEqual({
        args: [],
        environment: {},
      })
    }
  })

  it('selects X11, GTK 3, software rendering, and no VA-API driver on Linux', () => {
    const resolved = resolveDesktopDevelopmentElectronOverrides(true, 'linux')
    expect(resolved).toEqual({
      args: [
        '--ozone-platform=x11',
        '--gtk-version=3',
        '--disable-gpu',
        '--disable-gpu-compositing',
        '--disable-accelerated-video-decode',
        '--disable-accelerated-video-encode',
        '--disable-features=VaapiVideoDecoder,VaapiVideoEncoder,UseChromeOSDirectVideoDecoder',
      ],
      environment: { LIBVA_DRIVER_NAME: 'disabled' },
    })
    expect(resolved.args.join(' ')).not.toMatch(/(?:^|-)no-sandbox|disable-(?:gpu-)?sandbox/u)
  })

  it('rejects the Linux-only mode on another host', () => {
    expect(() => resolveDesktopDevelopmentElectronOverrides(true, 'darwin'))
      .toThrow(/requires a Linux build host/u)
  })
})
