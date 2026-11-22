/** Own only decorative DeepSeek toggles; React retains every native Claude control. */
export function mountClaudeUi(): () => void {
  let stopped = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const toggleStates = new Map<string, boolean>()
  const owned = new Set<HTMLElement>()

  const clear = () => {
    for (const el of owned) el.remove()
    owned.clear()
  }

  const sync = () => {
    timer = undefined
    if (stopped) return
    const root = document.documentElement
    if (!root?.classList.contains('skm-mask-on')) { clear(); return }
    const deepseek = getComputedStyle(root).getPropertyValue('--skm-deepseek').trim() === '1'
    for (const el of owned) if (!el.isConnected) owned.delete(el)
    if (!deepseek) { clear(); return }

    for (const actions of document.querySelectorAll<HTMLElement>('[data-cds="ChatComposerActions"]')) {
      let toggles = actions.querySelector<HTMLElement>(':scope > .skm-claude-toggles')
      if (!toggles) {
        toggles = document.createElement('div')
        toggles.className = 'skm-claude-toggles'
        toggles.dataset.skmOwned = 'true'
        for (const [label, icon] of [['深度思考', 'think'], ['智能搜索', 'search']]) {
          const button = document.createElement('button')
          button.type = 'button'
          button.className = `skm-claude-toggle skm-claude-toggle-${icon}`
          button.textContent = label
          button.setAttribute('aria-pressed', String(toggleStates.get(icon) ?? false))
          button.title = '外观开关；Claude 推理与联网仍由原生模型和工具菜单控制'
          button.addEventListener('click', () => {
            const active = button.getAttribute('aria-pressed') !== 'true'
            button.setAttribute('aria-pressed', String(active))
            toggleStates.set(icon, active)
          })
          toggles.append(button)
        }
        actions.prepend(toggles)
        owned.add(toggles)
      }
    }
  }

  const schedule = () => { if (!stopped && timer === undefined) timer = setTimeout(sync, 60) }
  const observer = new MutationObserver(schedule)
  observer.observe(document, {subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'data-mode']})
  schedule()

  return () => {
    stopped = true
    if (timer !== undefined) clearTimeout(timer)
    observer.disconnect()
    clear()
  }
}
