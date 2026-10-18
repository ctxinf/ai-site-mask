const deepseekLogoUrl = chrome.runtime.getURL('images/deepseek-logo.svg')
const deepseekIconUrl = chrome.runtime.getURL('images/deepseek-icon.svg')
export const deepseekPaletteCss = `
/* ============ 1. DeepSeek 品牌色板（皮肤变量，换主题只改这里） ============ */
html.skm-mask-on {
  --skm-deepseek: 1;
  --skm-new-chat: #ffffff;
  --skm-scheme: light;
  --skm-blue: #4d6bfe;        /* deepseek 品牌蓝 */
  --skm-blue-hover: #3d5bef;
  --skm-page: #ffffff;        /* 主对话区 */
  --skm-sidebar: #f8f9fb;     /* 左侧会话栏 */
  --skm-composer: #ffffff;     /* 输入框底色 */
  --skm-user-bubble: #edf2ff;  /* 用户消息气泡 */
  --skm-text: #262626;
  --skm-text-2: #6b6b6b;
  --skm-text-3: #9a9a9a;
  --skm-border: #e5e5e5;
  --skm-hover: #e9e9eb;
}

html.skm-mask-on.dark, html.skm-mask-on[data-theme="dark"] {
  --skm-new-chat: #44464b;
  --skm-scheme: dark;
  --skm-page: #141414;
  --skm-sidebar: #1c1c1c;
  --skm-composer: #2b2b2b;
  --skm-user-bubble: #2b2b2b;
  --skm-text: #ededed;
  --skm-text-2: #b4b4bc;
  --skm-text-3: #85858e;
  --skm-border: #3b3b3d;
  --skm-hover: #343436;
  --skm-blue: #4d7bfe;
}

`
/** DeepSeek light skin; native controls stay in place and extras reveal on interaction. */
export const deepseekThemeCss = `
${deepseekPaletteCss}
/* ============ 2. 接管 ChatGPT design token ============
 * 变量表来源：catppuccin/userstyles styles/chatgpt（MIT，2026.08.16 版）。
 * ChatGPT 在 html.light / html.dark 下定义这些变量，与我们的
 * html.skm-mask-on 特异度持平，用 !important 确保皮肤获胜。 */
html.skm-mask-on {
  --bg-primary: var(--skm-page) !important;
  --bg-secondary: var(--skm-sidebar) !important;
  --bg-tertiary: var(--skm-composer) !important;
  --main-surface-primary: var(--skm-page) !important;
  --main-surface-secondary: var(--skm-sidebar) !important;
  --main-surface-tertiary: var(--skm-composer) !important;
  --sidebar-surface: var(--skm-sidebar) !important;
  --sidebar-surface-primary: var(--skm-sidebar) !important;
  --bg-secondary-surface: var(--skm-sidebar) !important;
  --bg-elevated-primary: var(--skm-page) !important;
  --bg-elevated-secondary: var(--skm-sidebar) !important;
  --text-primary: var(--skm-text) !important;
  --text-secondary: var(--skm-text-2) !important;
  --text-tertiary: var(--skm-text-3) !important;
  --text-quaternary: var(--skm-text-3) !important;
  --border-light: var(--skm-border) !important;
  --border-default: #dcdcdc !important;
  --border-medium: #d0d0d0 !important;
  --theme-user-msg-bg: var(--skm-user-bubble) !important;
  --theme-user-msg-text: var(--skm-text) !important;
  --theme-submit-btn-bg: var(--skm-blue) !important;
  --theme-submit-btn-text: #ffffff !important;
  --theme-secondary-btn-bg: var(--skm-composer) !important;
  --theme-secondary-btn-text: var(--skm-text) !important;
  --interactive-label-accent-default: var(--skm-blue) !important;
  --interactive-bg-secondary-hover: var(--skm-hover) !important;
  --surface-hover: var(--skm-hover) !important;
  --icon-tertiary: var(--skm-text-3) !important;
  --shadow-color-1: rgba(0, 0, 0, 0.06) !important;
  --shadow-color-2: rgba(0, 0, 0, 0.08) !important;
}

/* ============ 3. 页面基底 ============ */
html.skm-mask-on [data-dil-message-id] { color: var(--skm-text) !important; }
html.skm-mask-on [data-dil-message-id] [data-d-text-flow] { color: inherit !important; }
html.skm-mask-on body,
html.skm-mask-on main,
html.skm-mask-on [role="main"] {
  background-color: var(--skm-page) !important;
  color: var(--skm-text) !important;
}

/* ============ 4. 输入框：deepseek 式大圆角 + 浅灰底 + 柔和阴影 ============
 * 选择器：语义钩子优先，按优先级降级（GPTDisguise 2.1.8 同款顺序）。 */
html.skm-mask-on #prompt-textarea,
html.skm-mask-on div[contenteditable="true"].ProseMirror,
html.skm-mask-on form div[contenteditable="true"],
html.skm-mask-on textarea[data-id] {
  border-radius: 24px !important;
}
/* 输入框外层容器：:has 精确定位到含输入框的 form，不误伤页内其他 form */
html.skm-mask-on form:has(#prompt-textarea),
html.skm-mask-on form:has(div[contenteditable="true"].ProseMirror) {
  border-radius: 28px !important;
  background-color: var(--skm-composer) !important;
  border: 1px solid var(--skm-border) !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06) !important;
}

/* ============ 5. 发送按钮：品牌蓝圆形 ============ */
html.skm-mask-on button[data-testid="send-button"],
html.skm-mask-on button[aria-label*="send prompt" i],
html.skm-mask-on form button[type="submit"] {
  border-radius: 9999px !important;
  background-color: var(--skm-blue) !important;
  color: #ffffff !important;
}
html.skm-mask-on button[data-testid="send-button"]:hover,
html.skm-mask-on button[aria-label*="send prompt" i]:hover,
html.skm-mask-on form button[type="submit"]:hover {
  background-color: var(--skm-blue-hover) !important;
}

/* ============ 6. 用户气泡：浅灰蓝圆角；AI 回复：纯文本排版 ============ */
html.skm-mask-on [data-message-author-role="user"] {
  border-radius: 16px !important;
}
html.skm-mask-on article[data-testid^="conversation-turn"] [data-message-author-role="assistant"],
html.skm-mask-on [data-message-author-role="assistant"] {
  font-size: 15px !important;
  line-height: 1.75 !important;
}

/* ============ 7. 侧边栏：浅灰底 + 右分隔线 ============ */
html.skm-mask-on nav[aria-label="Chat history"],
html.skm-mask-on #stage-slideover-sidebar {
  background-color: var(--skm-sidebar) !important;
  border-right: 1px solid var(--skm-border) !important;
}
/* 新对话按钮：圆角 12px（颜色走 token） */
html.skm-mask-on a[data-testid="create-new-chat-button"],
html.skm-mask-on nav a[aria-label="New chat"] {
  border-radius: 12px !important;
}

/* Current ChatGPT surfaces. */
html.skm-mask-on {
  color-scheme: var(--skm-scheme) !important;
  --color-text: var(--skm-text) !important;
  --color-text-emphasis: var(--skm-text) !important;
  --color-text-composer-primary: var(--skm-text) !important;
  --color-text-secondary-soft-alt: var(--skm-text-2) !important;
  --color-text-secondary-solid: var(--skm-text-2) !important;
  --app-color-text-foreground: var(--skm-text) !important;
  --app-color-text-foreground-secondary: var(--skm-text-2) !important;
  --app-color-text-foreground-tertiary: var(--skm-text-3) !important;
  --app-color-text-secondary: var(--skm-text-2) !important;
  --color-token-foreground: var(--skm-text) !important;
  --color-token-dropdown-foreground: var(--skm-text) !important;
  --color-token-description-foreground: var(--skm-text-3) !important;
  --color-token-border-default: var(--skm-border) !important;
  --user-message-text-color: var(--skm-text) !important;
  --user-message-background-color: var(--skm-user-bubble) !important;
  --color-background-user-message: var(--skm-user-bubble) !important;
  --color-background-user-message-compact: var(--skm-user-bubble) !important;
  --color-text-user-message: var(--skm-text) !important;
  --segmented-control-background: var(--skm-hover) !important;
  --segmented-control-thumb-background: var(--skm-page) !important;
  --segmented-control-option-highlight-background-color: var(--skm-page) !important;
  /* Current ChatGPT design system (observed in the live DOM). */
  --color-surface: var(--skm-page) !important;
  --color-surface-secondary: var(--skm-sidebar) !important;
  --color-surface-tertiary: var(--skm-hover) !important;
  --color-surface-card: var(--skm-page) !important;
  --color-surface-canvas: var(--skm-sidebar) !important;
  --color-surface-elevated: var(--skm-page) !important;
  --color-surface-elevated-secondary: var(--skm-sidebar) !important;
  --color-surface-recovery: var(--skm-page) !important;
  --color-background-composer-surface: var(--skm-page) !important;
  --color-background-primary-surface: var(--skm-hover) !important;
  --color-text-primary: var(--skm-text) !important;
  --color-text-primary-surface: var(--skm-text) !important;
  --color-text-primary-soft: var(--skm-text) !important;
  --color-text-primary-soft-alt: var(--skm-text) !important;
  --color-text-primary-outline: var(--skm-text) !important;
  --color-text-primary-outline-hover: var(--skm-text) !important;
  --color-text-primary-ghost: var(--skm-text) !important;
  --color-text-primary-ghost-hover: var(--skm-text) !important;
  --color-text-secondary: var(--skm-text-2) !important;
  --color-text-tertiary: var(--skm-text-3) !important;
  --color-text-quaternary: var(--skm-text-3) !important;
  --color-border-default: var(--skm-border) !important;
  --color-border-primary-surface: var(--skm-border) !important;
  --color-token-bg-primary: var(--skm-page) !important;
  --color-token-bg-secondary: var(--skm-sidebar) !important;
  --color-token-bg-tertiary: var(--skm-hover) !important;
  --color-token-main-surface-primary: var(--skm-page) !important;
  --color-token-text-primary: var(--skm-text) !important;
  --color-token-text-secondary: var(--skm-text-2) !important;
  --color-token-text-tertiary: var(--skm-text-3) !important;
  --color-token-interactive-bg-secondary-hover: var(--skm-hover) !important;
  --app-color-background-surface: var(--skm-page) !important;
  --app-color-background-surface-under: var(--skm-sidebar) !important;
  --app-shell-sidebar-divider: var(--skm-border) !important;
  --app-shell-sidebar-popover-background: var(--skm-page) !important;
  --app-shell-sidebar-popover-border: var(--skm-border) !important;
  --codex-base-surface: var(--skm-page) !important;
  --wb-surface-primary: var(--skm-page) !important;
  --wb-surface-secondary: var(--skm-sidebar) !important;
  --wb-text-primary: var(--skm-text) !important;

  --color-surface: var(--skm-page) !important;
  --color-surface-secondary: var(--skm-sidebar) !important;
  --color-surface-tertiary: var(--skm-hover) !important;
  --color-surface-elevated: var(--skm-page) !important;
  --color-background-composer-surface: var(--skm-page) !important;
  --color-text: var(--skm-text) !important;
  --color-text-primary: var(--skm-text) !important;
  --color-text-secondary: var(--skm-text-2) !important;
  --color-text-tertiary: var(--skm-text-3) !important;
  --color-border-default: var(--skm-border) !important;
  --user-message-background-color: var(--skm-user-bubble) !important;
  --color-background-user-message: var(--skm-user-bubble) !important;
  --user-message-text-color: var(--skm-text) !important;
}
html.skm-mask-on :is(aside.app-shell-left-panel, #app-shell-sidebar, [data-app-shell-header-slot="start"]) {
  --color-surface: var(--skm-sidebar) !important;
  background: var(--skm-sidebar) !important;
}
html.skm-mask-on [data-app-navigation-rail] {
  background: var(--skm-page) !important;
}
/* Replace only decoration inside native brand and expand buttons. */
html.skm-mask-on button:is([aria-label*="当前模式：ChatGPT"], [aria-label*="current mode: ChatGPT" i]) > span > span:first-child {
  font-size: 0 !important;
}
html.skm-mask-on button:is([aria-label*="当前模式：ChatGPT"], [aria-label*="current mode: ChatGPT" i]) > span > span:first-child > span {
  display: none !important;
}
html.skm-mask-on button:is([aria-label*="当前模式：ChatGPT"], [aria-label*="current mode: ChatGPT" i]) > span > span:first-child::after {
  content: "";
  display: inline-block;
  width: 143px;
  height: 23px;
  background: url("${deepseekLogoUrl}") center / contain no-repeat;
}
html.skm-mask-on [data-app-navigation-rail] [data-app-shell-sidebar-trigger] {
  background: url("${deepseekIconUrl}") center / 28px 22px no-repeat !important;
}
html.skm-mask-on [data-app-navigation-rail] [data-app-shell-sidebar-trigger] > span {
  opacity: 0 !important;
}
html.skm-mask-on main:has([data-composer-placement="home"]) h1:not(article *):not(.markdown *) {
  font-size: 0 !important;
}
html.skm-mask-on main:has([data-composer-placement="home"]) h1:not(article *):not(.markdown *)::after {
  content: "你好，让我们开始聊天吧";
  display: inline-block;
  padding-inline-start: 44px;
  background: url("${deepseekIconUrl}") left center / 34px 26px no-repeat;
  font-size: clamp(22px, 2vw, 26px);
  font-weight: 600;
}
html.skm-mask-on form[data-chatgpt-composer] {
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
html.skm-mask-on :is([data-composer-surface], [data-composer-surface-variant]) {
  background: var(--skm-composer) !important;
  border-radius: 24px !important;
  box-shadow: 0 8px 32px #18244b08 !important;
}
@layer components {
  html.skm-mask-on :is([data-composer-surface], [data-composer-surface-variant]) {
    border: 1px solid var(--skm-border) !important;
  }
}
html.skm-mask-on [data-composer-body] { background: transparent !important; }
html.skm-mask-on [data-composer-markdown] p[data-empty-paragraph="true"][data-placeholder]::before {
  content: "给 DeepSeek 发送消息" !important;
  color: #a6adba !important;
}
html.skm-mask-on form button:is([aria-label="发送"], [aria-label="Send" i]) {
  background: var(--skm-blue) !important;
  color: white !important;
  border-radius: 50% !important;
}
html.skm-mask-on form button:is([aria-label="发送"], [aria-label="Send" i]):disabled { opacity: .4 !important; }
/* Quiet extras retain their original hit targets and keyboard access. */
html.skm-mask-on :is(
  [data-app-shell-titlebar] [role="group"],
  [class~="group/home-suggestion-list-item"],
  [data-app-navigation-rail] .sidebar-item:not(:has([aria-label*="个人资料"], [aria-label*="profile" i])):not([aria-label="新聊天"]):not([aria-label="搜索"]):not([aria-label="New chat" i]):not([aria-label="Search" i]),
  #app-shell-sidebar [data-sidebar-destination],
  [data-app-shell-titlebar] button[aria-label="更多"],
  [data-app-shell-titlebar] button[aria-label="More" i]
) {
  opacity: 0 !important;
  transition: opacity 150ms ease;
}
html.skm-mask-on :is(
  [data-app-shell-titlebar] [role="group"],
  [class~="group/home-suggestion-list-item"],
  [data-app-navigation-rail] .sidebar-item,
  #app-shell-sidebar [data-sidebar-destination],
  [data-app-shell-titlebar] button[aria-label="更多"],
  [data-app-shell-titlebar] button[aria-label="More" i]
):is(:hover, :focus-within, [data-state="open"]) { opacity: 1 !important; }
@media (prefers-reduced-motion: reduce) {
  html.skm-mask-on :is(.sidebar-item, [data-app-shell-titlebar] [role="group"], [class~="group/home-suggestion-list-item"]) { transition: none; }
}

/* DeepSeek layout: roomy editor above a compact native action row. */
html.skm-mask-on [data-composer-footer-responsive] {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto !important;
  grid-template-rows: minmax(56px, auto) auto !important;
  gap: 10px 8px !important;
  padding: 14px 12px 12px !important;
}
html.skm-mask-on [data-composer-footer-responsive] > :nth-child(2) {
  grid-column: 1 / -1 !important;
  grid-row: 1 !important;
  margin: 0 !important;
}
html.skm-mask-on [data-composer-footer-responsive] > :first-child {
  grid-column: 1 !important; grid-row: 2 !important; align-self: end;
}
html.skm-mask-on [data-composer-footer-responsive] > :last-child {
  grid-column: 2 !important; grid-row: 2 !important; align-self: end;
}
html.skm-mask-on [data-composer-input] { padding: 0 !important; }
html.skm-mask-on [data-composer-input-layout] {
  height: auto !important; min-height: 56px !important; max-height: 240px; overflow-y: auto !important;
}
html.skm-mask-on [data-composer-markdown] {
  min-height: 56px !important; height: auto !important; padding: 2px 3px !important;
  border-radius: 0 !important; color: var(--skm-text) !important;
}
html.skm-mask-on [data-composer-navigation-target="reasoning"] {
  border: 1px solid var(--skm-border) !important;
  border-radius: 18px !important; min-height: 32px; font-size: 13px !important;
  color: var(--skm-blue) !important;
}
html.skm-mask-on form button:is([aria-label="发送"], [aria-label="Send" i]) {
  width: 34px !important; height: 34px !important;
}
html.skm-mask-on form button:is([aria-label="发送"], [aria-label="Send" i]) svg { color: white !important; }
html.skm-mask-on nav:not([data-app-navigation-rail]) button.sidebar-item:has(.text-fade-truncate):not([data-sidebar-destination]) {
  border-radius: 999px !important;
}
html.skm-mask-on nav:not([data-app-navigation-rail]) > div:first-child button.sidebar-item {
  min-height: 42px; margin-block: 8px; border: 1px solid var(--skm-border) !important;
  background: var(--skm-new-chat) !important; box-shadow: 0 1px 2px #00000008;
}
html.skm-mask-on nav:not([data-app-navigation-rail]) > div:first-child button.sidebar-item > div {
  justify-content: center !important; flex: 1;
}
html.skm-mask-on nav:not([data-app-navigation-rail]) > div:first-child button.sidebar-item > div > span {
  flex: 0 0 auto !important; width: auto !important; max-width: none !important;
}
html.skm-mask-on nav:not([data-app-navigation-rail]) > div:first-child button.sidebar-item .text-fade-truncate {
  font-size: 0 !important;
}
html.skm-mask-on nav:not([data-app-navigation-rail]) > div:first-child button.sidebar-item .text-fade-truncate::after {
  content: "开启新对话"; font-size: 14px;
}
html.skm-mask-on [data-composer-body] { position: relative; border-radius: inherit !important; box-shadow: none !important; }
html.skm-mask-on [data-composer-navigation-target="reasoning"] {
  position: absolute; inset-inline-start: 12px; bottom: 12px;
}
html.skm-mask-on [data-composer-navigation-target="add-context"] {
  position: absolute; inset-inline-end: 58px; bottom: 12px;
}
html.skm-mask-on nav:not([data-app-navigation-rail]) > div:first-child button.sidebar-item .icon-leading-slot {
  position: relative;
}
html.skm-mask-on nav:not([data-app-navigation-rail]) > div:first-child button.sidebar-item .icon-leading-slot > * { opacity: 0; }
html.skm-mask-on nav:not([data-app-navigation-rail]) > div:first-child button.sidebar-item .icon-leading-slot::after {
  content: ""; position: absolute; width: 17px; height: 17px; background: currentColor;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='black' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 19l-2 2 1-5a9 9 0 1 1 4 4'/%3E%3Cpath d='M12 7v8M8 11h8'/%3E%3C/g%3E%3C/svg%3E") center / contain no-repeat;
}
html.skm-mask-on .skm-deepseek-fold { margin: 0 10px; color: var(--skm-text-3); font-size: 13px; }
html.skm-mask-on .skm-deepseek-fold summary { padding: 7px 4px; cursor: pointer; border-radius: 6px; }
html.skm-mask-on .skm-deepseek-fold summary:hover { background: var(--skm-hover); }
html.skm-mask-on [data-skm-folded="true"] { display: none !important; }
html.skm-mask-on [data-skm-folded="false"] [data-sidebar-destination] { opacity: 1 !important; }
html.skm-mask-on .skm-deepseek-chat-title {
  pointer-events: auto; max-width: min(48vw, 440px); min-width: 0; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap; border: 0; border-radius: 5px;
  background: transparent; color: var(--skm-text); padding: 5px 10px;
  font-family: inherit; font-size: 14px; font-weight: 500; line-height: 20px; cursor: text; text-align: start;
}
html.skm-mask-on .skm-deepseek-chat-title:hover { background: var(--skm-hover); }
html.skm-mask-on .skm-deepseek-title-input {
  width: min(40vw, 340px); background: var(--skm-composer); color: var(--skm-text);
  border: 1px solid var(--skm-blue); border-radius: 4px; padding: 2px 6px; font: inherit;
}
html.skm-mask-on [data-app-shell-titlebar] button:is([aria-label*="临时"], [aria-label*="temporary" i]) {
  opacity: 0 !important; transition: opacity 150ms ease;
}
html.skm-mask-on [data-app-shell-titlebar] button:is([aria-label*="临时"], [aria-label*="temporary" i]):is(:hover, :focus-visible, [data-state="open"]) { opacity: 1 !important; }

html.skm-mask-on { --skm-share-icon: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M7.95889%201.52285C7.95888%200.826234%208.76055%200.467983%209.27669%200.875208L9.37524%200.967191L15.1317%207.18358C15.5582%207.64419%2015.5582%208.35614%2015.1317%208.81676L9.37524%2015.0331C8.87034%2015.578%207.95888%2015.2205%207.95889%2014.4775V10.8207C7.10614%2010.8432%206.31361%2010.9316%205.45468%2011.2515C4.39484%2011.6463%203.18248%2012.413%201.64676%2013.9425C1.4533%2014.135%201.18329%2014.1696%200.969086%2014.0908C0.74748%2014.0091%200.547307%2013.7879%200.54859%2013.4844L0.55516%2013.1315C0.618924%2011.3494%201.11153%209.29838%202.27656%207.63787C3.45289%205.96147%205.29554%204.71635%207.95889%204.54797V1.52285ZM9.20911%205.13366C9.20899%205.50567%208.9031%205.77687%208.56523%205.77755C5.99383%205.78282%204.33736%206.8762%203.29964%208.35496C2.54519%209.43014%202.10739%2010.7283%201.9152%2011.9939C3.04749%2011.0323%204.0569%2010.4385%205.01917%2010.0801C6.29638%209.60449%207.4406%209.56343%208.56429%209.56295C8.9178%209.5628%209.20894%209.84909%209.20911%2010.2068L9.20817%2013.3737L14.1837%208.00017L9.20817%202.62571L9.20911%205.13366Z%22/%3E%3C/svg%3E"); }
/* A single quiet disclosure controls all optional sidebar sections. */
html.skm-mask-on .skm-deepseek-fold { margin: 0 10px; height: 20px; }
html.skm-mask-on .skm-deepseek-fold summary {
  display: flex; align-items: center; width: 28px; height: 20px; padding: 0 4px;
  list-style: none; opacity: 0; transition: opacity 150ms ease;
}
html.skm-mask-on .skm-deepseek-fold summary::-webkit-details-marker { display: none; }
html.skm-mask-on .skm-deepseek-fold summary::before {
  content: ''; width: 0; height: 0; border-top: 4px solid transparent;
  border-bottom: 4px solid transparent; border-inline-start: 5px solid currentColor;
}
html.skm-mask-on .skm-deepseek-fold[open] summary::before { transform: rotate(90deg); }
html.skm-mask-on .skm-deepseek-fold:is(:hover, :focus-within) summary { opacity: 1; }
html.skm-mask-on .skm-deepseek-fold summary:hover { background: transparent; }
html.skm-mask-on [data-app-action-sidebar-section-heading="Recents"] [data-app-action-sidebar-section-toggle] > span:first-child {
  font-size: 0 !important;
}
html.skm-mask-on [data-app-action-sidebar-section-heading="Recents"] [data-app-action-sidebar-section-toggle] > span:first-child::after {
  content: '今天'; font-size: 12px; font-weight: 400;
}
html.skm-mask-on div:has([data-skm-account]) > div[aria-hidden="true"][class~="border-t-hairline"] { border-top: 0 !important; }
/* Account decoration leaves the native profile menu button in place. */
html.skm-mask-on [data-skm-account] { border: 0 !important; min-height: 48px; }
html.skm-mask-on [data-skm-account]::before { display: none !important; }
html.skm-mask-on [data-skm-account] > .pointer-events-none .flex-col { visibility: hidden; }
html.skm-mask-on .skm-deepseek-account-label {
  position: absolute; inset-inline-start: 42px; inset-inline-end: 32px; top: 50%; transform: translateY(-50%);
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  font-size: 13px; color: var(--skm-text-2); pointer-events: none;
}
html.skm-mask-on [data-skm-account]::after {
  content: '…'; position: absolute; inset: auto !important; inset-inline-end: 12px !important; top: 50% !important; transform: translateY(-50%);
  width: auto !important; height: auto !important; border: 0 !important; background: transparent !important;
  font-size: 19px; color: var(--skm-text-3); pointer-events: none;
}
html.skm-mask-on [data-composer-navigation-target="reasoning"] {
  inset-inline-start: auto; inset-inline-end: 100px; opacity: 0 !important;
  transition: opacity 150ms ease;
}
html.skm-mask-on [data-composer-navigation-target="reasoning"]:is(:hover, :focus-visible, [data-state="open"]) { opacity: 1 !important; }
html.skm-mask-on .skm-deepseek-toggles {
  position: absolute; inset-inline-start: 12px; bottom: 12px; display: flex; gap: 8px;
}
html.skm-mask-on .skm-deepseek-toggle {
  display: inline-flex; align-items: center; gap: 4px; height: 34px; padding: 0 10px;
  border: 1px solid var(--skm-border); border-radius: 18px;
  background: transparent; color: var(--skm-text); font: inherit; font-size: 13px; cursor: pointer;
}
html.skm-mask-on .skm-deepseek-toggle:hover { background: var(--skm-hover); }
html.skm-mask-on .skm-deepseek-toggle[aria-pressed="true"] {
  border-color: color-mix(in srgb, var(--skm-blue) 45%, transparent);
  background: color-mix(in srgb, var(--skm-blue) 9%, var(--skm-composer)); color: var(--skm-blue);
}
html.skm-mask-on .skm-deepseek-toggle::before {
  content: ''; width: 14px; height: 14px; background: currentColor;
}
html.skm-mask-on .skm-deepseek-toggle-think::before {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cg fill='none' stroke='black' stroke-width='1.3'%3E%3Cellipse cx='8' cy='8' rx='7' ry='3' transform='rotate(45 8 8)'/%3E%3Cellipse cx='8' cy='8' rx='7' ry='3' transform='rotate(-45 8 8)'/%3E%3C/g%3E%3Ccircle cx='8' cy='8' r='1.2'/%3E%3C/svg%3E") center / contain no-repeat;
}
html.skm-mask-on .skm-deepseek-toggle-search::before {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cg fill='none' stroke='black' stroke-width='1.3'%3E%3Ccircle cx='8' cy='8' r='6.8'/%3E%3Cellipse cx='8' cy='8' rx='2.9' ry='6.8'/%3E%3Cpath d='M1.2 8h13.6'/%3E%3C/g%3E%3C/svg%3E") center / contain no-repeat;
}
html.skm-mask-on [data-app-shell-titlebar] button:is([aria-label="分享"], [aria-label="Share" i]) {
  position: relative; width: 32px; min-width: 32px; padding: 0 !important;
  border: 0 !important; background: transparent !important; font-size: 0 !important;
}
html.skm-mask-on [data-app-shell-titlebar] button:is([aria-label="分享"], [aria-label="Share" i]) > * { opacity: 0 !important; }
html.skm-mask-on [data-app-shell-titlebar] button:is([aria-label="分享"], [aria-label="Share" i])::after {
  content: ''; position: absolute; width: 16px; height: 16px; top: 50%; left: 50%; transform: translate(-50%, -50%);
  background: currentColor; mask: var(--skm-share-icon) center / contain no-repeat;
}
@media (max-width: 480px) {
  html.skm-mask-on .skm-deepseek-toggles { gap: 4px; inset-inline-start: 8px; }
  html.skm-mask-on .skm-deepseek-toggle { padding-inline: 7px; font-size: 12px; }
  html.skm-mask-on [data-composer-navigation-target="reasoning"] { max-width: 64px; padding-inline: 4px !important; }
}

/* ============ 8. 滚动条：细、浅灰 ============ */
html.skm-mask-on ::-webkit-scrollbar {
  width: 10px !important;
  height: 10px !important;
}
html.skm-mask-on ::-webkit-scrollbar-thumb {
  background-color: #d4d4d4 !important;
  border-radius: 8px !important;
}
html.skm-mask-on ::-webkit-scrollbar-track {
  background-color: transparent !important;
}

/* Native accuracy notice can appear above the composer after SPA navigation. */
html.skm-mask-on main [data-markdown-copy="exclude"].text-center.text-pretty.text-codex-description {
  display: none !important;
}
`.trim()
