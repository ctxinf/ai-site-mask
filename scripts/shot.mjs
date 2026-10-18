#!/usr/bin/env node
// Compatibility shortcut: capture the live dev tabs through agent-browser.
import {execFileSync} from 'node:child_process'
import {mkdirSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {parseArgs} from 'node:util'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
try {
  const {values} = parseArgs({options: {
    target: {type: 'string', default: 'all'},
    out: {type: 'string', default: '.workflow/shots'},
    url: {type: 'string'}
  }})
  if (!['all', 'popup', 'page'].includes(values.target)) throw new Error('--target 必须是 all、popup 或 page')
  const out = resolve(root, values.out)
  mkdirSync(out, {recursive: true})
  const run = (surface, ...args) => execFileSync(process.execPath, [join(root, 'scripts/browser.mjs'), surface, ...args], {stdio: 'inherit', timeout: 60000})
  for (const surface of values.target === 'all' ? ['popup', 'page'] : [values.target]) {
    if (surface === 'page' && values.url) run(surface, 'open', values.url)
    if (surface === 'popup') run(surface, 'wait', 'input[type=checkbox]:enabled')
    else run(surface, 'wait', '--fn', 'document.readyState === "complete" && !!document.querySelector("main")')
    run(surface, 'eval', 'document.fonts.ready.then(() => true)')
    run(surface, 'screenshot', join(out, `${surface}.png`))
  }
} catch (error) {
  console.error('截图失败:', error.message)
  process.exitCode = 1
}
