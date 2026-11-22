import type {Skin} from './catalog'

export type FaviconCorner = 'br' | 'bl'

export const FAVICON_BADGES = [
  {id: '1', label: '角标 1'},
  {id: '2', label: '角标 2'},
  {id: '3', label: '角标 3'},
  {id: '4', label: '角标 4'},
  {id: 'chatgpt', label: 'ChatGPT'},
  {id: 'claude', label: 'Claude'},
  {id: 'grok', label: 'Grok'},
  {id: 'gemini', label: 'Gemini'},
  {id: 'flower', label: '小花'},
  {id: 'triangle', label: '三角'},
  {id: 'apple', label: '苹果'},
  {id: 'tesla', label: '特斯拉'},
  {id: 'sams', label: '山姆'},
] as const

export const QWEN_EDGE_BADGES = [
  {id: 'edge-top-yellow', label: '上边黄色', edge: 0, color: '#F59E0B'},
  {id: 'edge-top-red', label: '上边红色', edge: 0, color: '#EF4444'},
  {id: 'edge-top-green', label: '上边绿色', edge: 0, color: '#10B981'},
  {id: 'edge-left-yellow', label: '左边黄色', edge: 1, color: '#F59E0B'},
  {id: 'edge-left-red', label: '左边红色', edge: 1, color: '#EF4444'},
  {id: 'edge-left-green', label: '左边绿色', edge: 1, color: '#10B981'},
  {id: 'edge-right-yellow', label: '右边黄色', edge: 2, color: '#F59E0B'},
  {id: 'edge-right-red', label: '右边红色', edge: 2, color: '#EF4444'},
  {id: 'edge-right-green', label: '右边绿色', edge: 2, color: '#10B981'},
] as const

export type CommonFaviconBadgeId = typeof FAVICON_BADGES[number]['id']
export type QwenEdgeBadgeId = typeof QWEN_EDGE_BADGES[number]['id']
export type FaviconBadgeId = CommonFaviconBadgeId | QwenEdgeBadgeId

export interface CustomFaviconItem {
  id: string
  name: string
  dataUrl: string
  createdAt: number
}

const VALID_SKINS = new Set<Skin>(['qwen', 'deepseek'])
const VALID_CORNERS = new Set<FaviconCorner>(['br', 'bl'])
const COMMON_BADGE_SET = new Set<string>(FAVICON_BADGES.map(item => item.id))
const QWEN_EDGE_MAP = new Map<string, (typeof QWEN_EDGE_BADGES)[number]>(
  QWEN_EDGE_BADGES.map(item => [item.id, item])
)

export function getPresetBadgesForSkin(skin: Skin): ReadonlyArray<{id: FaviconBadgeId; label: string}> {
  return skin === 'qwen' ? [...FAVICON_BADGES, ...QWEN_EDGE_BADGES] : FAVICON_BADGES
}

export function getFaviconBadgeLabel(badge: string): string {
  const common = FAVICON_BADGES.find(item => item.id === badge)
  if (common) return common.label
  const edge = QWEN_EDGE_MAP.get(badge)
  if (edge) return edge.label
  return badge
}

export function makePresetFaviconId(skin: Skin, corner: FaviconCorner, badge: FaviconBadgeId): string {
  return `preset:${skin}:${corner}:${badge}`
}

export function parsePresetFaviconId(
  id?: string
): {skin: Skin; corner: FaviconCorner; badge: FaviconBadgeId} | null {
  if (typeof id !== 'string' || !id.startsWith('preset:')) return null
  const parts = id.split(':')
  if (parts.length !== 4) return null
  const [, skin, corner, badge] = parts
  if (!VALID_SKINS.has(skin as Skin) || !VALID_CORNERS.has(corner as FaviconCorner)) {
    return null
  }
  const isValidBadge = COMMON_BADGE_SET.has(badge) || (skin === 'qwen' && QWEN_EDGE_MAP.has(badge))
  if (!isValidBadge) return null
  return {
    skin: skin as Skin,
    corner: corner as FaviconCorner,
    badge: badge as FaviconBadgeId,
  }
}

export function isCustomFaviconId(id?: string): id is string {
  return typeof id === 'string' && /^custom:[a-zA-Z0-9_-]{4,64}$/.test(id)
}

export function normalizeFaviconId(value?: string): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'default') return undefined
  if (parsePresetFaviconId(trimmed) || isCustomFaviconId(trimmed)) return trimmed
  return undefined
}

export function normalizeCustomFaviconName(name?: string): string {
  const cleaned = (typeof name === 'string' ? name : '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .replace(/\.[a-z0-9]{1,8}$/i, '')
    .trim()
    .slice(0, 32)
  return cleaned || '自定义图标'
}

export function isValidFaviconDataUrl(url?: string): boolean {
  if (typeof url !== 'string') return false
  if (url.length > 200_000) return false
  return /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml|x-icon|vnd\.microsoft\.icon);/i.test(url)
}

// Qwen 三条边 path（0: 上边, 1: 左边, 2: 右下边），保持满幅尺寸
const QWEN_PATHS = [
  'M16.4317 2.35157H11.5088C11.5088 2.14167 11.453 1.93176 11.3448 1.74482L10.6855 0.60346C10.4691 0.229567 10.0689 -0.0032959 9.63601 -0.0032959H8.31755C7.88462 -0.0032959 7.48449 0.226288 7.26803 0.60346L5.25097 4.09641C5.03451 4.4703 5.03451 4.93275 5.25097 5.30664L5.9102 6.448C6.12667 6.82189 6.5268 7.05476 6.95973 7.05476H16.4284C16.8613 7.05476 17.2615 6.82517 17.4779 6.448L18.1372 5.30664C18.3536 4.93275 18.3536 4.4703 18.1372 4.09641L17.4779 2.95505C17.2615 2.58116 16.8613 2.34829 16.4284 2.34829L16.4317 2.35157Z',
  'M0.164057 8.25187L2.62388 12.5156C2.44349 12.6205 2.28934 12.7714 2.18111 12.9583L1.52188 14.0997C1.30542 14.4736 1.30542 14.936 1.52188 15.3099L2.18111 16.4513C2.39758 16.8252 2.79771 17.058 3.23064 17.058H7.26475C7.69767 17.058 8.09781 16.8284 8.31427 16.4513L8.9735 15.3099C9.18997 14.936 9.18997 14.4736 8.9735 14.0997L4.2408 5.90027C4.02434 5.52638 3.62421 5.29352 3.19128 5.29352H1.87281C1.43989 5.29352 1.03975 5.5231 0.82329 5.90027L0.164057 7.04163C-0.0524071 7.41553 -0.0524071 7.87797 0.164057 8.25187Z',
  'M13.4077 19.3932L15.8675 15.1295C16.0479 15.2345 16.2578 15.2935 16.4743 15.2935H17.7927C18.2257 15.2935 18.6258 15.0639 18.8423 14.6868L19.5015 13.5454C19.718 13.1715 19.718 12.7091 19.5015 12.3352L17.4844 8.84223C17.268 8.46834 16.8678 8.23547 16.4349 8.23547H15.1164C14.6835 8.23547 14.2834 8.46506 14.0669 8.84223L9.33422 17.0416C9.11776 17.4155 9.11776 17.878 9.33422 18.2519L9.99346 19.3932C10.2099 19.7671 10.6101 20 11.043 20H12.3614C12.7944 20 13.1945 19.7704 13.411 19.3932H13.4077Z',
] as const

function renderQwenBaseSvg(coloredEdge?: number, color?: string): string {
  const paths = QWEN_PATHS.map((d, i) => `<path d="${d}" fill="${i === coloredEdge && color ? color : '#082DFF'}"/>`).join('')
  return `<g transform="translate(2.5 2) scale(3)">${paths}</g>`
}

const DEEPSEEK_BASE_SVG = `<g transform="scale(1.28)">
  <path d="M48.8354 10.0479C48.3232 9.79199 48.1025 10.2798 47.8032 10.5278C47.7007 10.6079 47.6143 10.7119 47.5273 10.8076C46.7793 11.624 45.9048 12.1597 44.7622 12.0957C43.0923 12 41.666 12.5356 40.4058 13.8398C40.1377 12.2319 39.2476 11.272 37.8926 10.6558C37.1836 10.3359 36.4668 10.0156 35.9702 9.31982C35.6235 8.82373 35.5293 8.27197 35.356 7.72754C35.2456 7.3999 35.1353 7.06396 34.7651 7.00781C34.3633 6.94385 34.2056 7.2876 34.0479 7.57568C33.418 8.75195 33.1733 10.0479 33.1973 11.3599C33.2524 14.312 34.4736 16.6641 36.8999 18.3359C37.1758 18.5278 37.2466 18.7197 37.1597 19C36.9946 19.5757 36.7974 20.1357 36.624 20.7119C36.5137 21.0801 36.3486 21.1597 35.9624 21C34.6309 20.4321 33.481 19.5918 32.4644 18.5757C30.7393 16.8721 29.1792 14.9917 27.2334 13.52C26.7764 13.1758 26.3193 12.856 25.8467 12.5518C23.8618 10.584 26.1069 8.96777 26.627 8.77588C27.1704 8.57568 26.8159 7.8877 25.0591 7.896C23.3022 7.90381 21.6953 8.50391 19.647 9.30371C19.3477 9.42383 19.0322 9.51172 18.7095 9.58398C16.8501 9.22363 14.9199 9.14355 12.9033 9.37598C9.10596 9.80762 6.07275 11.6396 3.84326 14.7681C1.16455 18.5278 0.53418 22.7998 1.30664 27.2559C2.11768 31.9521 4.46582 35.8398 8.07373 38.8799C11.8159 42.0322 16.1255 43.5762 21.041 43.2803C24.0269 43.104 27.3516 42.6963 31.1016 39.4561C32.0469 39.936 33.0396 40.1279 34.686 40.272C35.9546 40.3921 37.1758 40.208 38.1211 40.0078C39.6021 39.688 39.4995 38.2881 38.9639 38.0322C34.623 35.9678 35.5762 36.8081 34.71 36.1279C36.9155 33.4639 40.2402 30.6958 41.54 21.728C41.6426 21.0161 41.5557 20.5679 41.54 19.9917C41.5322 19.6396 41.6108 19.5039 42.0049 19.4639C43.0923 19.3359 44.1479 19.0317 45.1167 18.4878C47.9292 16.9199 49.064 14.3438 49.3315 11.2559C49.3711 10.7837 49.3237 10.2959 48.8354 10.0479ZM24.3262 37.8398C20.1196 34.4639 18.0791 33.3521 17.2358 33.3999C16.4482 33.4482 16.5898 34.3682 16.7632 34.9678C16.9443 35.5601 17.1812 35.9683 17.5117 36.4878C17.7402 36.832 17.8979 37.3442 17.2832 37.728C15.9282 38.584 13.5728 37.4399 13.4624 37.3838C10.7207 35.7358 8.42822 33.5601 6.81348 30.584C5.25342 27.7197 4.34766 24.6479 4.19775 21.3677C4.1582 20.5757 4.38672 20.2959 5.15869 20.1519C6.17529 19.96 7.22314 19.9199 8.23926 20.0718C12.5327 20.7119 16.1885 22.6719 19.2529 25.7759C21.002 27.5439 22.3252 29.6558 23.6885 31.7202C25.1377 33.9121 26.6978 36 28.6831 37.7119C29.3843 38.312 29.9434 38.7681 30.479 39.104C28.8643 39.2881 26.1699 39.3281 24.3262 37.8398ZM26.3433 24.6001C26.3433 24.248 26.6191 23.9678 26.9658 23.9678C27.0444 23.9678 27.1152 23.9839 27.1782 24.0078C27.2651 24.04 27.3438 24.0879 27.4067 24.1602C27.5171 24.272 27.5801 24.4321 27.5801 24.6001C27.5801 24.9521 27.3042 25.2319 26.9575 25.2319C26.6108 25.2319 26.3433 24.9521 26.3433 24.6001ZM32.6064 27.8799C32.2046 28.0479 31.8027 28.1919 31.4165 28.208C30.8179 28.2397 30.1641 27.9922 29.8096 27.688C29.2583 27.2158 28.8643 26.9521 28.6987 26.1279C28.6279 25.7759 28.6675 25.2319 28.7305 24.9199C28.8721 24.248 28.7144 23.8159 28.2495 23.4238C27.8716 23.104 27.3911 23.0161 26.8633 23.0161C26.666 23.0161 26.4849 22.9277 26.3511 22.856C26.1304 22.7441 25.9492 22.4639 26.1226 22.1201C26.1777 22.0078 26.4458 21.7358 26.5088 21.688C27.2256 21.272 28.0527 21.4077 28.8169 21.7197C29.5259 22.0161 30.0615 22.5601 30.834 23.3281C31.6216 24.2559 31.7632 24.5117 32.2124 25.208C32.5669 25.752 32.8901 26.312 33.1104 26.9521C33.2446 27.3521 33.0713 27.6802 32.6064 27.8799Z" fill="#4D6BFE"/>
</g>`

const OPENAI_PATH = 'M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z'

const CLAUDE_PATH = 'M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z'

const GROK_PATH = 'M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815'

const GEMINI_PATH = 'M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z'

const NUMBER_COLORS: Record<'1' | '2' | '3' | '4', string> = {
  '1': '#E11D48',
  '2': '#D97706',
  '3': '#059669',
  '4': '#7C3AED',
}

// 渲染角标：isMask=true 时用于 <mask> 沿角标自身精确轮廓外扩挖空主体背景
function renderBadgeSvg(badge: CommonFaviconBadgeId, cx: number, cy: number, isMask: boolean): string {
  const maskAttr = 'fill="#000000" stroke="#000000" stroke-linejoin="round" stroke-linecap="round"'
  if (badge === '1' || badge === '2' || badge === '3' || badge === '4') {
    const color = NUMBER_COLORS[badge]
    return `<text x="${cx}" y="${cy + 10.5}" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,Arial,sans-serif" font-size="30" font-weight="900" ${isMask ? `${maskAttr} stroke-width="6"` : `fill="${color}"`}>${badge}</text>`
  }

  const tx = cx - 14
  const ty = cy - 14

  switch (badge) {
    case 'chatgpt':
      return `<g transform="translate(${tx} ${ty}) scale(1.16)"><path d="${OPENAI_PATH}" ${isMask ? `${maskAttr} stroke-width="5"` : 'fill="#111827" fill-rule="evenodd"'}/></g>`
    case 'claude':
      return `<g transform="translate(${tx} ${ty}) scale(1.16)"><path d="${CLAUDE_PATH}" ${isMask ? `${maskAttr} stroke-width="5"` : 'fill="#D97757"'}/></g>`
    case 'grok':
      return `<g transform="translate(${tx} ${ty}) scale(1.16)"><path d="${GROK_PATH}" ${isMask ? `${maskAttr} stroke-width="5"` : 'fill="#111827" fill-rule="evenodd"'}/></g>`
    case 'gemini':
      if (isMask) {
        return `<g transform="translate(${tx} ${ty}) scale(1.16)"><path d="${GEMINI_PATH}" ${maskAttr} stroke-width="5"/></g>`
      }
      return `<g transform="translate(${tx} ${ty}) scale(1.16)"><defs><linearGradient id="g0" gradientUnits="userSpaceOnUse" x1="7" x2="11" y1="15.5" y2="12"><stop stop-color="#08B962"/><stop offset="1" stop-color="#08B962" stop-opacity="0"/></linearGradient><linearGradient id="g1" gradientUnits="userSpaceOnUse" x1="8" x2="11.5" y1="5.5" y2="11"><stop stop-color="#F94543"/><stop offset="1" stop-color="#F94543" stop-opacity="0"/></linearGradient><linearGradient id="g2" gradientUnits="userSpaceOnUse" x1="3.5" x2="17.5" y1="13.5" y2="12"><stop stop-color="#FABC12"/><stop offset=".46" stop-color="#FABC12" stop-opacity="0"/></linearGradient></defs><path d="${GEMINI_PATH}" fill="#3186FF"/><path d="${GEMINI_PATH}" fill="url(#g0)"/><path d="${GEMINI_PATH}" fill="url(#g1)"/><path d="${GEMINI_PATH}" fill="url(#g2)"/></g>`
    case 'flower':
      return `<g transform="translate(${cx} ${cy}) scale(1.25)" ${isMask ? `${maskAttr} stroke-width="4.5"` : ''}><circle cx="0" cy="-6.2" r="4.4" ${isMask ? '' : 'fill="#EC4899"'}/><circle cx="5.9" cy="-1.9" r="4.4" ${isMask ? '' : 'fill="#EC4899"'}/><circle cx="3.6" cy="5.0" r="4.4" ${isMask ? '' : 'fill="#EC4899"'}/><circle cx="-3.6" cy="5.0" r="4.4" ${isMask ? '' : 'fill="#EC4899"'}/><circle cx="-5.9" cy="-1.9" r="4.4" ${isMask ? '' : 'fill="#EC4899"'}/><circle cx="0" cy="0" r="4.0" ${isMask ? '' : 'fill="#FACC15"'}/></g>`
    case 'triangle':
      return `<path d="M${cx} ${cy - 12.5} L${cx + 12.5} ${cy + 9.5} Q${cx + 13.8} ${cy + 11.8} ${cx + 11} ${cy + 11.8} L${cx - 11} ${cy + 11.8} Q${cx - 13.8} ${cy + 11.8} ${cx - 12.5} ${cy + 9.5} Z" ${isMask ? `${maskAttr} stroke-width="5.5"` : 'fill="#F97316"'}/>`
    case 'apple':
      return `<g transform="translate(${cx - 13.5} ${cy - 14.5}) scale(1.16)" ${isMask ? `${maskAttr} stroke-width="5"` : ''}><path d="M16.365 13.14c-.03-2.55 2.08-3.78 2.18-3.84-1.19-1.74-3.04-1.97-3.7-2-1.56-.16-3.07.93-3.86.93-.8 0-2.02-.91-3.33-.88-1.71.03-3.3 1-4.18 2.53-1.79 3.1-.46 7.68 1.28 10.19.85 1.23 1.87 2.61 3.21 2.56 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.35.8 1.39-.02 2.27-1.25 3.12-2.48.98-1.43 1.39-2.82 1.41-2.89-.03-.01-2.79-1.07-2.82-3.89z" ${isMask ? '' : 'fill="#1D1D1F"'}/><path d="M13.84 5.56c.71-.86 1.19-2.06 1.06-3.26-1.02.04-2.26.68-2.99 1.54-.65.75-1.22 1.98-1.07 3.15 1.14.09 2.3-.58 3-1.43z" ${isMask ? '' : 'fill="#1D1D1F"'}/></g>`
    case 'tesla':
      return `<g transform="translate(${cx - 14} ${cy - 13.5}) scale(1.18)"><path d="M12 22L8.9 7.8c2.1 0 3.1 1.4 3.1 1.4s1-1.4 3.1-1.4L12 22zM12 5.4c2.8 0 5.6.5 7.9 1.5l1.3-2.2C18.5 3.5 15.3 3 12 3S5.5 3.5 2.8 4.7l1.3 2.2c2.3-1 5.1-1.5 7.9-1.5zM2.2 3.1C5.2 1.7 8.5 1 12 1s6.8.7 9.8 2.1l-.7 1.3C18.3 3.1 15.2 2.4 12 2.4S5.7 3.1 2.9 4.4l-.7-1.3z" ${isMask ? `${maskAttr} stroke-width="5"` : 'fill="#E31937"'}/></g>`
    case 'sams':
      return `<g transform="translate(${cx} ${cy}) scale(1.22)" ${isMask ? `${maskAttr} stroke-width="4.5"` : ''}><rect x="-8.4" y="-8.4" width="11.2" height="11.2" rx="1.6" transform="rotate(45) translate(-2.6 0)" ${isMask ? '' : 'fill="#0067A0"'}/><rect x="-2.8" y="-2.8" width="11.2" height="11.2" rx="1.6" transform="rotate(45) translate(-2.6 0)" ${isMask ? '' : 'fill="#78BE20"'}/></g>`
  }
}

export function buildPresetFaviconSvg(skin: Skin, corner: FaviconCorner, badge: FaviconBadgeId): string {
  // Qwen 单边染色变体：直接给三条边之一换色
  const qwenEdge = QWEN_EDGE_MAP.get(badge)
  if (skin === 'qwen' && qwenEdge) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">${renderQwenBaseSvg(qwenEdge.edge, qwenEdge.color)}</svg>`
  }

  const base = skin === 'deepseek' ? DEEPSEEK_BASE_SVG : renderQwenBaseSvg()
  // Qwen 角标放在视觉中心点 (32, 32)；DeepSeek 角标紧贴右边界 (padding=0)
  const cx = skin === 'qwen' ? 32 : corner === 'br' ? 50 : 14
  const cy = skin === 'qwen' ? 32 : 49
  const commonBadge = badge as CommonFaviconBadgeId
  const maskCutout = renderBadgeSvg(commonBadge, cx, cy, true)
  const badgeSvg = renderBadgeSvg(commonBadge, cx, cy, false)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><defs><mask id="c"><rect width="64" height="64" fill="#FFFFFF"/>${maskCutout}</mask></defs><g mask="url(#c)">${base}</g>${badgeSvg}</svg>`
}

const dataUrlCache = new Map<string, string>()

export function getPresetFaviconDataUrl(presetId: string): string | undefined {
  const cached = dataUrlCache.get(presetId)
  if (cached) return cached
  const parsed = parsePresetFaviconId(presetId)
  if (!parsed) return undefined
  const svg = buildPresetFaviconSvg(parsed.skin, parsed.corner, parsed.badge)
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  dataUrlCache.set(presetId, url)
  return url
}
