// chrome.storage.sync 封装：各站点的 mask 开关状态。
// schema: { sites: { [host]: { mode, autoApply, theme? } }, globalAutoApplyDefault }

export type MaskMode = 'original' | 'mask'

export const DEFAULT_DEEPSEEK_USERNAME = '133****3333'
export function normalizeDeepseekUsername(value?: string): string {
  return (typeof value === 'string' ? value : '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 40) || DEFAULT_DEEPSEEK_USERNAME
}

export const DEFAULT_QWEN_MODEL_LABEL = 'Qwen3.7-Plus'
export function normalizeQwenModelLabel(value?: string): string {
  return (typeof value === 'string' ? value : '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 80) || DEFAULT_QWEN_MODEL_LABEL
}

export interface SiteState {
  mode: MaskMode
  autoApply: boolean
  /** 主题粒度预留，当前 UI 只做「原版 / Mask」二切 */
  theme?: string
  /** Resting opacity of controls absent from the reference UI (0–0.5). */
  extraOpacity?: number
  deepseekUsername?: string
  qwenModelLabel?: string
}

export interface MaskStorageSchema {
  sites: Record<string, SiteState>
  globalAutoApplyDefault: boolean
}

/** 首批支持换肤的站点 host */
export const SUPPORTED_HOSTS = ['chatgpt.com', 'chat.openai.com', 'claude.ai']

const STORAGE_KEY = 'skm'

const DEFAULT_SCHEMA: MaskStorageSchema = {
  sites: {},
  globalAutoApplyDefault: false,
}

function normalizeSiteState(
  raw: Partial<SiteState> | undefined,
  globalAutoApplyDefault: boolean
): SiteState {
  const state: SiteState = {
    deepseekUsername: normalizeDeepseekUsername(raw?.deepseekUsername),
    qwenModelLabel: normalizeQwenModelLabel(raw?.qwenModelLabel),
    mode: raw?.mode === 'mask' ? 'mask' : 'original',
    autoApply:
      typeof raw?.autoApply === 'boolean' ? raw.autoApply : globalAutoApplyDefault,
    extraOpacity: typeof raw?.extraOpacity === 'number' && Number.isFinite(raw.extraOpacity)
      ? Math.max(0, Math.min(0.5, raw.extraOpacity)) : 0.25,
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
    globalAutoApplyDefault: raw?.globalAutoApplyDefault ?? false,
  }
}

export async function getSiteState(host: string): Promise<SiteState> {
  const schema = await readSchema()
  return normalizeSiteState(schema.sites[host], schema.globalAutoApplyDefault)
}

export async function setSiteState(
  host: string,
  patch: Partial<SiteState>
): Promise<SiteState> {
  const schema = await readSchema()
  const merged = {
    ...normalizeSiteState(schema.sites[host], schema.globalAutoApplyDefault),
    ...patch,
  }
  const stored: SiteState = {
    deepseekUsername: normalizeDeepseekUsername(merged.deepseekUsername),
    qwenModelLabel: normalizeQwenModelLabel(merged.qwenModelLabel),
    mode: merged.mode, autoApply: merged.autoApply,
    extraOpacity: typeof merged.extraOpacity === 'number' && Number.isFinite(merged.extraOpacity)
      ? Math.max(0, Math.min(0.5, merged.extraOpacity)) : 0.25,
  }
  if (merged.theme !== undefined) {
    stored.theme = merged.theme
  }
  await chrome.storage.sync.set({
    [STORAGE_KEY]: {...schema, sites: {...schema.sites, [host]: stored}},
  })
  return stored
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
    if (area !== 'sync' || !changes[STORAGE_KEY]) {
      return
    }
    const oldRaw = changes[STORAGE_KEY].oldValue as
      | Partial<MaskStorageSchema>
      | undefined
    const newRaw = changes[STORAGE_KEY].newValue as
      | Partial<MaskStorageSchema>
      | undefined
    const globalDefault = newRaw?.globalAutoApplyDefault ?? false
    const before = normalizeSiteState(
      oldRaw?.sites?.[host],
      oldRaw?.globalAutoApplyDefault ?? globalDefault
    )
    const after = normalizeSiteState(newRaw?.sites?.[host], globalDefault)
    if (
      before.mode !== after.mode ||
      before.autoApply !== after.autoApply ||
      before.deepseekUsername !== after.deepseekUsername ||
      before.qwenModelLabel !== after.qwenModelLabel ||
      before.theme !== after.theme || before.extraOpacity !== after.extraOpacity
    ) {
      cb(after)
    }
  }
  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}
