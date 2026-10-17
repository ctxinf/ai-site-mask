# 开发与浏览器验证

## 1. 启动

先 `npm install`。没有浏览器时运行 `npm run install:browsers`。
已有 Chromium 可用 `--chromium-binary /absolute/path/to/chrome` 复用。

```bash
npm run page        # 终端 1，体验页固定为 http://127.0.0.1:8931
npm run dev         # 终端 2，可见浏览器，保持运行
npm run doctor      # 终端 3，确认 ready、控制通道和浏览器通过检查
```

无显示器使用 `EXTENSION_BROWSER_FLAGS=--headless=new npm run dev`。
agent-browser 只连接 Extension.js 启动的浏览器，不需要单独安装浏览器。

## 2. 查看、交互、截图

```bash
npm run browser:popup -- snapshot -i
# 根据实际快照的 ref 点击，ref 不是固定值：
npm run browser:popup -- click @e3
npm run browser:popup -- snapshot -i
npm run browser:page -- snapshot
npm run shot
```

两条 browser 命令均支持 agent-browser 的原生命令和参数：

```bash
npm run browser:popup -- uncheck 'input[type=checkbox]'
npm run browser:popup -- wait --text '横幅已隐藏'
npm run browser:page -- wait --fn '!document.querySelector("[data-extension-workflow]")?.shadowRoot?.querySelector("[role=status]")'
npm run browser:page -- reload
npm run browser:popup -- reload
npm run browser:popup -- is checked 'input[type=checkbox]'
npm run browser:popup -- check 'input[type=checkbox]'
npm run browser:page -- wait --fn '!!document.querySelector("[data-extension-workflow]")?.shadowRoot?.querySelector("[role=status]")'
npm run browser:popup -- screenshot .workflow/shots/popup.png
npm run browser:page -- screenshot .workflow/shots/page.png
```

使用条件等待，不使用固定 sleep。横幅位于 Shadow DOM，使用上面的显式
`shadowRoot` 条件确认存在或消失；宿主 div 没有可见尺寸，不能等待宿主“可见”。
`is checked` 输出 false 表示未选中，应读取结果判断。

`npm run shot` 默认截两页，也支持 `-- --target popup|page|all`、`--out <目录>`。
`npm run shot -- --target page --url <URL>` 会导航自己的 page 标签页；该页面需允许
插件注入。这个命令验证的是 **当前 dev 会话**，不会独立加载生产构建。
自定义页面也可 `npm run browser:page -- open <URL>`；后续命令继续使用该页。

## 3. 改代码，验证热更新与日志

保存 `src/` 的修改，观察 dev 输出的编译和重载结果，再重新 snapshot 或 screenshot。
不需要重启浏览器。对期望文案可执行 `wait --text '<新文案>'` 后再截图。

```bash
npm run logs:bg
npm run logs:popup
npm run logs:content
npm run logs:ndjson                # 持续跟随
npx extension logs --context all --output ndjson  # 打印已有日志后退出
npm run reload
npm run build                     # 停止 dev 后构建，避免覆盖同一 dist
npx tsc --noEmit
```

Extension.js **没有截图命令**。它负责跨上下文日志；agent-browser 的 console/errors
用于当前页面的额外诊断。popup/background 的 Extension.js eval 可能被 CSP 拦截，
交互使用 agent-browser，不放宽扩展 CSP。

## 4. 人工介入与结束

普通 `npm run dev` 使用可见浏览器，人工可以随时查看或操作，Codex 继续改代码。
两个 surface 使用各自的具名 session 和固定标签页，不会随人工切换而误操作别的标签页。
如果专用标签页被关闭，pin-tab 会报错；用 `npm run browser:popup -- tab new` 或
`npm run browser:page -- tab new` 恢复，再重试命令。

结束时先断开 agent-browser，再在 dev 和 page 两个终端按 Ctrl+C：

```bash
npm run browser:popup -- close
npm run browser:page -- close
```

CDP 外部浏览器由 Extension.js 所有；agent-browser close 断开其连接，dev 的 Ctrl+C
负责关闭浏览器。不要运行 `close --all` 影响其他项目 session。

## 会话与排障

封装读取 `dist/extension-js/chromium/ready.json` 中的 `instanceId`、`extensionId` 和
`cdpPort`，验证进程存活和 CDP 可达性。不会猜第一个 service worker，也不硬编码 ID
或端口。无 dev、仅 build、过期 ready 文件和浏览器已关闭时应报错，不回退启动新浏览器。
默认页面可通过 `WORKFLOW_PAGE_URL` 环境变量覆盖。

| 现象 | 处理 |
| --- | --- |
| 编译成功但浏览器没启动 | `npm run doctor`，检查 browser binary 和显示环境 |
| ready / CDP 不可用 | 重新启动 dev，封装会采用新会话信息 |
| 体验页连接失败 | 保持 `npm run page` 运行，检查 8931 端口 |
| 标签页被人工关闭 | 用对应 surface 的 `tab new` 恢复 |
| 外网访问失败 | 先用本地体验页验证，不依赖外网 |

原生命令参考：[agent-browser Commands](https://agent-browser.dev/commands)、
[CDP 与标签页绑定](https://agent-browser.dev/cdp-mode)。
