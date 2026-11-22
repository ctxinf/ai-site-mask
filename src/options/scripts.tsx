import {SITES, resolveSkin} from '../core/catalog'
import {createRoot} from 'react-dom/client'
import {useEffect, useRef, useState} from 'react'
import {Brand, Gear, Toggle, SKINS, SkinIcon, skinsForHost, type Skin} from '../ui/shared'
import {
  getFaviconBadgeLabel,
  getPresetBadgesForSkin,
  getPresetFaviconDataUrl,
  makePresetFaviconId,
  parsePresetFaviconId,
  type CustomFaviconItem,
} from '../core/favicons'
import {
  addCustomFavicon,
  DEFAULT_DEEPSEEK_USERNAME,
  DEFAULT_QWEN_MODEL_LABEL,
  getCustomFavicons,
  getPreferences,
  getSiteState,
  removeCustomFavicon,
  setPreferences,
  setSiteSkinState,
  setSiteState,
  type Preferences,
  type SiteState,
} from '../core/storage'
import '../action/styles.css'

type SiteHost = typeof SITES[number]['host']
type Page = 'general' | SiteHost

const siteIcons = {
  chatgpt: new URL('../images/openai.svg', import.meta.url).href,
  claude: new URL('../images/claude-color.svg', import.meta.url).href,
  grok: new URL('../images/grok.svg', import.meta.url).href,
  gemini: new URL('../images/gemini-color.svg', import.meta.url).href,
}
const defaultSkinFavicons: Record<Skin, string> = {
  qwen: new URL('../images/qwen-favicon.png', import.meta.url).href,
  deepseek: new URL('../images/deepseek-favicon.svg', import.meta.url).href,
}
const sites = SITES.map(site => ({...site, image: siteIcons[site.id], id: site.host}))

async function fileToFaviconDataUrl(file: File): Promise<string> {
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('图片文件不能超过 2MB')
  }
  const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)
  if (isSvg) {
    const text = (await file.text()).trim()
    if (!/<svg[\s>]/i.test(text)) throw new Error('无效的 SVG 文件')
    if (text.length > 64_000) throw new Error('SVG 文件过大（请控制在 64KB 以内）')
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`
  }
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('无法解析该图片文件'))
    image.src = rawDataUrl
  })
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return rawDataUrl
  const scale = Math.min(size / Math.max(1, img.width), size / Math.max(1, img.height))
  const w = img.width * scale
  const h = img.height * scale
  ctx.clearRect(0, 0, size, size)
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
  return canvas.toDataURL('image/png')
}

function OptionsApp() {
  const [page, setPage] = useState<Page>('general')
  const [preferences, setPrefs] = useState<Required<Preferences> | null>(null)
  const [site, setSite] = useState<SiteState | null>(null)
  const [selectedSkin, setSelectedSkin] = useState<Skin>('qwen')
  const [draftQwenLabel, setDraftQwenLabel] = useState(DEFAULT_QWEN_MODEL_LABEL)
  const [draftDeepseekUser, setDraftDeepseekUser] = useState(DEFAULT_DEEPSEEK_USERNAME)
  const [draftFaviconId, setDraftFaviconId] = useState<string | undefined>(undefined)
  const [customFavicons, setCustomFavicons] = useState<CustomFaviconItem[]>([])
  const [status, setStatus] = useState('正在读取设置…')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const revision = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function syncSkinDraft(siteState: SiteState, skin: Skin) {
    setDraftQwenLabel(siteState.skins?.qwen?.qwenModelLabel ?? siteState.qwenModelLabel ?? DEFAULT_QWEN_MODEL_LABEL)
    setDraftDeepseekUser(siteState.skins?.deepseek?.deepseekUsername ?? siteState.deepseekUsername ?? DEFAULT_DEEPSEEK_USERNAME)
    setDraftFaviconId(siteState.skins?.[skin]?.faviconId)
  }

  useEffect(() => {
    let cancelled = false
    setPrefs(null); setSite(null); setError(''); setStatus('正在读取设置…')
    ;(async () => {
      const [prefs, customList, value] = await Promise.all([
        getPreferences(),
        getCustomFavicons(),
        page !== 'general' ? getSiteState(page) : Promise.resolve(null),
      ])
      if (cancelled) return
      setPrefs(prefs)
      setCustomFavicons(customList)
      setSite(value)
      if (value) {
        const initialSkin = resolveSkin(value.theme)
        setSelectedSkin(initialSkin)
        syncSkinDraft(value, initialSkin)
      }
      setStatus('设置已同步')
    })().catch(err => { if (!cancelled) { setError(String(err)); setStatus('读取失败') } })
    return () => { cancelled = true }
  }, [page])

  async function savePreferences(patch: Preferences) {
    if (saving) return
    const current = revision.current
    setSaving(true); setError(''); setStatus('正在保存…')
    try {
      await setPreferences(patch)
      const value = await getPreferences()
      if (revision.current === current) { setPrefs(value); setStatus('所有更改已保存') }
    } catch (err) { setError(String(err)); setStatus('保存失败，请重试') }
    finally { setSaving(false) }
  }

  async function saveAutoApply() {
    if (!site || page === 'general' || saving) return
    setSaving(true); setError(''); setStatus('正在保存…')
    try {
      const next = await setSiteState(page, {autoApply: !site.autoApply})
      setSite(next)
      setStatus('所有更改已保存')
    } catch (err) { setError(String(err)); setStatus('保存失败，请重试') }
    finally { setSaving(false) }
  }

  async function saveDefaultSkin(skin: Skin) {
    if (!site || page === 'general' || saving || resolveSkin(site.theme) === skin) return
    setSaving(true); setError(''); setStatus('正在保存…')
    try {
      const next = await setSiteState(page, {theme: skin})
      setSite(next)
      setStatus(`已将默认面具设为 ${SKINS[skin].name}`)
    } catch (err) { setError(String(err)); setStatus('保存失败，请重试') }
    finally { setSaving(false) }
  }

  function handleSelectSkinTab(skin: Skin) {
    if (saving || !site || skin === selectedSkin) return
    setSelectedSkin(skin)
    setError('')
    syncSkinDraft(site, skin)
  }

  async function handleApplySkinSettings(e: React.FormEvent) {
    e.preventDefault()
    if (!site || page === 'general' || saving || !isDirty) return
    setSaving(true); setError(''); setStatus('正在应用设置…')
    try {
      const patch = selectedSkin === 'qwen'
        ? {qwenModelLabel: draftQwenLabel, faviconId: draftFaviconId}
        : {deepseekUsername: draftDeepseekUser, faviconId: draftFaviconId}
      const next = await setSiteSkinState(page, selectedSkin, patch)
      setSite(next)
      syncSkinDraft(next, selectedSkin)
      setStatus(`已应用 ${currentSite?.name} · ${SKINS[selectedSkin].name} 设置`)
    } catch (err) {
      setError(String(err))
      setStatus('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  async function handleUploadFavicon(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || uploading) return
    setUploading(true); setError(''); setStatus('正在处理上传图标…')
    try {
      const dataUrl = await fileToFaviconDataUrl(file)
      const created = await addCustomFavicon({name: file.name, dataUrl})
      const nextList = await getCustomFavicons()
      setCustomFavicons(nextList)
      setDraftFaviconId(created.id)
      setStatus('图标已添加到候选，点击“应用”生效')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus('图标上传失败')
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteCustomFavicon(id: string) {
    if (saving || uploading || !site || page === 'general') return
    setError('')
    try {
      await removeCustomFavicon(id)
      const nextList = await getCustomFavicons()
      setCustomFavicons(nextList)
      if (draftFaviconId === id) {
        setDraftFaviconId(undefined)
      }
      if (site.skins?.[selectedSkin]?.faviconId === id) {
        const nextSite = await setSiteSkinState(page, selectedSkin, {faviconId: undefined})
        setSite(nextSite)
      }
      setStatus('已移除自定义候选图标')
    } catch (err) {
      setError(String(err))
    }
  }

  function resolvePreviewUrl(skin: Skin, faviconId?: string): string {
    if (faviconId) {
      const preset = getPresetFaviconDataUrl(faviconId)
      if (preset) return preset
      const custom = customFavicons.find(item => item.id === faviconId)
      if (custom) return custom.dataUrl
    }
    return defaultSkinFavicons[skin]
  }

  function resolveFaviconTitle(skin: Skin, faviconId?: string): string {
    if (!faviconId) return `${SKINS[skin].name} 默认图标`
    const parsed = parsePresetFaviconId(faviconId)
    if (parsed) {
      return `${SKINS[parsed.skin].name} · ${getFaviconBadgeLabel(parsed.badge)}`
    }
    const custom = customFavicons.find(item => item.id === faviconId)
    return custom ? custom.name : `${SKINS[skin].name} 默认图标`
  }

  const currentSite = page === 'general' ? undefined : sites.find(s => s.id === page)
  const title = page === 'general' ? '通用设置' : currentSite?.name
  const parent = page === 'general' ? '偏好设置' : '原始站点'
  const activeSiteSkin = site ? resolveSkin(site.theme) : 'qwen'
  const siteSkins = page !== 'general' ? skinsForHost(page) : ([] as readonly Skin[])

  const savedSkinSettings = site?.skins?.[selectedSkin]
  const isDirty = Boolean(site && (
    (draftFaviconId ?? '') !== (savedSkinSettings?.faviconId ?? '') ||
    (selectedSkin === 'qwen'
      ? (draftQwenLabel.trim() || DEFAULT_QWEN_MODEL_LABEL) !== (savedSkinSettings?.qwenModelLabel ?? site.qwenModelLabel ?? DEFAULT_QWEN_MODEL_LABEL)
      : (draftDeepseekUser.trim() || DEFAULT_DEEPSEEK_USERNAME) !== (savedSkinSettings?.deepseekUsername ?? site.deepseekUsername ?? DEFAULT_DEEPSEEK_USERNAME))
  ))

  function navigate(next: Page) {
    if (saving || next === page) return
    revision.current++
    setSite(null)
    setPage(next)
  }

  return <div className="options-shell">
    <header className="options-header"><Brand/><span className="header-divider">/</span><span>偏好设置</span><a className="github-link" href="https://github.com/ctxinf/ai-site-mask" target="_blank" rel="noopener noreferrer" aria-label="GitHub 项目仓库（在新标签页打开）"><svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" aria-hidden="true"><path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.768-.244.768-.542 0-.267-.01-.974-.015-1.912-3.13.68-3.791-1.509-3.791-1.509-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.077-.685.077-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.722 2.637 1.225 3.279.937.102-.729.393-1.225.715-1.507-2.499-.284-5.126-1.25-5.126-5.565 0-1.23.44-2.233 1.16-3.02-.116-.285-.503-1.43.11-2.98 0 0 .945-.302 3.094 1.153A10.79 10.79 0 0 1 12 6.18c.956.004 1.918.13 2.816.378 2.148-1.455 3.091-1.153 3.091-1.153.615 1.55.228 2.695.112 2.98.722.787 1.158 1.79 1.158 3.02 0 4.327-2.631 5.278-5.138 5.557.404.349.764 1.034.764 2.084 0 1.505-.014 2.719-.014 3.088 0 .3.202.65.774.54A11.251 11.251 0 0 0 12 .75Z"/></svg></a></header>
    <div className="options-layout"><aside className="options-sidebar"><nav aria-label="偏好设置导航">
      <button className={`nav-general ${page === 'general' ? 'current' : ''}`} aria-current={page === 'general' ? 'page' : undefined} disabled={saving} onClick={() => navigate('general')}><Gear/>通用设置</button>
      <details open><summary><span className="folder-icon"/>原始站点</summary><ul>{sites.map(s => <li key={s.id}><button disabled={saving} className={page === s.id ? 'current' : ''} aria-current={page === s.id ? 'page' : undefined} onClick={() => navigate(s.id)}><img className="nav-site-icon" src={s.image} alt=""/>{s.name}</button></li>)}</ul></details>
    </nav><div className="sidebar-note"><small>Ai Site Mask · v{chrome.runtime.getManifest().version}</small></div></aside>
    <main className="options-main"><div className="breadcrumb">{parent}<span>/</span>{title}{currentSite && <><span>/</span>{SKINS[selectedSkin].name}</>}</div>
      <h1 className="options-title">{page === 'general' ? <Gear/> : currentSite && <img className="options-title-site-icon" src={currentSite.image} alt=""/>}{title}</h1>
      {page === 'general' && <p className="options-description">统一调整伪装界面的显示细节。</p>}
      {preferences && <>
        {page === 'general' && <section className="settings-card"><Toggle checked={preferences.popupCompact} disabled={saving} onChange={() => savePreferences({popupCompact: !preferences.popupCompact})}><strong>popup(弹出面板)简约模式</strong></Toggle><p>popup(弹出面板)隐藏所有文字说明和效果</p></section>}
        {page === 'general' && <section className="settings-card"><h2>隐藏透明度</h2><p>调整额外入口静止时的显示程度。</p><div className="range-control"><input aria-label="隐藏透明度" type="range" min="0" max="50" step="5" disabled={saving} value={Math.round(preferences.extraOpacity * 100)} style={{'--range-fill': `${preferences.extraOpacity * 200}%`} as React.CSSProperties} onChange={e => setPrefs({...preferences, extraOpacity: Number(e.target.value) / 100})} onPointerUp={e => savePreferences({extraOpacity: Number(e.currentTarget.value) / 100})} onKeyUp={e => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) savePreferences({extraOpacity: Number(e.currentTarget.value) / 100}) }} onBlur={e => savePreferences({extraOpacity: Number(e.currentTarget.value) / 100})}/><output>{Math.round(preferences.extraOpacity * 100)}%</output></div><div className="range-labels"><span>完全隐藏 · 0%</span><span>半透明 · 50%</span></div><p className="field-hint">保留原位置和原控件；鼠标悬停或键盘聚焦时完整显示。</p><p className="field-hint">调整后自动保存，统一应用于所有额外入口。</p></section>}
        {site && currentSite && <>
          <section className="settings-card site-settings">
            <h2>{page}</h2>
            <Toggle checked={site.autoApply} disabled={saving} onChange={saveAutoApply}><strong>打开页面时自动生效</strong></Toggle>
            <div className="site-setting-row">
              <span className="site-setting-label">默认面具</span>
              <div className="seg-switch seg-switch-sm" role="group" aria-label="默认面具">
                {siteSkins.map(skin => <button
                  key={skin}
                  type="button"
                  aria-pressed={activeSiteSkin === skin}
                  className={`seg-btn ${activeSiteSkin === skin ? 'is-active' : ''}`}
                  disabled={saving}
                  onClick={() => saveDefaultSkin(skin)}
                >
                  <SkinIcon skin={skin}/>
                  <span>{SKINS[skin].name}</span>
                </button>)}
              </div>
            </div>
          </section>

          <section className="settings-card pair-settings-card">
            <div className="skin-tab-bar">
              <span className="pair-header-title">伪装设置</span>
              <div className="seg-switch" role="tablist" aria-label="切换面具皮肤">
                {siteSkins.map(skin => <button
                  key={skin}
                  type="button"
                  role="tab"
                  aria-selected={selectedSkin === skin}
                  className={`seg-btn ${selectedSkin === skin ? 'is-active' : ''}`}
                  disabled={saving}
                  onClick={() => handleSelectSkinTab(skin)}
                >
                  <SkinIcon skin={skin}/>
                  <span>{SKINS[skin].name}</span>
                  {activeSiteSkin === skin && <em className="seg-default-tag">默认</em>}
                </button>)}
              </div>
            </div>

            <form className="pair-settings-form" onSubmit={handleApplySkinSettings}>
              <div className="pair-settings-body">
                <div className="pair-field-block">
                  {selectedSkin === 'qwen' ? <>
                    <label className="field-label" htmlFor="pair-model-label">模型显示名称</label>
                    <input id="pair-model-label" type="text" maxLength={80} disabled={saving} value={draftQwenLabel} placeholder={DEFAULT_QWEN_MODEL_LABEL} onChange={e => setDraftQwenLabel(e.target.value)}/>
                  </> : <>
                    <label className="field-label" htmlFor="pair-username">显示用户名</label>
                    <input id="pair-username" type="text" maxLength={40} disabled={saving} value={draftDeepseekUser} placeholder={DEFAULT_DEEPSEEK_USERNAME} onChange={e => setDraftDeepseekUser(e.target.value)}/>
                  </>}
                </div>

                <div className="favicon-block">
                  <div className="field-label">自定义favicon</div>
                  <div className="favicon-row">
                    <div className="favicon-current-box" title={resolveFaviconTitle(selectedSkin, draftFaviconId)}>
                      <img src={resolvePreviewUrl(selectedSkin, draftFaviconId)} alt={resolveFaviconTitle(selectedSkin, draftFaviconId)}/>
                    </div>

                    <div className="favicon-right">
                      <div className="favicon-compact-grid" role="radiogroup" aria-label="选择 Favicon">
                        <button
                          type="button"
                          role="radio"
                          aria-checked={!draftFaviconId}
                          aria-label="默认图标"
                          title="默认图标"
                          className={`favicon-tile ${!draftFaviconId ? 'is-selected' : ''}`}
                          onClick={() => setDraftFaviconId(undefined)}
                        >
                          <img src={defaultSkinFavicons[selectedSkin]} alt=""/>
                        </button>
                        {getPresetBadgesForSkin(selectedSkin).map(badge => {
                          const presetId = makePresetFaviconId(selectedSkin, 'br', badge.id)
                          const selected = draftFaviconId === presetId
                          return <button
                            key={presetId}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={badge.label}
                            title={badge.label}
                            className={`favicon-tile ${selected ? 'is-selected' : ''}`}
                            onClick={() => setDraftFaviconId(presetId)}
                          >
                            <img src={getPresetFaviconDataUrl(presetId)} alt=""/>
                          </button>
                        })}
                        {customFavicons.map(item => {
                          const selected = draftFaviconId === item.id
                          return <div key={item.id} className="favicon-tile-wrap">
                            <button
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              aria-label={item.name}
                              title={item.name}
                              className={`favicon-tile ${selected ? 'is-selected' : ''}`}
                              onClick={() => setDraftFaviconId(item.id)}
                            >
                              <img src={item.dataUrl} alt=""/>
                            </button>
                            <button
                              type="button"
                              className="favicon-tile-delete"
                              aria-label={`删除 ${item.name}`}
                              title="删除"
                              disabled={saving}
                              onClick={() => handleDeleteCustomFavicon(item.id)}
                            >×</button>
                          </div>
                        })}
                        <input
                          ref={fileInputRef}
                          className="sr-only"
                          type="file"
                          accept="image/png,image/svg+xml,image/jpeg,image/webp,image/gif,image/x-icon,.ico"
                          onChange={handleUploadFavicon}
                        />
                        <button
                          type="button"
                          className="favicon-tile favicon-upload-tile"
                          aria-label="上传图标"
                          title="上传自定义图标"
                          disabled={uploading || saving}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploading ? '…' : '+'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pair-card-footer">
                <button className="save-button" disabled={saving || uploading || !isDirty} type="submit">应用</button>
              </div>
            </form>
          </section>
          {page === 'chatgpt.com' && <p className="legacy-note">旧域名 chat.openai.com 的偏好仍独立保留，可在该站点的插件弹窗中调整。</p>}
        </>}
      </>}
      {error && <p className="error" role="alert">{error}</p>}<p className={`save-status ${error ? 'failed' : ''}`} role="status"><span/>{status}</p>
    </main></div>
  </div>
}
createRoot(document.getElementById('root')!).render(<OptionsApp/>)
