import {qwenPaletteCss} from '../chatgpt/theme-qwen'
import {deepseekPaletteCss} from '../chatgpt/theme-deepseek'

/** Presentation only: retain Claude's editor, model selector and native actions. */
export function claudeThemeCss(theme?: string): string {
  const deep = theme === 'deepseek'
  const token = (q: string, d: string) => `var(--skm-${deep ? d : `qwen-${q}`})`
  const page = token('page', 'page'), sidebar = token('sidebar', 'sidebar')
  const text = token('text', 'text'), secondary = token('secondary', 'text-2')
  const muted = token('muted', 'text-3'), border = token('border', 'border')
  const hover = token('hover', 'hover'), accent = token('accent', 'blue')
  const composer = token('composer', 'composer'), bubble = token('bubble', 'user-bubble')
  // Claude's current theme uses data-mode, independently of data-theme="claude".
  const palette = (deep ? deepseekPaletteCss : qwenPaletteCss)
    .replaceAll('html.skm-mask-on.dark', 'html.skm-mask-on[data-mode="dark"]')
  const tokens: Record<string, string> = {
    'cds-page-bg': page, 'cds-surface-0': sidebar, 'cds-surface-1': page,
    'cds-surface-2': sidebar, 'cds-surface-3': composer,
    'cds-surface-panel': sidebar, 'cds-surface-popover': composer,
    'cds-text-primary': text, 'cds-text-secondary': secondary, 'cds-text-muted': muted,
    'cds-text-accent': accent, 'cds-border': border, 'cds-border-strong': border,
    'cds-fill-accent': accent, 'cds-fill-accent-hover': accent,
    'cds-fill-brand': accent, 'cds-fill-brand-hover': accent,
    'cds-fill-primary': text, 'cds-fill-primary-hover': secondary,
    'cds-fill-secondary': hover, 'cds-fill-secondary-hover': bubble,
    'cds-fill-ghost-hover': hover, 'cds-fill-ghost-selected': bubble,
    'cds-fill-control': hover, 'cds-fill-control-hover': bubble,
    'cds-fill-field': composer, 'cds-fill-field-ring': border,
    'df-hover': hover, 'df-selected': bubble,
  }
  const declarations = Object.entries(tokens).map(([key, value]) => `--${key}: ${value} !important;`).join('\n')
  const logo = deep ? `url("${chrome.runtime.getURL('images/deepseek-logo.svg')}")` : 'var(--skm-qwen-logo)'
  return `${palette}
html.skm-mask-on {
  ${declarations}
  --font-claude-response: var(--font-sans-serif);
  color-scheme: ${token('scheme', 'scheme')} !important;
  background: ${page} !important; color: ${text};
}
html.skm-mask-on :is(body, main, .dframe-pane-primary, .dframe-content-inner) {
  background-color: ${page} !important; color: ${text};
}
html.skm-mask-on :is(.dframe-sidebar, [data-testid="sidebar"]) {
  background: ${sidebar} !important;
}
html.skm-mask-on .dframe-sidebar { border-inline-end: 1px solid ${border}; }
html.skm-mask-on [data-cds="ProductLogo"][data-app-wordmark="claude"] {
  width: ${deep ? '132px' : '84px'}; height: 28px;
  background: ${logo} left center / contain no-repeat; position: relative;
}
html.skm-mask-on [data-cds="ProductLogo"][data-app-wordmark="claude"] > span {
  position: absolute; clip-path: inset(50%); width: 1px; height: 1px; overflow: hidden;
}
html.skm-mask-on .dframe-sidebar a[data-row-main-button][href="/new"] {
  background: ${deep ? 'var(--skm-new-chat)' : bubble} !important;
  color: ${accent} !important; border-radius: ${deep ? '24px' : '10px'};
  min-height: 38px;
}
html.skm-mask-on .dframe-sidebar [data-row-main-button][href^="/chat/"] { border-radius: 9px; }
html.skm-mask-on .dframe-sidebar [data-row]:hover { background-color: ${hover}; }
html.skm-mask-on .dframe-sidebar :is([data-row][data-nav-item],[data-row]:has([data-nav-item])) {
  opacity: var(--skm-extra-opacity); transition: opacity .15s;
}
html.skm-mask-on .dframe-sidebar :is([data-row][data-nav-item],[data-row]:has([data-nav-item])):is(:hover,:focus-within) { opacity: 1; }
/* Current CDS card is the inner child, not the outer composer wrapper. */
html.skm-mask-on [data-cds="ChatComposer"] > .rounded-composer {
  background: ${composer} !important; border: 1px solid ${border};
  border-radius: ${deep ? '24px' : '28px'} !important;
  box-shadow: 0 4px 20px #00000006 !important; padding: 16px;
  --cmp-font-size: 16px; --cmp-line-height: 26px;
}
html.skm-mask-on [data-cds="ChatComposer"] > .rounded-composer:focus-within {
  border-color: ${accent};
}
html.skm-mask-on [data-cds="ChatComposerEditor"] { color: ${text}; }
html.skm-mask-on [data-composer-placeholder] { color: ${muted}; }
html.skm-mask-on [data-testid="chat-input-send"] {
  border-radius: 50% !important; --cds-fill-primary: ${accent};
  --cds-fill-primary-hover: ${accent};
}
html.skm-mask-on [data-testid="chat-input-send"]:not(:disabled):not([aria-disabled="true"]) {
  background: ${accent} !important; color: white !important;
}
html.skm-mask-on [data-testid="chat-input-send"] [data-cds-part="paint"] { border-radius: 50%; }
html.skm-mask-on [data-cds="ChatComposer"] :is(button[aria-label="Dictate"],button[aria-label="Use voice mode"],[aria-label="Surface"]) {
  opacity: var(--skm-extra-opacity); transition: opacity .15s;
}
html.skm-mask-on [data-cds="ChatComposer"] :is(button[aria-label="Dictate"],button[aria-label="Use voice mode"],[aria-label="Surface"]):is(:hover,:focus-within,[aria-expanded="true"]) { opacity: 1; }
html.skm-mask-on :is([data-testid="user-message"],[data-cds="UserMessage"]) {
  background: ${bubble} !important; color: ${text}; border-radius: 18px !important;
}
html.skm-mask-on :is(.font-claude-response,[data-cds="AssistantMessage"]) {
  font-family: var(--font-sans-serif), system-ui, sans-serif !important; font-size: 15px; line-height: 1.75;
}
html.skm-mask-on .font-claude-response a { color: ${accent}; }
html.skm-mask-on main .font-display.text-balance {
  font-family: var(--font-sans-serif), system-ui, sans-serif; font-size: 0 !important;
}
html.skm-mask-on main .font-display.text-balance::after {
  content: '${deep ? '你好，让我们开始聊天吧' : '有什么可以帮你的吗？'}';
  font-size: clamp(23px, 3vw, 30px); font-weight: ${deep ? '600' : '400'}; color: ${text};
}
@media (max-width: 640px) {
  html.skm-mask-on [data-cds="ChatComposer"] > .rounded-composer { padding: 10px; }
}
`
}
