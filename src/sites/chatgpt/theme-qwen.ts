/** Qwen-inspired light skin. Keep the site's controls, model names and message DOM intact. */
export const qwenThemeCss = `
html.skm-mask-on {
  --skm-qwen-scheme: light;
  --skm-qwen-page: #ffffff;
  --skm-qwen-composer: #ffffff;
  --skm-qwen-sidebar: #f7f7f9;
  --skm-qwen-text: #242424;
  --skm-qwen-secondary: #55555a;
  --skm-qwen-muted: #929296;
  --skm-qwen-faint: #b5b5ba;
  --skm-qwen-border: #e3e3e6;
  --skm-qwen-hover: #ededf0;
  --skm-qwen-bubble: #f1f0fc;
  --skm-qwen-active: #eaeaec;
  --skm-qwen-accent: #6155f5;
  --skm-qwen-focus: #aaa3e9;
  --skm-qwen-selection: #dedbff;
  --skm-qwen-scrollbar: #d3d3d7;
}
html.skm-mask-on[data-theme="dark"], html.skm-mask-on.dark {
  --skm-qwen-scheme: dark;
  --skm-qwen-page: #212121;
  --skm-qwen-composer: #292929;
  --skm-qwen-sidebar: #111111;
  --skm-qwen-text: #f2f2f2;
  --skm-qwen-secondary: #d0d0d0;
  --skm-qwen-muted: #969696;
  --skm-qwen-faint: #666666;
  --skm-qwen-border: #505050;
  --skm-qwen-hover: #2b2b2b;
  --skm-qwen-bubble: #303030;
  --skm-qwen-active: #292929;
  --skm-qwen-accent: #a59aff;
  --skm-qwen-focus: #777777;
  --skm-qwen-selection: #49416b;
  --skm-qwen-scrollbar: #464646;
}
html.skm-mask-on {
  color-scheme: var(--skm-qwen-scheme) !important;
  color: var(--skm-qwen-text) !important;
  --color-text: var(--skm-qwen-text) !important;
  --color-text-emphasis: var(--skm-qwen-text) !important;
  --color-text-composer-primary: var(--skm-qwen-text) !important;
  --color-text-secondary-soft-alt: var(--skm-qwen-secondary) !important;
  --color-text-secondary-solid: var(--skm-qwen-secondary) !important;
  --app-color-text-foreground: var(--skm-qwen-text) !important;
  --app-color-text-foreground-secondary: var(--skm-qwen-secondary) !important;
  --app-color-text-foreground-tertiary: var(--skm-qwen-muted) !important;
  --app-color-text-secondary: var(--skm-qwen-secondary) !important;
  --color-token-foreground: var(--skm-qwen-text) !important;
  --color-token-dropdown-foreground: var(--skm-qwen-text) !important;
  --color-token-description-foreground: var(--skm-qwen-muted) !important;
  --color-token-border-default: var(--skm-qwen-border) !important;
  --user-message-text-color: var(--skm-qwen-text) !important;
  --user-message-background-color: var(--skm-qwen-bubble) !important;
  --color-background-user-message: var(--skm-qwen-bubble) !important;
  --color-background-user-message-compact: var(--skm-qwen-bubble) !important;
  --color-text-user-message: var(--skm-qwen-text) !important;
  --segmented-control-background: var(--skm-qwen-hover) !important;
  --segmented-control-thumb-background: var(--skm-qwen-page) !important;
  --segmented-control-option-highlight-background-color: var(--skm-qwen-page) !important;
  /* Current ChatGPT design system (observed in the live DOM). */
  --color-surface: var(--skm-qwen-page) !important;
  --color-surface-secondary: var(--skm-qwen-sidebar) !important;
  --color-surface-tertiary: var(--skm-qwen-hover) !important;
  --color-surface-card: var(--skm-qwen-page) !important;
  --color-surface-canvas: var(--skm-qwen-sidebar) !important;
  --color-surface-elevated: var(--skm-qwen-page) !important;
  --color-surface-elevated-secondary: var(--skm-qwen-sidebar) !important;
  --color-surface-recovery: var(--skm-qwen-page) !important;
  --color-background-composer-surface: var(--skm-qwen-page) !important;
  --color-background-primary-surface: var(--skm-qwen-hover) !important;
  --color-text-primary: var(--skm-qwen-text) !important;
  --color-text-primary-surface: var(--skm-qwen-text) !important;
  --color-text-primary-soft: var(--skm-qwen-text) !important;
  --color-text-primary-soft-alt: var(--skm-qwen-text) !important;
  --color-text-primary-outline: var(--skm-qwen-text) !important;
  --color-text-primary-outline-hover: var(--skm-qwen-text) !important;
  --color-text-primary-ghost: var(--skm-qwen-text) !important;
  --color-text-primary-ghost-hover: var(--skm-qwen-text) !important;
  --color-text-secondary: var(--skm-qwen-secondary) !important;
  --color-text-tertiary: var(--skm-qwen-muted) !important;
  --color-text-quaternary: var(--skm-qwen-faint) !important;
  --color-border-default: var(--skm-qwen-border) !important;
  --color-border-primary-surface: var(--skm-qwen-border) !important;
  --color-token-bg-primary: var(--skm-qwen-page) !important;
  --color-token-bg-secondary: var(--skm-qwen-sidebar) !important;
  --color-token-bg-tertiary: var(--skm-qwen-hover) !important;
  --color-token-main-surface-primary: var(--skm-qwen-page) !important;
  --color-token-text-primary: var(--skm-qwen-text) !important;
  --color-token-text-secondary: var(--skm-qwen-secondary) !important;
  --color-token-text-tertiary: var(--skm-qwen-muted) !important;
  --color-token-interactive-bg-secondary-hover: var(--skm-qwen-hover) !important;
  --app-color-background-surface: var(--skm-qwen-page) !important;
  --app-color-background-surface-under: var(--skm-qwen-sidebar) !important;
  --app-shell-sidebar-divider: var(--skm-qwen-border) !important;
  --app-shell-sidebar-popover-background: var(--skm-qwen-page) !important;
  --app-shell-sidebar-popover-border: var(--skm-qwen-border) !important;
  --codex-base-surface: var(--skm-qwen-page) !important;
  --wb-surface-primary: var(--skm-qwen-page) !important;
  --wb-surface-secondary: var(--skm-qwen-sidebar) !important;
  --wb-text-primary: var(--skm-qwen-text) !important;
  /* Legacy ChatGPT components still mounted in conversations. */
  --bg-primary: var(--skm-qwen-page) !important;
  --bg-secondary: var(--skm-qwen-sidebar) !important;
  --bg-tertiary: var(--skm-qwen-hover) !important;
  --bg-elevated-primary: var(--skm-qwen-page) !important;
  --bg-elevated-secondary: var(--skm-qwen-sidebar) !important;
  --main-surface-primary: var(--skm-qwen-page) !important;
  --main-surface-secondary: var(--skm-qwen-sidebar) !important;
  --main-surface-tertiary: var(--skm-qwen-hover) !important;
  --sidebar-surface: var(--skm-qwen-sidebar) !important;
  --sidebar-surface-primary: var(--skm-qwen-sidebar) !important;
  --text-primary: var(--skm-qwen-text) !important;
  --text-secondary: var(--skm-qwen-secondary) !important;
  --text-tertiary: var(--skm-qwen-muted) !important;
  --border-light: var(--skm-qwen-border) !important;
  --border-default: var(--skm-qwen-border) !important;
  --theme-user-msg-bg: var(--skm-qwen-bubble) !important;
  --theme-user-msg-text: var(--skm-qwen-text) !important;
  --theme-submit-btn-bg: var(--skm-qwen-accent) !important;
  --theme-submit-btn-text: #ffffff !important;
  --interactive-label-accent-default: var(--skm-qwen-accent) !important;
  --surface-hover: var(--skm-qwen-hover) !important;
  --composer-surface-border-radius: 28px !important;
}
html.skm-mask-on body {
  --color-surface: var(--skm-qwen-sidebar) !important;
  background: var(--skm-qwen-sidebar) !important;
  color: var(--skm-qwen-text) !important;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif !important;
}
html.skm-mask-on main { background-color: var(--skm-qwen-page) !important; }
html.skm-mask-on aside.app-shell-left-panel,
html.skm-mask-on [data-app-shell-header-slot="start"],
html.skm-mask-on #app-shell-sidebar,
html.skm-mask-on #stage-slideover-sidebar,
html.skm-mask-on nav[aria-label="Chat history"],
html.skm-mask-on nav[aria-label="聊天记录"] {
  --color-surface: var(--skm-qwen-sidebar) !important;
  background: var(--skm-qwen-sidebar) !important;
  color: var(--skm-qwen-text) !important;
}

@media (min-width: 1024px) {
  html.skm-mask-on main[data-app-shell-main-surface] {
    margin: 5px 6px 5px 0;
    border: 0 !important;
    border-radius: 12px;
    min-width: 0;
    overflow: clip;
  }
}
html.skm-mask-on #app-shell-sidebar { --height-token-nav-row: 36px; }

/* Respect the native collapsed state and mobile drawer. */
@media (min-width: 1024px) {
  html.skm-mask-on [style*="--app-shell-animated-left-panel-width"]:has([data-app-shell-sidebar-trigger][aria-expanded="true"]) {
    --app-shell-left-panel-width: 232px !important;
    --app-shell-animated-left-panel-width: 232px !important;
  }
  html.skm-mask-on aside.app-shell-left-panel:has([data-app-shell-sidebar-trigger][aria-expanded="true"]) > div {
    width: 232px !important;
    min-width: 232px !important;
  }
}
html.skm-mask-on #app-shell-sidebar .sidebar-item {
  border-radius: 9px !important;
  transition: background-color 120ms ease;
}
html.skm-mask-on #app-shell-sidebar .sidebar-item:hover { background-color: var(--skm-qwen-hover) !important; }
html.skm-mask-on #app-shell-sidebar .sidebar-item[aria-current="page"] {
  background-color: var(--skm-qwen-active) !important;
  color: var(--skm-qwen-accent) !important;
}
/* Only replace the decorative wordmark, leaving the actual mode button intact. */
html.skm-mask-on button[aria-label*="当前模式：ChatGPT"] > span > span:first-child,
html.skm-mask-on button[aria-label*="current mode: ChatGPT" i] > span > span:first-child {
  font-size: 0 !important;
}
html.skm-mask-on button[aria-label*="当前模式：ChatGPT"] > span > span:first-child > span,
html.skm-mask-on button[aria-label*="current mode: ChatGPT" i] > span > span:first-child > span {
  display: none !important;
}
html.skm-mask-on button[aria-label*="当前模式：ChatGPT"] > span > span:first-child::after,
html.skm-mask-on button[aria-label*="current mode: ChatGPT" i] > span > span:first-child::after {
  content: "Qwen";
  font-size: 21px;
  font-weight: 650;
  letter-spacing: -0.8px;
  color: var(--skm-qwen-text);
}
/* A greeting is decoration; message headings and their SVGs are never targeted. */
html.skm-mask-on main:has([data-composer-placement="home"]) h1:not(article *):not([data-message-author-role] *):not(.markdown *) {
  font-size: 0 !important;
  line-height: 1.4 !important;
}
html.skm-mask-on main:has([data-composer-placement="home"]) h1:not(article *):not([data-message-author-role] *):not(.markdown *)::after {
  content: "有什么可以帮你的吗？";
  display: block;
  color: var(--skm-qwen-text);
  font-size: clamp(22px, 2vw, 26px);
  font-weight: 400;
  letter-spacing: -0.4px;
}
/* Style the composer surface, not every nested div or the editor's document. */
html.skm-mask-on [data-composer-surface],
html.skm-mask-on form:has([data-composer-markdown]),
html.skm-mask-on form:has(#prompt-textarea) {
  background-color: var(--skm-qwen-composer) !important;
  border: 1px solid var(--skm-qwen-border) !important;
  border-radius: 28px !important;
  box-shadow: 0 2px 8px #25214b05 !important;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
html.skm-mask-on [data-composer-surface]:focus-within,
html.skm-mask-on form:has([data-composer-markdown]):focus-within,
html.skm-mask-on form:has(#prompt-textarea):focus-within {
  border-color: var(--skm-qwen-focus) !important;
  box-shadow: 0 0 0 3px var(--skm-qwen-accent)0c !important;
}
html.skm-mask-on [data-composer-markdown],
html.skm-mask-on #prompt-textarea {
  color: var(--skm-qwen-text) !important;
  font-size: 15px !important;
  caret-color: var(--skm-qwen-accent);
}
html.skm-mask-on [data-composer-markdown] p[data-empty-paragraph="true"][data-placeholder]::before {
  content: "有什么我能帮你的吗？" !important;
  color: var(--skm-qwen-faint) !important;
}
html.skm-mask-on button[data-testid="send-button"],
html.skm-mask-on form button[aria-label="发送"],
html.skm-mask-on form button[aria-label="Send" i] {
  background: var(--skm-qwen-accent) !important;
  color: #ffffff !important;
  border-radius: 50% !important;
}
html.skm-mask-on form button[aria-label="发送"]:disabled,
html.skm-mask-on button[data-testid="send-button"]:disabled { opacity: .4 !important; }
html.skm-mask-on [data-message-author-role="user"] { --theme-user-msg-bg: var(--skm-qwen-bubble) !important; }
html.skm-mask-on [data-message-author-role="assistant"] {
  color: var(--skm-qwen-text) !important;
  font-size: 15px;
  line-height: 1.75;
}
html.skm-mask-on [data-app-shell-titlebar] [role="group"][aria-label="撰写器模式"] {
  background: var(--skm-qwen-hover) !important;
  border: 1px solid var(--skm-qwen-border);
  height: 34px;
}
html.skm-mask-on [data-app-shell-titlebar] [role="group"][aria-label="撰写器模式"] > span {
  background: transparent !important;
  box-shadow: none !important;
}
html.skm-mask-on [data-app-shell-titlebar] [role="group"][aria-label="撰写器模式"] button {
  color: var(--skm-qwen-muted) !important;
}
html.skm-mask-on [data-app-shell-titlebar] [role="group"][aria-label="撰写器模式"] button[aria-pressed="true"] {
  color: var(--skm-qwen-accent) !important;
  background: var(--skm-qwen-page) !important;
  box-shadow: 0 1px 3px var(--skm-qwen-text)0c;
}
/* Extra ChatGPT features keep their native position and hit targets. */
html.skm-mask-on [data-app-shell-titlebar] [role="group"][aria-label="撰写器模式"],
html.skm-mask-on main:has([data-composer-placement="home"]) [class~="group/home-suggestion-list-item"],
html.skm-mask-on #app-shell-sidebar [data-sidebar-destination="builtin:automations"],
html.skm-mask-on #app-shell-sidebar [data-sidebar-destination="builtin:library"],
html.skm-mask-on #app-shell-sidebar [data-sidebar-destination="builtin:skills"],
html.skm-mask-on #app-shell-sidebar .sidebar-item[aria-haspopup="menu"]:not([data-sidebar-destination]),
html.skm-mask-on #app-shell-sidebar .sidebar-item[aria-label="定时任务"],
html.skm-mask-on #app-shell-sidebar .sidebar-item[aria-label="资料库"],
html.skm-mask-on #app-shell-sidebar .sidebar-item[aria-label="插件"],
html.skm-mask-on #app-shell-sidebar .sidebar-item[aria-label="探索"],
html.skm-mask-on #app-shell-sidebar .sidebar-item[aria-label="Tasks"],
html.skm-mask-on #app-shell-sidebar .sidebar-item[aria-label="Library"],
html.skm-mask-on #app-shell-sidebar .sidebar-item[aria-label="Apps"],
html.skm-mask-on #app-shell-sidebar .sidebar-item[aria-label="Explore"] {
  opacity: var(--skm-extra-opacity, .25) !important;
  transition: opacity 150ms ease;
}
html.skm-mask-on [data-app-shell-titlebar] [role="group"][aria-label="撰写器模式"]:is(:hover, :focus-within),
html.skm-mask-on main:has([data-composer-placement="home"]) [class~="group/home-suggestion-list-item"]:is(:hover, :focus-within),
html.skm-mask-on #app-shell-sidebar .sidebar-item:is(:hover, :focus-within) {
  opacity: 1 !important;
}
@media (prefers-reduced-motion: reduce) {
  html.skm-mask-on [data-app-shell-titlebar] [role="group"],
  html.skm-mask-on [class~="group/home-suggestion-list-item"],
  html.skm-mask-on #app-shell-sidebar .sidebar-item { transition: none; }
}
html.skm-mask-on ::selection { background: var(--skm-qwen-selection); }
html.skm-mask-on * { scrollbar-color: var(--skm-qwen-scrollbar) transparent; }
`.trim()
