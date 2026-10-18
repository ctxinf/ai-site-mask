import {getSiteState, onSiteStateChange} from './storage'
import {normalizeOpacity, normalizeQwenModelLabel} from './preferences'
import {TabIdentity} from './tab-identity'

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
  private readonly identity = new TabIdentity()
  private readonly styleId: string
  private unsubscribe: (() => void) | null = null
  private booted = false
  private generation = 0
  private documentObserver: MutationObserver | null = null
  private cancelDocumentReady: (() => void) | null = null
  private enabled = false
  private messageListener: Parameters<typeof chrome.runtime.onMessage.addListener>[0] | null = null
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
    const opacity = normalizeOpacity(extraOpacity)
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

    this.identity.apply(this.options?.getTitle?.(theme), this.options?.getFavicon?.(theme))
  }

  /** 移除开关 class 和 style 标签；恢复标题和 Favicon；还原深色模式；幂等。 */
  remove(): void {
    document.documentElement?.classList.remove('skm-mask-on')
    this.styleEl?.remove()
    this.classObserver?.disconnect()
    this.classObserver = null

    this.identity.restore()

    if (this.wasDark) {
      document.documentElement?.classList.add('dark')
      this.wasDark = false
    }
  }

  /**
   * content script 入口（run_at=document_start）调用：
   * 1. 并发等待 documentElement 可用 + 读取 storage；
   * 2. 仅根据 autoApply 初始化当前页面的临时开关；
   * 3. 接收 popup 的页面命令，偏好变化仅更新已开启的页面。
   */
  async boot(host: string): Promise<void> {
    if (this.booted) {
      return
    }
    this.booted = true
    const generation = ++this.generation

    const docElReady = new Promise<void>((resolve) => {
      this.cancelDocumentReady = resolve
      if (document.documentElement) {
        resolve()
        return
      }
      const obs = new MutationObserver(() => {
        if (document.documentElement) {
          obs.disconnect()
          this.documentObserver = null
          resolve()
        }
      })
      this.documentObserver = obs
      obs.observe(document, {childList: true})
    })

    const [state] = await Promise.all([getSiteState(host), docElReady])
    if (generation !== this.generation) return
    this.cancelDocumentReady = null
    this.enabled = state.autoApply
    if (this.enabled) {
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

    this.messageListener = (message, _sender, respond) => {
      if (message?.type === 'skm:get-page-state') {
        respond({enabled: this.enabled})
      } else if (message?.type === 'skm:set-page-state' && typeof message.enabled === 'boolean') {
        getSiteState(host).then(next => {
          if (generation !== this.generation) { respond({error: '页面已卸载'}); return }
          this.enabled = message.enabled
          if (this.enabled) this.apply(next.theme, next.extraOpacity, next.qwenModelLabel)
          else {
            this.requestedStyle = null
            this.remove()
          }
          respond({enabled: this.enabled})
        }).catch(error => respond({error: String(error)}))
        return true
      }
    }
    chrome.runtime.onMessage.addListener(this.messageListener)
    this.unsubscribe = onSiteStateChange(host, (next) => {
      if (this.enabled) this.apply(next.theme, next.extraOpacity, next.qwenModelLabel)
    })
  }

  /** HMR/卸载时清理：取消订阅并移除 mask。 */
  destroy(): void {
    this.generation++
    this.documentObserver?.disconnect()
    this.documentObserver = null
    this.cancelDocumentReady?.()
    this.cancelDocumentReady = null
    if (this.routeTimer !== null) clearInterval(this.routeTimer)
    this.routeTimer = null
    this.requestedStyle = null
    if (this.messageListener) chrome.runtime.onMessage.removeListener(this.messageListener)
    this.messageListener = null
    this.enabled = false
    this.unsubscribe?.()
    this.unsubscribe = null
    this.booted = false
    this.remove()
  }
}
