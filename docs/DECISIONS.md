# 选型记录

## Extension.js + React + TypeScript

Extension.js 4.1.33 管插件构建、启动开发浏览器和热更新。React 用于 popup 与 content
界面。MV3 background、popup、content 的日志通过 Extension.js 原生 CLI 按上下文收集。

## 浏览器交互与截图采用 agent-browser

Extension.js 没有截图命令，且 popup/background 的 eval 可能被扩展 CSP 拦截。
采用 [agent-browser](https://github.com/vercel-labs/agent-browser) 0.39.1，固定版本加入
开发依赖。通过 [CDP 模式](https://agent-browser.dev/cdp-mode) 接管 Extension.js 的
同一个浏览器，不单独启动截图浏览器，也不再维护 WebSocket/CDP 客户端。

旧 `shot.mjs`（237 行）自行管理浏览器启动、临时 profile、CDP 消息、超时和截图，
固定等待 2/4 秒，且独立浏览器无法证明 dev 会话中的 HMR 与状态。
现在它只作为 agent-browser 的截图快捷方式，默认连接正在运行的 dev 会话。
因此行为有意改变：只运行 build 后不能截图，需要先运行 dev 和本地体验页。

`scripts/browser.mjs` 保留少量项目适配：读取 Extension.js ready 文件、检查进程和
CDP、按项目和 dev instance 隔离 agent-browser session，并为 popup/page 分别绑定
标签页。`--pin-tab` 防止人工切换标签页导致 agent 误操作；关闭标签页会显式失败。
不使用全局默认 agent-browser session，不硬编码调试端口或扩展 ID。

## 单个浏览器，允许人工介入

浏览器由 Extension.js 所有，agent-browser 只连接。可见模式用于人工体验，headless
模式用于 agent 验证。两者使用同一套命令。可复用本机 Chromium，无需额外运行
`agent-browser install`。`scripts/page.mjs` 提供独立的本地页面，验证不依赖外网。

popup 以扩展标签页运行，适合交互、截图和日志验证；工具栏浮层的手势、焦点和关闭
行为仍需人工验证。当前封装针对 Chromium，未宣称覆盖 Firefox、商店发布或生产安装。
