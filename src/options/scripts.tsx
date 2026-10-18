import {SITES} from '../core/catalog'
import {createRoot} from 'react-dom/client'
import {useEffect, useRef, useState} from 'react'
import {Brand, Gear, Toggle, SKINS, SkinIcon, skinsForHost, type Skin} from '../ui/shared'
import {getPreferences, setPreferences, getSiteState, setSiteState, DEFAULT_QWEN_MODEL_LABEL, DEFAULT_DEEPSEEK_USERNAME, type Preferences, type SiteState} from '../core/storage'
import '../action/styles.css'

type Page = 'general' | typeof SITES[number]['host'] | Skin
const sites = SITES.map(site => ({...site, id: site.host}))

function OptionsApp() {
  const [page, setPage] = useState<Page>('general')
  const [preferences, setPrefs] = useState<Required<Preferences> | null>(null)
  const [site, setSite] = useState<SiteState | null>(null)
  const [status, setStatus] = useState('正在读取设置…')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const revision = useRef(0)
  useEffect(() => {
    let cancelled = false
    setPrefs(null); setSite(null); setError(''); setStatus('正在读取设置…')
    ;(async () => {
      const prefs = await getPreferences()
      const value = page.includes('.') ? await getSiteState(page) : null
      if (!cancelled) { setPrefs(prefs); setSite(value); setStatus('设置已同步') }
    })().catch(err => { if (!cancelled) {setError(String(err)); setStatus('读取失败')} })
    return () => { cancelled = true }
  }, [page])

  async function savePreferences(patch:Preferences) {
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
    if (!site || saving) return
    setSaving(true); setError(''); setStatus('正在保存…')
    try { setSite(await setSiteState(page,{autoApply:!site.autoApply})); setStatus('所有更改已保存') }
    catch (err) { setError(String(err)); setStatus('保存失败，请重试') }
    finally { setSaving(false) }
  }
  const isSkin = page in SKINS
  const title = page === 'general' ? '通用设置' : isSkin ? SKINS[page as Skin].name : sites.find(s => s.id === page)?.name
  const parent = page === 'general' ? '偏好设置' : isSkin ? '伪装站点' : '原始站点'
  function navigate(next:Page) { if (!saving) {revision.current++; setPage(next)} }

  return <div className="options-shell">
    <header className="options-header"><Brand/><span className="header-divider">/</span><span>偏好设置</span></header>
    <div className="options-layout"><aside className="options-sidebar"><nav aria-label="偏好设置导航">
      <button className={`nav-general ${page === 'general' ? 'current' : ''}`} aria-current={page === 'general' ? 'page' : undefined} disabled={saving} onClick={() => navigate('general')}><Gear/>通用设置</button>
      <details open><summary><span className="folder-icon"/>原始站点</summary><ul>{sites.map(s => <li key={s.id}><button disabled={saving} className={page === s.id ? 'current' : ''} aria-current={page === s.id ? 'page' : undefined} onClick={() => navigate(s.id)}><span className={`nav-site-icon ${s.name.toLowerCase()}`}>{s.glyph}</span>{s.name}</button></li>)}</ul></details>
      <details open><summary><span className="folder-icon"/>伪装站点</summary><ul>{(Object.keys(SKINS) as Skin[]).map(s => <li key={s}><button disabled={saving} className={page === s ? 'current' : ''} aria-current={page === s ? 'page' : undefined} onClick={() => navigate(s)}><SkinIcon skin={s}/>{SKINS[s].name}</button></li>)}</ul></details>
    </nav><div className="sidebar-note"><span>只换外观，功能如常。</span><small>AI Site Skin Mask · v0.1.0</small></div></aside>
    <main className="options-main"><div className="breadcrumb">{parent}<span>/</span>{title}</div><h1 className="options-title">{isSkin && <SkinIcon skin={page as Skin}/>} {page === 'general' && <Gear/>}{title}</h1><p className="options-description">{page === 'general' ? '统一调整伪装界面的显示细节。' : isSkin ? '为喜欢的伪装，留一点自己的习惯。' : '管理这个网站的伪装偏好。'}</p>
      {preferences && <>
        {page === 'general' && <form className="settings-card" onSubmit={e => {e.preventDefault(); savePreferences({extraOpacity:preferences.extraOpacity})}}><h2>隐藏透明度</h2><p>调整额外入口静止时的显示程度。</p><div className="range-control"><input aria-label="隐藏透明度" type="range" min="0" max="50" step="5" disabled={saving} value={Math.round(preferences.extraOpacity*100)} style={{'--range-fill':`${preferences.extraOpacity*200}%`} as React.CSSProperties} onChange={e => setPrefs({...preferences,extraOpacity:Number(e.target.value)/100})}/><output>{Math.round(preferences.extraOpacity*100)}%</output></div><div className="range-labels"><span>完全隐藏 · 0%</span><span>半透明 · 50%</span></div><p className="field-hint">保留原位置和原控件；鼠标悬停或键盘聚焦时完整显示。</p><div className="form-actions"><span>保存后统一应用于所有额外入口</span><button className="save-button" disabled={saving} type="submit">保存更改</button></div></form>}
        {page === 'qwen' && <form className="settings-card" onSubmit={e => {e.preventDefault(); savePreferences({qwenModelLabel:preferences.qwenModelLabel})}}><label className="field-label" htmlFor="model-label">模型显示名称</label><input id="model-label" type="text" maxLength={80} disabled={saving} value={preferences.qwenModelLabel} placeholder={DEFAULT_QWEN_MODEL_LABEL} onChange={e => setPrefs({...preferences,qwenModelLabel:e.target.value})}/><p className="field-hint">仅改变千问皮肤中的显示名称，实际模型不变。</p><div className="form-actions"><span>用于 ChatGPT 和 Grok 的千问皮肤</span><button className="save-button" disabled={saving} type="submit">保存更改</button></div></form>}
        {page === 'deepseek' && <form className="settings-card" onSubmit={e => {e.preventDefault(); savePreferences({deepseekUsername:preferences.deepseekUsername})}}><label className="field-label" htmlFor="username">显示用户名</label><input id="username" type="text" maxLength={40} disabled={saving} value={preferences.deepseekUsername} placeholder={DEFAULT_DEEPSEEK_USERNAME} onChange={e => setPrefs({...preferences,deepseekUsername:e.target.value})}/><p className="field-hint">仅用于 DeepSeek 皮肤展示，不会更改账号信息。</p><div className="form-actions"><span>用于 ChatGPT 和 Grok 的 DeepSeek 皮肤</span><button className="save-button" disabled={saving} type="submit">保存更改</button></div></form>}
        {site && <><section className="settings-card site-settings"><h2>{page}</h2><p>以下偏好仅应用于这个原始站点。</p><Toggle checked={site.autoApply} disabled={saving} onChange={saveAutoApply}><strong>打开页面时自动生效</strong></Toggle><div className="site-summary"><span>所选皮肤</span><strong>{SKINS[skinsForHost(page).find(s => s === site.theme) ?? skinsForHost(page)[0]].name}</strong></div><p className="field-hint">在目标网站打开插件弹窗，可切换伪装开关与皮肤。</p></section>{page === 'chatgpt.com' && <p className="legacy-note">旧域名 chat.openai.com 的偏好仍独立保留，可在该站点的插件弹窗中调整。</p>}</>}
      </>}
      {error && <p className="error" role="alert">{error}</p>}<p className={`save-status ${error ? 'failed' : ''}`} role="status"><span/>{status}</p>
    </main></div>
  </div>
}
createRoot(document.getElementById('root')!).render(<OptionsApp/>)
