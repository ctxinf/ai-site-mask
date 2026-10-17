/**
 * claude.ai × doubao 浅色主题。
 *
 * 实现策略（见同目录 DESIGN.md）：
 *  1. 第一层：重定义 Claude 自身的 design token（--bg-000..500、
 *     --accent-brand、--accent-secondary-000、--border-100..400），
 *     不依赖 DOM 选择器，最抗站点改版。
 *  2. 第二层：语义选择器 + 降级数组，只做 doubao 式的"形状"
 *     （输入框超大圆角、发送按钮蓝色圆形、用户气泡浅蓝圆角、
 *     侧边栏浅灰、新对话浅蓝高亮）。
 *
 * 硬约束：只改颜色 / 背景 / 圆角 / 字体字号 / 阴影；
 * 绝不 display:none / visibility:hidden / opacity:0 任何元素，
 * 不增删 DOM 节点，不拦截事件。
 *
 * 所有规则以 `html.skm-mask-on` 为前缀，仅在 mask 开启时生效。
 * MaskEngine 按字符串原样注入 <style id="skm-mask-claude">。
 */
export const doubaoThemeCss = `
/* ============ 1. Doubao 品牌色板（皮肤变量，换主题只改这里） ============ */
/* 配色采样自 doubao.com 网页版公开截图（见 DESIGN.md），近似值，待用户实测校准 */
html.skm-mask-on {
  --skm-blue: #3b82f6;        /* doubao 品牌蓝（登录/发送按钮） */
  --skm-blue-hover: #2f6fed;
  --skm-blue-pale: #eaf1fe;   /* 新对话高亮、用户气泡 */
  --skm-page: #ffffff;        /* 主对话区 */
  --skm-sidebar: #f7f7f8;     /* 左侧栏 */
  --skm-composer: #ffffff;     /* 输入框底色 */
  --skm-text: #1f2329;
  --skm-text-2: #646a73;
  --skm-text-3: #9a9ea5;
  --skm-border: #e5e5ea;
  --skm-hover: #efeff1;
}

/* ============ 2. 接管 Claude design token ============
 * 变量名来源：knoopx/nix-userstyles userstyles/claude.nix
 * （--accent-brand、--accent-secondary-000、--bg-000..500、
 * --border-100..400）。各 bg 层级的精确语义未公开，按"越小越基础"
 * 的惯例映射：000=页面基底，200=侧边栏级浅灰。!important 压过站点自身定义。 */
html.skm-mask-on {
  --bg-000: var(--skm-page) !important;
  --bg-100: var(--skm-page) !important;
  --bg-200: var(--skm-sidebar) !important;
  --bg-300: #f1f1f3 !important;
  --bg-400: #ececee !important;
  --bg-500: #e4e4e7 !important;
  --accent-brand: var(--skm-blue) !important;
  --accent-secondary-000: var(--skm-blue-pale) !important;
  --border-100: #ececee !important;
  --border-200: var(--skm-border) !important;
  --border-300: #d9d9de !important;
  --border-400: #c9c9d1 !important;
}

/* ============ 3. 页面基底 ============ */
html.skm-mask-on body,
html.skm-mask-on main,
html.skm-mask-on .dframe-pane-primary {
  background-color: var(--skm-page) !important;
  color: var(--skm-text) !important;
}

/* ============ 4. 侧边栏：极浅灰 + 新对话浅蓝高亮 ============
 * 选择器来源：GPTDisguise 2.1.8（本地解压，见 docs/REF_ANALYSIS.md 第 4.2 节）：
 * aside.dframe-sidebar / [data-testid="sidebar"] / [data-testid="sidebar-recents"] /
 * a[data-row-main-button][href$="/new"]。只改颜色，不动宽度变量。 */
html.skm-mask-on aside.dframe-sidebar,
html.skm-mask-on [data-testid="sidebar"] {
  background-color: var(--skm-sidebar) !important;
  border-right: 1px solid var(--skm-border) !important;
}
/* 新对话行：doubao 式浅蓝 pill */
html.skm-mask-on a[data-row-main-button][href$="/new"],
html.skm-mask-on a[href$="claude.ai/new"],
html.skm-mask-on a[href="/new"] {
  background-color: var(--skm-blue-pale) !important;
  color: var(--skm-blue) !important;
  border-radius: 12px !important;
}

/* ============ 5. 输入框：doubao 式超大圆角 + 白底 + 柔和阴影 ============
 * 选择器：语义钩子优先，按优先级降级（GPTDisguise 2.1.8 同款）。 */
html.skm-mask-on [data-cds="ChatComposer"] {
  border-radius: 24px !important;
  background-color: var(--skm-composer) !important;
  border: 1px solid var(--skm-border) !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06) !important;
}
/* 编辑器本体：字号行高 */
html.skm-mask-on [data-cds="Editor"] [contenteditable="true"],
html.skm-mask-on [data-cds="ChatComposer"] [contenteditable="true"],
html.skm-mask-on div[contenteditable="true"][data-testid="chat-input"],
html.skm-mask-on div.ProseMirror[contenteditable="true"] {
  font-size: 15px !important;
  line-height: 1.6 !important;
}

/* ============ 6. 发送按钮：品牌蓝圆形 ============
 * 全部限定在 composer 内，避免误伤页内其他 submit 按钮。 */
html.skm-mask-on [data-cds="ChatComposer"] button[aria-label*="send message" i],
html.skm-mask-on [data-cds="ChatComposer"] button[aria-label="Send" i],
html.skm-mask-on [data-cds="ChatComposerActions"] button[type="submit"],
html.skm-mask-on [data-cds="ChatComposer"] button[type="submit"] {
  border-radius: 9999px !important;
  background-color: var(--skm-blue) !important;
  color: #ffffff !important;
}
html.skm-mask-on [data-cds="ChatComposer"] button[aria-label*="send message" i]:hover,
html.skm-mask-on [data-cds="ChatComposer"] button[aria-label="Send" i]:hover,
html.skm-mask-on [data-cds="ChatComposerActions"] button[type="submit"]:hover,
html.skm-mask-on [data-cds="ChatComposer"] button[type="submit"]:hover {
  background-color: var(--skm-blue-hover) !important;
}

/* ============ 7. 用户气泡：浅蓝圆角；AI 回复：纯文本排版 ============
 * 选择器：mirror.js 的 getTurns 降级链（[data-testid="user-message"] /
 * [data-cds="UserMessage"] / [data-cds="AssistantMessage"] / .font-claude-response）。 */
html.skm-mask-on [data-testid="user-message"],
html.skm-mask-on [data-cds="UserMessage"] {
  background-color: var(--skm-blue-pale) !important;
  border-radius: 16px !important;
}
html.skm-mask-on [data-cds="AssistantMessage"],
html.skm-mask-on .font-claude-response {
  font-size: 15px !important;
  line-height: 1.75 !important;
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
