#!/usr/bin/env node
// Attach to the existing Brave (default) or a managed Chromium; agent-browser handles interaction and screenshots.
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {mkdirSync, readFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {inspectBraveExtensions, readBraveDevTools} from './brave-ext.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [surface, ...command] = process.argv.slice(2)

function resolveBraveExtensionId() {
  if (process.env.WORKFLOW_EXTENSION_ID) return process.env.WORKFLOW_EXTENSION_ID
  const extInfo = inspectBraveExtensions()
  if (extInfo.preferencesReadable) {
    if (extInfo.enabled.length === 1) return extInfo.enabled[0].id
    if (extInfo.enabled.length > 1) {
      const list = extInfo.enabled.map(e => `${e.id} (${e.relPath})`).join(', ')
      throw new Error(`Brave 中同时启用了多个本地扩展: ${list}。请设置 WORKFLOW_EXTENSION_ID=<ID> 指定目标。`)
    }
    const disabledList = extInfo.extensions.map(e => `${e.id} (${e.relPath})`).join(', ')
    const detail = disabledList ? `已发现但均已禁用: ${disabledList}` : '未发现本仓库的解包扩展'
    throw new Error(`Brave 中本项目扩展当前未启用（${detail}）。请停下来请用户在 brave://extensions 手动加载或开启后再继续。`)
  }
  if (extInfo.readyReceipt?.extensionId) return extInfo.readyReceipt.extensionId
  throw new Error('无法确定扩展 ID。请运行 npm run brave:ext 检查，或显式传入 WORKFLOW_EXTENSION_ID=<ID>。')
}

try {
  if (!['popup', 'page'].includes(surface)) {
    throw new Error('用法: npm run browser -- <popup|page> [agent-browser 命令及参数]')
  }
  const browser = process.env.WORKFLOW_BROWSER || 'brave'
  if (!['chromium', 'brave'].includes(browser)) throw new Error('WORKFLOW_BROWSER 必须为 brave 或 chromium')
  let ready, webSocketDebuggerUrl
  if (browser === 'brave') {
    // Attach to the existing default-profile browser; never launch another one.
    const devtools = readBraveDevTools()
    webSocketDebuggerUrl = devtools.webSocketDebuggerUrl
    ready = {
      instanceId: webSocketDebuggerUrl,
      extensionId: surface === 'popup' ? resolveBraveExtensionId() : null,
    }
  } else {
    try {
      ready = JSON.parse(readFileSync(join(root, 'dist/extension-js/chromium/ready.json'), 'utf8'))
      if (ready.command !== 'dev' || ready.status !== 'ready') throw new Error('not ready')
      if (!Number.isInteger(ready.pid) || !Number.isInteger(ready.browserPid)) throw new Error('missing pid')
      process.kill(ready.pid, 0)
      process.kill(ready.browserPid, 0)
      if (!Number.isInteger(ready.cdpPort) || ready.cdpPort < 1 || ready.cdpPort > 65535) throw new Error('missing CDP port')
      if (!/^[a-p]{32}$/.test(ready.extensionId) || !ready.instanceId) throw new Error('missing session identity')
    } catch {
      throw new Error('没有就绪的 Chromium dev 会话。先运行 npm run dev，再用 npm run doctor 检查。')
    }
    // Fail before invoking agent-browser, so a stale receipt cannot launch another browser.
    const response = await fetch(`http://127.0.0.1:${ready.cdpPort}/json/version`, {
      signal: AbortSignal.timeout(3000)
    })
    if (!response.ok) throw new Error('开发浏览器 CDP 不可用，请运行 npm run doctor')
    ;({webSocketDebuggerUrl} = await response.json())
    if (!webSocketDebuggerUrl) throw new Error('开发浏览器没有提供 CDP WebSocket 地址')
    if (process.env.WORKFLOW_EXTENSION_ID) ready.extensionId = process.env.WORKFLOW_EXTENSION_ID
  }

  const identity = createHash('sha256').update(`${root}:${ready.instanceId}`).digest('hex').slice(0, 12)
  if (surface === 'popup' && !/^[a-p]{32}$/.test(ready.extensionId || '')) throw new Error('扩展 ID 无效')
  const executable = join(root, 'node_modules/.bin/agent-browser')
  const flags = ['--session', `ewf-${identity}-${surface}`, '--cdp', webSocketDebuggerUrl, '--pin-tab']
  const run = (args, capture = false) => execFileSync(executable, [...flags, ...args], {
    cwd: root, timeout: 45000,
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: 'utf8'
  })
  mkdirSync(join(root, '.workflow/shots'), {recursive: true})
  const args = command.length ? command : ['snapshot', '-i']
  if (!['close', 'tab'].includes(args[0])) {
    const result = JSON.parse(run(['get', 'url', '--json'], true))
    if (!result.success) throw new Error(JSON.stringify(result))
    const current = result.data.url
    const popup = surface === 'popup' ? `chrome-extension://${ready.extensionId}/action/index.html` : null
    // Each surface has a pinned tab. Human tabs and the other surface stay untouched.
    if (surface === 'popup' && current !== popup) run(['open', popup], true)
    if (surface === 'page' && current === 'about:blank' && args[0] !== 'open') {
      run(['open', process.env.WORKFLOW_PAGE_URL || 'https://chatgpt.com/'], true)
    }
    if (surface === 'popup') run(['wait', '#root > *'], true)
  }
  if (args[0] === 'screenshot') {
    const {data} = JSON.parse(run(['tab', 'list', '--json'], true))
    const active = data.tabs.find(tab => tab.active)
    if (!active) throw new Error('没有绑定的截图标签页')
    run(['tab', active.targetId], true) // Activate before capture, including headed mode.
    run(['eval', 'Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 3000))]).then(() => new Promise(resolve => { setTimeout(() => resolve(true), 1000); requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))) }))'], true)
  }
  // agent-browser 0.39 may return a generated path even with a positional path.
  if (args[0] === 'screenshot' && args[1] && !args[1].startsWith('-')) {
    const {copyFileSync} = await import('node:fs')
    const result = JSON.parse(run(['screenshot', '--json', ...args.slice(2)], true))
    if (!result.success || !result.data?.path) throw new Error(JSON.stringify(result))
    copyFileSync(result.data.path, resolve(root, args[1]))
    console.log(`截图已保存: ${resolve(root, args[1])}`)
  } else run(args)
} catch (error) {
  console.error('browser:', error.stderr?.trim() || error.stdout?.trim() || error.message)
  process.exitCode = 1
}
