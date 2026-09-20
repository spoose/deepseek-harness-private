import { describe, expect, it } from 'vitest'
import {
  desktopElectronSwitchArguments,
  resolveDesktopLinuxSoftwareRendering,
} from '../src/linux-software-rendering.ts'

describe('packaged Linux software rendering', () => {
  it('selects X11, GTK 3, disabled GPU paths, and no VA-API driver', () => {
    const resolved = resolveDesktopLinuxSoftwareRendering('linux')
    expect(resolved).toBeDefined()
    expect(resolved?.environment).toEqual({ LIBVA_DRIVER_NAME: 'disabled' })
    expect(resolved?.disableHardwareAcceleration).toBe(true)
    expect(desktopElectronSwitchArguments(resolved?.switches ?? [])).toEqual([
      '--ozone-platform=x11',
      '--gtk-version=3',
      '--disable-gpu',
      '--disable-gpu-compositing',
      '--disable-accelerated-video-decode',
      '--disable-accelerated-video-encode',
      '--disable-features=VaapiVideoDecoder,VaapiVideoEncoder,UseChromeOSDirectVideoDecoder',
    ])
  })

  it('leaves macOS and Windows packages unchanged', () => {
    expect(resolveDesktopLinuxSoftwareRendering('darwin')).toBeUndefined()
    expect(resolveDesktopLinuxSoftwareRendering('win32')).toBeUndefined()
  })
})
