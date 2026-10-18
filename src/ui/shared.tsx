import {SKINS, type Skin} from '../core/catalog'
export {SKINS, skinsForHost, type Skin} from '../core/catalog'
import type {ReactNode} from 'react'

export function Brand() {
  return <div className="brand"><img src="../images/icon-48.png" alt=""/><span>Ai Site Mask</span></div>
}
export function Gear() {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m9 3-.6 2.2-2 .9-2.1-.6-2 3.5 1.6 1.6v2.8L2.3 15l2 3.5 2.1-.6 2 .9L9 21h4l.6-2.2 2-.9 2.1.6 2-3.5-1.6-1.6v-2.8l1.6-1.6-2-3.5-2.1.6-2-.9L13 3Z"/><circle cx="11" cy="12" r="3"/></svg>
}
export function Toggle({checked, disabled, onChange, children}: {checked:boolean; disabled?:boolean; onChange:()=>void; children:ReactNode}) {
  return <label className="toggle-row"><span>{children}</span><input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={onChange}/><span className="toggle-track" aria-hidden="true"/></label>
}
export function SkinIcon({skin}: {skin:Skin}) {
  const s = SKINS[skin]
  return <img className="skin-icon" src={`../${s.image}`} alt=""/>
}
