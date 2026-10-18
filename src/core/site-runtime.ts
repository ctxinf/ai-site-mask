import {SKINS, resolveSkin, type SiteId} from './catalog'
import {MaskEngine, type CssProvider} from './mask'

type Cleanup = () => void
interface SiteAdapter {
  id: SiteId
  css: CssProvider
  isApplicable: () => boolean
  mountUi?: () => Cleanup
}

/** Each injection owns its engine and UI resources, including HMR cleanup. */
export function defineSite(adapter: SiteAdapter): () => Cleanup {
  return () => {
    const engine = new MaskEngine(adapter.id, adapter.css, {
      isApplicable: adapter.isApplicable,
      forceLight: () => false,
      getTitle: theme => SKINS[resolveSkin(theme)].title,
      getFavicon: theme => chrome.runtime.getURL(SKINS[resolveSkin(theme)].favicon),
    })
    const cleanupUi = adapter.mountUi?.()
    engine.boot(location.hostname).catch(error => console.error(`[skm][${adapter.id}] boot 失败:`, error))
    return () => { cleanupUi?.(); engine.destroy() }
  }
}
