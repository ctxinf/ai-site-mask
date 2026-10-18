export const DEFAULT_DEEPSEEK_USERNAME = '133****3333'
export function normalizeDeepseekUsername(value?: string): string {
  return (typeof value === 'string' ? value : '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 40) || DEFAULT_DEEPSEEK_USERNAME
}

export const DEFAULT_QWEN_MODEL_LABEL = 'Qwen3.7-Plus'
export function normalizeQwenModelLabel(value?: string): string {
  return (typeof value === 'string' ? value : '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 80) || DEFAULT_QWEN_MODEL_LABEL
}

export interface SiteState {
  autoApply: boolean
  /** 当前站点选择的伪装皮肤。 */
  theme?: string
  /** Resting opacity of controls absent from the reference UI (0–0.5). */
  extraOpacity?: number
  deepseekUsername?: string
  qwenModelLabel?: string
}

export interface Preferences {
  extraOpacity?: number
  qwenModelLabel?: string
  deepseekUsername?: string
}

export function normalizeOpacity(value?: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(0.5, value)) : 0.25
}
