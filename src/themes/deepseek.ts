export const deepseekPaletteCss = `
/* ============ 1. DeepSeek 品牌色板（皮肤变量，换主题只改这里） ============ */
html.skm-mask-on {
  --skm-deepseek: 1;
  --skm-new-chat: #ffffff;
  --skm-scheme: light;
  --skm-blue: #4d6bfe;        /* deepseek 品牌蓝 */
  --skm-blue-hover: #3d5bef;
  --skm-page: #ffffff;        /* 主对话区 */
  --skm-sidebar: #f8f9fb;     /* 左侧会话栏 */
  --skm-composer: #ffffff;     /* 输入框底色 */
  --skm-user-bubble: #edf2ff;  /* 用户消息气泡 */
  --skm-text: #262626;
  --skm-text-2: #6b6b6b;
  --skm-text-3: #9a9a9a;
  --skm-border: #e5e5e5;
  --skm-hover: #e9e9eb;
}

html.skm-mask-on.dark, html.skm-mask-on[data-theme="dark"] {
  --skm-new-chat: #44464b;
  --skm-scheme: dark;
  --skm-page: #141414;
  --skm-sidebar: #1c1c1c;
  --skm-composer: #2b2b2b;
  --skm-user-bubble: #2b2b2b;
  --skm-text: #ededed;
  --skm-text-2: #b4b4bc;
  --skm-text-3: #85858e;
  --skm-border: #3b3b3d;
  --skm-hover: #343436;
  --skm-blue: #4d7bfe;
}

`
/** DeepSeek light skin; native controls stay in place and extras reveal on interaction. */
