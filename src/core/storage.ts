// chrome.storage.sync 封装：各站点偏好与（原始站点 × 伪装皮肤）二元组设置；
// chrome.storage.local 封装：用户上传的自定义 Favicon 候选列表（避免触及 sync 8KB 单项限制）。

import {SKINS, SUPPORTED_HOSTS, resolveSkin, type Skin} from './catalog'
import {
  getPresetFaviconDataUrl,
  isCustomFaviconId,
  isValidFaviconDataUrl,
  normalizeCustomFaviconName,
  normalizeFaviconId,
  type CustomFaviconItem,
} from './favicons'
import {
  normalizeDeepseekUsername,
  normalizeOpacity,
  normalizeQwenModelLabel,
  type Preferences,
  type SiteSkinSettings,
  type SiteState,
} from './preferences'

export {SUPPORTED_HOSTS} from './catalog'
export {
  DEFAULT_DEEPSEEK_USERNAME,
  DEFAULT_QWEN_MODEL_LABEL,
  normalizeDeepseekUsername,
  normalizeQwenModelLabel,
} from './preferences'
export type {Preferences, SiteSkinSettings, SiteState} from './preferences'
export type {CustomFaviconItem} from './favicons'

export interface MaskStorageSchema {
  preferences?: Preferences
  sites: Record<string, SiteState>
  globalAutoApplyDefault: boolean
}

const STORAGE_KEY = 'skm'
const CUSTOM_FAVICONS_KEY = 'skmCustomFavicons'

const DEFAULT_SCHEMA: MaskStorageSchema = {
  sites: {},
  globalAutoApplyDefault: false,
}

function normalizeStoredSkins(
  rawSkins: Partial<Record<Skin, SiteSkinSettings>> | undefined
): Partial<Record<Skin, SiteSkinSettings>> | undefined {
  if (!rawSkins || typeof rawSkins !== 'object') return undefined
  const result: Partial<Record<Skin, SiteSkinSettings>> = {}
  if (rawSkins.qwen && typeof rawSkins.qwen === 'object') {
    const next: SiteSkinSettings = {}
    if (typeof rawSkins.qwen.qwenModelLabel === 'string' && rawSkins.qwen.qwenModelLabel.trim()) {
      next.qwenModelLabel = normalizeQwenModelLabel(rawSkins.qwen.qwenModelLabel)
    }
    const faviconId = normalizeFaviconId(rawSkins.qwen.faviconId)
    if (faviconId) next.faviconId = faviconId
    if (Object.keys(next).length > 0) result.qwen = next
  }
  if (rawSkins.deepseek && typeof rawSkins.deepseek === 'object') {
    const next: SiteSkinSettings = {}
    if (typeof rawSkins.deepseek.deepseekUsername === 'string' && rawSkins.deepseek.deepseekUsername.trim()) {
      next.deepseekUsername = normalizeDeepseekUsername(rawSkins.deepseek.deepseekUsername)
    }
    const faviconId = normalizeFaviconId(rawSkins.deepseek.faviconId)
    if (faviconId) next.faviconId = faviconId
    if (Object.keys(next).length > 0) result.deepseek = next
  }
  return Object.keys(result).length > 0 ? result : undefined
}

function normalizeSiteState(
  raw: Partial<SiteState> | undefined,
  globalAutoApplyDefault: boolean,
  preferences: Preferences = {}
): SiteState {
  const activeSkin = resolveSkin(raw?.theme)
  const qwenLabel = normalizeQwenModelLabel(
    raw?.skins?.qwen?.qwenModelLabel ?? preferences.qwenModelLabel ?? raw?.qwenModelLabel
  )
  const deepseekUser = normalizeDeepseekUsername(
    raw?.skins?.deepseek?.deepseekUsername ?? preferences.deepseekUsername ?? raw?.deepseekUsername
  )
  const qwenFaviconId = normalizeFaviconId(raw?.skins?.qwen?.faviconId)
  const deepseekFaviconId = normalizeFaviconId(raw?.skins?.deepseek?.faviconId)

  const skins: Record<Skin, SiteSkinSettings> = {
    qwen: {
      qwenModelLabel: qwenLabel,
      ...(qwenFaviconId ? {faviconId: qwenFaviconId} : {}),
    },
    deepseek: {
      deepseekUsername: deepseekUser,
      ...(deepseekFaviconId ? {faviconId: deepseekFaviconId} : {}),
    },
  }

  const state: SiteState = {
    deepseekUsername: deepseekUser,
    qwenModelLabel: qwenLabel,
    autoApply:
      typeof raw?.autoApply === 'boolean' ? raw.autoApply : globalAutoApplyDefault,
    extraOpacity: normalizeOpacity(preferences.extraOpacity ?? raw?.extraOpacity),
    skins,
    faviconId: skins[activeSkin].faviconId,
  }
  if (typeof raw?.theme === 'string' && raw.theme) {
    state.theme = raw.theme
  }
  return state
}

async function readSchema(): Promise<MaskStorageSchema> {
  const result = await chrome.storage.sync.get({[STORAGE_KEY]: DEFAULT_SCHEMA})
  const raw = result[STORAGE_KEY] as Partial<MaskStorageSchema> | undefined
  return {
    sites: raw?.sites ?? {},
    preferences: raw?.preferences ?? {},
    globalAutoApplyDefault: raw?.globalAutoApplyDefault ?? false,
  }
}

export async function getSiteState(host: string): Promise<SiteState> {
  const schema = await readSchema()
  return normalizeSiteState(schema.sites[host], schema.globalAutoApplyDefault, schema.preferences)
}

export async function setSiteState(
  host: string,
  patch: Partial<SiteState>
): Promise<SiteState> {
  const schema = await readSchema()
  const existingRaw = schema.sites[host]
  const merged = {
    ...normalizeSiteState(existingRaw, schema.globalAutoApplyDefault, schema.preferences),
    ...patch,
  }
  const stored: SiteState = {
    deepseekUsername: normalizeDeepseekUsername(merged.deepseekUsername),
    qwenModelLabel: normalizeQwenModelLabel(merged.qwenModelLabel),
    autoApply: merged.autoApply,
    extraOpacity: normalizeOpacity(merged.extraOpacity),
  }
  if (merged.theme !== undefined) {
    stored.theme = merged.theme
  }
  const preservedSkins = normalizeStoredSkins(patch.skins ?? existingRaw?.skins)
  if (preservedSkins) {
    stored.skins = preservedSkins
  }
  await chrome.storage.sync.set({
    [STORAGE_KEY]: {...schema, sites: {...schema.sites, [host]: stored}},
  })
  return normalizeSiteState(stored, schema.globalAutoApplyDefault, schema.preferences)
}

/** 更新（原始站点 × 伪装皮肤）二元组设置，仅影响该站点对应皮肤。 */
export async function setSiteSkinState(
  host: string,
  skin: Skin,
  patch: Partial<SiteSkinSettings>
): Promise<SiteState> {
  const schema = await readSchema()
  const existingRaw = schema.sites[host]
  const current = normalizeSiteState(existingRaw, schema.globalAutoApplyDefault, schema.preferences)
  const existingSkins = normalizeStoredSkins(existingRaw?.skins) ?? {}
  const prevSkin: SiteSkinSettings = {...existingSkins[skin]}

  if (skin === 'qwen' && patch.qwenModelLabel !== undefined) {
    prevSkin.qwenModelLabel = normalizeQwenModelLabel(patch.qwenModelLabel)
  }
  if (skin === 'deepseek' && patch.deepseekUsername !== undefined) {
    prevSkin.deepseekUsername = normalizeDeepseekUsername(patch.deepseekUsername)
  }
  if ('faviconId' in patch) {
    const normalizedFavicon = normalizeFaviconId(patch.faviconId)
    if (normalizedFavicon) prevSkin.faviconId = normalizedFavicon
    else delete prevSkin.faviconId
  }

  const nextSkins: Partial<Record<Skin, SiteSkinSettings>> = {...existingSkins}
  if (Object.keys(prevSkin).length > 0) nextSkins[skin] = prevSkin
  else delete nextSkins[skin]

  const stored: SiteState = {
    deepseekUsername: existingRaw?.deepseekUsername ?? current.deepseekUsername,
    qwenModelLabel: existingRaw?.qwenModelLabel ?? current.qwenModelLabel,
    autoApply: existingRaw?.autoApply ?? current.autoApply,
    extraOpacity: existingRaw?.extraOpacity ?? current.extraOpacity,
  }
  if (existingRaw?.theme !== undefined) {
    stored.theme = existingRaw.theme
  }
  if (Object.keys(nextSkins).length > 0) {
    stored.skins = nextSkins
  }

  await chrome.storage.sync.set({
    [STORAGE_KEY]: {...schema, sites: {...schema.sites, [host]: stored}},
  })
  return normalizeSiteState(stored, schema.globalAutoApplyDefault, schema.preferences)
}

function siteStateChanged(before: SiteState, after: SiteState): boolean {
  return (
    before.autoApply !== after.autoApply ||
    before.deepseekUsername !== after.deepseekUsername ||
    before.qwenModelLabel !== after.qwenModelLabel ||
    before.theme !== after.theme ||
    before.extraOpacity !== after.extraOpacity ||
    before.faviconId !== after.faviconId ||
    before.skins?.qwen?.faviconId !== after.skins?.qwen?.faviconId ||
    before.skins?.deepseek?.faviconId !== after.skins?.deepseek?.faviconId
  )
}

/** 订阅某 host 的状态变化；返回取消订阅函数。 */
export function onSiteStateChange(
  host: string,
  cb: (state: SiteState) => void
): () => void {
  const listener = (
    changes: {[key: string]: chrome.storage.StorageChange},
    area: string
  ) => {
    if (area === 'sync' && changes[STORAGE_KEY]) {
      const oldRaw = changes[STORAGE_KEY].oldValue as
        | Partial<MaskStorageSchema>
        | undefined
      const newRaw = changes[STORAGE_KEY].newValue as
        | Partial<MaskStorageSchema>
        | undefined
      const globalDefault = newRaw?.globalAutoApplyDefault ?? false
      const before = normalizeSiteState(
        oldRaw?.sites?.[host],
        oldRaw?.globalAutoApplyDefault ?? globalDefault,
        oldRaw?.preferences
      )
      const after = normalizeSiteState(newRaw?.sites?.[host], globalDefault, newRaw?.preferences)
      if (siteStateChanged(before, after)) {
        cb(after)
      }
      return
    }
    if (area === 'local' && changes[CUSTOM_FAVICONS_KEY]) {
      getSiteState(host).then(state => {
        if (isCustomFaviconId(state.faviconId)) cb(state)
      }).catch(() => {})
    }
  }
  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}

/** Shared preferences override legacy per-site fields only after explicitly saved. */
export async function getPreferences(): Promise<Required<Preferences>> {
  const {preferences = {}, sites} = await readSchema()
  // Show existing values in the new editor without rewriting users' legacy settings.
  const legacy = SUPPORTED_HOSTS.map(host => sites[host]).filter(Boolean)
  return {
    popupCompact: preferences.popupCompact === true,
    extraOpacity: normalizeOpacity(preferences.extraOpacity ?? legacy.find(s => s.extraOpacity !== undefined)?.extraOpacity),
    qwenModelLabel: normalizeQwenModelLabel(preferences.qwenModelLabel ?? legacy.find(s => s.qwenModelLabel !== undefined)?.qwenModelLabel),
    deepseekUsername: normalizeDeepseekUsername(preferences.deepseekUsername ?? legacy.find(s => s.deepseekUsername !== undefined)?.deepseekUsername),
  }
}

export async function setPreferences(patch: Preferences): Promise<void> {
  const schema = await readSchema()
  const preferences = {...schema.preferences}
  if (patch.popupCompact !== undefined) preferences.popupCompact = patch.popupCompact === true
  if (patch.extraOpacity !== undefined) preferences.extraOpacity = normalizeOpacity(patch.extraOpacity)
  if (patch.qwenModelLabel !== undefined) preferences.qwenModelLabel = normalizeQwenModelLabel(patch.qwenModelLabel)
  if (patch.deepseekUsername !== undefined) preferences.deepseekUsername = normalizeDeepseekUsername(patch.deepseekUsername)
  await chrome.storage.sync.set({[STORAGE_KEY]: {...schema, preferences}})
}

export async function getCustomFavicons(): Promise<CustomFaviconItem[]> {
  if (!chrome.storage?.local) return []
  const result = await chrome.storage.local.get({[CUSTOM_FAVICONS_KEY]: []})
  const raw = result[CUSTOM_FAVICONS_KEY]
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is CustomFaviconItem => (
    Boolean(item) &&
    typeof item === 'object' &&
    isCustomFaviconId(item.id) &&
    typeof item.name === 'string' &&
    isValidFaviconDataUrl(item.dataUrl)
  ))
}

export async function addCustomFavicon(input: {name: string; dataUrl: string}): Promise<CustomFaviconItem> {
  if (!chrome.storage?.local) throw new Error('当前环境不支持本地图标存储')
  if (!isValidFaviconDataUrl(input.dataUrl)) throw new Error('不支持的图片格式或文件过大')
  const items = await getCustomFavicons()
  const rand = Math.random().toString(36).slice(2, 8)
  const item: CustomFaviconItem = {
    id: `custom:${Date.now().toString(36)}-${rand}`,
    name: normalizeCustomFaviconName(input.name),
    dataUrl: input.dataUrl,
    createdAt: Date.now(),
  }
  await chrome.storage.local.set({[CUSTOM_FAVICONS_KEY]: [item, ...items].slice(0, 40)})
  return item
}

export async function removeCustomFavicon(id: string): Promise<void> {
  if (!chrome.storage?.local) return
  const items = await getCustomFavicons()
  const filtered = items.filter(item => item.id !== id)
  await chrome.storage.local.set({[CUSTOM_FAVICONS_KEY]: filtered})
}

export async function resolveFaviconUrl(skin: Skin, faviconId?: string): Promise<string | undefined> {
  const normalized = normalizeFaviconId(faviconId)
  if (normalized) {
    const preset = getPresetFaviconDataUrl(normalized)
    if (preset) return preset
    if (isCustomFaviconId(normalized)) {
      const items = await getCustomFavicons()
      const found = items.find(item => item.id === normalized)
      if (found) return found.dataUrl
    }
  }
  const fallback = SKINS[skin].favicon
  return chrome.runtime?.getURL ? chrome.runtime.getURL(fallback) : fallback
}
