import {useEffect, useState} from 'react'
import {
  SUPPORTED_HOSTS,
  getSiteState,
  setSiteState,
  type MaskMode,
} from '../core/storage'

export default function PopupApp() {
  const [host, setHost] = useState<string | null>(null)
  const [mode, setMode] = useState<MaskMode>('original')
  const [theme, setTheme] = useState<string>('qwen')
  const [autoApply, setAutoApply] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  const supported = host !== null && SUPPORTED_HOSTS.includes(host)

  useEffect(() => {
    let cancelled = false
    chrome.tabs
      .query({active: true, currentWindow: true})
      .then(async (tabs) => {
        let h = ''
        try {
          h = new URL(tabs[0]?.url ?? '').hostname
        } catch {
          // chrome:// 等无 URL 页面
        }
        if (cancelled) {
          return
        }
        setHost(h || null)
        if (SUPPORTED_HOSTS.includes(h)) {
          const state = await getSiteState(h)
          if (cancelled) {
            return
          }
          setMode(state.mode)
          setTheme(state.theme || (h.includes('claude') ? 'doubao' : 'qwen'))
          setAutoApply(state.autoApply)
        }
        setReady(true)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(String(err))
          setReady(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function switchMode(next: MaskMode) {
    if (!host || next === mode) {
      return
    }
    setError('')
    try {
      const state = await setSiteState(host, {mode: next, theme})
      setMode(state.mode)
      console.log('[skm][popup] 模式已切换:', host, next)
    } catch (err) {
      setError(String(err))
    }
  }

  async function switchTheme(nextTheme: string) {
    if (!host || nextTheme === theme) {
      return
    }
    setError('')
    try {
      const state = await setSiteState(host, {theme: nextTheme})
      setTheme(state.theme || nextTheme)
      console.log('[skm][popup] 主题已切换:', host, nextTheme)
    } catch (err) {
      setError(String(err))
    }
  }

  async function toggleAutoApply() {
    if (!host) {
      return
    }
    setError('')
    try {
      const state = await setSiteState(host, {autoApply: !autoApply})
      setAutoApply(state.autoApply)
      console.log('[skm][popup] 自动应用已切换:', host, state.autoApply)
    } catch (err) {
      setError(String(err))
    }
  }

  return (
    <div className="popup">
      <h1>ai-site-skin-mask</h1>
      <p className="subtitle">网页 AI 换肤 · 只换皮，不换功能</p>

      {!ready && (
        <p className="subtitle" role="status">
          正在读取设置…
        </p>
      )}

      {ready && !supported && (
        <p className="unsupported" role="status">
          当前页面不支持换肤{host ? `（${host}）` : ''}
        </p>
      )}

      {ready && supported && host && (
        <>
          <p className="site-line">
            当前站点：<strong>{host}</strong>
          </p>
          <div className="mode-switch" role="group" aria-label="界面模式">
            <button
              type="button"
              className={mode === 'original' ? 'active' : ''}
              onClick={() => switchMode('original')}
            >
              原版
            </button>
            <button
              type="button"
              className={mode === 'mask' ? 'active' : ''}
              onClick={() => switchMode('mask')}
            >
              Mask
            </button>
          </div>

          {mode === 'mask' && (host.includes('chatgpt') || host.includes('openai')) && (
            <div className="theme-section">
              <span className="theme-title">皮肤风格：</span>
              <div className="theme-switch" role="group" aria-label="皮肤风格">
                <button
                  type="button"
                  className={theme === 'qwen' ? 'active' : ''}
                  onClick={() => switchTheme('qwen')}
                >
                  通义千问 (Qwen)
                </button>
                <button
                  type="button"
                  className={theme === 'deepseek' ? 'active' : ''}
                  onClick={() => switchTheme('deepseek')}
                >
                  DeepSeek
                </button>
              </div>
            </div>
          )}

          <label className="auto-apply">
            <input
              type="checkbox"
              checked={autoApply}
              onChange={toggleAutoApply}
            />
            <span>打开页面自动应用</span>
          </label>
          <p className="subtitle" role="status">
            {mode === 'mask'
              ? `Mask 已生效（${theme === 'qwen' ? '通义千问' : theme}）`
              : '当前为原版界面'} · 自动保存
          </p>
        </>
      )}

      {error && <p role="alert">设置失败：{error}</p>}
    </div>
  )
}
