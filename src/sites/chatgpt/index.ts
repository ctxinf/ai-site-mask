import {defineSite} from '../../core/site-runtime'
import {qwenThemeCss} from './theme-qwen'
import {deepseekThemeCss} from './theme-deepseek'
import {mountDeepseekUi} from './deepseek-ui'

export default defineSite({
  id: 'chatgpt',
  css: theme => theme === 'deepseek' ? deepseekThemeCss : qwenThemeCss,
  isApplicable: () => location.pathname === '/' || location.pathname.startsWith('/c/'),
  mountUi: mountDeepseekUi,
})
