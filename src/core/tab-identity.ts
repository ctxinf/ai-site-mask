/** Reversible tab identity, independent of theme CSS and page state. */
export class TabIdentity {
  private originalTitle: string | null = null
  private titleObserver: MutationObserver | null = null
  private faviconObserver: MutationObserver | null = null
  private faviconOriginals = new Map<HTMLLinkElement, {href: string | null; type: string | null; sizes: string | null}>()
  private createdFavicon: HTMLLinkElement | null = null
  private faviconTimer: ReturnType<typeof setTimeout> | null = null

  apply(title?: string, favicon?: string): void {
    this.applyTitle(title)
    this.applyFavicon(favicon)
  }

  applyTitle(title?: string): void {
    const disguisedTitle = title
    // A theme switch must replace the observer's captured title as well.
    this.titleObserver?.disconnect()
    this.titleObserver = null
    if (disguisedTitle) {
      if (this.originalTitle === null) {
        this.originalTitle = document.title
      }
      if (document.title !== disguisedTitle) {
        document.title = disguisedTitle
      }
      // Observe the container: document_start may precede <title>, and Gemini
      // can replace the title node entirely during SPA navigation.
      this.titleObserver = new MutationObserver(() => {
        if (
          document.documentElement?.classList.contains('skm-mask-on') &&
          document.title !== disguisedTitle
        ) {
          if (!this.originalTitle && document.title) this.originalTitle = document.title
          document.title = disguisedTitle
        }
      })
      this.titleObserver.observe(document.head ?? document.documentElement, {
        childList: true,
        characterData: true,
        subtree: true,
      })
    }
  }

  applyFavicon(favicon?: string): void {
    // Replace every tab icon candidate; the site can add or rewrite them on navigation.
    this.restoreFavicons()
    const disguisedFavicon = favicon
    if (disguisedFavicon) {
      const isSvgDataUrl = disguisedFavicon.startsWith('data:image/svg+xml')
      const target = document.head ?? document.documentElement
      const observeOptions: MutationObserverInit = {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['href', 'rel', 'type', 'sizes'],
      }
      const updateIcons = () => {
        // Pause observer while mutating attributes to prevent self-triggered loops.
        this.faviconObserver?.disconnect()
        try {
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
            if (icon.getAttribute('href') !== disguisedFavicon) {
              icon.setAttribute('href', disguisedFavicon)
            }
            if (isSvgDataUrl) {
              if (icon.getAttribute('type') !== 'image/svg+xml') icon.setAttribute('type', 'image/svg+xml')
            } else {
              // A stale SVG MIME type or size hint can prevent PNG selection.
              if (icon.hasAttribute('type')) icon.removeAttribute('type')
            }
            if (icon.hasAttribute('sizes')) icon.removeAttribute('sizes')
          }
        } finally {
          if (this.faviconObserver && target) {
            this.faviconObserver.observe(target, observeOptions)
          }
        }
      }
      this.faviconObserver = new MutationObserver(() => {
        if (this.faviconTimer !== null) return
        // Coalesce rapid host mutations so host icon scripts cannot spin CPU.
        this.faviconTimer = setTimeout(() => {
          this.faviconTimer = null
          if (document.documentElement?.classList.contains('skm-mask-on')) {
            updateIcons()
          }
        }, 80)
      })
      updateIcons()
    }
  }

  private restoreFavicons(): void {
    if (this.faviconTimer !== null) {
      clearTimeout(this.faviconTimer)
      this.faviconTimer = null
    }
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

  restore(): void {
    this.titleObserver?.disconnect()
    this.titleObserver = null
    if (this.originalTitle !== null) {
      document.title = this.originalTitle
      this.originalTitle = null
    }
    this.restoreFavicons()
  }
}
