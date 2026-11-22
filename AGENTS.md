# 项目操作约定

## 项目与现有能力

- 浏览器扩展：保留 ChatGPT / Claude / Grok / Gemini 原生功能，支持 Qwen、DeepSeek 风格。
- 技术栈为 React + TypeScript；Extension.js 负责构建，agent-browser 负责浏览器交互、快照和截图。依赖安装使用 `npm install`。
- popup 支持原版 / Mask、主题、自动应用，以及 Qwen 额外入口的 0–50% 静止透明度。
- README.md 按用户最新要求以 webstore/ 宣传图和截图为主，保留简短用途、安装方式与隐私政策入口；必要的项目说明和操作约定集中维护在本文件。
- docs/ 仅作为本地参考，已取消 Git 跟踪并加入忽略规则；其中 WORKFLOW.md 是操作说明，VALIDATION.md 是历史实测，不应把本地文档当成其他检出环境必有的依赖。

## 重构边界

- `src/core/catalog.ts` 维护站点与皮肤元信息；`preferences.ts` 维护偏好类型、默认值与规范化；`storage.ts` 负责持久化和订阅。
- `site-runtime.ts` 只共享入口生命周期；`mask.ts` 管理页面开关和样式；`tab-identity.ts` 管理可恢复的标题与图标。
- `src/themes/` 只放品牌色板；各宿主的 CSS、选择器、布局、装饰与交互留在 `src/sites/<site>/`。允许有意重复，避免不同宿主更新互相牵连；不要为了去重建立通用宿主适配框架。
- `npm run verify`（即 `npm test && npm run typecheck`）运行核心回归与类型检查，需要支持 TypeScript 类型转换的 Node.js（当前使用 Node 24）；真实浏览器验证仍不可省略。

## 浏览器：默认复用当前 Brave

- 默认使用用户已经打开、已经登录的 Brave 进程和当前默认 profile。禁止另开浏览器、临时 profile、无痕窗口，禁止重启或关闭用户 Brave 来解决连接问题。
- 用户已在 `brave://inspect/#remote-debugging` 开启远程调试。读取 `~/.config/BraveSoftware/Brave-Browser/DevToolsActivePort` 中本次端口和 WebSocket 路径，不硬编码旧地址；自定义位置用 `WORKFLOW_DEVTOOLS_FILE`。注意：Brave 远程调试只提供 WebSocket 地址，不提供 HTTP `/json/list`，且会拦截 `brave://extensions` 等内部页面导航（`ERR_CONNECTION_CLOSED`）。
- 封装脚本默认 `WORKFLOW_BROWSER=brave`（如需切回 Chromium dev 显式传 `WORKFLOW_BROWSER=chromium`），交互统一用 `npm run browser:page -- <命令>` / `npm run browser:popup -- <命令>`。封装始终传显式 CDP 地址，避免 agent-browser 自动启动其他浏览器。连接失败时诊断连接，不回退启动新浏览器。
- 如需 Extension.js 开发命令，使用 `npm run dev:brave -- --starting-url https://chatgpt.com/`，其中 `--profile false` 必须保留。优先直接连接当前进程；不要为每次截图重新启动 dev。启动子进程退出或回执显示 `browser_exited`，不代表复用的 Brave 已退出。
- `browser:page` 直接使用 `DevToolsActivePort`，不依赖 `ready.json`；`browser:popup` 会自动从 Brave `Default/Preferences` 识别当前已启用的本项目扩展 ID（也可用 `WORKFLOW_EXTENSION_ID=<ID>` 显式覆盖）。

## 扩展身份与构建

- 开始浏览器验证前，先运行 `npm run brave:ext` 确认 Brave 远程调试状态、已安装的本项目解包扩展 ID、加载目录及启用状态；不能仅凭 `dist/extension-js/brave/ready.json` 推断。
- 用户有时会切换测试正式版本，因此本地开发扩展在 Brave 中可能处于**未加载或已禁用**状态（`Preferences` 中 `disable_reasons` 非空，直接打开 popup 会报 `net::ERR_BLOCKED_BY_CLIENT`）。**遇到扩展未加载或未启用时，立即停下来请求用户在 `brave://extensions` 手动加载或开启对应版本**；不要尝试修改 Brave 的 `Preferences` 文件，也不要尝试通过 CDP 打开 `brave://extensions`。
- 常见本地构建目录与 ID 排查线索：`dist/brave-agentdev`（推荐给 Agent 开发测试专用，用 `npm run build:agentdev`，扩展名自动带 `[AgentDev]` 前缀以区分正式版）、`dist/brave`（`kmplgofmbnbomllbglcefbkeegbnagjf`，用 `npm run build:brave`）、`dist/chromium`（`diiajonijlhkahmknglokeapolnhhhnf`，用 `npm run build`）。每次以 `npm run brave:ext` 实测为准，禁止写死到业务代码，也不要让 dev 和生产构建同时覆盖同一输出目录。
- popup 在独立扩展标签页中打开，不等同于真实工具栏浮层。
- 构建完成后只重载本项目扩展，再刷新目标页面。扩展重载会关闭扩展标签页，需要重新打开。不要重启 Brave。

## 固定验证顺序

1. 检查 Brave 连接与扩展状态：`npm run brave:ext`；若本项目扩展未启用，停下来请求用户手动加载/开启。
2. 列出标签页：`npm run browser:page -- tab list --json`。
3. 根据 URL 和用户指定页面确认目标，再执行 `npm run browser:page -- tab <targetId>`；不依赖人工当前激活页，不复用旧 snapshot 的元素引用。
4. 确认效果来自重新加载的实际扩展。`autoApply=false` 时刷新不会自动换肤，需通过 popup 手动启用；不要擅自改变用户的自动应用设置。
5. 用条件等待确认预期状态，再截图：`npm run shot:page -- --out .workflow/shots/<名称>`。字体和两帧绘制等待不代表换肤已完成，仍需检查 `html.skm-mask-on` 和相关控件/计算样式。
6. 查看生成图片，并检查改动涉及的原生交互。临时 CSS、DOM fixture、明暗预览和草稿要清理。验证输入框无需发送消息或上传文件。
7. 代码检查使用 `npm run verify`、适当构建及 `git diff --check`。报告实际覆盖范围，不把临时注入预览称为正式扩展验证。

- 截图和调试证据放在 `.workflow/`，用户手动参考图在 `.workflow/shots/manual/`，不要清理它们。 用户手动抓取并清理的目标html在`.workflow/html-shots`
- 额外入口默认保留原位置和原控件，静止透明度 0–50%，hover/键盘聚焦恢复显示；未经新需求不要删除或挪动。
- `.gitignore` 有用户独立修改，不得顺带覆盖或提交。当前 `*.md` 会忽略新 Markdown 文件；需要提交本文件时显式 `git add -f AGENTS.md`，不要为此修改用户忽略规则。

## 直连命令 nopp

- `~/.local/bin/nopp COMMAND [ARG ...]` 仅用于需要直连的安装场景，例如 `nopp npm install`、`nopp cargo install <crate>`，只影响本次命令及其子进程。
- nopp 清除常见代理环境变量，将 NO_PROXY / no_proxy 设为 `*`，禁用 npm、Cargo、Git 的常见代理设置，并移除 LD_PRELOAD 中的 proxychains 注入。内部命令不要再套 pp/p 或显式代理参数。
- 永远禁止用 nopp 测试或探测本机出口网络信息，包括公网 IP、地区、运营商、ASN、出口路由、代理是否生效及出口对比。验证只允许本地环境变量、参数、退出码和配置检查，不得为此发起网络请求。
