import {createRoot} from 'react-dom/client'
import PopupApp from './PopupApp'
import './styles.css'

// 打开 popup 就会打这行，`npm run logs:popup` 里能看到。
console.log('[workflow][popup] popup 页面已打开')

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Popup root element not found')
}

createRoot(rootElement).render(<PopupApp />)
