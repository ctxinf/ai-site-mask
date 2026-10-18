import {MaskEngine} from '../../core/mask'
import {mountGrokUi} from './ui'
import {grokThemeCss} from './theme'

const engine = new MaskEngine('grok', grokThemeCss, {
  isApplicable: () => location.pathname === '/' || location.pathname.startsWith('/c/'),
  forceLight: () => false,
  getTitle: theme => theme === 'deepseek' ? 'DeepSeek' : 'Qwen',
  getFavicon: theme => chrome.runtime.getURL(theme === 'deepseek'
    ? 'images/deepseek-favicon.svg' : 'images/qwen-favicon.png'),
})

export default function initial() {
  const cleanup = mountGrokUi()
  engine.boot(location.hostname).catch(err => console.error('[skm][grok] boot 失败:', err))
  return () => { cleanup(); engine.destroy() }
}
