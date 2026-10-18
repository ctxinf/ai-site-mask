import {defineSite} from '../../core/site-runtime'
import {grokThemeCss} from './theme'
import {mountGrokUi} from './ui'

export default defineSite({
  id: 'grok',
  css: grokThemeCss,
  isApplicable: () => location.pathname === '/' || location.pathname.startsWith('/c/'),
  mountUi: mountGrokUi,
})
