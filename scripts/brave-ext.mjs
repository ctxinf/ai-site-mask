#!/usr/bin/env node
// Inspect Brave remote debugging state and unpacked extensions belonging to this repo.
import {existsSync, readFileSync} from 'node:fs'
import {homedir} from 'node:os'
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path'
import {fileURLToPath} from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export function getBravePaths() {
  const userDataDir = process.env.WORKFLOW_BRAVE_USER_DATA_DIR || join(homedir(), '.config/BraveSoftware/Brave-Browser')
  const profile = process.env.WORKFLOW_BRAVE_PROFILE || 'Default'
  const devtoolsFile = process.env.WORKFLOW_DEVTOOLS_FILE || join(userDataDir, 'DevToolsActivePort')
  const preferencesFile = join(userDataDir, profile, 'Preferences')
  return {userDataDir, profile, devtoolsFile, preferencesFile}
}

export function readBraveDevTools() {
  const {devtoolsFile} = getBravePaths()
  if (!existsSync(devtoolsFile)) {
    throw new Error(`未找到 Brave 远程调试文件: ${devtoolsFile}（请确认 Brave 已打开并在 brave://inspect/#remote-debugging 开启远程调试）`)
  }
  const [port, wsPath] = readFileSync(devtoolsFile, 'utf8').trim().split(/\r?\n/)
  if (!/^\d+$/.test(port) || !wsPath?.startsWith('/devtools/browser/')) {
    throw new Error(`Brave 调试地址无效: ${devtoolsFile}`)
  }
  return {
    devtoolsFile,
    port: Number(port),
    wsPath,
    webSocketDebuggerUrl: `ws://127.0.0.1:${port}${wsPath}`,
  }
}

export function inspectBraveExtensions() {
  const {preferencesFile} = getBravePaths()
  const result = {
    preferencesFile,
    preferencesReadable: false,
    extensions: [],
    enabled: [],
    readyReceipt: null,
  }

  const readyFile = join(root, 'dist/extension-js/brave/ready.json')
  if (existsSync(readyFile)) {
    try {
      const ready = JSON.parse(readFileSync(readyFile, 'utf8'))
      result.readyReceipt = {
        file: relative(root, readyFile),
        extensionId: ready.extensionId || null,
        distPath: ready.distPath ? relative(root, ready.distPath) : null,
        status: ready.status || null,
      }
    } catch {
      // Ignore malformed receipt
    }
  }

  if (!existsSync(preferencesFile)) return result
  try {
    const prefs = JSON.parse(readFileSync(preferencesFile, 'utf8'))
    result.preferencesReadable = true
    const settings = prefs.extensions?.settings || {}
    const rootPrefix = root.endsWith(sep) ? root : root + sep
    for (const [id, info] of Object.entries(settings)) {
      if (typeof info?.path !== 'string' || !isAbsolute(info.path)) continue
      const absPath = resolve(info.path)
      if (absPath !== root && !absPath.startsWith(rootPrefix)) continue
      const relPath = relative(root, absPath)
      const disableReasons = Array.isArray(info.disable_reasons) ? info.disable_reasons : []
      const enabled = disableReasons.length === 0 && info.state !== 0
      const buildCommand = relPath === 'dist/brave-agentdev'
        ? 'npm run build:agentdev'
        : relPath === 'dist/brave'
          ? 'npm run build:brave'
          : relPath === 'dist/chromium'
            ? 'npm run build'
            : null
      const item = {id, path: absPath, relPath, enabled, disableReasons, buildCommand}
      result.extensions.push(item)
      if (enabled) result.enabled.push(item)
    }
  } catch {
    result.preferencesReadable = false
  }
  return result
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const asJson = process.argv.includes('--json')
  let devtools = null
  let devtoolsError = null
  try {
    devtools = readBraveDevTools()
  } catch (error) {
    devtoolsError = error.message
  }
  const extInfo = inspectBraveExtensions()

  if (asJson) {
    console.log(JSON.stringify({devtools, devtoolsError, ...extInfo}, null, 2))
    if (devtoolsError) process.exitCode = 1
  } else {
    if (devtools) {
      console.log(`Brave CDP: 就绪 (${devtools.webSocketDebuggerUrl})`)
    } else {
      console.log(`Brave CDP: 不可用 - ${devtoolsError}`)
      process.exitCode = 1
    }

    if (!extInfo.preferencesReadable) {
      console.log(`Brave Preferences: 不可读 (${extInfo.preferencesFile})`)
    } else if (extInfo.extensions.length === 0) {
      console.log('已安装本地扩展: 无')
      console.log('提示: 当前 Brave 未加载本仓库的解包扩展，请停下来请用户在 brave://extensions 手动加载。')
    } else {
      console.log('已安装本地扩展:')
      for (const ext of extInfo.extensions) {
        const tag = ext.enabled ? 'ENABLED ' : 'DISABLED'
        const extra = ext.enabled ? (ext.buildCommand ? ` (${ext.buildCommand})` : '') : ` (disable_reasons=${JSON.stringify(ext.disableReasons)})`
        console.log(`  [${tag}] ${ext.id} -> ${ext.relPath}${extra}`)
      }
      if (extInfo.enabled.length === 1) {
        const active = extInfo.enabled[0]
        console.log(`当前启用: ${active.id} (${active.relPath})${active.buildCommand ? ` -> 构建命令: ${active.buildCommand}` : ''}`)
      } else if (extInfo.enabled.length === 0) {
        console.log('当前无已启用的本地开发扩展。请停下来请用户在 brave://extensions 手动开启需要测试的版本。')
      } else {
        console.log('检测到多个已启用的本地扩展，操作 popup 时请传 WORKFLOW_EXTENSION_ID=<目标ID>。')
      }
    }
  }
}
