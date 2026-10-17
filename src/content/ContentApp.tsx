import {useEffect, useState} from 'react'

// 在所有已打开的页面同步 popup 中的设置。
export default function ContentApp() {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    const changed = (changes: {[key: string]: chrome.storage.StorageChange}, area: string) => {
      if (area === 'local' && changes.bannerEnabled) {
        setEnabled(changes.bannerEnabled.newValue !== false)
        console.log('[workflow][content] 横幅显示:', changes.bannerEnabled.newValue !== false)
      }
    }
    chrome.storage.onChanged.addListener(changed)
    chrome.storage.local.get({bannerEnabled: true}).then((settings) => {
      setEnabled(settings.bannerEnabled !== false)
    }).catch((err) => console.error('[workflow][content] 设置读取失败:', err))
    return () => chrome.storage.onChanged.removeListener(changed)
  }, [])

  if (!enabled) return null
  return (
    <div className="content_pill content_pill_static" role="status">
      <span className="content_pill_text">
        extension-workflow · content 已注入
      </span>
    </div>
  )
}
