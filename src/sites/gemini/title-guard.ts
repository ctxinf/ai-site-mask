/** Runs in the page world: accept Gemini's native title updates without
 * publishing them while the isolated-world mask owns the visible title. */
const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'title')
if (descriptor?.get && descriptor.set) {
  const read = descriptor.get
  const write = descriptor.set
  let nativeTitle = read.call(document) as string
  const masked = () => document.documentElement?.classList.contains('skm-mask-on')
  Object.defineProperty(document, 'title', {
    configurable: true,
    get() { return masked() ? nativeTitle : read.call(document) },
    set(value: string) {
      nativeTitle = String(value)
      if (!masked()) write.call(document, nativeTitle)
    },
  })
  let wasMasked = false
  const observer = new MutationObserver(() => {
    const active = !!masked()
    if (wasMasked && !active) write.call(document, nativeTitle)
    wasMasked = active
  })
  const observe = () => {
    if (document.documentElement) observer.observe(document.documentElement, {attributes: true, attributeFilter: ['class']})
  }
  if (document.documentElement) observe()
  else document.addEventListener('DOMContentLoaded', observe, {once: true})
}
export {}
