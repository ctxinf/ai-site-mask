import {MaskEngine} from '../../core/mask'
import {qwenThemeCss} from './theme-qwen'
import {deepseekThemeCss} from './theme-deepseek'

// chatgpt.com / chat.openai.com 独立入口。
// 支持主题：
//  - qwen (默认): 通义千问浅色 (https://chat.qwen.ai/)
//  - deepseek: DeepSeek 浅色
// 硬约束：所有规则必须以 `html.skm-mask-on` 开头；只改颜色/背景/圆角/字体字号
// 等安全属性，不删除、不 display:none 任何原页面元素，不改动 DOM 结构。
function resolveChatGptTheme(theme?: string): string {
  if (theme === 'deepseek') {
    return deepseekThemeCss
  }
  return qwenThemeCss // 默认通义千问 (Qwen)
}

const QWEN_FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23615ced'/%3E%3Cpath d='M16 4L19.5 12.5L28 16L19.5 19.5L16 28L12.5 19.5L4 16L12.5 12.5L16 4Z' fill='white'/%3E%3C/svg%3E"

const engine = new MaskEngine('chatgpt', resolveChatGptTheme, {
  getTitle: (theme) => (theme === 'deepseek' ? 'DeepSeek' : '通义千问'),
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
