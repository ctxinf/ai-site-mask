/**
 * chatgpt.com × deepseek 浅色主题。
 *
 * 实现策略（见同目录 DESIGN.md）：
 *  1. 第一层：重定义 ChatGPT 自身的 design token（--bg-*, --main-surface-*,
 *     --sidebar-surface*, --theme-user-msg-*, --theme-submit-btn-* 等），
 *     不依赖 DOM 选择器，最抗站点改版。
 *  2. 第二层：语义选择器 + 降级数组，只做 deepseek 式的"形状"
 *     （输入框大圆角、发送按钮圆形、用户气泡圆角、字号行高）。
 *
 * 硬约束：只改颜色 / 背景 / 圆角 / 字体字号 / 阴影；
 * 绝不 display:none / visibility:hidden / opacity:0 任何元素，
 * 不增删 DOM 节点，不拦截事件。代码块原生高亮保持不动。
 *
 * 所有规则以 `html.skm-mask-on` 为前缀，仅在 mask 开启时生效。
 * MaskEngine 按字符串原样注入 <style id="skm-mask-chatgpt">。
 */
export const deepseekThemeCss = `
/* ============ 1. DeepSeek 品牌色板（皮肤变量，换主题只改这里） ============ */
html.skm-mask-on {
  --skm-blue: #4d6bfe;        /* deepseek 品牌蓝 */
  --skm-blue-hover: #3d5bef;
  --skm-page: #ffffff;        /* 主对话区 */
  --skm-sidebar: #f4f4f5;     /* 左侧会话栏 */
  --skm-composer: #f4f4f5;     /* 输入框底色 */
  --skm-user-bubble: #edf0f7;  /* 用户消息气泡 */
  --skm-text: #262626;
  --skm-text-2: #6b6b6b;
  --skm-text-3: #9a9a9a;
  --skm-border: #e5e5e5;
  --skm-hover: #e9e9eb;
}

/* ============ 2. 接管 ChatGPT design token ============
 * 变量表来源：catppuccin/userstyles styles/chatgpt（MIT，2026.08.16 版）。
 * ChatGPT 在 html.light / html.dark 下定义这些变量，与我们的
 * html.skm-mask-on 特异度持平，用 !important 确保皮肤获胜。 */
html.skm-mask-on {
  --bg-primary: var(--skm-page) !important;
  --bg-secondary: #f7f7f8 !important;
  --bg-tertiary: var(--skm-composer) !important;
  --main-surface-primary: var(--skm-page) !important;
  --main-surface-secondary: #f7f7f8 !important;
  --main-surface-tertiary: var(--skm-composer) !important;
  --sidebar-surface: var(--skm-sidebar) !important;
  --sidebar-surface-primary: var(--skm-sidebar) !important;
  --bg-secondary-surface: var(--skm-sidebar) !important;
  --bg-elevated-primary: var(--skm-page) !important;
  --bg-elevated-secondary: #f7f7f8 !important;
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
`.trim()
