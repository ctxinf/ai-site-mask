// extension-workflow 实验项目：background（service worker）入口。
// 这里的 console.log 会出现在 `npm run logs:bg`（scope = background）里。

console.log('[workflow][background] service worker 启动')

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.bannerEnabled) {
    console.log('[workflow][background] 横幅设置变更:', changes.bannerEnabled.newValue !== false)
  }
})

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[workflow][background] onInstalled, reason =', details.reason)
})

chrome.runtime.onStartup.addListener(() => {
  console.log('[workflow][background] onStartup')
})

// popup / content 发来的演示消息都会经过这里，方便在日志里看到跨 scope 联动。
chrome.runtime.onMessage.addListener((message, sender) => {
  console.log(
    '[workflow][background] 收到消息:',
    message?.type,
    '| 来自:',
    sender.tab ? `tab ${sender.tab.id}` : 'extension page'
  )
})
