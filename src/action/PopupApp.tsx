import {resolveSkin, siteForHost} from '../core/catalog'
import {useEffect, useState} from 'react'
import {SUPPORTED_HOSTS, getPreferences, getSiteState, setSiteState, onSiteStateChange, type SiteState} from '../core/storage'
import {Brand, Gear, Toggle, SKINS, SkinIcon, SiteIcon, skinsForHost} from '../ui/shared'

const maskImages = {
  qwen: new URL('../images/mask-qwen-negative.svg', import.meta.url).href,
  deepseek: new URL('../images/mask-deepseek-negative.svg', import.meta.url).href,
}

export default function PopupApp() {
  const [compact, setCompact] = useState<boolean | null>(null)
  const [tabId, setTabId] = useState<number>()
  const [enabled, setEnabled] = useState(false)
  const [maskEntering, setMaskEntering] = useState(false)
  const [host, setHost] = useState('')
  const [state, setState] = useState<SiteState | null>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let cancelled = false
    let unsubscribe = () => {}
    ;(async () => {
      const preferences = await getPreferences()
      if (cancelled) return
      setCompact(preferences.popupCompact)
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
      setMaskEntering(page.enabled && !enabled)
      setEnabled(page.enabled)
    } catch (err) { setError(String(err)) }
    finally { setBusy(false) }
  }
  const skins = skinsForHost(host)
  const activeSkin = resolveSkin(state?.theme)
  const openOptions = () => { chrome.runtime.openOptionsPage().catch(err => setError(String(err))) }
  if (compact === null && !error) return <main className="compact-popup" aria-label="正在读取设置" aria-busy="true"/>
  if (compact) return <main className="compact-popup">
    <div className="compact-row" aria-busy={!ready || busy}>
      <span className="compact-switch-label" id="compact-switch-label">开关</span>
      <button className="compact-switch" role="switch" aria-labelledby="compact-switch-label" aria-checked={enabled} disabled={!state || busy} onClick={togglePage} title={error || (!ready ? '正在读取设置…' : !state ? '当前页面不支持' : '启用页面外观')}><span/></button>
      <div className="compact-tabs" role="group" aria-label="页面外观">
        {(['qwen', 'deepseek'] as const).map((skin, i) => <button key={skin} aria-label={`外观 ${i + 1}`} aria-pressed={activeSkin === skin} disabled={!state || busy} onClick={() => save({theme:skin})}>{i + 1}</button>)}
      </div>
      <button className="icon-button compact-settings" aria-label="打开偏好设置" onClick={openOptions}><Gear/></button>
      <span className="sr-only" role={error ? 'alert' : 'status'}>{error || (!ready ? '正在读取设置' : !state ? '当前页面不支持' : busy ? '正在保存' : '')}</span>
    </div>
  </main>
  return <main className={`popup ${enabled ? 'is-enabled' : ''}`}>
    <header className="popup-header"><Brand/><button className="icon-button" aria-label="打开偏好设置" onClick={openOptions}><Gear/></button></header>
    {!ready && <p className="notice" role="status">正在读取设置…</p>}
    {ready && !state && !error && <div className="site-bar" role="status"><strong>非目标页面</strong></div>}
    {state && <>
      <div className="site-bar"><span className="site-monogram">{siteForHost(host) && <SiteIcon site={siteForHost(host)!.id}/>}</span><span>当前网站</span><strong>{host}</strong></div>
      <div className="popup-controls">
      <div className={`popup-mask-backdrop ${enabled ? 'is-visible' : ''} ${maskEntering ? 'is-entering' : ''}`} aria-hidden="true"
        onAnimationEnd={() => setMaskEntering(false)}>
        <span className="popup-mask-host">{siteForHost(host) && <SiteIcon site={siteForHost(host)!.id}/>}</span>
        <span className={`popup-mask-film ${activeSkin}`}>
          <svg viewBox="0 0 120 64" aria-hidden="true"><defs><linearGradient id="mask-film-glass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".95"/><stop offset=".45" stopColor="#eee3ff" stopOpacity=".72"/><stop offset="1" stopColor="#b89bdf" stopOpacity=".85"/></linearGradient></defs><path fill="url(#mask-film-glass)" fillRule="evenodd" stroke="#fff" strokeWidth=".8" d="M4 10Q28 0 52 17L60 24 68 17Q92 0 116 10L111 37Q102 61 82 54L60 40 38 54Q18 61 9 37ZM18 24Q32 15 47 28Q33 42 21 32ZM73 28Q88 15 102 24L99 32Q87 42 73 28Z"/><path d="M9 12Q29 5 48 19M72 19Q91 5 111 12" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <img className="popup-mask-overlay" src={maskImages[activeSkin]} alt=""/>
        </span>
      </div>
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
      </div>
    </>}
    {error && <p className="error" role="alert">设置失败：{error}</p>}
    <footer className="popup-footer"><span role="status">{busy ? '正在保存…' : state ? '设置已自动保存' : ''}</span></footer>
  </main>
}
