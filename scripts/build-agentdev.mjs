#!/usr/bin/env node
// Build an isolated Brave unpacked extension in dist/brave-agentdev with a [AgentDev] title prefix.
import {execFileSync} from 'node:child_process'
import {cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const prefix = process.env.AGENTDEV_TITLE_PREFIX || '[AgentDev] '
const srcDir = join(root, 'dist/brave')
const outDir = join(root, 'dist/brave-agentdev')

const withPrefix = (value) => (typeof value === 'string' && !value.startsWith(prefix) ? `${prefix}${value}` : value)

try {
  execFileSync(join(root, 'node_modules/.bin/extension'), ['build', '--browser', 'brave'], {
    cwd: root,
    stdio: 'inherit',
  })

  rmSync(outDir, {recursive: true, force: true})
  cpSync(srcDir, outDir, {recursive: true})

  // Prefix localized extension names in _locales/*/messages.json
  const localesDir = join(outDir, '_locales')
  if (existsSync(localesDir)) {
    for (const locale of readdirSync(localesDir)) {
      const msgPath = join(localesDir, locale, 'messages.json')
      if (!existsSync(msgPath)) continue
      const messages = JSON.parse(readFileSync(msgPath, 'utf8'))
      if (messages.extensionName?.message) {
        messages.extensionName.message = withPrefix(messages.extensionName.message)
      }
      writeFileSync(msgPath, JSON.stringify(messages, null, 2) + '\n')
    }
  }

  // Prefix manifest action title (and direct name if not i18n-backed)
  const manifestPath = join(outDir, 'manifest.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (manifest.action?.default_title) {
    manifest.action.default_title = withPrefix(manifest.action.default_title)
  }
  if (typeof manifest.name === 'string' && !manifest.name.startsWith('__MSG_')) {
    manifest.name = withPrefix(manifest.name)
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')

  console.log(`\nAgentDev 扩展已构建: ${outDir}`)
  console.log(`扩展名称前缀: ${prefix.trim()}`)
} catch (error) {
  console.error('build:agentdev 失败:', error.message)
  process.exitCode = 1
}
