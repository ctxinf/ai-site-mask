import {test} from 'node:test'
import assert from 'node:assert/strict'
import {SKINS, SITES, SUPPORTED_HOSTS, resolveSkin, skinsForHost, siteForHost} from '../src/core/catalog.ts'
import {normalizeOpacity, normalizeQwenModelLabel, DEFAULT_QWEN_MODEL_LABEL} from '../src/core/preferences.ts'
import {
  FAVICON_BADGES,
  QWEN_EDGE_BADGES,
  buildPresetFaviconSvg,
  getPresetBadgesForSkin,
  getPresetFaviconDataUrl,
  makePresetFaviconId,
  normalizeCustomFaviconName,
  normalizeFaviconId,
  parsePresetFaviconId,
} from '../src/core/favicons.ts'
import {
  addCustomFavicon,
  getCustomFavicons,
  getPreferences,
  getSiteState,
  onSiteStateChange,
  removeCustomFavicon,
  resolveFaviconUrl,
  setPreferences,
  setSiteSkinState,
  setSiteState,
} from '../src/core/storage.ts'
import {MaskEngine} from '../src/core/mask.ts'

let saved
let localSaved = {}
const listeners = new Set()
globalThis.chrome = {
  runtime: {
    getURL(path) { return `chrome-extension://test/${path}` },
  },
  storage: {
    sync: {
      async get() { return {skm: structuredClone(saved)} },
      async set(value) {
        const oldValue = saved
        saved = structuredClone(value.skm)
        for (const listener of listeners) listener({skm: {oldValue, newValue: saved}}, 'sync')
      },
    },
    local: {
      async get(defaults) {
        const out = {}
        for (const [key, fallback] of Object.entries(defaults)) {
          out[key] = key in localSaved ? structuredClone(localSaved[key]) : structuredClone(fallback)
        }
        return out
      },
      async set(value) {
        const changes = {}
        for (const [key, next] of Object.entries(value)) {
          const oldValue = key in localSaved ? structuredClone(localSaved[key]) : undefined
          localSaved[key] = structuredClone(next)
          changes[key] = {oldValue, newValue: structuredClone(next)}
        }
        for (const listener of listeners) listener(changes, 'local')
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

test('preset favicon helpers cover every badge and corner', () => {
  assert.equal(FAVICON_BADGES.length, 13)
  assert.equal(QWEN_EDGE_BADGES.length, 9)
  assert.equal(getPresetBadgesForSkin('qwen').length, 22)
  assert.equal(getPresetBadgesForSkin('deepseek').length, 13)
  for (const skin of Object.keys(SKINS)) {
    for (const corner of ['br', 'bl']) {
      for (const badge of getPresetBadgesForSkin(skin)) {
        const id = makePresetFaviconId(skin, corner, badge.id)
        assert.deepEqual(parsePresetFaviconId(id), {skin, corner, badge: badge.id})
        const svg = buildPresetFaviconSvg(skin, corner, badge.id)
        assert.match(svg, /^<svg .*<\/svg>$/s)
        const dataUrl = getPresetFaviconDataUrl(id)
        assert.ok(dataUrl?.startsWith('data:image/svg+xml;charset=utf-8,'))
      }
    }
  }
  assert.equal(parsePresetFaviconId('preset:deepseek:br:edge-top-red'), null)
  assert.equal(normalizeFaviconId('default'), undefined)
  assert.equal(normalizeFaviconId('preset:invalid:br:1'), undefined)
  assert.equal(normalizeFaviconId('preset:qwen:bl:tesla'), 'preset:qwen:bl:tesla')
  assert.equal(normalizeCustomFaviconName('  my-icon.png  '), 'my-icon')
})

test('site-skin pair settings isolate per host and per skin and resolve favicons', async () => {
  saved = {sites: {'grok.com': {autoApply: true, theme: 'qwen'}, 'chatgpt.com': {autoApply: false, theme: 'qwen'}}}
  localSaved = {}
  const events = []
  const unsubscribe = onSiteStateChange('grok.com', state => events.push(state))

  await setSiteSkinState('grok.com', 'qwen', {qwenModelLabel: 'Qwen-Grok', faviconId: 'preset:qwen:br:grok'})
  await setSiteSkinState('grok.com', 'deepseek', {deepseekUsername: 'grok-user', faviconId: 'preset:deepseek:bl:tesla'})

  const grokState = await getSiteState('grok.com')
  const chatgptState = await getSiteState('chatgpt.com')
  assert.equal(grokState.qwenModelLabel, 'Qwen-Grok')
  assert.equal(grokState.deepseekUsername, 'grok-user')
  assert.equal(grokState.faviconId, 'preset:qwen:br:grok')
  assert.equal(chatgptState.qwenModelLabel, DEFAULT_QWEN_MODEL_LABEL)
  assert.equal(chatgptState.faviconId, undefined)
  assert.equal(events.length, 2)

  // Switching theme on grok.com preserves skins and switches active faviconId.
  const switched = await setSiteState('grok.com', {theme: 'deepseek'})
  assert.equal(switched.faviconId, 'preset:deepseek:bl:tesla')
  assert.equal(switched.skins?.qwen?.faviconId, 'preset:qwen:br:grok')

  // Custom uploaded favicon in local storage resolves and falls back when removed.
  const custom = await addCustomFavicon({name: 'logo.png', dataUrl: 'data:image/png;base64,AAAA'})
  assert.equal((await getCustomFavicons()).length, 1)
  await setSiteSkinState('grok.com', 'deepseek', {faviconId: custom.id})
  assert.equal(await resolveFaviconUrl('deepseek', custom.id), 'data:image/png;base64,AAAA')
  await removeCustomFavicon(custom.id)
  assert.equal(await resolveFaviconUrl('deepseek', custom.id), 'chrome-extension://test/images/deepseek-favicon.svg')

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
