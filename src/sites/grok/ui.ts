import {getSiteState, onSiteStateChange, DEFAULT_DEEPSEEK_USERNAME, DEFAULT_QWEN_MODEL_LABEL} from '../../core/storage'

/** Own only decorative nodes and adapter attributes; React retains every native control. */
export function mountGrokUi(): () => void {
  let stopped = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let username = DEFAULT_DEEPSEEK_USERNAME
  let modelLabel = DEFAULT_QWEN_MODEL_LABEL
  let extrasOpen = false
  const toggleStates = new Map<string, boolean>()
  const folds = new Map<HTMLElement, {item: HTMLElement; details: HTMLDetailsElement; targets: Set<HTMLElement>}>()
  const clearFolds = () => {
    for (const {item, targets} of folds.values()) {
      item.remove()
      for (const target of targets) target.removeAttribute('data-skm-grok-folded')
    }
    folds.clear()
  }
  const owned = new Set<HTMLElement>()
  const marked = new Set<HTMLElement>()
  const mark = (el: HTMLElement | null | undefined, name: string) => {
    if (el && !el.hasAttribute(name)) { el.setAttribute(name, ''); marked.add(el) }
  }
  const add = (parent: HTMLElement, cls: string, tag = 'span') => {
    let el = parent.querySelector<HTMLElement>(`:scope > .${cls}`)
    if (!el) { el = document.createElement(tag); el.className = cls; el.dataset.skmOwned = 'true'; parent.append(el); owned.add(el) }
    return el
  }
  const clear = () => {
    clearFolds()
    for (const el of owned) el.remove()
    owned.clear()
    for (const el of marked) for (const attr of [...el.attributes]) if (attr.name.startsWith('data-skm-grok-')) el.removeAttribute(attr.name)
    marked.clear()
  }
  const findSidebarRoot = (): HTMLElement | null => {
    const legacy = document.querySelector<HTMLElement>('[data-sidebar="sidebar"]')
    if (legacy) return legacy
    const scrollport = document.querySelector<HTMLElement>('[data-slot="sidebar-scrollport"]')
    let cur = scrollport?.parentElement ?? null
    while (cur && cur !== document.body) {
      if (cur.querySelector(':scope > header') && cur.querySelector(':scope > footer')) return cur
      cur = cur.parentElement
    }
    return null
  }
  const syncPlaceholder = () => {
    const query = document.querySelector<HTMLElement>('form[data-composer], .query-bar')
    if (!query) return
    const input = query.querySelector<HTMLElement>('[data-testid="chat-input"]')
    const editor = query.querySelector<HTMLElement>('[contenteditable="true"]')
    if (!editor || !input) return
    const hint = add(input, 'skm-grok-placeholder')
    hint.setAttribute('aria-hidden', 'true')
    hint.hidden = !!editor.textContent?.trim()
  }
  const sync = () => {
    timer = undefined
    if (stopped) return
    if (!document.documentElement?.classList.contains('skm-mask-on')) { clear(); return }
    for (const el of owned) if (!el.isConnected) owned.delete(el)
    for (const el of marked) if (!el.isConnected) marked.delete(el)
    const deepseek = getComputedStyle(document.documentElement).getPropertyValue('--skm-deepseek').trim() === '1'

    // Sidebar (supports both new Base UI sidebar and legacy [data-sidebar="sidebar"])
    const sidebar = findSidebarRoot()
    const leadingChrome = document.querySelector<HTMLElement>('[data-leading-chrome]')
    const chromeParent = leadingChrome?.parentElement
    if (sidebar) {
      mark(sidebar, 'data-skm-grok-sidebar')
      const sidebarOpen = sidebar.getBoundingClientRect().width > 120
      if (chromeParent) {
        if (sidebarOpen) {
          chromeParent.setAttribute('data-skm-grok-chrome-open', 'true')
          marked.add(chromeParent)
        } else {
          chromeParent.removeAttribute('data-skm-grok-chrome-open')
        }
      }
      const sbHeader = sidebar.querySelector<HTMLElement>(':scope > header')
      if (sbHeader && !sidebar.matches('[data-sidebar="sidebar"]')) {
        const brand = add(sbHeader, 'skm-grok-brand')
        brand.setAttribute('aria-hidden', 'true')
      }
      // New chat button
      const newChatBtn = sidebar.querySelector<HTMLElement>('[data-testid="new-chat"]')
        ?? [...sidebar.querySelectorAll<HTMLElement>('button')].find(btn =>
          /^(New chat|新聊天|开启新对话)/i.test(btn.textContent?.trim() ?? '') || !!btn.querySelector('[data-slot="sidebar-item-shortcut"]'))
      mark(newChatBtn, 'data-skm-grok-new-chat')

      // Grok Bot section in sidebar
      for (const bots of sidebar.querySelectorAll<HTMLElement>('[data-reorder-item="bots"]')) {
        mark(bots, 'data-skm-grok-bot')
      }
      // Library button in sidebar
      for (const btn of sidebar.querySelectorAll<HTMLElement>('[data-slot="sidebar-scrollport"] button')) {
        const text = btn.textContent?.trim() ?? ''
        if (/^(Library|照片库|媒体库)$/i.test(text)) mark(btn, 'data-skm-grok-extra-nav')
      }
      // Chats heading in new sidebar
      const recentSection = sidebar.querySelector<HTMLElement>('[data-reorder-item="recent"]')
      const recentHeading = recentSection?.querySelector<HTMLElement>('button')
      if (recentHeading && /^(Chats|聊天)$/i.test(recentHeading.textContent?.trim() ?? '')) {
        mark(recentHeading, 'data-skm-grok-recents')
      }
      // Upgrade to Premium button in sidebar
      for (const btn of sidebar.querySelectorAll<HTMLElement>('button, a')) {
        const text = btn.textContent?.trim() ?? ''
        if (/^(Upgrade to Premium|Upgrade|SuperGrok|升级)/i.test(text) || /Upgrade to (Premium|SuperGrok)/i.test(text)) {
          mark(btn, 'data-skm-grok-upgrade')
          const wrap = btn.parentElement
          if (wrap && wrap.tagName === 'DIV' && wrap.children.length === 1 && wrap.parentElement === sidebar) {
            mark(wrap, 'data-skm-grok-upgrade')
          }
        }
      }
      // Legacy sidebar groups
      for (const group of sidebar.querySelectorAll<HTMLElement>('[data-sidebar="group"]')) {
        const plugin = [...group.querySelectorAll('button')].find(button => /^(插件|Connectors|Extensions)$/i.test(button.textContent?.trim() ?? ''))
        if (plugin) mark(group, 'data-skm-grok-plugins')
        for (const button of group.querySelectorAll<HTMLElement>('button[aria-expanded]')) {
          const label = button.querySelector<HTMLElement>(':scope > span')
          if (label && /^(聊天|Chats)$/i.test(label.textContent?.trim() ?? '')) mark(label, 'data-skm-grok-recents')
        }
      }
    }

    // Legacy DeepSeek sidebar fold (only when legacy [data-sidebar="menu-item"] exists)
    if (!deepseek) {
      clearFolds()
      for (const node of owned) if (node.classList.contains('skm-grok-toggles')) { node.remove(); owned.delete(node) }
    } else {
      for (const [menu, fold] of folds) if (!menu.isConnected || !fold.item.isConnected) {
        for (const target of fold.targets) target.removeAttribute('data-skm-grok-folded')
        fold.item.remove(); folds.delete(menu)
      }
      const newChat = sidebar?.querySelector<HTMLElement>('[data-testid="new-chat"]')?.closest<HTMLElement>('[data-sidebar="menu-item"]')
      const menu = newChat?.parentElement
      if (menu && newChat) {
        let fold = folds.get(menu)
        if (!fold) {
          const item = document.createElement('li')
          item.className = 'skm-grok-fold-item'
          item.dataset.skmOwned = 'true'
          const details = document.createElement('details')
          details.className = 'skm-grok-fold'
          details.open = extrasOpen
          const summary = document.createElement('summary')
          summary.setAttribute('aria-label', '展开或折叠功能和项目')
          summary.title = '功能和项目'
          details.append(summary); item.append(details)
          newChat.after(item)
          fold = {item, details, targets: new Set()}
          const current = fold
          details.addEventListener('toggle', () => {
            extrasOpen = details.open
            for (const target of current.targets) target.setAttribute('data-skm-grok-folded', String(!details.open))
          })
          folds.set(menu, fold)
        }
        const targets = [...menu.children].filter(el => el !== newChat && el !== fold.item)
        for (const group of sidebar?.querySelectorAll<HTMLElement>('[data-sidebar="group"]') ?? []) {
          const label = group.querySelector('button[aria-expanded] > span')?.textContent?.trim()
          if (label && /^(项目|Projects)$/i.test(label)) targets.push(group)
        }
        for (const target of targets) if (target instanceof HTMLElement) {
          fold.targets.add(target)
          target.setAttribute('data-skm-grok-folded', String(!fold.details.open))
        }
      }
    }

    // Home hero & greeting
    const area = document.querySelector<HTMLElement>('#grok-content-area')
    const heading = area?.querySelector<HTMLElement>('h1:has(> span)') ?? area?.querySelector<HTMLElement>('[data-empty-chat-hero] h1')
    mark(heading, 'data-skm-grok-greeting')
    mark(heading?.parentElement?.parentElement, 'data-skm-grok-home')

    // Composer
    const ensureToggles = (host: HTMLElement) => {
      const toggles = add(host, 'skm-grok-toggles', 'div')
      if (!toggles.children.length) {
        for (const [label, icon] of [['深度思考', 'think'], ['智能搜索', 'search']]) {
          const button = document.createElement('button')
          button.type = 'button'
          button.className = `skm-grok-toggle skm-grok-toggle-${icon}`
          button.textContent = label
          button.setAttribute('aria-pressed', String(toggleStates.get(label) ?? false))
          button.title = '皮肤装饰开关，不改变 Grok 模型或搜索设置'
          button.addEventListener('click', () => {
            const active = button.getAttribute('aria-pressed') !== 'true'
            button.setAttribute('aria-pressed', String(active)); toggleStates.set(label, active)
          })
          toggles.append(button)
        }
      }
    }
    const legacyQuery = document.querySelector<HTMLElement>('.query-bar')
    if (legacyQuery) {
      const input = legacyQuery.querySelector<HTMLElement>('[data-testid="chat-input"]')
      let body = input?.parentElement
      while (body && body.parentElement !== legacyQuery) body = body.parentElement
      mark(body, 'data-skm-grok-input-body')
      let toolbar = legacyQuery.querySelector<HTMLElement>('[data-testid="attach-button"]')?.parentElement
      while (toolbar && toolbar !== legacyQuery && !toolbar.classList.contains('absolute')) toolbar = toolbar.parentElement
      if (toolbar !== legacyQuery) mark(toolbar, 'data-skm-grok-toolbar')
      if (deepseek && toolbar && toolbar !== legacyQuery) ensureToggles(toolbar)
    } else if (deepseek) {
      const composerForm = document.querySelector<HTMLElement>('form[data-composer]')
      if (composerForm) ensureToggles(composerForm)
    }
    syncPlaceholder()

    // Header controls
    const header = area?.querySelector<HTMLElement>('header')
    if (header) {
      for (const el of header.querySelectorAll<HTMLElement>('button, a')) {
        const label = el.getAttribute('aria-label') ?? ''
        const text = el.textContent?.trim() ?? ''
        if (el.hasAttribute('data-grok-bot-pill') || /Grok Bot/i.test(label) || /^Grok Bot$/i.test(text)) {
          mark(el, 'data-skm-grok-bot')
        }
        if (/Private|私密/i.test(label) || /^Private$/i.test(text) || el.matches('a[href*="#private"]')) {
          mark(el, 'data-skm-grok-private')
        }
        if (/^(更多|More|Conversation Actions)$/i.test(label)) mark(el, 'data-skm-grok-more')
        if (/创建共享链接|Create (?:a )?share|Share conversation/i.test(label)) mark(el, 'data-skm-grok-share')
        if (/切换右侧面板|Toggle right (?:side )?pan/i.test(label)) mark(el, 'data-skm-grok-panel')
      }
      const proxy = add(header, 'skm-grok-model', 'button') as HTMLButtonElement
      if (proxy.textContent !== modelLabel) proxy.textContent = modelLabel
      proxy.type = 'button'
      proxy.setAttribute('aria-haspopup', 'menu')
      proxy.setAttribute('aria-label', '选择实际 Grok 模型')
      proxy.title = '打开 Grok 原生模型选择菜单'
      proxy.onclick = () => document.querySelector<HTMLButtonElement>('form[data-composer] button[aria-label^="Model:"], #model-select-trigger, .query-bar button[aria-label^="Model:"]')?.click()
    }

    // Right pane toggle button (outside #grok-content-area header in new Grok)
    for (const btn of document.querySelectorAll<HTMLElement>('button[aria-label*="Toggle right pan" i], button[aria-label*="切换右侧面板"]')) {
      mark(btn, 'data-skm-grok-panel')
    }

    // Account trigger in footer
    for (const button of document.querySelectorAll<HTMLElement>('[data-account-trigger], [aria-label^="Account menu"]')) {
      const label = add(button, 'skm-grok-account')
      if (label.textContent !== username) label.textContent = username
    }

    // Fixed bottom-right Upgrade / Premium promo cards
    for (const el of document.querySelectorAll<HTMLElement>('h1, h2, h3, button, a')) {
      const text = el.textContent?.trim() ?? ''
      if (/^(Premium|SuperGrok|Upgrade to Premium|Upgrade to SuperGrok|Upgrade|升级)$/i.test(text)) {
        let card = el.parentElement
        while (card && getComputedStyle(card).position !== 'fixed' && card.parentElement !== document.body) card = card.parentElement
        if (card && getComputedStyle(card).position === 'fixed') mark(card, 'data-skm-grok-upgrade')
      }
    }
  }
  const schedule = () => { if (!stopped && !timer) timer = setTimeout(sync, 60) }
  const onInput = (event: Event) => {
    if (event.target instanceof HTMLElement && event.target.closest('form[data-composer], .query-bar')) syncPlaceholder()
  }
  const observer = new MutationObserver(schedule)
  observer.observe(document, {childList: true, subtree: true, attributes: true, attributeFilter: ['class']})
  document.addEventListener('input', onInput, true)
  getSiteState(location.hostname).then(s => { username = s.deepseekUsername ?? username; modelLabel = s.qwenModelLabel ?? modelLabel; schedule() }).catch(console.error)
  const unsubscribe = onSiteStateChange(location.hostname, s => { username = s.deepseekUsername ?? username; modelLabel = s.qwenModelLabel ?? modelLabel; schedule() })
  const routeTimer = setInterval(schedule, 500)
  schedule()
  return () => { stopped = true; observer.disconnect(); document.removeEventListener('input', onInput, true); unsubscribe(); clearInterval(routeTimer); if (timer) clearTimeout(timer); clear() }
}
