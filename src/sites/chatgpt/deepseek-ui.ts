/** Small reversible enhancements; never move React-owned nodes. */
export function mountDeepseekUi(): () => void {
  const folds = new Map<HTMLElement, HTMLDetailsElement>()
  const titles = new Map<HTMLElement, HTMLDivElement>()
  const openStates = new Map<string, boolean>()
  let timer: ReturnType<typeof setTimeout> | undefined
  let stopped = false
  const clean = () => {
    for (const [target, details] of folds) {
      target.removeAttribute('data-skm-folded')
      details.remove()
    }
    folds.clear()
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
    for (const [target, details] of folds) {
      if (!target.isConnected || !details.isConnected) {
        target.removeAttribute('data-skm-folded')
        details.remove()
        folds.delete(target)
      }
    }
    const candidates: [HTMLElement, string][] = []
    for (const scroll of document.querySelectorAll<HTMLElement>('[data-app-action-sidebar-scroll]')) {
      const features = scroll.firstElementChild as HTMLElement | null
      if (features?.querySelector('[data-sidebar-destination]')) candidates.push([features, '功能'])
      for (const section of scroll.querySelectorAll<HTMLElement>('[data-app-action-sidebar-section-heading]')) {
        const heading = section.getAttribute('data-app-action-sidebar-section-heading') ?? ''
        if (/pinned|置顶/i.test(heading)) candidates.push([section, '置顶'])
        if (/projects|项目/i.test(heading)) candidates.push([section, '项目'])
      }
    }
    for (const [target, label] of candidates) {
      if (folds.has(target)) continue
      const details = document.createElement('details')
      details.className = 'skm-deepseek-fold'
      details.dataset.skmOwned = 'true'
      details.open = openStates.get(label) ?? false
      const summary = document.createElement('summary')
      summary.textContent = label
      details.append(summary)
      const update = () => {
        openStates.set(label, details.open)
        target.setAttribute('data-skm-folded', String(!details.open))
      }
      details.addEventListener('toggle', update)
      update()
      target.before(details)
      folds.set(target, details)
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
  schedule()
  return () => {
    stopped = true
    if (timer !== undefined) clearTimeout(timer)
    observer.disconnect()
    window.removeEventListener('popstate', schedule)
    clean()
  }
}
