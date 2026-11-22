import {qwenPaletteCss} from '../../themes/qwen'
import {deepseekPaletteCss} from '../../themes/deepseek'

/** Grok adapter: share palettes, target native Grok landmarks and controls. */
export function grokThemeCss(theme?: string): string {
  const deepseek = theme === 'deepseek'
  const token = (qwen: string, deep: string) => `var(--skm-${deepseek ? deep : `qwen-${qwen}`})`
  const page = token('page', 'page'), sidebar = token('sidebar', 'sidebar')
  const text = token('text', 'text'), secondary = token('secondary', 'text-2')
  const muted = token('muted', 'text-3'), border = token('border', 'border')
  const hover = token('hover', 'hover'), accent = token('accent', 'blue')
  const composer = token('composer', 'composer'), bubble = token('bubble', 'user-bubble')
  const logo = deepseek ? `url("${chrome.runtime.getURL('images/deepseek-logo.svg')}")` : 'var(--skm-qwen-logo)'
  const variables: Record<string, string> = {
    'surface-base': page, 'surface-l1': sidebar, 'surface-l2': composer,
    'surface-l3': hover, 'surface-l4': hover, 'surface-inset': sidebar,
    'surface-composer': composer, 'surface-user-bubble': bubble,
    'surface-l1-hover': hover, 'surface-l2-hover': hover,
    'fg-primary': text, 'fg-secondary': secondary, 'fg-tertiary': muted,
    'fg-quaternary': muted, 'fg-accent': accent, 'fg-link': accent,
    'border-default': border, 'border-composer': border, 'input-border-focus': accent,
    'background': page, 'background-color': page, 'foreground': text,
    'input-background': composer, 'sidebar': sidebar, 'sidebar-foreground': text,
    'sidebar-accent': hover, 'sidebar-border': border, 'ring': accent,
    'button-ghost-hover': hover, 'button-ghost-active': hover,
    'button-secondary-fill-hover': hover, 'button-secondary-fill-active': hover,
  }
  const declarations = Object.entries(variables).map(([key, value]) =>
    `--${key}: ${value} !important; --color-${key}: ${value} !important;`).join('\n')
  return `${deepseek ? deepseekPaletteCss : qwenPaletteCss}
html.skm-mask-on {
  ${declarations}
  color-scheme: ${token('scheme', 'scheme')} !important;
  background: ${page} !important;
  color: ${text} !important;
  font-family: Inter, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
}
html.skm-mask-on body, html.skm-mask-on #grok-content-area { background: ${page} !important; color: ${text}; }
html.skm-mask-on #grok-content-area header { position: absolute !important; inset: 0 0 auto; height: 56px; z-index: 40; background: ${page}; }
html.skm-mask-on [data-sidebar="sidebar"],
html.skm-mask-on [data-skm-grok-sidebar] { background: ${sidebar} !important; }
html.skm-mask-on [data-sidebar="menu-button"] { border-radius: 10px; }
html.skm-mask-on [data-sidebar="menu-button"]:hover { background: ${hover} !important; }
html.skm-mask-on [data-sidebar="header"] a[href="/"] {
  background-image: ${logo}; background-position: center; background-repeat: no-repeat;
  background-size: contain; width: ${deepseek ? '144px' : '90px'}; height: 30px;
}
html.skm-mask-on [data-sidebar="header"] a[href="/"] > svg { visibility: hidden; }
html.skm-mask-on [data-skm-grok-sidebar] > header { position: relative; display: flex !important; align-items: center !important; justify-content: flex-start !important; }
html.skm-mask-on .skm-grok-brand {
  display: block; margin-left: 14px !important; margin-right: auto !important;
  background-image: ${logo}; background-position: left center; background-repeat: no-repeat;
  background-size: contain; width: ${deepseek ? '124px' : '88px'}; height: 26px;
  pointer-events: none;
}
html.skm-mask-on [data-skm-grok-chrome-open="true"] { justify-content: flex-end !important; padding-right: 10px !important; }
html.skm-mask-on [data-skm-grok-chrome-open="true"] [data-leading-chrome] { margin-left: auto !important; }
html.skm-mask-on .query-bar,
html.skm-mask-on form[data-composer] {
  background: ${composer} !important; border: 1px solid ${border} !important;
  border-radius: ${deepseek ? '26px' : '28px'} !important; box-shadow: 0 4px 20px #00000006;
}
html.skm-mask-on .query-bar:focus-within,
html.skm-mask-on form[data-composer]:focus-within { border-color: ${border} !important; }
html.skm-mask-on [data-testid="user-message"] { background: ${bubble} !important; border-radius: 18px; }
html.skm-mask-on [data-testid="assistant-message"] { line-height: 1.8; }
html.skm-mask-on [data-sidebar="menu-button"][href="/imagine"],
html.skm-mask-on [data-sidebar="menu-button"][href="/library"],
html.skm-mask-on [data-sidebar="menu-button"][href="/automations"],
html.skm-mask-on [data-skm-grok-extra-nav],
html.skm-mask-on [data-account-action],
html.skm-mask-on [data-slot="composer-suggestions"] { opacity: var(--skm-extra-opacity); transition: opacity .15s; }
html.skm-mask-on [data-sidebar="menu-button"][href="/imagine"]:is(:hover,:focus-visible),
html.skm-mask-on [data-sidebar="menu-button"][href="/library"]:is(:hover,:focus-visible),
html.skm-mask-on [data-sidebar="menu-button"][href="/automations"]:is(:hover,:focus-visible),
html.skm-mask-on [data-skm-grok-extra-nav]:is(:hover,:focus-visible),
html.skm-mask-on [data-account-action]:is(:hover,:focus-visible),
html.skm-mask-on [data-slot="composer-suggestions"]:is(:hover,:focus-within) { opacity: 1; }
${layoutCss(deepseek)}
`
}

function layoutCss(deepseek: boolean): string {
  return `
html.skm-mask-on [data-sidebar="sidebar"],
html.skm-mask-on [data-skm-grok-sidebar] { border-right: 1px solid ${deepseek ? 'var(--skm-border)' : 'transparent'}; }
html.skm-mask-on [data-sidebar="header"] { height: 48px; padding: 0 8px; gap: 4px; }
html.skm-mask-on [data-sidebar="header"] > :first-child { margin-right: auto; }
html.skm-mask-on [data-testid="new-chat"],
html.skm-mask-on [data-skm-grok-new-chat] { height: ${deepseek ? '42px' : '38px'}; border-radius: ${deepseek ? '24px' : '10px'} !important; background: ${deepseek ? 'var(--skm-new-chat)' : 'var(--skm-qwen-active)'} !important; border-color: transparent !important; }
html.skm-mask-on [data-testid="new-chat"] { margin-top: 5px; justify-content: ${deepseek ? 'center' : 'flex-start'}; }
html.skm-mask-on [data-testid="new-chat"] > span,
html.skm-mask-on [data-skm-grok-new-chat] [data-sidebar-item-label] { font-size: 0 !important; }
html.skm-mask-on [data-testid="new-chat"] > span::after,
html.skm-mask-on [data-skm-grok-new-chat] [data-sidebar-item-label]::after { content: "${deepseek ? '开启新对话' : '新聊天'}"; font-size: 14px; }
html.skm-mask-on [data-skm-grok-new-chat] [data-slot="sidebar-item-shortcut"] { display: none !important; }
html.skm-mask-on [data-sidebar="menu-button"][href^="/c/"] { min-height: 36px; font-size: 14px; }
html.skm-mask-on [data-sidebar="footer"],
html.skm-mask-on [data-skm-grok-sidebar] > footer { border-top: 1px solid ${deepseek ? 'transparent' : 'var(--skm-qwen-border)'}; }
html.skm-mask-on [data-sidebar="footer"] { padding: 8px 12px; }
html.skm-mask-on [aria-label^="Account menu"],
html.skm-mask-on [data-account-trigger] { min-height: 40px; }
html.skm-mask-on .skm-grok-account { display: ${deepseek ? 'block' : 'none'}; font-size: 14px; color: var(--skm-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
${deepseek ? `
html.skm-mask-on [aria-label^="Account menu"] > div:not(.skm-grok-account) { display: none; }
html.skm-mask-on [data-account-trigger] > span:not(.skm-grok-account) > span:not(:first-child),
html.skm-mask-on [data-account-trigger] [data-sidebar-item-label] { display: none !important; }
` : ''}
html.skm-mask-on [data-skm-grok-home] { padding-top: max(100px, calc(${deepseek ? '34' : '35'}dvh - 8px)) !important; gap: ${deepseek ? '28px' : '20px'} !important; height: auto !important; }
html.skm-mask-on [data-skm-grok-home] > :first-child { padding-bottom: 0 !important; }
html.skm-mask-on [data-skm-grok-greeting] { font-size: 0 !important; line-height: 1.4; font-weight: ${deepseek ? '600' : '400'} !important; display: flex; align-items: center; justify-content: center; gap: 12px; }
html.skm-mask-on [data-skm-grok-greeting] > * { display: none; }
html.skm-mask-on [data-skm-grok-greeting]::after { content: "${deepseek ? '你好，让我们开始聊天吧' : '有什么可以帮你的吗？'}"; font-size: 28px; }
html.skm-mask-on [data-skm-grok-greeting]::before { ${deepseek ? `content: ""; width: 34px; height: 34px; background: url("${chrome.runtime.getURL('images/deepseek-icon.svg')}") center / contain no-repeat;` : 'content: none;'} }
html.skm-mask-on form[data-composer] { max-width: 768px; margin-inline: auto; width: calc(100% - 32px); }
html.skm-mask-on .query-bar { border-radius: ${deepseek ? '26px' : '28px'} !important; box-shadow: none; overflow: visible; }
html.skm-mask-on [data-skm-grok-input-body] { padding-bottom: ${deepseek ? '58px' : '0'} !important; min-height: ${deepseek ? '136px' : '52px'}; }
html.skm-mask-on [data-testid="chat-input"] { position: relative; }
html.skm-mask-on .query-bar [contenteditable="true"] { min-height: ${deepseek ? '74px' : '50px'}; padding: ${deepseek ? '20px 4px 12px' : '14px 200px 12px 36px'} !important; font-size: 16px; line-height: 24px; }
html.skm-mask-on [data-testid="chat-input"] > [aria-hidden="true"]:not(.skm-grok-placeholder),
html.skm-mask-on [contenteditable="true"] p.is-editor-empty::before,
html.skm-mask-on [contenteditable="true"] [data-placeholder]::before { display: none !important; content: none !important; }
html.skm-mask-on .skm-grok-placeholder { position: absolute; left: 8px; top: 0; pointer-events: none; font-size: 15px; line-height: 24px; color: ${deepseek ? 'var(--skm-text-2)' : 'var(--skm-qwen-muted)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: calc(100% - 16px); }
html.skm-mask-on .query-bar .skm-grok-placeholder { left: ${deepseek ? '4px' : '36px'}; top: ${deepseek ? '20px' : '14px'}; font-size: 16px; }
html.skm-mask-on .skm-grok-placeholder::after { content: "${deepseek ? '给 DeepSeek 发送消息' : '有什么我能帮你的吗？'}"; }
html.skm-mask-on .skm-grok-placeholder[hidden] { display: none; }
html.skm-mask-on [data-skm-grok-toolbar] { padding: ${deepseek ? '8px 10px' : '5px'} !important; border: 0 !important; }
html.skm-mask-on [data-skm-grok-toolbar] button { pointer-events: auto; height: 36px; }
html.skm-mask-on form[data-composer] button[data-testid="chat-submit"],
html.skm-mask-on form[data-composer] button[data-composer-action="send"],
html.skm-mask-on form[data-composer] button[type="submit"] { pointer-events: auto !important; position: relative; z-index: 2; }
html.skm-mask-on [data-testid="attach-button"] { width: 36px; }
html.skm-mask-on button[aria-label^="Model:"]::after { content: none !important; }
html.skm-mask-on button[aria-label^="Model:"] { padding-inline: 10px; }
html.skm-mask-on form[data-composer] button[aria-label*="听写"],
html.skm-mask-on form[data-composer] button[aria-label*="Dictat" i],
html.skm-mask-on .query-bar button[aria-label*="听写"],
html.skm-mask-on .query-bar button[aria-label*="Dictat" i] { opacity: var(--skm-extra-opacity); width: 28px; transition: opacity .15s; }
html.skm-mask-on form[data-composer] button[aria-label*="听写"]:is(:hover,:focus-visible),
html.skm-mask-on form[data-composer] button[aria-label*="Dictat" i]:is(:hover,:focus-visible),
html.skm-mask-on .query-bar button[aria-label*="听写"]:is(:hover,:focus-visible),
html.skm-mask-on .query-bar button[aria-label*="Dictat" i]:is(:hover,:focus-visible) { opacity: 1; }
html.skm-mask-on form[data-composer] button[data-composer-action="voice"],
html.skm-mask-on .query-bar button[aria-label*="语音模式"] > div,
html.skm-mask-on .query-bar button[aria-label*="voice mode" i] > div { color: ${deepseek ? 'var(--skm-blue)' : 'var(--skm-qwen-accent)'}; background: ${deepseek ? 'var(--skm-user-bubble)' : 'var(--skm-qwen-bubble)'}; }
html.skm-mask-on .query-bar button[aria-label*="语音模式"] > div,
html.skm-mask-on .query-bar button[aria-label*="voice mode" i] > div { width: 36px; height: 36px; }
html.skm-mask-on .query-bar button[aria-label*="语音模式"] > div::before { background: transparent; }
html.skm-mask-on .skm-grok-model { position: absolute; z-index: 30; left: 20px; top: 10px; height: 32px; color: inherit; background: transparent; font-size: 16px; display: ${deepseek ? 'none' : 'block'}; cursor: pointer; border-radius: 8px; padding: 4px 6px; }
html.skm-mask-on .skm-grok-model::before { content: none; }
html.skm-mask-on .skm-grok-model::after { content: "⌄"; margin-left: 6px; }
html.skm-mask-on .skm-grok-model:hover { background: var(--skm-qwen-hover); }
html.skm-mask-on .skm-grok-title { display: none !important; }
html.skm-mask-on [data-skm-grok-private],
html.skm-mask-on [data-skm-grok-panel],
html.skm-mask-on [data-skm-grok-extra] { opacity: var(--skm-extra-opacity) !important; transition: opacity .15s; }
html.skm-mask-on [data-skm-grok-private]:is(:hover,:focus-visible,[aria-pressed="true"],[data-pressed]),
html.skm-mask-on [data-skm-grok-panel]:is(:hover,:focus-visible,[aria-pressed="true"],[data-pressed]),
html.skm-mask-on [data-skm-grok-extra]:is(:hover,:focus-within) { opacity: 1 !important; }
html.skm-mask-on [data-testid="chat-transcript-scroller"] [role="article"] { font-size: 16px; }
${controlsCss(deepseek)}
@media (max-width: 640px) {
 html.skm-mask-on [data-skm-grok-home] { padding-top: 22dvh !important; }
 html.skm-mask-on [data-skm-grok-greeting]::after { font-size: 23px; }
 html.skm-mask-on .query-bar [contenteditable="true"] { padding-right: ${deepseek ? '8px' : '150px'} !important; }
 html.skm-mask-on .skm-grok-model, html.skm-mask-on .skm-grok-title { left: 52px; }
}
`
}

function controlsCss(deepseek: boolean): string {
  return `
html.skm-mask-on [data-skm-grok-plugins],
html.skm-mask-on [data-grok-bot-pill],
html.skm-mask-on [data-reorder-item="bots"],
html.skm-mask-on [data-skm-grok-bot],
html.skm-mask-on [data-skm-grok-upgrade] { display: none !important; }
html.skm-mask-on header [data-skm-grok-more] { opacity: 0 !important; background: transparent !important; transition: opacity .15s; }
html.skm-mask-on header [data-skm-grok-more]:is(:hover,:focus-visible,[data-state="open"],[data-popup-open]) { opacity: 1 !important; }
html.skm-mask-on header [data-skm-grok-share] { position: relative; border-radius: 50%; width: 32px; height: 32px; color: ${deepseek ? 'var(--skm-text-2)' : 'var(--skm-qwen-secondary)'}; background: transparent !important; opacity: ${deepseek ? '1' : '0'} !important; }
html.skm-mask-on header [data-skm-grok-share]:is(:hover,:focus-visible,[data-state="open"],[data-popup-open]) { opacity: 1 !important; }
${deepseek ? `
html.skm-mask-on header [data-skm-grok-share] > * { visibility: hidden; }
html.skm-mask-on header [data-skm-grok-share]::after {
 content: ''; position: absolute; inset: 7px; background: currentColor;
 mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M13 4l8 7-8 7v-5C7 13 4 16 3 20c0-9 4-13 10-13V4z' fill='none' stroke='black' stroke-width='1.7' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
}
html.skm-mask-on [data-skm-grok-folded="true"] { display: none !important; }
html.skm-mask-on [data-skm-grok-folded="false"] [data-sidebar="menu-button"] { opacity: 1 !important; }
html.skm-mask-on [data-skm-grok-recents] { font-size: 0 !important; font-weight: 400; }
html.skm-mask-on [data-skm-grok-recents] > span:first-child { display: none !important; }
html.skm-mask-on [data-skm-grok-recents]::after { content: '今天'; font-size: 12px; }
html.skm-mask-on .skm-grok-fold-item { margin: 0 10px; min-height: 20px; color: var(--skm-text-3); }
html.skm-mask-on .skm-grok-fold summary { display: flex; align-items: center; width: 28px; height: 20px; padding: 0 4px; cursor: pointer; list-style: none; opacity: 0; transition: opacity .15s; }
html.skm-mask-on .skm-grok-fold summary::-webkit-details-marker { display: none; }
html.skm-mask-on .skm-grok-fold summary::before { content: ''; border-block: 4px solid transparent; border-inline-start: 5px solid currentColor; }
html.skm-mask-on .skm-grok-fold[open] summary::before { transform: rotate(90deg); }
html.skm-mask-on .skm-grok-fold-item:is(:hover,:focus-within) summary { opacity: 1; }
html.skm-mask-on form[data-composer] {
  display: grid !important;
  min-height: 128px !important;
  padding: 16px 14px 12px !important;
  border-radius: 24px !important;
  grid-template-areas:
    "field field field field"
    "toggles mode leading actions" !important;
  grid-template-columns: 1fr auto auto auto !important;
  grid-template-rows: minmax(56px, auto) 36px !important;
  row-gap: 10px !important;
  column-gap: 8px !important;
  align-items: end !important;
}
html.skm-mask-on form[data-composer] > div:has([data-composer-field]) {
  grid-area: field !important;
  align-self: start !important;
  width: 100% !important;
  min-height: 56px;
  padding: 0 !important;
}
html.skm-mask-on form[data-composer] [data-composer-field] {
  padding: 0 !important;
  margin: 0 !important;
}
html.skm-mask-on form[data-composer] > div[data-composer-surface="true"] {
  display: contents !important;
  padding: 0 !important;
}
html.skm-mask-on form[data-composer] > div[data-composer-surface="true"] > div:has([data-testid="attach-button"]) {
  grid-area: leading !important;
  align-self: center !important;
  width: auto !important;
  flex-shrink: 0 !important;
}
html.skm-mask-on form[data-composer] [data-query-bar-mode-select] {
  grid-area: mode !important;
  align-self: center !important;
  justify-self: end !important;
  position: static !important;
  margin: 0 !important;
  min-width: max-content !important;
  flex-shrink: 0 !important;
}
html.skm-mask-on form[data-composer] [data-query-bar-mode-select] button {
  min-width: max-content !important;
  max-width: none !important;
}
html.skm-mask-on form[data-composer] > div[data-composer-surface="true"] > div:has([data-composer-action], [data-testid="chat-submit"]) {
  grid-area: actions !important;
  align-self: center !important;
  display: flex !important;
  align-items: center !important;
  gap: 4px;
  width: auto !important;
  flex-shrink: 0 !important;
}
html.skm-mask-on form[data-composer] > .skm-grok-toggles {
  position: static !important;
  grid-area: toggles !important;
  justify-self: start !important;
  align-self: center !important;
  display: flex;
  gap: 8px;
  pointer-events: auto;
}
html.skm-mask-on .skm-grok-toggles { position: absolute; left: 12px; bottom: 10px; display: flex; gap: 8px; pointer-events: auto; }
html.skm-mask-on .skm-grok-toggle { display: inline-flex; align-items: center; gap: 6px; height: 34px !important; padding: 0 11px; border: 1px solid var(--skm-border); border-radius: 18px; color: var(--skm-text); background: transparent; font-family: quote-cjk-patch, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; font-size: 13px; font-weight: 500; line-height: 24px; font-feature-settings: "kern"; font-variant-ligatures: no-contextual; user-select: none; -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); cursor: pointer; }
html.skm-mask-on .skm-grok-toggle::before { content: ''; width: 14px; height: 14px; background: currentColor; }
html.skm-mask-on .skm-grok-toggle-think::before { mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cellipse cx='8' cy='8' rx='7' ry='3' transform='rotate(45 8 8)' fill='none' stroke='black'/%3E%3Cellipse cx='8' cy='8' rx='7' ry='3' transform='rotate(-45 8 8)' fill='none' stroke='black'/%3E%3C/svg%3E") center / contain no-repeat; }
html.skm-mask-on .skm-grok-toggle-search::before { mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cg fill='none' stroke='black'%3E%3Ccircle cx='8' cy='8' r='6.5'/%3E%3Cellipse cx='8' cy='8' rx='3' ry='6.5'/%3E%3Cpath d='M2 6h12M2 10h12'/%3E%3C/g%3E%3C/svg%3E") center / contain no-repeat; }
html.skm-mask-on .skm-grok-toggle:hover { background: var(--skm-hover); }
html.skm-mask-on .skm-grok-toggle[aria-pressed="true"] { color: var(--skm-blue); border-color: var(--skm-blue); background: var(--skm-user-bubble); }
html.skm-mask-on.dark .skm-grok-toggle[aria-pressed="true"],
html.skm-mask-on[data-theme="dark"] .skm-grok-toggle[aria-pressed="true"] { color: rgb(103, 158, 254); border-color: rgba(103, 158, 254, 0.45); }
html.skm-mask-on [data-skm-grok-toolbar] div:has(> [data-testid="attach-button"]) { margin-left: auto; }
html.skm-mask-on [data-skm-grok-toolbar] div:has(> [data-query-bar-mode-select]) { margin-left: 8px !important; }
html.skm-mask-on [data-testid="new-chat"] { margin-top: 0; }
html.skm-mask-on [data-sidebar="menu-item"]:has(> [data-testid="new-chat"]) > [aria-hidden="true"] { border-radius: 24px; }
@media (max-width: 640px) {
 html.skm-mask-on .skm-grok-toggles { gap: 4px; left: 8px; }
 html.skm-mask-on .skm-grok-toggle { padding-inline: 6px; }
 html.skm-mask-on [data-skm-grok-toolbar] button[aria-label^="Model:"] { padding-inline: 4px; }
}
` : 'html.skm-mask-on .skm-grok-toggles { display: none; }'}
`
}
