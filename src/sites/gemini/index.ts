import {defineSite} from '../../core/site-runtime'
import {geminiThemeCss} from './theme'
import {isGeminiChat, mountGeminiUi} from './ui'

export default defineSite({
  id: 'gemini',
  css: geminiThemeCss,
  isApplicable: isGeminiChat,
  mountUi: mountGeminiUi,
})
