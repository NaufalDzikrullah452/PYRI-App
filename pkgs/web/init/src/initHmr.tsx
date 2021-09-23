import { reloadAllComponents } from './core/platform'
import type { BaseWindow } from './window'

declare const window: BaseWindow
export const initHmr = () => {
  for (let i of Object.keys(localStorage)) {
    if (
      i.indexOf('csx-') === 0 ||
      i.indexOf('ccx-') === 0 ||
      i.indexOf('dbdef-') === 0
    ) {
      localStorage.removeItem(i)
    }
  }
  window.ws_dev = new WebSocket(
    `ws://${location.hostname}:${location.port}/__hmr`
  )
  window.ws_dev.onmessage = async (e) => {
    const msg = JSON.parse(e.data)

    switch (msg.type) {
      case 'hmr-reload-page':
        if (msg.id === window.cms_id) {
          if (window.cms_pages[msg.url]) {
            console.clear()
            window.liveReloadPage()
          }
        } else if (msg.id === window.cms_layout_id) {
          console.clear()
          window.liveReloadLayout()
        }
        break
      case 'hmr-reload-all':
        if (location.pathname !== '/dev') {
          location.reload()
        }
        break
      case 'component-reload':
        localStorage[`ccx-${msg.id}`] = msg.html
        window.cms_components[msg.id].loaded = false;
        window.liveReloadPage()
        break
    }
  }
}
