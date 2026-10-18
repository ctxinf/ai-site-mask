import {defineSite} from '../../core/site-runtime'
import {claudeThemeCss} from './theme'

/** Keep account, project and billing pages native. */
export function isClaudeChat(): boolean {
  return location.pathname === '/' || /^\/new\/?$/.test(location.pathname) || /^\/chat\/[^/]+\/?$/.test(location.pathname)
}

export default defineSite({
  id: 'claude',
  css: claudeThemeCss,
  isApplicable: isClaudeChat,
})
