import {resolveSkin, siteForHost} from '../core/catalog'
import {useEffect, useState} from 'react'
import {SUPPORTED_HOSTS, getSiteState, setSiteState, onSiteStateChange, type SiteState} from '../core/storage'
import {Brand, Gear, Toggle, SKINS, SkinIcon, skinsForHost} from '../ui/shared'

export default function PopupApp() {
  const [tabId, setTabId] = useState<number>()
  const [enabled, setEnabled] = useState(false)
  const [host, setHost] = useState('')
  const [state, setState] = useState<SiteState | null>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let cancelled = false
    let unsubscribe = () => {}
    ;(async () => {
      const tabs = await chrome.tabs.query({active:true, currentWindow:true})
      let h = ''
      try { h = new URL(tabs[0]?.url ?? '').hostname } catch {}
      if (cancelled) return
      setHost(h)
      setTabId(tabs[0]?.id)
      if (SUPPORTED_HOSTS.includes(h)) {
        const [value, page] = await Promise.all([getSiteState(h), chrome.tabs.sendMessage(tabs[0].id!, {type:'skm:get-page-state'})])
        if (typeof page?.enabled !== 'boolean') throw new Error('无法读取页面状态，请刷新目标页面后重试')
        if (cancelled) return
        setEnabled(page.enabled)
        setState(value)
        unsubscribe = onSiteStateChange(h, setState)
      }
      setReady(true)
    })().catch(err => { if (!cancelled) { setError(String(err)); setReady(true) } })
    return () => { cancelled = true; unsubscribe() }
  }, [])
  async function save(patch:Partial<SiteState>) {
    if (!state || busy) return
    setBusy(true); setError('')
    try { setState(await setSiteState(host,patch)) }
    catch (err) { setError(String(err)) }
    finally { setBusy(false) }
  }
  async function togglePage() {
    if (tabId === undefined || busy) return
    setBusy(true); setError('')
    try {
      const page = await chrome.tabs.sendMessage(tabId, {type:'skm:set-page-state', enabled:!enabled})
      if (page?.error || typeof page?.enabled !== 'boolean') throw new Error(page?.error || '无法更新页面状态')
      setEnabled(page.enabled)
    } catch (err) { setError(String(err)) }
    finally { setBusy(false) }
  }
  const skins = skinsForHost(host)
  const activeSkin = resolveSkin(state?.theme)
  const openOptions = () => { chrome.runtime.openOptionsPage().catch(err => setError(String(err))) }
  return <main className={`popup ${enabled ? 'is-enabled' : ''}`}>
    <header className="popup-header"><Brand/><button className="icon-button" aria-label="打开偏好设置" onClick={openOptions}><Gear/></button></header>
    {!ready && <p className="notice" role="status">正在读取设置…</p>}
    {ready && !state && !error && <div className="site-bar" role="status"><strong>非目标页面</strong></div>}
    {state && <>
      <div className="site-bar"><span className="site-monogram">{siteForHost(host)?.glyph}</span><span>当前网站</span><strong>{host}</strong></div>
      <Toggle checked={enabled} disabled={busy} onChange={togglePage}><strong>启用伪装</strong></Toggle>
      {enabled && <section className="skin-section"><h1>选择你的伪装:</h1><p className="skin-helper">换个外观，原生功能依旧。</p>
        <div className="skin-grid" role="group" aria-label="伪装皮肤">
          {skins.map(skin => <button key={skin} className={`skin-card ${skin} ${activeSkin === skin ? 'selected' : ''}`} disabled={busy} aria-pressed={activeSkin === skin} onClick={() => save({theme:skin})}>
            <span className="skin-card-title"><span className="radio-dot"/><strong>{SKINS[skin].name}</strong></span>
            <span className="skin-preview" aria-hidden="true"><span className="mini-sidebar"><i/><i/><i/><i/></span><span className="mini-chat"><span className="mini-brand"><SkinIcon skin={skin}/><span>{SKINS[skin].name}</span></span><span className="mini-bubble"/><span className="mini-bubble short"/><span className="mini-input"/></span></span>
          </button>)}
        </div>
      </section>}
      <Toggle checked={state.autoApply} disabled={busy} onChange={() => save({autoApply:!state.autoApply})}><strong className="auto-label">打开页面时自动生效</strong></Toggle>
    </>}
    {error && <p className="error" role="alert">设置失败：{error}</p>}
    <footer className="popup-footer"><span role="status">{busy ? '正在保存…' : state ? '设置已自动保存' : '只换外观，功能如常'}</span><button className="text-button" onClick={openOptions}><Gear/>偏好设置 <span aria-hidden="true">→</span></button></footer>
  </main>
}
