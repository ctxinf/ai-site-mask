import {MaskEngine} from '../../core/mask'
import {geminiThemeCss} from './theme'
import {isGeminiChat, mountGeminiUi} from './ui'

const engine = new MaskEngine('gemini', geminiThemeCss, {
  isApplicable: isGeminiChat,
  forceLight: () => false,
  getTitle: theme => theme === 'deepseek' ? 'DeepSeek' : 'Qwen',
  getFavicon: theme => chrome.runtime.getURL(theme === 'deepseek'
    ? 'images/deepseek-favicon.svg' : 'images/qwen-favicon.png'),
})

export default function initial() {
  const cleanup = mountGeminiUi()
  engine.boot(location.hostname).catch(err => console.error('[skm][gemini] boot 失败:', err))
  return () => { cleanup(); engine.destroy() }
}
