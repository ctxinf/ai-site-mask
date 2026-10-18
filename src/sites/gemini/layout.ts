/** Structural parity with the ChatGPT/Grok skins, scoped to observed Gemini landmarks. */
export function geminiLayoutCss(deepseek: boolean): string {
  const logo = deepseek ? `url("${chrome.runtime.getURL('images/deepseek-logo.svg')}")` : 'var(--skm-qwen-logo)'
  const icon = `url("${chrome.runtime.getURL(deepseek ? 'images/deepseek-icon.svg' : 'images/qwen-favicon.png')}")`
  return `
/* Native sidebar sizing/collapse remains under Gemini's control. */
html.skm-mask-on :is(bard-sidenav,mat-sidenav) { border-inline-end: 1px solid ${deepseek ? 'var(--skm-g-border)' : 'transparent'}; }
html.skm-mask-on :is(bard-sidenav,mat-sidenav) .gem-nav-list-item { border-radius: 10px !important; }
html.skm-mask-on :is(bard-sidenav,mat-sidenav) .gem-nav-list-item:hover { background: var(--skm-g-hover) !important; }
html.skm-mask-on :is(bard-sidenav,mat-sidenav) [data-skm-gemini-history] { min-height: 36px; font-size: 14px; }
html.skm-mask-on :is(bard-sidenav,mat-sidenav) .gem-nav-list-item:is([aria-current="page"],.is-active) {
  color: var(--skm-g-accent) !important; background: var(--skm-g-bubble) !important;
}
html.skm-mask-on :is(bard-sidenav,mat-sidenav) [data-skm-gemini-new-chat] {
  margin-block: 5px; min-height: ${deepseek ? '42px' : '36px'}; border-radius: ${deepseek ? '24px' : '10px'} !important;
  background: ${deepseek ? 'var(--skm-new-chat)' : 'var(--skm-qwen-active)'} !important;
  ${deepseek ? 'border: 1px solid var(--skm-g-border);' : ''}
}
html.skm-mask-on :is(bard-sidenav,mat-sidenav) [data-skm-gemini-new-chat] .title-text { font-size: 0 !important; }
html.skm-mask-on :is(bard-sidenav,mat-sidenav) [data-skm-gemini-new-chat] .title-text::after {
  content: '${deepseek ? '开启新对话' : '新聊天'}'; font-size: 14px;
}
html.skm-mask-on side-nav-sparkle-button a {
  background: ${logo} left center / ${deepseek ? '128px 26px' : '88px 26px'} no-repeat !important;
  min-height: 32px; min-width: 0 !important; width: ${deepseek ? '143px' : '88px'} !important;
}
html.skm-mask-on side-nav-sparkle-button a > * { visibility: hidden; }
/* The collapsed native expand button remains fully clickable. */
html.skm-mask-on side-nav-sparkle-button button .sparkle-image-container {
  background: ${icon} center / ${deepseek ? '28px 24px' : '26px 26px'} no-repeat;
  width: 28px; height: 28px; display: block !important; overflow: hidden;
}
html.skm-mask-on side-nav-sparkle-button button .sparkle-image-container img { opacity: 0; }
html.skm-mask-on [data-skm-gemini-recents] { font-size: 0 !important; }
html.skm-mask-on [data-skm-gemini-recents]::after { content: '历史对话'; font-size: 12px; color: var(--skm-g-muted); }
html.skm-mask-on .skm-gemini-fold {
  display: block; width: 28px; height: 22px; margin-inline: 14px; padding: 4px 8px;
  color: var(--skm-g-muted); border: 0; border-radius: 5px; background: transparent; cursor: pointer;
  opacity: var(--skm-extra-opacity, .25);
}
html.skm-mask-on .skm-gemini-fold::before {
  content: ''; display: block; border-block: 4px solid transparent; border-inline-start: 5px solid currentColor;
  width: 0; height: 0;
}
html.skm-mask-on .skm-gemini-fold[aria-expanded="true"]::before { transform: rotate(90deg); }
html.skm-mask-on .skm-gemini-fold:is(:hover,:focus-visible) { opacity: 1; background: var(--skm-g-hover); }
html.skm-mask-on [data-skm-gemini-folded="true"] { display: none !important; }

/* Home greeting never matches message headings or code. */
html.skm-mask-on [data-skm-gemini-greeting] {
  font-size: 0 !important; color: var(--skm-g-text); line-height: 1.4 !important;
  display: flex; align-items: center; justify-content: center; gap: 12px;
}
html.skm-mask-on [data-skm-gemini-greeting] > * { display: none; }
html.skm-mask-on [data-skm-gemini-greeting]::after {
  content: '${deepseek ? '你好，让我们开始聊天吧' : '有什么可以帮你的吗？'}';
  font-size: clamp(22px, 2vw, 28px); font-weight: ${deepseek ? '600' : '400'}; letter-spacing: -.4px;
}
${deepseek ? `html.skm-mask-on [data-skm-gemini-greeting]::before {
  content: ''; flex: 0 0 34px; height: 28px; background: ${icon} center / contain no-repeat;
}` : ''}
html.skm-mask-on modular-zero-state .assistant-messages-primary-container { background: transparent !important; }
html.skm-mask-on input-container .input-area-container {
  max-width: 768px !important; width: calc(100% - 32px) !important; margin-inline: auto;
}
html.skm-mask-on input-area-v2 .text-input-field {
  background: var(--skm-g-composer) !important; border: 1px solid var(--skm-g-border) !important;
  border-radius: ${deepseek ? '26px' : '30px'} !important; box-shadow: none !important;
  min-width: 0; overflow: visible; padding: ${deepseek ? '16px 12px 10px' : '10px 12px'} !important;
  grid-template-columns: ${deepseek ? 'minmax(0, 1fr) auto auto' : '40px minmax(0, 1fr) auto'} !important;
  grid-template-rows: ${deepseek ? 'minmax(60px, auto) auto' : 'auto'} !important;
  gap: ${deepseek ? '10px 6px' : '0 8px'} !important;
}
html.skm-mask-on input-area-v2 :is(.single-line-format,.multi-line-format) {
  grid-column: ${deepseek ? '1 / -1' : '2'} !important; grid-row: 1 !important;
  min-width: 0; margin: 0 !important;
}
html.skm-mask-on input-area-v2 .leading-actions-wrapper {
  grid-column: ${deepseek ? '2' : '1'} !important; grid-row: ${deepseek ? '2' : '1'} !important;
  align-self: end; margin: 0 !important;
}
html.skm-mask-on input-area-v2 .trailing-actions-wrapper {
  grid-column: 3 !important; grid-row: ${deepseek ? '2' : '1'} !important;
  align-self: end; margin: 0 !important; min-width: 0;
}
html.skm-mask-on [data-skm-gemini-editor] {
  color: var(--skm-g-text) !important; caret-color: var(--skm-g-accent);
  font-size: 16px !important; line-height: 24px !important;
  min-height: ${deepseek ? '60px' : '32px'} !important; max-height: 240px; overflow-y: auto;
  padding: ${deepseek ? '2px 4px' : '4px 0'} !important;
}
html.skm-mask-on [data-skm-gemini-editor].ql-blank::before {
  content: '${deepseek ? '给 DeepSeek 发送消息' : '有什么我能帮你的吗？'}' !important;
  color: var(--skm-g-muted) !important; font-style: normal;
}
html.skm-mask-on input-area-v2 :is(button[aria-label="Send message"],button[aria-label="发送消息"],button[aria-label="发送"]) {
  width: 34px; height: 34px; border-radius: 50% !important;
  background: var(--skm-g-accent) !important; color: white !important;
}
html.skm-mask-on input-area-v2 :is(button[aria-label="Send message"],button[aria-label="发送消息"],button[aria-label="发送"]):disabled { opacity: .4 !important; }
html.skm-mask-on input-area-v2 :is(button[aria-label="Send message"],button[aria-label="发送消息"],button[aria-label="发送"]):not(:disabled):hover { filter: brightness(.94); }
html.skm-mask-on .skm-gemini-toggles {
  grid-column: 1; grid-row: 2; display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
}
html.skm-mask-on .skm-gemini-toggle {
  display: inline-flex; align-items: center; gap: 5px; min-height: 34px; padding: 0 10px;
  border: 1px solid var(--skm-g-border); border-radius: 18px; background: transparent;
  color: var(--skm-g-text); font: inherit; font-size: 13px; cursor: pointer;
}
html.skm-mask-on .skm-gemini-toggle:hover { background: var(--skm-g-hover); }
html.skm-mask-on .skm-gemini-toggle[aria-pressed="true"] {
  color: var(--skm-g-accent); border-color: var(--skm-g-accent); background: var(--skm-g-bubble);
}
html.skm-mask-on .skm-gemini-toggle::before { content: ''; width: 14px; height: 14px; background: currentColor; }
html.skm-mask-on .skm-gemini-toggle-think::before {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cg fill='none' stroke='black' stroke-width='1.3'%3E%3Cellipse cx='8' cy='8' rx='7' ry='3' transform='rotate(45 8 8)'/%3E%3Cellipse cx='8' cy='8' rx='7' ry='3' transform='rotate(-45 8 8)'/%3E%3C/g%3E%3C/svg%3E") center / contain no-repeat;
}
html.skm-mask-on .skm-gemini-toggle-search::before {
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cg fill='none' stroke='black' stroke-width='1.3'%3E%3Ccircle cx='8' cy='8' r='6.5'/%3E%3Cellipse cx='8' cy='8' rx='3' ry='6.5'/%3E%3Cpath d='M2 6h12M2 10h12'/%3E%3C/g%3E%3C/svg%3E") center / contain no-repeat;
}
/* Header model decoration opens the actual Gemini menu; native model labels remain accurate. */
html.skm-mask-on .skm-gemini-header {
  position: absolute; inset-block-start: 12px; inset-inline-start: 12px; z-index: 30;
  display: flex; align-items: center; max-width: calc(100% - 80px); pointer-events: auto;
}
html.skm-mask-on :is(.skm-gemini-model,.skm-gemini-title) {
  border: 0; border-radius: 8px; background: transparent; color: var(--skm-g-text);
  font: inherit; font-size: ${deepseek ? '14px' : '16px'}; line-height: 24px;
  padding: 4px 8px; max-width: min(45vw, 440px); overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; cursor: ${deepseek ? 'text' : 'pointer'};
}
html.skm-mask-on .skm-gemini-model::after { content: '⌄'; margin-inline-start: 8px; }
html.skm-mask-on :is(.skm-gemini-model,.skm-gemini-title):hover { background: var(--skm-g-hover); }
html.skm-mask-on .skm-gemini-title input {
  max-width: 100%; width: min(38vw,340px); padding: 1px 4px; border: 1px solid var(--skm-g-accent);
  border-radius: 4px; background: var(--skm-g-composer); color: var(--skm-g-text); font: inherit;
}
html.skm-mask-on sidenav-mavatar-footer { color: var(--skm-g-text); }
html.skm-mask-on :is(bard-sidenav,mat-sidenav) button[aria-label="Search chats"] { color: var(--skm-g-secondary) !important; }
html.skm-mask-on :is(gem-popover-menu,.mat-mdc-menu-panel,.mat-mdc-select-panel) { background-color: var(--skm-g-composer) !important; color: var(--skm-g-text) !important; }
html.skm-mask-on :is(gem-popover-menu,.mat-mdc-menu-panel) [role^="menuitem"] { color: var(--skm-g-text) !important; }
html.skm-mask-on sidenav-mavatar-footer .mavatar-footer-row { border-top: 0; padding-block: 8px; }
html.skm-mask-on sidenav-mavatar-footer .mavatar-footer-left { flex: 1 1 0; min-width: 0; }
html.skm-mask-on sidenav-mavatar-footer [data-skm-gemini-account] { position: relative; min-height: 40px; }
html.skm-mask-on [data-skm-gemini-account] .mavatar-user-info { visibility: hidden; }
html.skm-mask-on .skm-gemini-account {
  position: absolute; inset-inline-start: 40px; inset-inline-end: 4px; top: 50%; transform: translateY(-50%);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px;
  color: var(--skm-g-secondary); pointer-events: none;
}
html.skm-mask-on [data-skm-gemini-accuracy] { font-size: 0 !important; }
html.skm-mask-on [data-skm-gemini-accuracy]::after {
  content: '人工智能生成的内容可能不准确。'; font-size: 11px; line-height: 16px; color: var(--skm-g-muted);
}
/* Additional native features retain their layout, hit targets, menus and keyboard access. */
html.skm-mask-on :is([data-skm-gemini-extra],modular-zero-state suggestion-block,chat-spark-toggle,
  desktop-get-app-button,temp-chat-button,conversation-actions-icon,speech-dictation-mic-button,
  input-area-v2 bard-mode-switcher) {
  opacity: var(--skm-extra-opacity, .25) !important; transition: opacity 150ms ease;
}
html.skm-mask-on :is([data-skm-gemini-extra],modular-zero-state suggestion-block,chat-spark-toggle,
  desktop-get-app-button,temp-chat-button,conversation-actions-icon,speech-dictation-mic-button,
  input-area-v2 bard-mode-switcher):is(:hover,:focus-within,:has([aria-expanded="true"])) { opacity: 1 !important; }
html.skm-mask-on :is(.skm-gemini-toggle,.skm-gemini-title,.skm-gemini-model,.skm-gemini-fold):focus-visible {
  outline: 2px solid var(--skm-g-accent); outline-offset: 2px;
}
html.skm-mask-on ::selection { background: var(--skm-g-bubble); }
html.skm-mask-on * { scrollbar-width: thin; scrollbar-color: var(--skm-g-border) transparent; }
@media (min-width: 1024px) {
  html.skm-mask-on :is(bard-sidenav,mat-sidenav)-content { border-radius: ${deepseek ? '0' : '12px'}; }
}
@media (max-width: 640px) {
  html.skm-mask-on input-container .input-area-container { width: calc(100% - 16px) !important; }
  html.skm-mask-on input-area-v2 .text-input-field { padding: 12px 8px 8px !important; column-gap: 4px !important; }
  html.skm-mask-on .skm-gemini-toggles { gap: 4px; }
  html.skm-mask-on .skm-gemini-toggle { font-size: 12px; padding-inline: 7px; }
  html.skm-mask-on input-area-v2 button[data-test-id="bard-mode-menu-button"] { padding-inline: 4px !important; min-width: 0; }
  html.skm-mask-on input-area-v2 .logo-pill-label-container { max-width: 64px; overflow: hidden; text-overflow: ellipsis; }
  html.skm-mask-on [data-skm-gemini-greeting] { gap: 8px; }
  html.skm-mask-on [data-skm-gemini-greeting]::after { font-size: 22px; }
  html.skm-mask-on .skm-gemini-title { max-width: 48vw; }
  /* Gemini moves its model picker into a separate mobile header. Keep that native action. */
  html.skm-mask-on .skm-gemini-header { display: none; }
  html.skm-mask-on button[aria-label^="Open mode picker"] .logo-pill-label-container { font-size: 0 !important; }
  html.skm-mask-on button[aria-label^="Open mode picker"] .logo-pill-label-container > * { display: none; }
  html.skm-mask-on button[aria-label^="Open mode picker"] .logo-pill-label-container::after {
    content: ${deepseek ? '"DeepSeek"' : 'var(--skm-qwen-model-label, "Qwen3.7-Plus")'};
    font-size: 15px; color: var(--skm-g-text);
  }
}
@media (prefers-reduced-motion: reduce) {
  html.skm-mask-on :is([data-skm-gemini-extra],suggestion-block,chat-spark-toggle,desktop-get-app-button,
    temp-chat-button,conversation-actions-icon,speech-dictation-mic-button,bard-mode-switcher) { transition: none; }
}
`
}
