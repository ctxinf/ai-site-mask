# extension-workflow

让 Codex 和人共同开发浏览器插件：**Extension.js 管构建、热更新和日志；
agent-browser 管同一个浏览器的交互、快照和截图。** React + TypeScript，Chromium MV3。

## 开始

```bash
npm install
npm run install:browsers     # 已有 Chromium 可跳过，见下方
npm run page                # 终端 1：本地体验页 http://127.0.0.1:8931
npm run dev                 # 终端 2：可见浏览器 + 热更新，保持运行
```

已有浏览器：`npm run dev -- --chromium-binary /absolute/path/to/chrome`。
无显示器：在 dev 命令前加 `EXTENSION_BROWSER_FLAGS=--headless=new`。
安装需要直连时使用 `nopp npm install`、`nopp npm run install:browsers`。
agent-browser 接管现有浏览器，**不需要另跑 `agent-browser install`**。

## 开发闭环

```bash
npm run doctor                         # 检查 dev 和浏览器是否就绪
npm run browser:popup -- snapshot -i    # 打开插件页面，列出按钮和 checkbox 的 @ref
npm run browser:popup -- click @e3      # 用刚得到的 ref 操作；页面变化后重新 snapshot
npm run browser:page -- snapshot        # 查看体验页（含 Shadow DOM 中的横幅）
npm run shot                           # 截取当前 dev 会话：.workflow/shots/{popup,page}.png
npm run logs:ndjson                     # 按 popup / background / content 读日志
```

直接改 `src/`，保存后热更新，再操作、读日志、截图。没有新增自动化测试框架。
`browser:popup` 和 `browser:page` 分别绑定自己的标签页，人工可以在同一可见浏览器中
查看和操作。popup 默认作为扩展标签页打开；真实工具栏浮层需人工点击扩展按钮。

## 示例功能

popup 的「显示页面横幅」开关即时同步到已打开页面，并用 `chrome.storage.local`
保存。刷新页面或重开 popup 后仍保留设置。另有点击计数器和 HMR 文案标记。

## 工具分工与文件

| 工具 / 文件 | 作用 |
| --- | --- |
| Extension.js | 插件构建、热更新、浏览器生命周期、按上下文收集日志 |
| agent-browser 0.39.1 | 通过 CDP 接管 dev 浏览器，提供 snapshot、click、wait、screenshot 等命令 |
| `scripts/browser.mjs` | 薄封装：读取 dev 的 ready.json，校验会话，绑定项目专用标签页，转发命令 |
| `scripts/shot.mjs` | 截图快捷方式，调用 agent-browser，不再自研 CDP 或启动第二个浏览器 |
| `scripts/page.mjs` | 提供无需外网的本地体验页 |
| `src/` | popup、background、content 与 manifest |

详细命令与限制见 [WORKFLOW.md](docs/WORKFLOW.md)，选型见
[DECISIONS.md](docs/DECISIONS.md)，实测记录见 [VALIDATION.md](docs/VALIDATION.md)。
