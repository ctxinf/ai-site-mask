import {getSiteState, onSiteStateChange} from './storage'

export type CssProvider = string | ((theme?: string) => string)

export interface MaskEngineOptions {
  getTitle?: (theme?: string) => string | undefined
  getFavicon?: (theme?: string) => string | undefined
}

// Mask 换肤引擎：负责 <style> 注入/移除 + html 开关 class + 标题与 Favicon 伪装 + 深色模式中和。
// cssText 必须由调用方保证所有规则都以 `html.skm-mask-on` 为前缀，
// 这里不做校验、不做改写，只做注入。
export class MaskEngine {
  private readonly styleId: string
  private unsubscribe: (() => void) | null = null
  private booted = false
  private originalTitle: string | null = null
  private titleObserver: MutationObserver | null = null
  private originalFavicon: string | null = null
  private wasDark = false
  private classObserver: MutationObserver | null = null

  constructor(
    private readonly siteId: string,
    private readonly cssProvider: CssProvider,
    private readonly options?: MaskEngineOptions
  ) {
    this.styleId = `skm-mask-${siteId}`
  }

  private get styleEl(): HTMLStyleElement | null {
    return document.getElementById(this.styleId) as HTMLStyleElement | null
  }

  private resolveCss(theme?: string): string {
    return typeof this.cssProvider === 'function'
      ? this.cssProvider(theme)
      : this.cssProvider
  }

  /** 注入（或复用）style 标签并挂上开关 class；幂等。 */
  apply(theme?: string): void {
    const cssText = this.resolveCss(theme)
    let el = this.styleEl
    if (!el) {
      el = document.createElement('style')
      el.id = this.styleId
      el.textContent = cssText
      // document_start 时 head 可能还没解析出来，先挂到 documentElement 也一样生效。
      ;(document.head ?? document.documentElement).appendChild(el)
    } else if (el.textContent !== cssText) {
      el.textContent = cssText
    }
    document.documentElement?.classList.add('skm-mask-on')

    // 中和 ChatGPT 原生深色模式，强制统一到浅色高质感体系
    if (document.documentElement?.classList.contains('dark')) {
      this.wasDark = true
      document.documentElement.classList.remove('dark')
    }
    if (!this.classObserver && document.documentElement) {
      this.classObserver = new MutationObserver(() => {
        if (
          document.documentElement?.classList.contains('skm-mask-on') &&
          document.documentElement?.classList.contains('dark')
        ) {
          this.wasDark = true
          document.documentElement.classList.remove('dark')
        }
      })
      this.classObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      })
    }

    // 标题伪装
    const disguisedTitle = this.options?.getTitle?.(theme)
    if (disguisedTitle) {
      if (this.originalTitle === null) {
        this.originalTitle = document.title
      }
      document.title = disguisedTitle
      // 对抗 SPA 动态重写 title
      if (!this.titleObserver) {
        const titleEl = document.querySelector('title')
        if (titleEl) {
          this.titleObserver = new MutationObserver(() => {
            if (
              document.documentElement?.classList.contains('skm-mask-on') &&
              document.title !== disguisedTitle
            ) {
              document.title = disguisedTitle
            }
          })
          this.titleObserver.observe(titleEl, {
            childList: true,
            characterData: true,
            subtree: true,
          })
        }
      }
    }

    // Favicon 伪装
    const disguisedFavicon = this.options?.getFavicon?.(theme)
    if (disguisedFavicon) {
      let iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null
      if (iconLink) {
        if (this.originalFavicon === null) {
          this.originalFavicon = iconLink.href
        }
        iconLink.href = disguisedFavicon
      } else {
        iconLink = document.createElement('link')
        iconLink.rel = 'shortcut icon'
        iconLink.href = disguisedFavicon
        document.head?.appendChild(iconLink)
      }
    }
  }

  /** 移除开关 class 和 style 标签；恢复标题和 Favicon；还原深色模式；幂等。 */
  remove(): void {
    document.documentElement?.classList.remove('skm-mask-on')
    this.styleEl?.remove()
    this.titleObserver?.disconnect()
    this.titleObserver = null
    this.classObserver?.disconnect()
    this.classObserver = null

    if (this.originalTitle !== null) {
      document.title = this.originalTitle
      this.originalTitle = null
    }

    if (this.originalFavicon !== null) {
      const iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null
      if (iconLink) {
        iconLink.href = this.originalFavicon
      }
      this.originalFavicon = null
    }

    if (this.wasDark) {
      document.documentElement?.classList.add('dark')
      this.wasDark = false
    }
  }

  /**
   * content script 入口（run_at=document_start）调用：
   * 1. 并发等待 documentElement 可用 + 读取 storage；
   * 2. 若 mode=mask 且 autoApply=true，第一时间加 class（防闪烁）；
   * 3. 订阅 storage 变化，mode 变化时自动 apply/remove。
   */
  async boot(host: string): Promise<void> {
    if (this.booted) {
      return
    }
    this.booted = true

    const docElReady = new Promise<void>((resolve) => {
      if (document.documentElement) {
        resolve()
        return
      }
      const obs = new MutationObserver(() => {
        if (document.documentElement) {
          obs.disconnect()
          resolve()
        }
      })
      obs.observe(document, {childList: true})
    })

    const [state] = await Promise.all([getSiteState(host), docElReady])
    if (state.mode === 'mask' && state.autoApply) {
      this.apply(state.theme)
    }

    this.unsubscribe = onSiteStateChange(host, (next) => {
      if (next.mode === 'mask') {
        this.apply(next.theme)
      } else {
        this.remove()
      }
    })
  }

  /** HMR/卸载时清理：取消订阅并移除 mask。 */
  destroy(): void {
    this.unsubscribe?.()
    this.unsubscribe = null
    this.booted = false
    this.remove()
  }
}
