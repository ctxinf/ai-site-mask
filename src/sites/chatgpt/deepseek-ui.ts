import {DEFAULT_DEEPSEEK_USERNAME, getSiteState, onSiteStateChange} from '../../core/storage'

/** Small reversible enhancements; never move React-owned nodes. */
export function mountDeepseekUi(): () => void {
  const folds = new Map<HTMLElement, {details: HTMLDetailsElement; targets: Set<HTMLElement>}>()
  const accounts = new Map<HTMLElement, HTMLSpanElement>()
  const toggles = new Map<HTMLElement, HTMLDivElement>()
  const toggleStates = new Map<string, boolean>()
  let username = DEFAULT_DEEPSEEK_USERNAME
  const titles = new Map<HTMLElement, HTMLDivElement>()
  let extrasOpen = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let stopped = false
  const clean = () => {
    for (const {details, targets} of folds.values()) {
      for (const target of targets) target.removeAttribute('data-skm-folded')
      details.remove()
    }
    folds.clear()
    for (const [row, label] of accounts) {
      row.removeAttribute('data-skm-account')
      label.remove()
    }
    accounts.clear()
    for (const controls of toggles.values()) controls.remove()
    toggles.clear()
    for (const button of titles.values()) button.remove()
    titles.clear()
  }
  const sync = () => {
    timer = undefined
    if (stopped) return
    if (!document.documentElement) { schedule(); return }
    const enabled = document.documentElement.classList.contains('skm-mask-on') &&
      getComputedStyle(document.documentElement).getPropertyValue('--skm-deepseek').trim() === '1'
    if (!enabled) { clean(); return }
    for (const [scroll, group] of folds) {
      if (!scroll.isConnected || !group.details.isConnected) {
        for (const target of group.targets) target.removeAttribute('data-skm-folded')
        group.details.remove()
        folds.delete(scroll)
      }
    }
    for (const scroll of document.querySelectorAll<HTMLElement>('[data-app-action-sidebar-scroll]')) {
      let group = folds.get(scroll)
      if (!group) {
        const details = document.createElement('details')
        details.className = 'skm-deepseek-fold'
        details.dataset.skmOwned = 'true'
        details.open = extrasOpen
        const summary = document.createElement('summary')
        summary.setAttribute('aria-label', '展开或折叠功能、置顶和项目')
        summary.title = '功能、置顶和项目'
        details.append(summary)
        group = {details, targets: new Set()}
        const current = group
        details.addEventListener('toggle', () => {
          extrasOpen = details.open
          for (const target of current.targets) target.setAttribute('data-skm-folded', String(!details.open))
        })
        scroll.prepend(details)
        folds.set(scroll, group)
      }
      const features = [...scroll.children].find(e => e !== group.details && e.querySelector('[data-sidebar-destination]') && !e.querySelector('[data-app-action-sidebar-section-heading]'))
      const targets = [features, ...scroll.querySelectorAll<HTMLElement>('[data-app-action-sidebar-section-heading="Pinned"], [data-app-action-sidebar-section-heading="Projects"]')]
      for (const target of targets) {
        if (!(target instanceof HTMLElement)) continue
        group.targets.add(target)
        target.setAttribute('data-skm-folded', String(!group.details.open))
      }
    }
    for (const [row, label] of accounts) {
      if (!row.isConnected) { label.remove(); accounts.delete(row) }
    }
    for (const button of document.querySelectorAll<HTMLElement>('button:is([aria-label="打开个人资料菜单"], [aria-label="Open profile menu" i])')) {
      const row = button.parentElement
      if (!row?.querySelector(':scope > .pointer-events-none')) continue
      row.setAttribute('data-skm-account', 'true')
      let label = accounts.get(row)
      if (!label) {
        label = document.createElement('span')
        label.className = 'skm-deepseek-account-label'
        label.dataset.skmOwned = 'true'
        row.append(label)
        accounts.set(row, label)
      }
      if (label.textContent !== username) label.textContent = username
    }
    for (const [body, controls] of toggles) {
      if (!body.isConnected) { controls.remove(); toggles.delete(body) }
    }
    for (const body of document.querySelectorAll<HTMLElement>('[data-composer-body]')) {
      if (toggles.has(body)) continue
      const controls = document.createElement('div')
      controls.className = 'skm-deepseek-toggles'
      controls.dataset.skmOwned = 'true'
      for (const [label, icon] of [['深度思考', 'think'], ['智能搜索', 'search']]) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = `skm-deepseek-toggle skm-deepseek-toggle-${icon}`
        button.textContent = label
        button.setAttribute('aria-pressed', String(toggleStates.get(label) ?? false))
        button.addEventListener('click', () => {
          const active = button.getAttribute('aria-pressed') !== 'true'
          button.setAttribute('aria-pressed', String(active))
          toggleStates.set(label, active)
        })
        controls.append(button)
      }
      body.append(controls)
      toggles.set(body, controls)
    }
    const conversation = location.pathname.match(/\/c\/([^/]+)/)?.[1]
    const link = conversation ? [...document.querySelectorAll<HTMLAnchorElement>('a[href]')].find(a => {
      try { return new URL(a.href).pathname === `/c/${conversation}` && a.querySelector('[data-thread-title]') }
      catch { return false }
    }) : undefined
    const generated = link?.querySelector('[data-thread-title]')?.textContent?.trim()
    const key = `skm-deepseek-title:${conversation ?? location.pathname}`
    let custom: string | null = null
    try { custom = sessionStorage.getItem(key) } catch { /* Storage may be unavailable. */ }
    const label = custom || generated || (conversation ? '当前对话' : '新对话')
    for (const [header, button] of titles) {
      if (!header.isConnected) { button.remove(); titles.delete(header) }
    }
    for (const header of document.querySelectorAll<HTMLElement>('[data-app-shell-main-titlebar]')) {
      let button = titles.get(header)
      if (!button) {
        button = document.createElement('div')
        button.role = 'button'
        button.tabIndex = 0
        button.addEventListener('keydown', e => {
          if (e.target === button && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); button!.click() }
        })
        button.className = 'skm-deepseek-chat-title'
        button.dataset.skmOwned = 'true'
        button.setAttribute('aria-label', '编辑当前对话显示标题')
        button.addEventListener('click', () => {
          if (button!.querySelector('input')) return
          const input = document.createElement('input')
          input.className = 'skm-deepseek-title-input'
          input.value = button!.textContent ?? ''
          input.maxLength = 120
          input.setAttribute('aria-label', '当前对话显示标题')
          let done = false
          const finish = (save: boolean) => {
            if (done) return
            done = true
            if (save) {
              try {
                const value = input.value.trim()
                if (value) sessionStorage.setItem(key, value)
                else sessionStorage.removeItem(key)
              } catch { /* Display still updates in this page. */ }
            }
            button!.textContent = save ? input.value.trim() || generated || '当前对话' : label
            schedule()
          }
          input.addEventListener('keydown', e => {
            e.stopPropagation()
            if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); finish(e.key === 'Enter') }
          })
          input.addEventListener('click', e => e.stopPropagation())
          input.addEventListener('blur', () => finish(true))
          button!.replaceChildren(input)
          input.focus()
          input.select()
        })
        header.prepend(button)
        titles.set(header, button)
      }
      // Recreate on route changes so edit handlers capture the current conversation.
      if (button.dataset.route !== location.pathname && button.dataset.route) {
        button.remove(); titles.delete(header); schedule(); continue
      }
      button.dataset.route = location.pathname
      if (!button.querySelector('input') && button.textContent !== label) button.textContent = label
      if (button.title !== label) button.title = label
    }
  }
  const schedule = () => { if (!stopped && timer === undefined) timer = setTimeout(sync, 60) }
  const observer = new MutationObserver(schedule)
  observer.observe(document, {subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: ['class', 'href', 'aria-current']})
  window.addEventListener('popstate', schedule)
  const unsubscribe = onSiteStateChange(location.hostname, state => {
    username = state.deepseekUsername ?? DEFAULT_DEEPSEEK_USERNAME
    schedule()
  })
  getSiteState(location.hostname).then(state => {
    username = state.deepseekUsername ?? DEFAULT_DEEPSEEK_USERNAME
    schedule()
  }).catch(() => {})
  schedule()
  return () => {
    stopped = true
    if (timer !== undefined) clearTimeout(timer)
    observer.disconnect()
    unsubscribe()
    window.removeEventListener('popstate', schedule)
    clean()
  }
}
