import {MaskEngine} from '../../core/mask'
import {claudeThemeCss} from './theme'

/** Never apply chat presentation to login, billing, projects or account pages. */
export function isClaudeChat(): boolean {
  return location.pathname === '/' || /^\/new\/?$/.test(location.pathname) || /^\/chat\/[^/]+\/?$/.test(location.pathname)
}

const engine = new MaskEngine('claude', claudeThemeCss, {
  isApplicable: isClaudeChat,
  forceLight: () => false,
  getTitle: theme => theme === 'deepseek' ? 'DeepSeek' : 'Qwen',
  getFavicon: theme => chrome.runtime.getURL(theme === 'deepseek'
    ? 'images/deepseek-favicon.svg' : 'images/qwen-favicon.png'),
})

export default function initial() {
  engine.boot(location.hostname).catch(err => console.error('[skm][claude] boot 失败:', err))
  return () => engine.destroy()
}
