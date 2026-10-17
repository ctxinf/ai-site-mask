# 开发流程实测（2026-10-17）

## 当前流程：Extension.js + agent-browser 0.39.1

已将 agent-browser 固定为开发依赖。`browser.mjs` 连接 Extension.js 当前 dev 浏览器，
popup/page 分别使用具名 session 和 pin-tab；`shot.mjs` 改为调用 agent-browser，
不再自行启动浏览器或实现 CDP。以下步骤均已实际执行，没有新增自动化测试框架。

| 检查 | 结果 |
| --- | --- |
| popup / page 快照 | 能识别 checkbox、计数器、Shadow DOM 中的横幅 |
| uncheck → 页面状态 | popup 显示已隐藏，页面快照不再包含横幅 |
| 刷新页面与 popup | 仍显示已隐藏，`is checked` 输出 false |
| check → 页面状态 | Shadow DOM 条件等待通过，横幅恢复 |
| HMR | 修改文案为 `HMR 标记 v4 · agent-browser`，404 ms 编译后，agent-browser wait 与快照确认新文案 |
| 引用交互 | 从新快照获取按钮 ref 并点击，计数器显示 1 |
| 两页截图 | `npm run shot -- --target all` 成功；图片已查看，popup 包含新文案、计数器 1，体验页包含横幅 |
| 标签页关闭保护 | page 标签页关闭后返回非零退出码与 `tab_gone`，没有回退到其他标签页 |
| 标签页恢复 | `browser:page -- tab new` 后，快照与两页截图再次成功 |
| 外部浏览器生命周期 | 两个 agent-browser session close 后，Extension.js doctor 仍 8/8 通过 |
| dev 停止后 | browser 命令快速返回非零退出码，提示先启动 dev，没有另起浏览器 |
| 日志 | background、popup、content 均有记录，收集的日志没有 error |

实测发现并处理了两个集成细节：

- Shadow DOM 宿主没有可见尺寸，等待宿主“可见”会超时，改为显式 `shadowRoot` 条件等待。
- 后台页截图曾出现 `Page.captureScreenshot` 超时；截图前通过 agent-browser tab 激活
  绑定的目标页后，两页截图连续完成。

当前截图：`.workflow/shots/popup.png`、`page.png`；当前日志：
`.workflow/evidence/agent-browser-logs.ndjson`。验证结束已停止 dev、体验页服务和浏览器。
本轮运行使用 headless Chromium；可见浏览器人工操作在下述早期流程中已验证。

## 早期流程记录（自研 CDP，已被上述流程替代）

本次由 Codex 完成图标补齐、新功能开发及浏览器验证，没有新增自动化测试。

## 实现内容

- 补齐 manifest 引用的五种尺寸 PNG 图标。
- popup 新增「显示页面横幅」开关，使用 `chrome.storage.local` 保存设置。
- content 监听设置变更，立即显示或隐藏横幅；background 记录设置变更。
- `package.json` 格式化为多行。

## 实测结果

| 环节 | 结果 |
| --- | --- |
| 安装依赖 | `nopp npm install` 成功 |
| 生产构建 | `npm run build` 成功 |
| 类型检查 | `./node_modules/.bin/tsc --noEmit` 成功 |
| dev 会话 | 使用本机 Playwright Chromium 147、headless 模式成功启动 |
| 诊断 | `npm run doctor` 8/8 通过 |
| popup → content | 点击开关后，现有页面横幅立即消失；再次开启后恢复 |
| 设置持久化 | 关闭后刷新页面和重新加载 popup，仍显示关闭状态，storage 值为 false |
| 计数器 | 点击后显示 1 次 |
| 热更新 | 修改 popup 文案后编译耗时 411 ms，已打开页面显示 v3 文案，计数器仍为 1 |
| 日志 | background、popup、content 均记录 false/true 设置变更；收集的扩展日志无 error |
| 生产截图 | `CHROME_BIN=... npm run shot -- --target all` 成功生成两张 PNG，已查看 |

## 浏览器与操作方式

首次尝试托管 Chromium 下载耗时较长，发现本机已有可用浏览器后中止下载并复用：

```bash
EXTENSION_BROWSER_FLAGS=--headless=new npm run dev -- \
  --chromium-binary /home/user13500/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome \
  --starting-url http://127.0.0.1:8931
```

本地测试页由临时 HTTP 服务提供。popup 通过 Extension.js `navigate --new-tab`
打开为扩展标签页。`eval --context popup` 被 CSP 拦截，改用同一开发浏览器的
CDP `Runtime.evaluate` 调用控件 `.click()`、读取 DOM，并通过
`Page.captureScreenshot` 截图。没有修改 CSP。

本次验证覆盖扩展标签页中的 popup 内容，没有验证工具栏浮层的打开手势、
焦点及关闭行为。也没有验证 Firefox 或商店发布流程。

## 本地证据

- `.workflow/evidence/popup-hmr.png`：热更新后文案与计数器状态。
- `.workflow/evidence/popup-off.png`、`page-off.png`：开关关闭后的 popup 与页面。
- `.workflow/evidence/page-on.png`：恢复显示后的页面。
- `.workflow/evidence/logs.ndjson`：开发会话的跨上下文日志。
- `.workflow/evidence/doctor.txt`：8/8 诊断结果。
- `.workflow/shots/popup.png`、`page.png`：原有截图脚本对生产构建的截图。

`.workflow/` 仍按仓库原有规则忽略，不包含在 Git 变更中。

## Qwen 实页改进（2026-10-18）

本轮复用用户已打开、已登录的 Brave 默认 profile，通过用户开启的远程调试接口连接。
没有为 Brave 新建 profile。实际安装目录为 `dist/chromium`，已生产构建、重载扩展，
刷新实页后通过 popup 的「原版 → Mask」按钮启用，确认效果来自正式扩展而非仅临时 CSS。

参考图为 `.workflow/shots/manual/qwen-light.png`、`q wen-dark.png`。
最终截图为 `.workflow/shots/final-light/page.png`、`final-dark/page.png`。

| 检查 | 结果 |
| --- | --- |
| TypeScript / 生产构建 | `tsc --noEmit`、`npm run build` 通过 |
| 真正的扩展开关 | 原版/Mask 可切换；刷新后自动应用为 false 时不自动开启，符合原设置 |
| 深色主题 | 保留原站 `data-theme=dark`，color-scheme 为 dark，侧栏 232px，无横向溢出 |
| 浅色预览 | 临时变更 DOM 的 data-theme 查看浅色后恢复 dark，未改账户设置 |
| 编辑器 | 可输入测试文字，发送按钮启用；未发送消息，已用 Control+A / Backspace 清空草稿 |
| 模型菜单 | 真实模型按钮可展开菜单，包含「选择模型」「强度」 |
| 附件入口 | 真实按钮可点击并变为 aria-expanded=true；未上传文件 |
| 正文选择器回归 | 临时 article/assistant fixture 的 h1 无伪元素替换，SVG display=block；验证后已移除 |
| 透明度滑块 | 实际键盘 End 保存 0.5，Home 保存 0；对应 chrome.storage.sync 值正确 |
| 透明入口恢复 | 0% 的顶部模式控件 hover 后条件等待确认 opacity=1；默认恢复到 25% |
| 页面截图 Pipeline | `WORKFLOW_BROWSER=brave npm run shot:page` 成功写到指定目录 |

额外入口按用户要求保留原位置及控件，不删除、不重排；静止透明度可调 0–50%，
hover/focus-within 恢复完整显示。尚未验证消息发送/流式输出、真实文件上传和移动端。
