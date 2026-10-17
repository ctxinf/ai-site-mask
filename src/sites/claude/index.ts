import {MaskEngine} from '../../core/mask'
import {doubaoThemeCss} from './theme-doubao'

// claude.ai 独立入口。
// 当前主题：doubao 浅色（theme-doubao.ts）。换主题 = 换一个 css 字符串模块。
// 硬约束：所有规则必须以 `html.skm-mask-on` 开头；只改颜色/背景/圆角/字体字号
// 等安全属性，不删除、不 display:none 任何原页面元素，不改动 DOM 结构。
const engine = new MaskEngine('claude', doubaoThemeCss)

// 每次注入到页面都会打这行，`npm run logs:content` 里能看到。
console.log('[skm][claude] content script 已注入:', location.href)

/**
 * Extension.js content_script 入口：框架在注入时调用它，
 * 返回的函数在 HMR/卸载时被调用做清理。不要自己调用它。
 */
export default function initial() {
  engine
    .boot(location.hostname)
    .catch((err) => console.error('[skm][claude] boot 失败:', err))

  return () => {
    engine.destroy()
  }
}
