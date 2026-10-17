# chatgpt.com × deepseek 主题设计说明

## 1. DeepSeek 对话页视觉特征（目标样式，10 条）

1. 浅色主题：主区纯白 `#ffffff`，侧边栏浅灰 `#f4f4f5`
2. 左侧会话栏：顶部"开启新对话"按钮 + 按时间分组的历史会话列表
3. 对话区居中窄列，AI 回复为无气泡纯文本
4. 用户消息为浅灰蓝圆角气泡（`#edf0f7` 系，圆角 ~16px）
5. 输入框：大圆角（~24–28px）、浅灰底 `#f4f4f5`、带柔和阴影
6. 发送按钮：品牌蓝 `#4D6BFE` 圆形按钮，hover 加深
7. 顶部栏极简：仅模型切换器 + 少量图标
8. 正文排版：字号 15px、行高 1.75
9. 细边框 `#e5e5e5`、hover 态 `#e9e9eb`
10. 整体留白大、圆角多、无深色元素

> 依据：chat.deepseek.com 聊天页需登录，上述特征基于公开文档与界面描述整理；
> 最终效果以用户在自己浏览器里的实测截图为准迭代。

## 2. 实现策略：token 接管为主，选择器为辅

ChatGPT 现行构建是 design-token 驱动（在 `html.light` / `html.dark` 下定义
CSS 变量，组件全部消费变量）。换肤第一层直接重定义 token：

`--bg-*`、`--main-surface-*`、`--sidebar-surface*`、`--bg-secondary-surface`、
`--text-*`、`--border-*`、`--theme-user-msg-bg/text`、`--theme-submit-btn-bg/text`、
`--interactive-label-accent-default`、`--surface-hover`、`--shadow-color-*`

这一层不依赖任何 DOM 选择器，最抗站点改版；用 `!important` 压过
`html.light` / `html.dark` 同级特异度的定义。

第二层用"语义选择器 + 降级数组"做 deepseek 式的**形状**
（输入框大圆角、发送按钮圆形、用户气泡圆角、字号行高），不碰颜色体系。

## 3. 选择器依据（来源 + 更新时间）

- **GPTDisguise 2.1.8**（本地解压分析，2026-10-17，见 `docs/REF_ANALYSIS.md` 第 4 节）：
  `article[data-testid^="conversation-turn"]`、`[data-message-author-role]`、
  `#prompt-textarea`、`div[contenteditable="true"].ProseMirror`、
  `button[data-testid="send-button"]`、`nav[aria-label="Chat history"]`、
  `a[data-testid="create-new-chat-button"]`、`#stage-slideover-sidebar`
- **catppuccin/userstyles** `styles/chatgpt/catppuccin.user.less`
  （MIT 协议，版本 `2026.08.16`）：ChatGPT design token 变量全表，
  主题第 2 层的全部变量名均出自此处
- **userstyles.world/style/26421**（版本 `20260926`）：
  `main` / `[role="main"]` 基底写法、`[data-markdown-copy="code-block"]`；
  该样式特意**不碰代码块**以保留原生语法高亮——本主题同样遵守

## 4. 硬约束遵守情况

- 无 `display:none` / `visibility:hidden` / `opacity:0` 规则
- 不增删 DOM 节点，不改事件监听
- 代码块、工具栏、模型切换器等功能性元素只换颜色，不动形状与位置
- 所有规则以 `html.skm-mask-on` 为前缀，关闭即 100% 还原

## 5. 已知局限（需用户实测确认）

- ChatGPT 深色模式用户：token 被 `!important` 压回浅色，但 `.dark` 下个别
  硬编码颜色的选择器可能残留，建议先把 ChatGPT 设置切到浅色模式再看效果
- `chat.openai.com` 旧域名沿用同一套 token 变量名，理论兼容，未实测
- 站点改版导致 token 更名时，主题退化为"形状层仍生效、颜色回原版"，
  不会破坏功能；届时对照 catppuccin 仓库更新变量表即可
