import {qwenPaletteCss} from '../../themes/qwen'
import {deepseekPaletteCss} from '../../themes/deepseek'
import {geminiLayoutCss} from './layout'

/** Keep Gemini's native editor, navigation and tools; only override presentation. */
export function geminiThemeCss(theme?: string): string {
  const deepseek = theme === 'deepseek'
  const token = (qwen: string, deep: string) => `var(--skm-${deepseek ? deep : `qwen-${qwen}`})`
  const page = token('page', 'page'), sidebar = token('sidebar', 'sidebar')
  const text = token('text', 'text'), secondary = token('secondary', 'text-2')
  const border = token('border', 'border'), hover = token('hover', 'hover')
  const accent = token('accent', 'blue'), composer = token('composer', 'composer')
  const bubble = token('bubble', 'user-bubble')
  const muted = token('muted', 'text-3')
  // Gemini keeps theme state on body rather than html.
  const palette = (deepseek ? deepseekPaletteCss : qwenPaletteCss)
    .replaceAll('html.skm-mask-on.dark', 'html.skm-mask-on:has(body.dark-theme)')
  const variables: Record<string, string> = {
    'gem-sys-color--surface': page, 'gem-sys-color--surface-dim': page,
    'gem-sys-color--surface-bright': composer,
    'gem-sys-color--surface-container': sidebar,
    'gem-sys-color--surface-container-lowest': page,
    'gem-sys-color--surface-container-low': sidebar,
    'gem-sys-color--surface-container-high': composer,
    'gem-sys-color--surface-container-highest': hover,
    'gem-sys-color--on-surface': text, 'gem-sys-color--on-surface-variant': secondary,
    'gem-sys-color--on-surface-low': secondary,
    'gem-sys-color--primary': accent, 'gem-sys-color--primary-container': bubble,
    'gem-sys-color--on-primary-container': text,
    'gem-sys-color--outline': border, 'gem-sys-color--outline-variant': border,
    'bard-color-sidenav-background-desktop': sidebar,
    'bard-color-sidenav-background-mobile': sidebar,
    'bard-color-synthetic--chat-window-surface': page,
    'bard-color-synthetic--chat-window-surface-container': page,
    'bard-color-synthetic--chat-window-surface-container-high': composer,
    'bard-color-synthetic--chat-window-surface-container-highest': hover,
    'bard-color-input-area-buttons-hover-background': hover,
    'lumi-sys-color--surface': page, 'lumi-sys-color--surface-background': page,
    'lumi-sys-color--surface-dim': sidebar, 'lumi-sys-color--surface-bright': composer,
    'lumi-sys-color--on-surface': text, 'lumi-sys-color--on-surface-variant': secondary,
    'lumi-sys-color--on-surface-low': muted, 'lumi-sys-color--surface-accent': bubble,
    'lumi-sys-color--code-background': sidebar,
    'mat-app-background-color': page,
    'mat-sidenav-container-background-color': sidebar,
    'mat-sidenav-content-background-color': page,
    'mat-menu-container-color': composer, 'mat-select-panel-background-color': composer,
  }
  const declarations = Object.entries(variables).map(([key, value]) => `--${key}: ${value} !important;`).join('\n')

  return `${palette}
html.skm-mask-on {
  --skm-g-page: ${page}; --skm-g-sidebar: ${sidebar}; --skm-g-text: ${text};
  --skm-g-secondary: ${secondary}; --skm-g-muted: ${muted}; --skm-g-border: ${border};
  --skm-g-hover: ${hover}; --skm-g-accent: ${accent}; --skm-g-composer: ${composer}; --skm-g-bubble: ${bubble};
  color-scheme: ${token('scheme', 'scheme')};
}
html.skm-mask-on body {
  ${declarations}
  color-scheme: ${token('scheme', 'scheme')};
  background: ${page} !important; color: ${text} !important;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
}
html.skm-mask-on :is(chat-app, bard-sidenav-content, chat-window, chat-window-content, .conversation-container) {
  background-color: ${page} !important; color: ${text};
}
html.skm-mask-on :is(bard-sidenav, mat-sidenav, side-navigation-content) { background: ${sidebar} !important; }
html.skm-mask-on .text-input-field {
  background: ${composer} !important; border: 1px solid ${border} !important;
  border-radius: 24px !important; box-shadow: 0 4px 20px #00000006;
}
html.skm-mask-on :is(.ql-editor, .query-text, .markdown) { color: ${text} !important; }
html.skm-mask-on .ql-editor.ql-blank::before { color: ${secondary} !important; }
html.skm-mask-on .user-query-bubble-with-background {
  background: ${bubble} !important; color: ${text} !important; border-radius: 18px !important;
}
html.skm-mask-on model-response .markdown { font-size: 15px; line-height: 1.75; }
html.skm-mask-on model-response .response-container { background: transparent !important; }
html.skm-mask-on model-response code-block { border-radius: 12px; overflow: clip; }
html.skm-mask-on model-response a { color: ${accent}; }
html.skm-mask-on :is(.mat-mdc-menu-panel, .mat-mdc-select-panel) { background: ${composer} !important; color: ${text}; }
${geminiLayoutCss(deepseek)}
`
}
