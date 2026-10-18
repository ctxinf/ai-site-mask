import {MaskEngine} from '../../core/mask'
import {qwenThemeCss} from './theme-qwen'
import {deepseekThemeCss} from './theme-deepseek'

// chatgpt.com / chat.openai.com 独立入口。
// 支持主题：
//  - qwen (默认): 通义千问（跟随站点明暗模式） (https://chat.qwen.ai/)
//  - deepseek: DeepSeek 浅色
// CSS 规则限定在 html.skm-mask-on 下；保留原控件、菜单与消息 DOM。
// Qwen 仅隐藏品牌按钮内的装饰字标，布局变化在关闭时由 CSS 自动回滚。
function resolveChatGptTheme(theme?: string): string {
  if (theme === 'deepseek') {
    return deepseekThemeCss
  }
  return qwenThemeCss // 默认通义千问 (Qwen)
}

const QWEN_FAVICON = chrome.runtime.getURL('images/qwen-favicon.png')

const engine = new MaskEngine('chatgpt', resolveChatGptTheme, {
  forceLight: (theme) => theme === 'deepseek',
  getTitle: (theme) => (theme === 'deepseek' ? 'DeepSeek' : 'Qwen'),
  getFavicon: (theme) => (theme === 'deepseek' ? undefined : QWEN_FAVICON),
})

// 每次注入到页面都会打这行，`npm run logs:content` 里能看到。
console.log('[skm][chatgpt] content script 已注入:', location.href)

/**
 * Extension.js content_script 入口：框架在注入时调用它，
 * 返回的函数在 HMR/卸载时被调用做清理。不要自己调用它。
 */
export default function initial() {
  engine
    .boot(location.hostname)
    .catch((err) => console.error('[skm][chatgpt] boot 失败:', err))

  return () => {
    engine.destroy()
  }
}
