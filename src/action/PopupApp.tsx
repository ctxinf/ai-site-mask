import {useEffect, useState} from 'react'

export default function PopupApp() {
  const [count, setCount] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const changed = (changes: {[key: string]: chrome.storage.StorageChange}, area: string) => {
      if (area === 'local' && changes.bannerEnabled) {
        setEnabled(changes.bannerEnabled.newValue !== false)
      }
    }
    chrome.storage.onChanged.addListener(changed)
    chrome.storage.local.get({bannerEnabled: true}).then((settings) => {
      setEnabled(settings.bannerEnabled !== false)
      setReady(true)
    }).catch((err) => setError(String(err)))
    return () => chrome.storage.onChanged.removeListener(changed)
  }, [])

  async function toggleBanner() {
    setReady(false)
    setError('')
    try {
      await chrome.storage.local.set({bannerEnabled: !enabled})
      setEnabled(!enabled)
      console.log('[workflow][popup] 横幅设置已保存:', !enabled)
    } catch (err) {
      setError(String(err))
    } finally {
      setReady(true)
    }
  }

  return (
    <div className="popup">
      <h1>extension-workflow</h1>
      <p className="subtitle">AI 快速迭代实验 · React + TS + Extension.js</p>
      {/* HMR 验证标记：改这行文案并保存，看 popup 是否热更新 */}
      <p className="hmr-marker" data-testid="hmr-marker">
        HMR 标记 v4 · agent-browser
      </p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        点击 {count} 次
      </button>
      <label className="banner-setting">
        <span>显示页面横幅</span>
        <input type="checkbox" checked={enabled} disabled={!ready} onChange={toggleBanner} />
      </label>
      <p className="subtitle" role="status">{ready ? (enabled ? '横幅已开启' : '横幅已隐藏') : '正在读取设置…'} · 自动保存</p>
      {error && <p role="alert">设置失败：{error}</p>}
    </div>
  )
}
