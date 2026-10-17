# claude.ai × doubao 主题设计说明

## 1. Doubao 对话页视觉特征（目标样式，10 条）

1. 浅色主题：主区纯白 `#ffffff`，侧边栏极浅灰 `#f7f7f8`
2. 左侧栏：顶部豆包头像 + 名称；技能入口（帮我写作 / 图像生成 / 豆包编程 / 更多）
3. "新对话"为浅蓝底 pill（`#eaf1fe` 底 + 品牌蓝字）
4. 品牌蓝 `#3b82f6` 系：登录按钮、发送按钮为纯蓝圆形
5. 问候大标题居中（"你好，我是豆包"）
6. 输入框：超大圆角（~24px）、白底、浅灰边框、柔和阴影；左回形针 + 功能 pill，右圆形发送按钮
7. 输入框下方一排彩色小图标技能 chips（描边 pill）
8. 用户消息为浅蓝圆角气泡，AI 回复为无气泡纯文本
9. 正文排版：字号 15px、行高 1.75
10. 整体留白大、圆角多、无深色元素

> 依据：`browser_open` 抓 `https://www.doubao.com/` 失败（上游超时），特征改为
> 基于 image-search 找到的 doubao.com 网页版公开截图（两张，已人工看过）整理；
> 蓝色色值为截图采样近似值。最终效果以用户在自己浏览器里的实测截图为准迭代。

## 2. 实现策略：token 接管为主，选择器为辅

Claude.ai 现行构建是 design-token 驱动。换肤第一层直接重定义 token：

`--bg-000` ~ `--bg-500`、`--accent-brand`、`--accent-secondary-000`、
`--border-100` ~ `--border-400`

这一层不依赖任何 DOM 选择器，最抗站点改版；用 `!important` 压过站点自身定义。

第二层用"语义选择器 + 降级数组"做 doubao 式的**形状**
（输入框超大圆角、发送按钮蓝色圆形、用户气泡浅蓝圆角、侧边栏浅灰、
新对话浅蓝高亮），不碰布局与功能。

## 3. 选择器依据（来源 + 更新时间）

- **GPTDisguise 2.1.8**（本地 `~/workspace/user/files/GPTDisguise_2.1.8.zip` 解压，
  2026-10-17，见 `docs/REF_ANALYSIS.md` 第 4.2 节；本次又直接读了它的
  `disguise-config.js` / `mirror.js` 取实锤选择器）：
  - 输入框：`[data-cds="Editor"] [contenteditable="true"]`、
    `[data-cds="ChatComposer"] [contenteditable="true"]`、
    `div[contenteditable="true"][data-testid="chat-input"]`、
    `div.ProseMirror[contenteditable="true"]`
  - 发送按钮：`button[aria-label*="send message" i]`、`button[aria-label="Send" i]`、
    `[data-cds="ChatComposerActions"] button[type="submit"]`
  - 会话列表：`[data-testid="sidebar-recents"] a[href*="/chat/"]`
  - 新对话：`a[data-row-main-button][href$="/new"]`
  - 文本列：`[data-cds="ChatComposer"]`、`[data-testid="transcript-list"]`
  - 用户消息：`[data-testid="user-message"]`、`[data-cds="UserMessage"]`
  - AI 回复：`[data-cds="AssistantMessage"]`、`.font-claude-response`
  - 侧边栏：`aside.dframe-sidebar`、`[data-testid="sidebar"]`、`.dframe-root`
    （`--df-sidebar-width` / `--static-sidebar-width` 行内变量）
  - Composer 内部变量：`--cmp-lead-w`、`--cmp-trail-w`、`--cmp-gap-y`、
    `--cds-h-control`（本次未改，只记录）
- **knoopx/nix-userstyles** `userstyles/claude.nix`（经 deepwiki 摘要，2026 年中）：
  Claude.ai 主题变量名 `--accent-brand`、`--accent-secondary-000`、
  `--bg-000` ~ `--bg-500`、`--border-100` ~ `--border-400`——主题第 2 层变量名出自此处

## 4. 硬约束遵守情况

- 无 `display:none` / `visibility:hidden` / `opacity:0` 规则
- 不增删 DOM 节点，不改事件监听，不改布局宽度
- 发送按钮选择器全部限定在 `[data-cds="ChatComposer"]` 内，避免误伤其他按钮
- 所有规则以 `html.skm-mask-on` 为前缀，关闭即 100% 还原

## 5. 已知局限（需用户实测确认）

- `--bg-000` ~ `--bg-500` 各层级的精确语义未公开（只知变量名），按"越小越基础"
  惯例映射；若某层级语义猜错，表现为某块区域颜色不对——截图发回后对照调整，
  不会破坏功能
- Claude 深色模式用户：token 被 `!important` 压回浅色，建议先把 Claude 设置切到
  浅色模式再看效果
- doubao 蓝色色值是截图采样近似值（`#3b82f6` 系），以用户实测为准微调
- claude.ai 聊天页需登录，dev 浏览器看不到真实聊天 UI——验证步骤见任务报告
- 站点改版导致 token / 选择器失效时，主题退化为"部分生效"，不会破坏功能；
  届时对照 GPTDisguise 仓库更新选择器即可
