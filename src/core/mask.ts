import {getSiteState, onSiteStateChange, normalizeQwenModelLabel} from './storage'

export type CssProvider = string | ((theme?: string) => string)

export interface MaskEngineOptions {
  isApplicable?: () => boolean
  forceLight?: (theme?: string) => boolean
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
  private faviconObserver: MutationObserver | null = null
  private faviconOriginals = new Map<HTMLLinkElement, {href: string | null; type: string | null; sizes: string | null}>()
  private createdFavicon: HTMLLinkElement | null = null
  private wasDark = false
  private classObserver: MutationObserver | null = null
  private forceLight = true
  private routeTimer: ReturnType<typeof setInterval> | null = null
  private requestedStyle: [string | undefined, number, string | undefined] | null = null

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
  apply(theme?: string, extraOpacity = 0.25, qwenModelLabel?: string): void {
    this.requestedStyle = [theme, extraOpacity, qwenModelLabel]
    if (this.options?.isApplicable && !this.options.isApplicable()) {
      this.remove()
      return
    }
    this.forceLight = this.options?.forceLight?.(theme) ?? true
    const opacity = Number.isFinite(extraOpacity) ? Math.max(0, Math.min(0.5, extraOpacity)) : 0.25
    const cssText = `${this.resolveCss(theme)}\nhtml.skm-mask-on { --skm-extra-opacity: ${opacity}; --skm-qwen-model-label: ${JSON.stringify(normalizeQwenModelLabel(qwenModelLabel))}; }`
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
    if (!this.forceLight && this.wasDark) {
      document.documentElement.classList.add('dark')
      this.wasDark = false
    }
    if (this.forceLight && document.documentElement?.classList.contains('dark')) {
      this.wasDark = true
      document.documentElement.classList.remove('dark')
    }
    if (!this.classObserver && document.documentElement) {
      this.classObserver = new MutationObserver(() => {
        if (
          document.documentElement?.classList.contains('skm-mask-on') &&
          this.forceLight &&
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
    // A theme switch must replace the observer's captured title as well.
    this.titleObserver?.disconnect()
    this.titleObserver = null
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

    // Replace every tab icon candidate; the site can add or rewrite them on navigation.
    this.restoreFavicons()
    const disguisedFavicon = this.options?.getFavicon?.(theme)
    if (disguisedFavicon) {
      const updateIcons = () => {
        const icons = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'))
        if (!icons.length && document.head) {
          const icon = document.createElement('link')
          icon.rel = 'icon'
          this.createdFavicon = icon
          document.head.appendChild(icon)
          icons.push(icon)
        }
        for (const icon of icons) {
          if (!this.faviconOriginals.has(icon) && icon !== this.createdFavicon) {
            this.faviconOriginals.set(icon, {
              href: icon.getAttribute('href'), type: icon.getAttribute('type'), sizes: icon.getAttribute('sizes'),
            })
          }
          if (icon.href !== disguisedFavicon) icon.href = disguisedFavicon
          // A stale SVG MIME type or size hint can prevent PNG selection.
          if (icon.hasAttribute('type')) icon.removeAttribute('type')
          if (icon.hasAttribute('sizes')) icon.removeAttribute('sizes')
        }
      }
      updateIcons()
      this.faviconObserver = new MutationObserver(updateIcons)
      this.faviconObserver.observe(document.head ?? document.documentElement, {
        childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'rel', 'type', 'sizes'],
      })
    }
  }

  private restoreFavicons(): void {
    this.faviconObserver?.disconnect()
    this.faviconObserver = null
    this.createdFavicon?.remove()
    this.createdFavicon = null
    for (const [icon, attributes] of this.faviconOriginals) {
      for (const [name, value] of Object.entries(attributes)) {
        if (value === null) icon.removeAttribute(name)
        else icon.setAttribute(name, value)
      }
    }
    this.faviconOriginals.clear()
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

    this.restoreFavicons()

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
      this.apply(state.theme, state.extraOpacity, state.qwenModelLabel)
    }

    // Content scripts run in an isolated world: polling the URL also catches
    // native pushState/replaceState navigation without patching the page.
    if (this.options?.isApplicable) {
      let previousPath = location.pathname
      this.routeTimer = setInterval(() => {
        if (location.pathname === previousPath) return
        previousPath = location.pathname
        if (this.requestedStyle) this.apply(...this.requestedStyle)
      }, 100)
    }

    this.unsubscribe = onSiteStateChange(host, (next) => {
      if (next.mode === 'mask') {
        this.apply(next.theme, next.extraOpacity, next.qwenModelLabel)
      } else {
        this.requestedStyle = null
        this.remove()
      }
    })
  }

  /** HMR/卸载时清理：取消订阅并移除 mask。 */
  destroy(): void {
    if (this.routeTimer !== null) clearInterval(this.routeTimer)
    this.routeTimer = null
    this.requestedStyle = null
    this.unsubscribe?.()
    this.unsubscribe = null
    this.booted = false
    this.remove()
  }
}
