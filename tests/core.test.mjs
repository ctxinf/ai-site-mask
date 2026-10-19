import {test} from 'node:test'
import assert from 'node:assert/strict'
import {SKINS, SITES, SUPPORTED_HOSTS, resolveSkin, skinsForHost, siteForHost} from '../src/core/catalog.ts'
import {normalizeOpacity, normalizeQwenModelLabel, DEFAULT_QWEN_MODEL_LABEL} from '../src/core/preferences.ts'
import {getSiteState, getPreferences, setPreferences, setSiteState, onSiteStateChange} from '../src/core/storage.ts'
import {MaskEngine} from '../src/core/mask.ts'

let saved
const listeners = new Set()
globalThis.chrome = {
  storage: {
    sync: {
      async get() { return {skm: structuredClone(saved)} },
      async set(value) {
        const oldValue = saved
        saved = structuredClone(value.skm)
        for (const listener of listeners) listener({skm: {oldValue, newValue: saved}}, 'sync')
      },
    },
    onChanged: {addListener: fn => listeners.add(fn), removeListener: fn => listeners.delete(fn)},
  },
}

test('catalog covers every site and keeps legacy aliases independent', () => {
  assert.equal(siteForHost('chat.openai.com').id, 'chatgpt')
  assert.equal(new Set(SUPPORTED_HOSTS).size, 5)
  for (const site of SITES) assert.deepEqual(skinsForHost(site.host), Object.keys(SKINS))
  assert.deepEqual(skinsForHost('example.com'), [])
  assert.equal(resolveSkin('retired-theme'), 'qwen')
  assert.equal(resolveSkin('deepseek'), 'deepseek')
})

test('preference normalization preserves limits and defaults', () => {
  assert.equal(normalizeOpacity(NaN), .25)
  assert.equal(normalizeOpacity(-1), 0)
  assert.equal(normalizeOpacity(1), .5)
  assert.equal(normalizeQwenModelLabel(' \u0000 '), DEFAULT_QWEN_MODEL_LABEL)
  assert.equal(normalizeQwenModelLabel('x'.repeat(100)).length, 80)
})

test('legacy preferences remain readable until shared preferences are saved', async () => {
  saved = {sites: {'chatgpt.com': {autoApply: false, theme: 'deepseek', qwenModelLabel: 'Legacy'}, 'claude.ai': {autoApply: true, qwenModelLabel: 'Claude'}}}
  assert.equal((await getPreferences()).qwenModelLabel, 'Legacy')
  assert.equal((await getSiteState('claude.ai')).qwenModelLabel, 'Claude')
  const events = []
  const unsubscribe = onSiteStateChange('claude.ai', state => events.push(state))
  await setPreferences({qwenModelLabel: 'Shared', extraOpacity: .9})
  assert.equal(events.length, 1)
  assert.equal(events[0].qwenModelLabel, 'Shared')
  assert.equal(events[0].extraOpacity, .5)
  await setSiteState('chatgpt.com', {theme: 'qwen'})
  assert.equal(saved.sites['chatgpt.com'].autoApply, false)
  assert.equal(saved.sites['claude.ai'].autoApply, true)
  assert.equal(saved.sites['claude.ai'].qwenModelLabel, 'Claude')
  unsubscribe()
  await setPreferences({qwenModelLabel: 'Later'})
  assert.equal(events.length, 1)
})

test('compact popup preference preserves site settings and does not notify page state', async () => {
  saved = {sites: {'grok.com': {autoApply: false, theme: 'deepseek'}}}
  assert.equal((await getPreferences()).popupCompact, false)
  const before = structuredClone(saved.sites)
  const events = []
  const unsubscribe = onSiteStateChange('grok.com', value => events.push(value))
  await setPreferences({popupCompact: true})
  assert.equal((await getPreferences()).popupCompact, true)
  assert.deepEqual(saved.sites, before)
  assert.equal(events.length, 0)
  await setPreferences({extraOpacity: .3})
  assert.equal((await getPreferences()).popupCompact, true)
  await setPreferences({popupCompact: false})
  assert.equal((await getPreferences()).popupCompact, false)
  unsubscribe()
})

test('destroy during async boot prevents late observers and page changes', async () => {
  saved = {sites: {'chatgpt.com': {autoApply: true}}}
  globalThis.document = {documentElement: {classList: {remove() {}, add() { throw new Error('late apply') } }}, getElementById() { return null }}
  const engine = new MaskEngine('chatgpt', '')
  const boot = engine.boot('chatgpt.com')
  engine.destroy()
  await boot
  assert.equal(listeners.size, 0)
})

test('destroy before documentElement appears disconnects and settles boot', async () => {
  let disconnected = false
  globalThis.MutationObserver = class {
    observe() {}
    disconnect() { disconnected = true }
  }
  globalThis.document = {documentElement: null, getElementById() { return null }}
  const engine = new MaskEngine('chatgpt', '')
  const boot = engine.boot('chatgpt.com')
  engine.destroy()
  await boot
  assert.equal(disconnected, true)
  assert.equal(listeners.size, 0)
})
