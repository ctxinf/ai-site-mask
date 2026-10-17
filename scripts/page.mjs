import {createServer} from 'node:http'
const server = createServer((_request, response) => {
  response.writeHead(200, {'content-type': 'text/html; charset=utf-8'})
  response.end(`<!doctype html><html lang="zh-CN"><meta charset="utf-8">
<title>插件体验页</title><style>body{font-family:system-ui;max-width:760px;margin:60px auto;padding:24px;line-height:1.8}h1{color:#2563eb}</style>
<h1>插件体验页</h1><p>右下角是插件注入的横幅。</p>
<p>在插件 popup 切换「显示页面横幅」，观察这里的变化。刷新后设置仍会保留。</p></html>`)
})
server.on('error', error => {console.error(error.message); process.exitCode = 1})
server.listen(8931, '127.0.0.1', () => console.log('插件体验页: http://127.0.0.1:8931'))
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close())
