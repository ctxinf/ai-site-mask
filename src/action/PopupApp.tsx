import {useEffect, useState} from 'react'
import {SUPPORTED_HOSTS, getSiteState, setSiteState, onSiteStateChange, type SiteState} from '../core/storage'
import {Brand, Gear, Toggle, SKINS, SkinIcon, skinsForHost} from '../ui/shared'

export default function PopupApp() {
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
      if (SUPPORTED_HOSTS.includes(h)) {
        const value = await getSiteState(h)
        if (cancelled) return
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
  const skins = skinsForHost(host)
  const activeSkin = skins.find(s => s === state?.theme) ?? skins[0]
  const enabled = state?.mode === 'mask'
  const openOptions = () => { chrome.runtime.openOptionsPage().catch(err => setError(String(err))) }
  return <main className="popup">
    <header className="popup-header"><Brand/><button className="icon-button" aria-label="打开偏好设置" onClick={openOptions}><Gear/></button></header>
    {!ready && <p className="notice" role="status">正在读取设置…</p>}
    {ready && !state && <div className="site-bar" role="status"><strong>非目标页面</strong></div>}
    {state && <>
      <div className="site-bar"><span className="site-monogram">{host === 'grok.com' ? '𝕏' : host === 'claude.ai' ? 'C' : 'G'}</span><span>当前网站</span><strong>{host}</strong></div>
      <Toggle checked={enabled} disabled={busy} onChange={() => save({mode:enabled ? 'original' : 'mask', theme:activeSkin})}><strong>启用伪装</strong></Toggle>
      <section className="skin-section"><h1>选择你的伪装:</h1><p className="skin-helper">{enabled ? '换个外观，原生功能依旧。' : '开启伪装后选择皮肤'}</p>
        <div className={`skin-grid ${enabled ? '' : 'is-off'}`} role="group" aria-label="伪装皮肤">
          {skins.map(skin => <button key={skin} className={`skin-card ${skin} ${enabled && activeSkin === skin ? 'selected' : ''}`} disabled={!enabled || busy} aria-pressed={activeSkin === skin} onClick={() => save({theme:skin})}>
            <span className="skin-card-title"><span className="radio-dot"/><strong>{SKINS[skin].name}</strong></span>
            <span className="skin-preview" aria-hidden="true"><span className="mini-sidebar"><i/><i/><i/><i/></span><span className="mini-chat"><span className="mini-brand"><SkinIcon skin={skin}/><span>{SKINS[skin].name}</span></span><span className="mini-bubble"/><span className="mini-bubble short"/><span className="mini-input"/></span></span>
          </button>)}
        </div>
      </section>
      <Toggle checked={state.autoApply} disabled={busy} onChange={() => save({autoApply:!state.autoApply})}><strong className="auto-label">打开页面时自动生效</strong></Toggle>
    </>}
    {error && <p className="error" role="alert">设置失败：{error}</p>}
    <footer className="popup-footer"><span role="status">{busy ? '正在保存…' : state ? '设置已自动保存' : '只换外观，功能如常'}</span><button className="text-button" onClick={openOptions}><Gear/>偏好设置 <span aria-hidden="true">→</span></button></footer>
  </main>
}
