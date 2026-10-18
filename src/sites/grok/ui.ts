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
  const sync = () => {
    timer = undefined
    if (stopped) return
    if (!document.documentElement?.classList.contains('skm-mask-on')) { clear(); return }
    for (const el of owned) if (!el.isConnected) owned.delete(el)
    for (const el of marked) if (!el.isConnected) marked.delete(el)
    const deepseek = getComputedStyle(document.documentElement).getPropertyValue('--skm-deepseek').trim() === '1'
    const sidebar = document.querySelector<HTMLElement>('[data-sidebar="sidebar"]')
    for (const group of sidebar?.querySelectorAll<HTMLElement>('[data-sidebar="group"]') ?? []) {
      const plugin = [...group.querySelectorAll('button')].find(button => /^(插件|Connectors|Extensions)$/i.test(button.textContent?.trim() ?? ''))
      if (plugin) mark(group, 'data-skm-grok-plugins')
      for (const button of group.querySelectorAll<HTMLElement>('button[aria-expanded]')) {
        const label = button.querySelector<HTMLElement>(':scope > span')
        if (label && /^(聊天|Chats)$/i.test(label.textContent?.trim() ?? '')) mark(label, 'data-skm-grok-recents')
      }
    }
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
    const area = document.querySelector<HTMLElement>('#grok-content-area')
    const heading = area?.querySelector<HTMLElement>('h1:has(> span)')
    mark(heading, 'data-skm-grok-greeting')
    mark(heading?.parentElement?.parentElement, 'data-skm-grok-home')
    const query = document.querySelector<HTMLElement>('.query-bar')
    if (query) {
      const input = query.querySelector<HTMLElement>('[data-testid="chat-input"]')
      let body = input?.parentElement
      while (body && body.parentElement !== query) body = body.parentElement
      mark(body, 'data-skm-grok-input-body')
      let toolbar = query.querySelector<HTMLElement>('[data-testid="attach-button"]')?.parentElement
      while (toolbar && toolbar !== query && !toolbar.classList.contains('absolute')) toolbar = toolbar.parentElement
      if (toolbar !== query) mark(toolbar, 'data-skm-grok-toolbar')
      if (deepseek && toolbar && toolbar !== query) {
        const toggles = add(toolbar, 'skm-grok-toggles', 'div')
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
      const editor = query.querySelector<HTMLElement>('[contenteditable="true"]')
      if (editor && input) {
        const hint = add(input, 'skm-grok-placeholder')
        hint.setAttribute('aria-hidden', 'true')
        hint.hidden = !!editor.textContent?.trim()
      }
    }
    const header = area?.querySelector<HTMLElement>('header')
    if (header) {
      for (const button of header.querySelectorAll<HTMLElement>('button')) {
        const label = button.getAttribute('aria-label') ?? ''
        if (/^(更多|More)$/i.test(label)) mark(button, 'data-skm-grok-more')
        if (/创建共享链接|Create (?:a )?share|Share conversation/i.test(label)) mark(button, 'data-skm-grok-share')
        if (/切换右侧面板|Toggle right (?:side )?panel/i.test(label)) mark(button, 'data-skm-grok-panel')
      }
      const proxy = add(header, 'skm-grok-model', 'button') as HTMLButtonElement
      if (proxy.textContent !== modelLabel) proxy.textContent = modelLabel
      proxy.type = 'button'
      proxy.setAttribute('aria-haspopup', 'menu')
      proxy.setAttribute('aria-label', '选择实际 Grok 模型')
      proxy.title = '打开 Grok 原生模型选择菜单'
      proxy.onclick = () => document.querySelector<HTMLButtonElement>('.query-bar button[aria-label^="Model:"]')?.click()
      const title = add(header, 'skm-grok-title')
      const path = location.pathname
      const link = [...document.querySelectorAll<HTMLAnchorElement>('[data-sidebar] a[href]')].find(a => new URL(a.href).pathname === path && path.startsWith('/c/'))
      const label = link?.innerText.trim() || '新对话'
      if (title.textContent !== label) title.textContent = label
    }
    for (const button of document.querySelectorAll<HTMLElement>('[aria-label^="Account menu"]')) {
      const label = add(button, 'skm-grok-account')
      if (label.textContent !== username) label.textContent = username
    }
    // The promotion remains in its native position and reveals on hover or focus.
    for (const h of document.querySelectorAll<HTMLElement>('h1')) {
      if (h.textContent === 'Premium') {
        let card = h.parentElement
        while (card && getComputedStyle(card).position !== 'fixed' && card.parentElement !== document.body) card = card.parentElement
        if (card && getComputedStyle(card).position === 'fixed') mark(card, 'data-skm-grok-extra')
      }
    }
  }
  const schedule = () => { if (!stopped && !timer) timer = setTimeout(sync, 60) }
  const observer = new MutationObserver(schedule)
  observer.observe(document, {childList: true, subtree: true, attributes: true, attributeFilter: ['class']})
  getSiteState(location.hostname).then(s => { username = s.deepseekUsername ?? username; modelLabel = s.qwenModelLabel ?? modelLabel; schedule() }).catch(console.error)
  const unsubscribe = onSiteStateChange(location.hostname, s => { username = s.deepseekUsername ?? username; modelLabel = s.qwenModelLabel ?? modelLabel; schedule() })
  const routeTimer = setInterval(schedule, 500)
  schedule()
  return () => { stopped = true; observer.disconnect(); unsubscribe(); clearInterval(routeTimer); if (timer) clearTimeout(timer); clear() }
}
