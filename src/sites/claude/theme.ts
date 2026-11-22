import {qwenPaletteCss} from '../../themes/qwen'
import {deepseekPaletteCss} from '../../themes/deepseek'

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
    'cds-bg-user-message': bubble, 'cds-page-bg': page, 'cds-surface-0': sidebar, 'cds-surface-1': page,
    'cds-surface-2': sidebar, 'cds-surface-3': composer,
    'cds-surface-panel': sidebar, 'cds-surface-popover': composer,
    'cds-text-primary': text, 'cds-text-secondary': secondary, 'cds-text-muted': muted,
    'cds-text-accent': accent, 'cds-border': border, 'cds-border-strong': border,
    'cds-fill-accent': accent, 'cds-fill-accent-hover': accent,
    'cds-fill-brand': accent, 'cds-fill-brand-hover': accent, 'cds-fill-brand-icon-only': accent,
    'cds-fill-primary': text, 'cds-fill-primary-hover': secondary,
    'cds-fill-secondary': hover, 'cds-fill-secondary-hover': bubble,
    'cds-fill-ghost-hover': hover, 'cds-fill-ghost-selected': bubble,
    'cds-fill-control': hover, 'cds-fill-control-hover': bubble,
    'cds-fill-field': composer, 'cds-fill-field-ring': border,
    'df-hover': hover, 'df-selected': bubble,
  }
  const declarations = Object.entries(tokens).map(([key, value]) => `--${key}: ${value} !important;`).join('\n')
  const logo = deep ? `url("${chrome.runtime.getURL('images/deepseek-logo.svg')}")` : 'var(--skm-qwen-logo)'
  const icon = `url("${chrome.runtime.getURL(deep ? 'images/deepseek-icon.svg' : 'images/qwen-favicon.png')}")`
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
html.skm-mask-on .dframe-root[data-collapsed="true"] .dframe-sidebar {
  background: transparent !important; border-inline-end-color: transparent !important;
}
html.skm-mask-on .dframe-root[data-collapsed="true"] .df-collapsed-chrome {
  gap: 8px;
}
html.skm-mask-on .dframe-root[data-collapsed="true"] .df-collapsed-chrome::after {
  content: ''; flex: 0 0 ${deep ? '28px' : '24px'}; width: ${deep ? '28px' : '24px'}; height: 24px;
  background: ${icon} center / contain no-repeat; pointer-events: none;
}
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
html.skm-mask-on :is([data-composer-card-holder], [data-cds="ChatComposer"]) { background-color: ${page} !important; }
html.skm-mask-on [data-cds="ChatComposer"] button:not([data-testid="chat-input-send"]):not(.skm-claude-toggle) {
  opacity: var(--skm-extra-opacity); transition: opacity .15s;
}
html.skm-mask-on [data-cds="ChatComposer"] button:not([data-testid="chat-input-send"]):not(.skm-claude-toggle):is(:hover,:focus-visible,[aria-expanded="true"]) { opacity: 1; }
${deep ? `html.skm-mask-on [data-cds="ChatComposer"] > .rounded-composer > div:has([data-cds="ChatComposerActions"]) > div:first-child {
  padding-bottom: 44px !important;
}
html.skm-mask-on [data-cds="ChatComposerActions"] {
  align-items: center !important; gap: 6px; margin-top: -36px !important; min-height: 34px;
}
html.skm-mask-on .skm-claude-toggles {
  display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; pointer-events: auto;
}
html.skm-mask-on .skm-claude-toggle {
  display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 11px;
  border: 1px solid ${border}; border-radius: 18px; background: transparent;
  color: ${text}; font: inherit; font-size: 13px; font-weight: 500; line-height: 24px;
  user-select: none; cursor: pointer;
}
html.skm-mask-on .skm-claude-toggle:hover { background: ${hover}; }
html.skm-mask-on .skm-claude-toggle:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
html.skm-mask-on .skm-claude-toggle[aria-pressed="true"] {
  color: ${accent}; border-color: ${accent}; background: ${bubble};
}
html.skm-mask-on[data-mode="dark"] .skm-claude-toggle[aria-pressed="true"] {
  color: rgb(103, 158, 254); border-color: rgba(103, 158, 254, 0.45);
}
html.skm-mask-on .skm-claude-toggle::before { content: ''; width: 14px; height: 14px; background: currentColor; }
html.skm-mask-on .skm-claude-toggle-think::before {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cg fill='none' stroke='black' stroke-width='1.3'%3E%3Cellipse cx='8' cy='8' rx='7' ry='3' transform='rotate(45 8 8)'/%3E%3Cellipse cx='8' cy='8' rx='7' ry='3' transform='rotate(-45 8 8)'/%3E%3C/g%3E%3C/svg%3E") center / contain no-repeat;
}
html.skm-mask-on .skm-claude-toggle-search::before {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cg fill='none' stroke='black' stroke-width='1.3'%3E%3Ccircle cx='8' cy='8' r='6.5'/%3E%3Cellipse cx='8' cy='8' rx='3' ry='6.5'/%3E%3Cpath d='M2 6h12M2 10h12'/%3E%3C/g%3E%3C/svg%3E") center / contain no-repeat;
}` : 'html.skm-mask-on .skm-claude-toggles { display: none; }'}
html.skm-mask-on [data-cds="UserMessage"], html.skm-mask-on [data-testid="user-message"] { background: transparent !important; }
/* These backing panels appear when the dock masks an unscrolled transcript.
   Their local CDS page token can differ from the root theme token. */
html.skm-mask-on [data-testid^="transcript-bottom-backing"] {
  background: ${page} !important;
}
/* CSS also applies when Claude mounts the prompt categories asynchronously. */
html.skm-mask-on [aria-label="Prompt categories"] {
  opacity: var(--skm-extra-opacity); transition: opacity .15s;
}
html.skm-mask-on [aria-label="Prompt categories"]:is(:hover,:focus-within) { opacity: 1; }
html.skm-mask-on [data-cds="ChatComposerEditor"] { color: ${text}; }
html.skm-mask-on [data-composer-placeholder] { color: ${muted}; }
html.skm-mask-on [data-testid="chat-input-send"] {
  border-radius: 50% !important; --cds-fill-primary: ${accent};
  --cds-fill-primary-hover: ${accent};
  --cds-fill-brand: ${accent}; --cds-fill-brand-hover: ${accent};
  --cds-fill-brand-icon-only: ${accent};
}
html.skm-mask-on [data-testid="chat-input-send"]:not(:disabled):not([aria-disabled="true"]) {
  background: transparent !important; color: white !important;
}
html.skm-mask-on [data-testid="chat-input-send"]:not(:disabled):not([aria-disabled="true"]) [data-cds-part="paint"] {
  background: ${accent} !important; border-radius: 50% !important;
}
html.skm-mask-on [data-testid="chat-input-send"]:not(:disabled):not([aria-disabled="true"]):hover [data-cds-part="paint"] {
  filter: brightness(.94);
}
html.skm-mask-on [data-testid="chat-input-send"] [data-cds-part="paint"] { border-radius: 50% !important; }
html.skm-mask-on [data-cds="ChatComposer"] :is(button[aria-label="Dictate"],button[aria-label="Use voice mode"],[aria-label="Surface"]) {
  opacity: var(--skm-extra-opacity); transition: opacity .15s;
}
html.skm-mask-on [data-cds="ChatComposer"] :is(button[aria-label="Dictate"],button[aria-label="Use voice mode"],[aria-label="Surface"]):is(:hover,:focus-within,[aria-expanded="true"]) { opacity: 1; }
html.skm-mask-on [data-cds="UserMessage"] > div:first-child {
  background: ${bubble} !important; color: ${text}; border-radius: 18px !important;
}
html.skm-mask-on :is(.font-claude-response,[data-cds="AssistantMessage"]) {
  font-family: var(--font-sans-serif), system-ui, sans-serif !important; font-size: 15px; line-height: 1.75;
}
html.skm-mask-on .font-claude-response a { color: ${accent}; }
html.skm-mask-on [data-new-page-notice-stack] div:has(> span > a[href="/upgrade"]),
html.skm-mask-on [data-new-page-notice-stack] div:has(> a[href="/upgrade"]) {
  display: none !important;
}
html.skm-mask-on main .font-display.text-balance {
  font-family: var(--font-sans-serif), system-ui, sans-serif; font-size: 0 !important;
  display: inline-flex; align-items: center; justify-content: center; gap: 12px;
}
html.skm-mask-on main .font-display.text-balance > * { display: none !important; }
${deep ? `html.skm-mask-on main .font-display.text-balance::before {
  content: ''; flex: 0 0 34px; width: 34px; height: 28px;
  background: ${icon} center / contain no-repeat;
}` : ''}
html.skm-mask-on main .font-display.text-balance::after {
  content: '${deep ? '你好，让我们开始聊天吧' : '有什么可以帮你的吗？'}';
  font-size: clamp(23px, 3vw, 30px); font-weight: ${deep ? '600' : '400'}; color: ${text};
}
html.skm-mask-on :is([data-testid="tab-switch"], [data-cds="ChatComposer"] [role="radiogroup"], [data-testid="chat-actions"] button[aria-haspopup="dialog"], button[aria-label="Share"], button[aria-label="分享"]) {
  opacity: var(--skm-extra-opacity); transition: opacity .15s;
}
html.skm-mask-on :is([data-testid="tab-switch"], [data-cds="ChatComposer"] [role="radiogroup"], [data-testid="chat-actions"] button[aria-haspopup="dialog"], button[aria-label="Share"], button[aria-label="分享"]):is(:hover,:focus-within,[aria-expanded="true"]) { opacity: 1; }
html.skm-mask-on [data-testid="chat-actions"] [data-cds-disabled-reason-wrapper]:is(:hover,:focus-within) button[aria-haspopup="dialog"] { opacity: 1; }
@media (max-width: 640px) {
  html.skm-mask-on [data-cds="ChatComposer"] > .rounded-composer { padding: 10px; }
  html.skm-mask-on .skm-claude-toggles { gap: 4px; }
  html.skm-mask-on .skm-claude-toggle { font-size: 12px; padding-inline: 7px; }
}
`
}
