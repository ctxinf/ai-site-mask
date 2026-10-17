# ai-site-skin-mask 需求文档

> 状态：需求收集中，实施待用户规划后开始。

## 1. 项目简介

浏览器插件（Chrome MV3），作用于 chatgpt.com、claude.ai 等**网页版 AI 对话站点**，
把页面视觉改造成 deepseek.ai / doubao.com / qwen.ai 风格的界面——给网页套一层
"mask"（换肤），**只换皮，不换功能**。

## 2. 目标站点

- 首批：chatgpt.com、claude.ai（网页版）。
- 架构上允许继续加站点。

## 3. 核心设计原则

- **分站点独立处理**：各站点的 DOM 结构与前端实现千变万化，每个站点一套独立的
  content script + 样式逻辑，**允许不追求代码复用**。
- **绝不破坏原有功能**：mask 只动观感与布局，站点的原有功能（发消息、历史会话、
  设置等）必须 100% 可用。这是硬性约束，任何实现方案都要先过这一条。

## 4. 功能需求

1. **手动切换**：用户打开页面后，可通过开关手动在「原版界面」与「mask 界面」
   之间来回切换。
2. **自动应用**：支持自动应用 mask（打开页面即生效），默认开关可配置。

## 5. 技术基座

- 从 extension-workflow（Extension.js 4.x + React 18 + TypeScript）fork 起步，
  本仓库即为该基座 + 本需求文档。
- 复用其 AI 迭代工作流：
  - `npm run dev`：HMR 热更新，改代码即在浏览器生效；
  - `npm run logs:<scope>`：按 background / popup / content 等 scope 读日志；
  - `npm run shot`：截图供多模态模型检查。
- 详见 `docs/WORKFLOW.md`。

## 6. 参考实现

- 同类插件解压包：<https://www.crxsoso.com/webstore/detail/bccghhjlejbkimijdkdfoboamcjgpefg>
  实施中遇到困难时下载分析其实现。

## 7. 待确认

- 手动 switch 的粒度：仅「原版 / mask」二切，还是
  「原版 / deepseek 风 / doubao 风 / qwen 风」多切？
- 自动应用的默认开关：默认开还是默认关？是否记忆用户上次选择？
- 首批站点是否只有 chatgpt.com + claude.ai？

## 8. 非目标

- 本阶段只定需求、不做实施；实施方案由用户规划后开始。
