/** Shared metadata; content scripts and React views use the same skin fallback. */
export const SKINS = {
  qwen: {name: '通义千问', title: 'Qwen', image: 'images/qwen-favicon.png', favicon: 'images/qwen-favicon.png'},
  deepseek: {name: 'DeepSeek', title: 'DeepSeek', image: 'images/deepseek-icon.svg', favicon: 'images/deepseek-favicon.svg'},
} as const
export type Skin = keyof typeof SKINS
const AVAILABLE_SKINS: readonly Skin[] = ['qwen', 'deepseek']

export const SITES = [
  {id: 'chatgpt', host: 'chatgpt.com', aliases: ['chat.openai.com'], name: 'ChatGPT', glyph: 'G'},
  {id: 'claude', host: 'claude.ai', aliases: [], name: 'Claude', glyph: '✳'},
  {id: 'grok', host: 'grok.com', aliases: [], name: 'Grok', glyph: '𝕏'},
  {id: 'gemini', host: 'gemini.google.com', aliases: [], name: 'Gemini', glyph: 'G'},
] as const
export type SiteId = typeof SITES[number]['id']
export const SUPPORTED_HOSTS: readonly string[] = SITES.flatMap(site => [site.host, ...site.aliases])
export function siteForHost(host: string) {
  return SITES.find(site => site.host === host || (site.aliases as readonly string[]).includes(host))
}
export function skinsForHost(host: string): readonly Skin[] {
  return siteForHost(host) ? AVAILABLE_SKINS : []
}
export function resolveSkin(theme?: string): Skin {
  return theme === 'deepseek' ? 'deepseek' : 'qwen'
}
