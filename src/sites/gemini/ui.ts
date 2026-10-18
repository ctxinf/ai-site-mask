import {DEFAULT_DEEPSEEK_USERNAME, DEFAULT_QWEN_MODEL_LABEL, getSiteState, onSiteStateChange} from '../../core/storage'

export const isGeminiChat = () => /^\/(?:u\/\d+\/)?app(?:\/[^/]+)?\/?$/.test(location.pathname)

/** Mark native landmarks and add removable decoration; never move Angular-owned nodes. */
export function mountGeminiUi(): () => void {
  let stopped = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let username = DEFAULT_DEEPSEEK_USERNAME
  let modelLabel = DEFAULT_QWEN_MODEL_LABEL
  let extrasOpen = true
  const toggleStates = new Map<string, boolean>()
  const owned = new Set<HTMLElement>()
  const marked = new Map<HTMLElement, Set<string>>()
  const mark = (el: HTMLElement | null | undefined, name: string, value = '') => {
    if (!el) return
    const attr = `data-skm-gemini-${name}`
    if (el.getAttribute(attr) !== value) el.setAttribute(attr, value)
    if (!marked.has(el)) marked.set(el, new Set())
    marked.get(el)!.add(attr)
  }
  const add = (parent: HTMLElement, cls: string, tag = 'span') => {
    let el = parent.querySelector<HTMLElement>(`:scope > .${cls}`)
    if (!el) {
      el = document.createElement(tag)
      el.className = cls
      el.dataset.skmOwned = 'true'
      parent.append(el)
      owned.add(el)
    }
    return el
  }
  const removeOwned = (cls: string) => {
    for (const el of owned) if (el.classList.contains(cls)) { el.remove(); owned.delete(el) }
  }
  const clear = () => {
    for (const el of owned) el.remove()
    owned.clear()
    for (const [el, attrs] of marked) for (const attr of attrs) el.removeAttribute(attr)
    marked.clear()
  }
  const nativeModel = () => document.querySelector<HTMLButtonElement>('button[data-test-id="bard-mode-menu-button"], button[aria-label^="Open mode picker"]')
  const schedule = () => { if (!stopped && timer === undefined) timer = setTimeout(sync, 60) }
  const sync = () => {
    timer = undefined
    if (stopped) return
    if (!document.documentElement?.classList.contains('skm-mask-on') || !isGeminiChat()) { clear(); return }
    for (const el of owned) if (!el.isConnected) owned.delete(el)
    for (const el of marked.keys()) if (!el.isConnected) marked.delete(el)
    const deepseek = getComputedStyle(document.documentElement).getPropertyValue('--skm-deepseek').trim() === '1'
    const home = /^\/(?:u\/\d+\/)?app\/?$/.test(location.pathname)
    mark(document.documentElement, 'page', home ? 'home' : 'thread')
    const sidebar = document.querySelector<HTMLElement>('bard-sidenav, mat-sidenav')
    const extras = new Set<HTMLElement>()
    for (const list of sidebar?.querySelectorAll<HTMLElement>('[aria-label="Additional actions menu"]') ?? []) {
      // Fade individual hit targets so hovering one item doesn't reveal the whole group.
      for (const item of list.querySelectorAll<HTMLElement>('gem-nav-list-item, .icon-button-badge-container')) mark(item, 'extra')
      extras.add(list)
    }
    for (const projects of sidebar?.querySelectorAll<HTMLElement>('project-sidenav-list, a[href*="/notebooks"]') ?? []) {
      const section = projects.closest<HTMLElement>('expandable-section') ?? projects
      mark(section, 'extra')
      extras.add(section)
    }
    for (const el of sidebar?.querySelectorAll<HTMLElement>('a[href]') ?? []) {
      const path = new URL((el as HTMLAnchorElement).href).pathname
      if (/\/(?:u\/\d+\/)?app\/?$/.test(path)) mark(el, 'new-chat')
      else if (/\/(?:u\/\d+\/)?app\/[^/]+\/?$/.test(path)) mark(el, 'history')
    }
    for (const label of sidebar?.querySelectorAll<HTMLElement>('expandable-section:has(conversations-list) .expandable-section-header-text, expandable-section:has(conversations-list) .expandable-section-header > span') ?? []) mark(label, 'recents')

    const newChat = sidebar?.querySelector<HTMLElement>('[data-skm-gemini-new-chat]')?.closest<HTMLElement>('mat-nav-list')
    if (deepseek && newChat && extras.size) {
      const fold = add(newChat.parentElement!, 'skm-gemini-fold', 'button') as HTMLButtonElement
      fold.type = 'button'
      fold.setAttribute('aria-label', '展开或折叠功能和笔记本')
      if (fold.getAttribute('aria-expanded') !== String(extrasOpen)) fold.setAttribute('aria-expanded', String(extrasOpen))
      fold.title = '功能和笔记本'
      if (newChat.nextElementSibling !== fold) newChat.after(fold)
      fold.onclick = () => { extrasOpen = !extrasOpen; schedule() }
      for (const target of extras) mark(target, 'folded', String(!extrasOpen))
    } else {
      removeOwned('skm-gemini-fold')
      for (const [el, attrs] of marked) if (attrs.has('data-skm-gemini-folded')) el.removeAttribute('data-skm-gemini-folded')
    }

    // Only the zero-state heading is decoration. Never target headings inside messages.
    if (home) {
      for (const heading of document.querySelectorAll<HTMLElement>('modular-zero-state assistant-messages-primary h1[data-test-id="message"]')) mark(heading, 'greeting')
    }
    const field = document.querySelector<HTMLElement>('input-area-v2 .text-input-field')
    if (field) {
      const editor = field.querySelector<HTMLElement>('[role="textbox"][contenteditable="true"]')
      if (editor) mark(editor, 'editor')
      if (deepseek) {
        const toggles = add(field, 'skm-gemini-toggles', 'div')
        if (!toggles.children.length) for (const [label, icon] of [['深度思考', 'think'], ['智能搜索', 'search']]) {
          const button = document.createElement('button')
          button.type = 'button'
          button.className = `skm-gemini-toggle skm-gemini-toggle-${icon}`
          button.textContent = label
          button.setAttribute('aria-pressed', String(toggleStates.get(icon) ?? false))
          button.title = '外观开关；Gemini 推理与联网仍由原生模型和工具菜单控制'
          button.onclick = () => {
            const active = button.getAttribute('aria-pressed') !== 'true'
            button.setAttribute('aria-pressed', String(active)); toggleStates.set(icon, active)
          }
          toggles.append(button)
        }
      } else removeOwned('skm-gemini-toggles')
    }

    const main = document.querySelector<HTMLElement>('bard-sidenav-content')
    const header = main ? add(main, 'skm-gemini-header', 'div') : null
    if (header) {
      if (deepseek) {
        removeOwned('skm-gemini-model')
        const title = add(header, 'skm-gemini-title', 'div')
        title.role = 'button'
        title.tabIndex = 0
        title.onkeydown = event => {
          if (event.target === title && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); title.click() }
        }
        title.setAttribute('aria-label', '编辑当前对话显示标题')
        const link = [...(sidebar?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? [])].find(a => new URL(a.href).pathname === location.pathname)
        const generated = home ? '新对话' : link?.textContent?.trim() || '当前对话'
        const key = `skm-gemini-title:${location.pathname}`
        let custom: string | null = null
        try { custom = sessionStorage.getItem(key) } catch { /* Optional display title. */ }
        const label = custom || generated
        if (!title.querySelector('input') && title.textContent !== label) title.textContent = label
        title.title = label
        title.onclick = () => {
          if (title.querySelector('input')) return
          const input = document.createElement('input')
          input.value = title.textContent ?? ''
          input.maxLength = 120
          input.setAttribute('aria-label', '当前对话显示标题')
          const path = location.pathname
          let done = false
          const finish = (save: boolean) => {
            if (done) return
            done = true
            if (save && location.pathname === path) {
              try {
                if (input.value.trim()) sessionStorage.setItem(key, input.value.trim())
                else sessionStorage.removeItem(key)
              } catch { /* Session storage may be disabled. */ }
            }
            title.textContent = save ? input.value.trim() || generated : label
            schedule()
          }
          input.onkeydown = event => {
            event.stopPropagation()
            if (event.key === 'Enter' || event.key === 'Escape') { event.preventDefault(); finish(event.key === 'Enter') }
          }
          input.onclick = event => event.stopPropagation()
          input.onblur = () => finish(true)
          title.replaceChildren(input); input.focus(); input.select()
        }
      } else {
        removeOwned('skm-gemini-title')
        const proxy = add(header, 'skm-gemini-model', 'button') as HTMLButtonElement
        proxy.type = 'button'
        if (proxy.textContent !== modelLabel) proxy.textContent = modelLabel
        proxy.setAttribute('aria-label', '选择 Gemini 实际模型')
        proxy.setAttribute('aria-haspopup', 'menu')
        const model = nativeModel()
        const expanded = model?.getAttribute('aria-expanded') ?? 'false'
        if (proxy.getAttribute('aria-expanded') !== expanded) proxy.setAttribute('aria-expanded', expanded)
        proxy.disabled = !model
        proxy.title = model?.getAttribute('aria-label') ?? '等待 Gemini 模型选择器'
        proxy.onclick = () => nativeModel()?.click()
      }
    }
    for (const account of document.querySelectorAll<HTMLElement>('sidenav-mavatar-footer .mavatar-footer-left')) {
      if (deepseek) {
        mark(account, 'account')
        const label = add(account, 'skm-gemini-account')
        if (label.textContent !== username) label.textContent = username
      } else account.removeAttribute('data-skm-gemini-account')
    }
    if (!deepseek) removeOwned('skm-gemini-account')
    // Gemini can render the same notice in different containers across SPA routes.
    for (const notice of document.querySelectorAll<HTMLElement>('hallucination-disclaimer .capabilities-disclaimer > p:not([data-test-id="empty-disclaimer"])')) {
      if (notice.textContent?.trim() && !notice.querySelector('a,button')) mark(notice, 'accuracy')
    }
  }
  const observer = new MutationObserver(schedule)
  observer.observe(document, {subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: ['class', 'href', 'aria-current', 'aria-expanded']})
  const unsubscribe = onSiteStateChange(location.hostname, state => {
    username = state.deepseekUsername ?? DEFAULT_DEEPSEEK_USERNAME
    modelLabel = state.qwenModelLabel ?? DEFAULT_QWEN_MODEL_LABEL
    schedule()
  })
  getSiteState(location.hostname).then(state => {
    username = state.deepseekUsername ?? DEFAULT_DEEPSEEK_USERNAME
    modelLabel = state.qwenModelLabel ?? DEFAULT_QWEN_MODEL_LABEL
    schedule()
  }).catch(console.error)
  let previousPath = location.pathname
  const routeTimer = setInterval(() => {
    if (location.pathname !== previousPath) { previousPath = location.pathname; removeOwned('skm-gemini-title'); schedule() }
  }, 100)
  window.addEventListener('popstate', schedule)
  schedule()
  return () => {
    stopped = true
    if (timer !== undefined) clearTimeout(timer)
    clearInterval(routeTimer); observer.disconnect(); unsubscribe()
    window.removeEventListener('popstate', schedule)
    clear()
  }
}
