import ReactDOM from 'react-dom/client'
import ContentApp from './ContentApp'
import './styles.css'

// 每次注入到页面都会打这行，`npm run logs:content` 里能看到。
console.log('[workflow][content] content script 已注入:', location.href)

/**
 * Extension.js content_script 入口：框架在注入时调用它，
 * 返回的函数在 HMR/卸载时被调用做清理。不要自己调用它。
 */
export default function initial() {
  const rootDiv = document.createElement('div')
  rootDiv.setAttribute('data-extension-workflow', 'true')
  // 把宿主元素和页面样式隔离开（shadow DOM 只保护后代，宿主本身仍吃页面 CSS）。
  rootDiv.style.cssText = 'all: initial !important'
  document.body.appendChild(rootDiv)

  // 在 shadow DOM 里挂载，防止扩展样式污染页面、页面样式污染扩展。
  const shadowRoot = rootDiv.attachShadow({mode: 'open'})

  const styleElement = document.createElement('style')
  shadowRoot.appendChild(styleElement)

  fetchCSS().then((css) => (styleElement.textContent = css))

  const mountingPoint = ReactDOM.createRoot(shadowRoot)
  mountingPoint.render(
    <div className="content_script">
      <ContentApp />
    </div>
  )

  console.log('[workflow][content] 横幅已挂载到页面')

  return () => {
    mountingPoint.unmount()
    rootDiv.remove()
  }
}

async function fetchCSS() {
  const cssUrl = new URL('./styles.css', import.meta.url)
  const response = await fetch(cssUrl)
  const text = await response.text()

  return response.ok ? text : Promise.reject(text)
}
