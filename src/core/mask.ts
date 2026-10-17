import {getSiteState, onSiteStateChange} from './storage'

// Mask 换肤引擎：只负责 <style> 注入 / 移除 + html 上的开关 class。
// cssText 必须由调用方保证所有规则都以 `html.skm-mask-on` 为前缀，
// 这里不做校验、不做改写，只做注入。
export class MaskEngine {
  private readonly styleId: string
  private unsubscribe: (() => void) | null = null
  private booted = false

  constructor(
    private readonly siteId: string,
    private readonly cssText: string
  ) {
    this.styleId = `skm-mask-${siteId}`
  }

  private get styleEl(): HTMLStyleElement | null {
    return document.getElementById(this.styleId) as HTMLStyleElement | null
  }

  /** 注入（或复用）style 标签并挂上开关 class；幂等。 */
  apply(): void {
    let el = this.styleEl
    if (!el) {
      el = document.createElement('style')
      el.id = this.styleId
      el.textContent = this.cssText
      // document_start 时 head 可能还没解析出来，先挂到 documentElement 也一样生效。
      ;(document.head ?? document.documentElement).appendChild(el)
    } else if (el.textContent !== this.cssText) {
      el.textContent = this.cssText
    }
    document.documentElement?.classList.add('skm-mask-on')
  }

  /** 移除开关 class 和 style 标签；幂等。 */
  remove(): void {
    document.documentElement?.classList.remove('skm-mask-on')
    this.styleEl?.remove()
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
      this.apply()
    }

    this.unsubscribe = onSiteStateChange(host, (next) => {
      if (next.mode === 'mask') {
        this.apply()
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
