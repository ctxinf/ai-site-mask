/**
 * chatgpt.com × Qwen (通义千问 - https://chat.qwen.ai/) 深度伪装浅色主题。
 *
 * 核心目标：
 *  1. 视觉品牌替换：Logo、顶部标题、新建对话文案、输入框占位符、免责声明全量伪装为通义千问；
 *  2. 强制中和深色模式：无论用户当前 ChatGPT 是深色还是浅色，统一呈现纯净浅灰紫千问风格；
 *  3. 精确特征对齐：
 *     - 标志性 Qwen 紫色（#615ced / #6964ed）
 *     - AI 回复头像替换为 Qwen 紫底白色菱形星芒
 *     - 用户提问气泡：优雅淡紫（#eff0fe，圆角 16px，微紫描边）
 *     - 输入框：纯白底 + 24px 大圆角 + Qwen 紫外发光
 *     - 底部免责声明替换为千问官方口吻文案
 *
 * 硬约束：只改颜色/背景/伪类文案/圆角/字体字号/阴影；
 * 绝不拦截事件，绝不破坏原有会话和发送功能。
 */
export const qwenThemeCss = `
/* ============ 1. Qwen 品牌色板 ============ */
html.skm-mask-on {
  --skm-qwen-purple: #615ced;       /* Qwen 核心品牌紫 */
  --skm-qwen-purple-hover: #504cd9; /* Qwen 品牌紫 Hover */
  --skm-qwen-purple-light: #eff0fe; /* 用户气泡浅紫淡雅底色 */
  --skm-qwen-purple-tint: #f5f6fe;  /* 微紫极浅背景 */
  --skm-qwen-page: #ffffff;         /* 对话主区域纯白 */
  --skm-qwen-sidebar: #f7f8fc;      /* 侧边栏千问冷灰微紫 */
  --skm-qwen-composer: #ffffff;     /* 输入框底色 */
  --skm-qwen-user-bubble: #eff0fe;  /* 用户消息气泡 */
  --skm-qwen-text: #1f2329;         /* 主文字深度冷黑 */
  --skm-qwen-text-2: #646a73;       /* 次级文字 */
  --skm-qwen-text-3: #8f959e;       /* 辅助微弱文字 */
  --skm-qwen-border: #e2e4ed;       /* 细分割线 */
  --skm-qwen-border-focus: #615ced; /* 聚焦边框色 */
  --skm-qwen-hover: #f0f1f5;        /* 通用 Hover 底色 */
  --skm-qwen-shadow: rgba(97, 92, 237, 0.08); /* 品牌微紫柔光阴影 */
}

/* ============ 2. 接管 ChatGPT design token + 压制深色模式 ============ */
html.skm-mask-on,
html.skm-mask-on.dark,
html.skm-mask-on .dark {
  color-scheme: light !important;
  --bg-primary: var(--skm-qwen-page) !important;
  --bg-secondary: var(--skm-qwen-sidebar) !important;
  --bg-tertiary: var(--skm-qwen-composer) !important;
  --main-surface-primary: var(--skm-qwen-page) !important;
  --main-surface-secondary: var(--skm-qwen-sidebar) !important;
  --main-surface-tertiary: var(--skm-qwen-composer) !important;
  --sidebar-surface: var(--skm-qwen-sidebar) !important;
  --sidebar-surface-primary: var(--skm-qwen-sidebar) !important;
  --bg-secondary-surface: var(--skm-qwen-sidebar) !important;
  --bg-elevated-primary: var(--skm-qwen-page) !important;
  --bg-elevated-secondary: var(--skm-qwen-sidebar) !important;
  --text-primary: var(--skm-qwen-text) !important;
  --text-secondary: var(--skm-qwen-text-2) !important;
  --text-tertiary: var(--skm-qwen-text-3) !important;
  --text-quaternary: var(--skm-qwen-text-3) !important;
  --border-light: var(--skm-qwen-border) !important;
  --border-default: #dcdfe6 !important;
  --border-medium: #cfd3dc !important;
  --theme-user-msg-bg: var(--skm-qwen-user-bubble) !important;
  --theme-user-msg-text: var(--skm-qwen-text) !important;
  --theme-submit-btn-bg: var(--skm-qwen-purple) !important;
  --theme-submit-btn-text: #ffffff !important;
  --theme-secondary-btn-bg: var(--skm-qwen-sidebar) !important;
  --theme-secondary-btn-text: var(--skm-qwen-text) !important;
  --interactive-label-accent-default: var(--skm-qwen-purple) !important;
  --interactive-bg-secondary-hover: var(--skm-qwen-hover) !important;
  --surface-hover: var(--skm-qwen-hover) !important;
  --icon-tertiary: var(--skm-qwen-text-3) !important;
  --shadow-color-1: rgba(97, 92, 237, 0.05) !important;
  --shadow-color-2: rgba(97, 92, 237, 0.08) !important;
}

/* ============ 3. 页面主基底与全局背景 ============ */
html.skm-mask-on body,
html.skm-mask-on main,
html.skm-mask-on [role="main"],
html.skm-mask-on div[class*="bg-token-main-surface"],
html.skm-mask-on div[class*="bg-[#212121]"] {
  background-color: var(--skm-qwen-page) !important;
  color: var(--skm-qwen-text) !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif !important;
}

/* ============ 4. 品牌替换：顶部标题栏与 Logo 伪装 ============ */
/* 替换顶栏 Model Switcher 文案为“通义千问 2.5” */
html.skm-mask-on button[data-testid="model-switcher-dropdown-button"] div,
html.skm-mask-on button[data-testid="model-switcher-dropdown-button"] span {
  display: none !important;
}
html.skm-mask-on button[data-testid="model-switcher-dropdown-button"]::before {
  content: "" !important;
  display: inline-block !important;
  width: 20px !important;
  height: 20px !important;
  margin-right: 6px !important;
  vertical-align: middle !important;
  background: #615ced url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z'/%3E%3C/svg%3E") no-repeat center !important;
  background-size: 65% !important;
  border-radius: 5px !important;
}
html.skm-mask-on button[data-testid="model-switcher-dropdown-button"]::after {
  content: "通义千问 2.5" !important;
  font-weight: 600 !important;
  font-size: 15px !important;
  color: #1f2329 !important;
  vertical-align: middle !important;
}

/* 侧边栏/顶栏 Brand Logo 替换 */
html.skm-mask-on a[aria-label="ChatGPT"] svg,
html.skm-mask-on a[data-testid="logo"] svg {
  display: none !important;
}
html.skm-mask-on a[aria-label="ChatGPT"]::before,
html.skm-mask-on a[data-testid="logo"]::before {
  content: "" !important;
  display: inline-block !important;
  width: 22px !important;
  height: 22px !important;
  margin-right: 8px !important;
  vertical-align: middle !important;
  background: #615ced url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z'/%3E%3C/svg%3E") no-repeat center !important;
  background-size: 65% !important;
  border-radius: 6px !important;
}
html.skm-mask-on a[aria-label="ChatGPT"]::after,
html.skm-mask-on a[data-testid="logo"]::after {
  content: "通义千问" !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  color: #1f2329 !important;
  vertical-align: middle !important;
}

/* ============ 5. 初始对话欢迎语伪装 ============ */
html.skm-mask-on main svg.icon-lg,
html.skm-mask-on div[data-testid="logo"] svg {
  display: none !important;
}
html.skm-mask-on main h1,
html.skm-mask-on main h2,
html.skm-mask-on [data-testid="greeting-header"] {
  font-size: 0 !important;
  line-height: 0 !important;
}
html.skm-mask-on main h1::after,
html.skm-mask-on main h2::after,
html.skm-mask-on [data-testid="greeting-header"]::after {
  content: "你好，我是通义千问" !important;
  font-size: 26px !important;
  line-height: 1.4 !important;
  font-weight: 600 !important;
  color: #1f2329 !important;
  display: block !important;
  text-align: center !important;
  letter-spacing: -0.3px !important;
  margin-bottom: 8px !important;
}

/* ============ 6. AI 回复头像伪装为 Qwen 菱形紫星芒 ============ */
html.skm-mask-on [data-message-author-role="assistant"] svg,
html.skm-mask-on article [data-message-author-role="assistant"] svg.icon-md {
  display: none !important;
}
html.skm-mask-on [data-message-author-role="assistant"] [class*="avatar"],
html.skm-mask-on [data-message-author-role="assistant"] [class*="rounded-full"]:has(svg) {
  background-color: #615ced !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z'/%3E%3C/svg%3E") !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  background-size: 60% !important;
  border-radius: 50% !important;
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  box-shadow: 0 2px 6px rgba(97, 92, 237, 0.2) !important;
}

/* ============ 7. 用户提问气泡：优雅淡紫气泡 ============ */
html.skm-mask-on [data-message-author-role="user"] {
  background-color: transparent !important;
}
html.skm-mask-on [data-message-author-role="user"] > div,
html.skm-mask-on [data-message-author-role="user"] div[class*="bg-"] {
  background-color: #eff0fe !important;
  color: #1f2329 !important;
  border-radius: 16px !important;
  padding: 10px 16px !important;
  border: 1px solid rgba(97, 92, 237, 0.12) !important;
  box-shadow: 0 1px 4px rgba(97, 92, 237, 0.04) !important;
}

/* AI 回复排版：纯文本无气泡 */
html.skm-mask-on article[data-testid^="conversation-turn"] [data-message-author-role="assistant"],
html.skm-mask-on [data-message-author-role="assistant"] {
  font-size: 15px !important;
  line-height: 1.75 !important;
  color: var(--skm-qwen-text) !important;
}

/* ============ 8. 输入框：Qwen 纯白质感 + 24px 大圆角 + 聚焦紫光 ============ */
html.skm-mask-on #prompt-textarea,
html.skm-mask-on div[contenteditable="true"].ProseMirror,
html.skm-mask-on form div[contenteditable="true"],
html.skm-mask-on textarea[data-id] {
  border-radius: 20px !important;
  font-size: 15px !important;
  color: var(--skm-qwen-text) !important;
}

/* 输入框外层容器 */
html.skm-mask-on form:has(#prompt-textarea),
html.skm-mask-on form:has(div[contenteditable="true"].ProseMirror),
html.skm-mask-on div[data-testid="composer"] {
  border-radius: 24px !important;
  background-color: var(--skm-qwen-composer) !important;
  border: 1px solid var(--skm-qwen-border) !important;
  box-shadow: 0 4px 20px var(--skm-qwen-shadow), 0 1px 3px rgba(0, 0, 0, 0.02) !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
}

/* 输入框聚焦态 */
html.skm-mask-on form:has(#prompt-textarea):focus-within,
html.skm-mask-on form:has(div[contenteditable="true"].ProseMirror):focus-within,
html.skm-mask-on div[data-testid="composer"]:focus-within {
  border-color: var(--skm-qwen-purple) !important;
  box-shadow: 0 4px 24px rgba(97, 92, 237, 0.14), 0 0 0 1.5px rgba(97, 92, 237, 0.3) !important;
}

/* 占位符替换为“向通义千问提问...” */
html.skm-mask-on #prompt-textarea::placeholder,
html.skm-mask-on textarea::placeholder {
  color: transparent !important;
}
html.skm-mask-on [data-placeholder]::before,
html.skm-mask-on p.placeholder::before {
  content: "向通义千问提问..." !important;
  color: #8f959e !important;
  font-size: 15px !important;
}

/* ============ 9. 发送按钮：Qwen 品牌紫圆形按钮 ============ */
html.skm-mask-on button[data-testid="send-button"],
html.skm-mask-on button[aria-label*="send prompt" i],
html.skm-mask-on form button[type="submit"] {
  border-radius: 9999px !important;
  background-color: var(--skm-qwen-purple) !important;
  color: #ffffff !important;
  transition: background-color 0.15s ease, transform 0.15s ease !important;
}
html.skm-mask-on button[data-testid="send-button"]:hover,
html.skm-mask-on button[aria-label*="send prompt" i]:hover,
html.skm-mask-on form button[type="submit"]:hover {
  background-color: var(--skm-qwen-purple-hover) !important;
  transform: scale(1.02);
}

/* ============ 10. 底部免责声明替换为千问官方口吻 ============ */
html.skm-mask-on form + div,
html.skm-mask-on div[class*="text-token-text-tertiary"],
html.skm-mask-on div.text-xs:has(a[href*="openai.com"]) {
  font-size: 0 !important;
  color: transparent !important;
}
html.skm-mask-on form + div::after,
html.skm-mask-on div[class*="text-token-text-tertiary"]::after,
html.skm-mask-on div.text-xs:has(a[href*="openai.com"])::after {
  content: "通义千问生成的内容仅供参考，不代表任何态度或立场" !important;
  font-size: 12px !important;
  color: #8f959e !important;
  display: block !important;
  text-align: center !important;
  margin-top: 4px !important;
}

/* ============ 11. 侧边栏与导航 ============ */
html.skm-mask-on nav[aria-label="Chat history"],
html.skm-mask-on #stage-slideover-sidebar,
html.skm-mask-on aside {
  background-color: var(--skm-qwen-sidebar) !important;
  border-right: 1px solid var(--skm-qwen-border) !important;
}

/* 新建对话按钮 */
html.skm-mask-on a[data-testid="create-new-chat-button"],
html.skm-mask-on nav a[aria-label="New chat"],
html.skm-mask-on a[href="/"] button {
  border-radius: 12px !important;
  border: 1px solid var(--skm-qwen-border) !important;
  background-color: #ffffff !important;
  color: var(--skm-qwen-text) !important;
  transition: all 0.2s ease !important;
}
html.skm-mask-on a[data-testid="create-new-chat-button"]:hover,
html.skm-mask-on nav a[aria-label="New chat"]:hover {
  background-color: var(--skm-qwen-purple-light) !important;
  border-color: var(--skm-qwen-purple) !important;
  color: var(--skm-qwen-purple) !important;
}

/* 会话列表选中/悬停高亮 */
html.skm-mask-on nav a[href*="/c/"]:hover,
html.skm-mask-on nav a[href^="/c/"]:hover {
  background-color: var(--skm-qwen-purple-light) !important;
  color: var(--skm-qwen-purple) !important;
  border-radius: 8px !important;
}

/* ============ 12. 滚动条与选中文本 ============ */
html.skm-mask-on ::selection {
  background-color: #d2d0f9 !important; /* Qwen Lilac Pale */
  color: #1f2329 !important;
}
html.skm-mask-on ::-webkit-scrollbar {
  width: 8px !important;
  height: 8px !important;
}
html.skm-mask-on ::-webkit-scrollbar-thumb {
  background-color: #d8dae5 !important;
  border-radius: 6px !important;
}
html.skm-mask-on ::-webkit-scrollbar-thumb:hover {
  background-color: #c4c7d6 !important;
}
html.skm-mask-on ::-webkit-scrollbar-track {
  background-color: transparent !important;
}
`.trim()
