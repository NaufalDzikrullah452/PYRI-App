import { Unpackr } from 'msgpackr/unpack'
import type { BaseWindow } from '../window'
import { generateLayout } from './gen-layout'

declare const window: BaseWindow
export const unpackBase = () => {
  if (window.cms_base_pack) {
    const unpackr = new Unpackr({})
    const result = unpackr.unpack(new Uint8Array(window.cms_base_pack))

    for (let [k, v] of Object.entries(result) as any) {
      if (k === 'user') {
        try {
          window[k] = JSON.parse(v)
        } catch (e) {
          console.error('Failed to parse user session')
        }
      } else {
        window[k] = v
      }
    }

    for (let v of Object.values(window.cms_layouts)) {
      v.component = generateLayout(v.source)
    }
  }
}
