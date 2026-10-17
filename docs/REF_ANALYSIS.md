# 参考插件实现分析：GPTDisguise 2.1.8

> 来源：`~/workspace/user/files/GPTDisguise_2.1.8.zip`（CRX3 包，已解压分析）
> 插件：GPTDisguise v2.1.8 —— 把 ChatGPT / Claude / Gemini 网页版伪装成 Google Docs / MS Word / Notion 的外观
> 分析日期：2026-10-17
> 结论先行：**它不是“改 CSS”换肤，而是“整页覆盖 + 内容镜像投影”**。技术路线比我们预想的更重，但它的架构分层、选择器策略、防破坏设计有大量可直接借鉴的点。

---

## 1. 基本信息

| 项 | 值 |
|---|---|
| 名称 | GPTDisguise |
| 版本 | 2.1.8 |
| manifest_version | 3 |
| 描述 | Disguise ChatGPT, Claude, and Gemini as Google Docs. |
| 目标站点 | chatgpt.com / chat.openai.com / claude.ai / gemini.google.com |

### manifest 关键字段

```json
"permissions": ["activeTab", "scripting", "storage"],
"host_permissions": [
  "https://chatgpt.com/*", "https://chat.openai.com/*",
  "https://claude.ai/*", "https://gemini.google.com/*",
  "https://nytlywcvjazwzfkmustp.supabase.co/*"
],
"content_scripts": [{
  "matches": ["https://chatgpt.com/*", ..., "https://gemini.google.com/*"],
  "js": ["enable-button.js"],
  "run_at": "document_idle"
}],
"background": { "service_worker": "background.js" },
"action": { "default_popup": "popup.html" },
"commands": { "toggle-disguise": {
  "suggested_key": { "default": "Ctrl+Shift+Z" } } },
"web_accessible_resources": [{
  "resources": ["assets/*"],
  "matches": ["https://chatgpt.com/*", ...]
}]
```

**要点：**

1. **manifest 里只声明了一个极轻的 content script**（`enable-button.js`，页面右下角的浮动“开启伪装”按钮）。真正的换肤全部由 service worker 通过 `chrome.scripting.insertCSS / executeScript` 程序化注入——这样可以在运行时按站点、按主题动态组合，而不是靠静态声明。
2. 权限很克制：没有 `tabs` 的全部读取权限（`activeTab` + host_permissions 组合），`storage` 存状态，`scripting` 做注入。
3. 字体/图片资源全部打包在 `assets/` 并声明 `web_accessible_resources`。注释里明确写了原因：**Gemini 的 CSP 只允许 Google 域名的图片，外链会被拦；扩展自身资源走 `chrome-extension://` 不受页面 CSP 限制**。

---

## 2. 换肤技术路线：整页覆盖（Mirror）而非 CSS 微调

它的核心是 `mirror.js`（1805 行）实现的一套 **“镜像投影”** 机制：

```
真实页面（opacity: 0，照常运行）          假 UI（shadow DOM，全屏覆盖）
┌──────────────────────────┐        ┌──────────────────────────┐
│ ChatGPT 真实 DOM          │  克隆  │ 假 Docs 工具栏 (shadow)    │
│ - 对话内容照常渲染        │ ────▶ │ 假“文档标签”侧栏 (shadow)  │
│ - 输入框照常工作（inert）  │ 同步  │ 假文档纸面：对话文本克隆体  │
│ - MutationObserver 监听变化 │      │ 假输入框 textarea (shadow)  │
└──────────────────────────┘        └──────────────────────────┘
        ▲                                     │
        └──── 输入转发：execCommand→paste事件→InputEvent ─┘
```

具体步骤（`applyToTab` 流程，`disguise-config.js`）：

1. **注入样式层**：`chrome.scripting.insertCSS({ css: buildCss(siteKey, themeKey) })`。CSS 是三层叠加：`BASE_CSS + SITES[site].hideCss + THEMES[theme].lookCss`，全站 `!important`。对 mirror 站点则用 `MIRROR_CSS`（`body > * { opacity: 0 }`，只保留 `#disguise-banner / #disguise-sidebar / #disguise-page` 可见）。
2. **注入 in-page 主函数**：`chrome.scripting.executeScript({ func: disguiseFunc, args: [themeCfg] })`——注意是 **func 序列化注入**，不是文件注入。函数内只能用参数和页面全局变量。主函数负责：改 `document.title`、换 favicon、挂载工具栏/侧栏 shadow host、启动 `setInterval(apply, 1000)` 持续对抗 SPA 改标题。
3. **注入 mirror.js 文件**：挂载 `#disguise-page` shadow host，用 MutationObserver（`childList + subtree + characterData`）监听真实对话 DOM 变化，节流 150ms 后 `sync()`：按站点 adapter 提取 turns，克隆节点、去掉按钮/时间戳等杂物，渲染进假文档。

### 样式注入方式总结

| 方式 | 用途 |
|---|---|
| `chrome.scripting.insertCSS`（CSS 字符串） | 压扁原站样式 + 主题外观；可被 `removeCSS` 精确移除 |
| `chrome.scripting.executeScript({func})` | 改标题/favicon、挂载 shadow host、启动对抗 interval |
| `chrome.scripting.executeScript({files:['mirror.js']})` | 镜像投影主逻辑 |
| shadow DOM 内 `<style>` | 所有自造 UI（工具栏/侧栏/浮动按钮）自带样式，与页面隔离 |
| `@font-face` + `chrome.runtime.getURL()` | 打包字体/图片，绕过页面 CSP |

**移除/回滚**：`removeFunc` 清掉两个 interval、断开 observer、恢复真实输入框的 `inert` 属性、移除 shadow host、删除注入的 favicon；`removeCSS` 用**当初插入的精确字符串**移除（它把每 tab 的 `{siteKey, themeKey}` 存在 `chrome.storage.local.appliedDisguise` 里，移除时按记录重建字符串——注释特别提醒：用当前设置重建会在主题切换后“串台”，留下旧样式）。

---

## 3. 主题切换机制

`disguise-config.js` 里有一个纯数据驱动的配置表：

- **SITES**（chatgpt / claude / gemini）：`hosts`、`chatLinkSelector`（从隐藏侧栏读会话列表）、`newChatSelector`（驱动真实“新对话”控件）、`columnSelector`（文本列定位）、`hideCss`（本站点专属隐藏规则）。
- **THEMES**（docs / word / notion）：`title`、`faviconUrl`、`toolbarKey`、`page{look,width,textWidth,fontPx}`、`lookCss`。
- **TOOLBARS**（`toolbars.js` / `toolbar-word.js` / `toolbar-notion.js`）：假工具栏/侧栏的 `{css, html, height}` 纯字符串结构——**刻意做成可序列化的纯数据**，因为要过 `chrome.scripting` 序列化边界传给页面函数。

切换主题 = `clearAppliedCss(tabId)`（按记录精确移除旧 CSS）→ `insertCSS` 新 CSS → `executeScript(disguiseFunc, 新 cfg)`。in-page 函数检测到 `banner.__dgTheme !== c.themeKey` 就重建工具栏/侧栏。premium 门控在 **service worker 里做**（`resolveEffectiveConfig`），页面端只消费结果——免费用户即使 storage 里残留 premium 主题也会被降级。

**假工具栏不是截图**：注释说早期用过截图，发现拉伸模糊、高度随窗口变、不能 hover/开菜单，于是全部用 HTML+CSS 手工重建（`toolbars.js` 里连 Material Symbols 图标都是手写的 SVG path 数据，按 2880x212@2x 的截图量出尺寸、取色）。假侧栏的会话列表是**读真实站点的会话链接**生成的（`syncTabs`），点击行时直接 `r.el.click()` 驱动真实链接——SPA 内导航、状态（project/model）都保留。

---

## 4. 站点选择器策略（关键样本）

### 4.1 ChatGPT（`chatgpt.com`）

```js
// 对话 turn（按优先级降级）
'article[data-testid^="conversation-turn"]'
'[data-message-author-role]'            // 兜底

// 输入框（按优先级，逐个试，跳过不可见/在假 UI 内的）
'div[contenteditable="true"]#prompt-textarea'
'div[contenteditable="true"].ProseMirror'
'textarea[data-id]'
'div[contenteditable="true"]'
'form textarea'

// 发送按钮
'button[data-testid="send-button"]'
'button[aria-label*="send prompt" i]'
'form button[type="submit"]'

// 会话列表 / 新对话
'nav[aria-label="Chat history"] a[href*="/c/"], a[href^="/c/"]'
'a[data-testid="create-new-chat-button"], a[aria-label="New chat"]'
```

隐藏规则（`hideCss`）特点：**大量直接抄站点的 utility class 链和 data-testid**，例如 `button[data-testid="model-switcher-dropdown-button"]`、`div[data-testid="composer-footer-actions"]`、`.icon-md-heavy, .icon-md, .icon-sm`、`svg.icon`、`#stage-slideover-sidebar`、`[role="link"]`、`.text-caption-regular`，以及整条 Tailwind arbitrary class（如 `.ml-0\.5.inline-flex...bg-bg-300`）。注释承认：*“这就是为什么选择器长这样”*——直接瞄准站点的测试 id 和工具类，稳定但脆弱。

### 4.2 Claude（`claude.ai`）

```js
// 输入框 / 发送
'[data-cds="Editor"] [contenteditable="true"]'
'[data-cds="ChatComposer"] [contenteditable="true"]'
'button[aria-label*="send message" i]'
'[data-cds="ChatComposerActions"] button[type="submit"]'

// 会话列表（读隐藏侧栏的链接，侧栏 display:none 但链接仍在 DOM）
'[data-testid="sidebar-recents"] a[href*="/chat/"]'
'a[data-row-main-button][href$="/new"]'   // 限定行内按钮，避免点到标题栏 wordmark

// 文本列
'[data-cds="ChatComposer"], [data-testid="transcript-list"]'
```

隐藏规则亮点：

- 用设计系统语义命名：`[data-cds="ProductLogo"]`、`[data-cds="Spark"]`、`[data-cds="Avatar"]`、`[data-cds="Icon"]`（注释：Anthropicons 是私用区字体，不隐藏会渲染成方框）、`[data-cds="ChatComposerActions/Notices/Chin"]`、`[data-cds="SegmentedControl"]`、`[data-cds="ModelSelector"]`。
- **覆盖 CSS 变量**关侧栏：`.dframe-root { --df-sidebar-width: 0px !important; --static-sidebar-width: 0px !important; }`——注释指出 `!important` 能赢过行内 custom property。
- 预水合骨架屏：`#static-composer, #static-sidebar-skeleton` 等，防止加载闪烁。
- 空编辑器的占位符在 `::before` 上：`[data-cds="Editor"] .is-editor-empty::before { content: "" !important; }`。
- Composer 内部控件是绝对定位、通过 `--cmp-lead-w` 等变量预留空间，隐藏控件后把变量清零让输入框塌成一行。

### 4.3 Gemini（`gemini.google.com`）

```js
// Angular 自定义元素即稳定钩子（站点自己的样式表也这么用）
'bard-sidenav'                       // 侧栏
'conversations-list a[href*="/app/"]' // 会话列表
'[data-test-id="new-chat-button"] a'  // 新对话
'.input-area-container, .conversation-container'  // 文本列
'hallucination-disclaimer'           // 底部免责声明
'span.message-text / span.title-text' // 品牌文案
```

### 选择器策略共性（可直接抄）

1. **有序降级数组**：每个关键元素（composer/send/getTurns）都是 selector 数组逐个试，第一个命中（且可见、且不在自家 shadow host 内）即用。
2. **语义钩子优先**：`data-testid` / `data-cds` / `aria-label` / 自定义元素名 > utility class 链；utility class 链只在别无选择时用整串精确匹配。
3. **`inHost()` 守卫**：所有查询都排除自家 shadow host 内的元素，防止把自己当成站点。
4. **可见性检查**：`offsetParent` / `getClientRects().length` 过滤隐藏节点。
5. **读隐藏 DOM**：侧栏 `display:none` 后链接仍在 DOM 里，假面板直接复用（标题、点击导航都是真实的）。

---

## 5. 如何保证不破坏原页面功能

这是它设计最用心的地方，核心思想：**真实 DOM 只做隐藏，绝不改结构；所有交互发生在克隆体/代理层，真实站点在下面照常跑。**

1. **隐藏用 `opacity: 0` 而非移除**：`MIRROR_CSS` 让 `body > *` 透明，原站点的 React/Angular 树完整存活，事件、流式输出、路由都不受影响。
2. **真实输入框 `inert` 化而非禁用**：`neutralizeSiteComposer()` 给所有站点可编辑元素加 `inert` 属性（不可聚焦、不可点），并用 MutationObserver 持续补（SPA 会重建节点）。发送时才临时摘掉 `inert`（`__dgSending` 标记），发完立刻恢复。关闭伪装时 `releaseSiteComposer()` 全部摘掉——可逆。
3. **输入转发的三级降级**（`insertIntoComposer`）：`document.execCommand('insertText')` → 合成 `ClipboardEvent('paste')` → 合成 `beforeinput` + `input` 事件；每级都校验 `composerHas(composer, text)`，失败就回滚（把文字还给假输入框并提示用户关掉伪装去原站发）。**从不用 `innerText =` 直接赋值**（绕不过框架的受控组件）。
4. **发送走真实控件**：优先 `adapter.findSendButton().click()`，找不到才合成 Enter `keydown`。新会话/切换会话全部 `真实链接.click()`，SPA 内导航保留状态。
5. **对齐算法的熔断**（旧的列搬运路径 `nudgeOntoPage`）：每 pass 累积修正 margin，若误差 8 次不缩小就放弃并还原（`GIVE_UP_PASSES`），且偏移量钳制在 ±1 屏内——“跑飞了也还在页内”，不抖动。
6. **SPA 对抗**：`tabs.onUpdated(complete)` 重注 CSS（导航会清掉 injected CSS）；in-page `setInterval(apply, 1000)` 对抗标题/favicon 被 SPA 改写；`heal` interval 发现 host 被删就 `remount()`；in-page 函数幂等（`if (window.__disguiseInterval) return` 复用旧 interval）。
7. **失败可观测**：`window.dgDump()` 输出结构化诊断（turn 数、composer/send-button 是否找到），自动 dump 逻辑方便用户报 bug。
8. **test/ 目录**：存了各站点的页面快照 HTML + `run.sh`（headless Chrome `--dump-dom` 跑回归），说明他们靠快照做选择器回归测试。

---

## 6. 对 ai-site-skin-mask 的可借鉴点

> 我们的目标是“换 deepseek/doubao/qwen 的皮”，比“伪装成另一个应用”轻一个量级——大概率不需要整页 mirror，用它的 **CSS 层叠 + shadow 隔离 + adapter 选择器** 这套就够了。但它的坑值得全避开。

### 借鉴（5 条，具体到做法）

1. **三层 CSS 叠加 + 程序化注入**：`BASE（压扁）+ SITE.hideCss（本站隐藏）+ THEME.lookCss（目标皮肤）`，全部 `!important`，走 `chrome.scripting.insertCSS` 注入。切换皮肤时按“当初插入的精确字符串”`removeCSS`（每 tab 在 storage 里记 `{siteKey, themeKey}`）。对应我们：`src/content/` 里按 `sites/chatgpt.ts`、`sites/claude.ts`、`themes/deepseek.css.ts` 组织，background 负责组装与注入。
2. **所有自造 UI 进 shadow DOM + `:host { all: initial }`**：浮动按钮、皮肤切换器一旦用了 `* { !important }` 压扁层，不用 shadow 会被自己压扁。`enable-button.js` 的做法（`position:fixed; z-index:2147483645` 的 host + shadow 内联 `<style>`）可直接抄。
3. **Adapter 模式 + 有序降级选择器**：每个站点一个 adapter `{ findComposer, findSendButton, getTurns, isStreaming, chatLinkSelector, newChatSelector, columnSelector }`，选择器按“语义钩子 → 可见性校验 → 兜底”逐个试。上文第 4 节的选择器样本可直接作为我们 `sites/*.ts` 的起点。
4. **字体/图片打包进扩展**：deepseek/doubao/qwen 的品牌字体若需高度还原，打包 woff2 + `chrome.runtime.getURL`，不要外链（CSP + 离线 + 版本锁定）。
5. **“驱动真实控件”原则**：皮肤上的任何功能按钮（如新对话）都去 `querySelector` 真实控件并 `.click()`，不要自己 `location.assign`（会丢 SPA 状态）；URL 只做控件找不到时的 fallback。

### 要避开的坑（5 条）

1. **不要学它的整页 mirror**：mirror 要处理流式输出同步、输入转发三级降级、文件上传/拖拽/粘贴全套代理、thinking 块/artifact 识别——1800 行只为“看起来像另一个应用”。我们做“换肤”，CSS 覆盖 + 局部 DOM 微调足够，mirror 是过度工程，且它的 `body > * {opacity:0}` 会让页面对无障碍工具/自动化“消失”，有副作用。
2. **Tailwind 整串 class 选择器极脆**：如 chatgpt 那条 `.ml-0\.5.inline-flex.items-center...bg-bg-300`，站点一次改版就失效。我们的 `hideCss` 尽量用 `data-testid` / `aria-label` / `[data-message-author-role="user"]` 这类语义钩子，utility 链只做补充，并给每条规则写注释说明“在隐藏什么”，方便站点改版时定位替换。
3. **`* { display:none }` 误伤自己人**：它的 BASE_CSS 里 `button { display:none !important }` 是全局的，全靠 shadow DOM 救自家按钮。我们若采用压扁层，**必须先把自家 UI 迁入 shadow 再开压扁**，顺序反了会导致切换器自身消失（它用注释 + `z-index` 顺序显式处理了这点）。
4. **SPA 生命周期三处都要处理**：(a) 导航清 injected CSS → `tabs.onUpdated(complete)` 重注；(b) SPA 重写 title/favicon → in-page 轻量 interval 对抗（只做这两件小事，别学它 1s 全量 apply）；(c) body 被重建 → 用 `MutationObserver` 或 interval 做幂等 remount。只做 (a) 会在 ChatGPT 切会话时“掉皮”。
5. **in-page 注入函数必须是可序列化的纯函数**：`chrome.scripting.executeScript({func})` 序列化函数体——不能闭包引用外部变量、不能用 import，只能靠 `args` 传配置。它的 `toolbars.js` 注释明确要求 toolbar 是“纯字符串+数字、无函数无 DOM 节点”。我们用 Extension.js/React 时要注意：**content script 与 scripting 注入是两条通道**，需要共享的配置做成纯数据模块。

---

## 7. 附：包内文件清单（供查阅）

```
manifest.json            MV3 声明（见第 1 节）
background.js            service worker：premium 门控、注入编排、快捷键、重注
disguise-config.js       SITES/THEMES/TOOLBARS 配置 + buildCss + disguiseFunc/removeFunc
mirror.js                镜像投影：shadow 假页面、MutationObserver 同步、输入转发
toolbars.js              手工重建的 Google Docs 工具栏（HTML+CSS 字符串，SVG path 图标）
toolbar-word.js          Word 版（Office 头栏 + 功能区 + 导航窗格 + 状态栏）
toolbar-notion.js        Notion 版（顶栏 + 停靠侧栏）
enable-button.js         唯一的 content script：右下角浮动开启按钮（shadow DOM）
extension-auth-helper.js Supabase 登录/token 刷新（与我们无关）
popup.html/css/js        扩展弹窗：总开关、主题选择、站点开关、premium
assets/                  打包的字体（Aptos/Segoe/GoogleSans）与图片（favicon/banner）
test/                    各站点快照 HTML + run.sh（headless Chrome 回归脚本）
```

`test/run.sh` 的做法值得我们抄：用 Node 把 `disguise-config.js` 的 `buildCss()` 直接跑出来生成 `production.css`，再用 headless Chrome `--dump-dom` 对快照 HTML 做回归——**纯 CSS 换肤方案完全可以在无真实账号的情况下做快照回归测试**。
