const qwenLogoUrl = chrome.runtime.getURL('images/qwen-logo.svg')
const qwenLogoDarkUrl = chrome.runtime.getURL('images/qwen-logo-dark.svg')
export const qwenPaletteCss = `
html.skm-mask-on {
  --skm-qwen-logo: url("${qwenLogoUrl}");
  --skm-qwen-scheme: light;
  --skm-qwen-page: #ffffff;
  --skm-qwen-composer: #ffffff;
  --skm-qwen-sidebar: #f7f7f9;
  --skm-qwen-text: #242424;
  --skm-qwen-secondary: #55555a;
  --skm-qwen-muted: #929296;
  --skm-qwen-faint: #b5b5ba;
  --skm-qwen-border: #e3e3e6;
  --skm-qwen-hover: #ededf0;
  --skm-qwen-bubble: #f1f0fc;
  --skm-qwen-active: #eaeaec;
  --skm-qwen-accent: #6155f5;
  --skm-qwen-focus: #aaa3e9;
  --skm-qwen-selection: #dedbff;
  --skm-qwen-scrollbar: #d3d3d7;
}
html.skm-mask-on[data-theme="dark"], html.skm-mask-on.dark {
  --skm-qwen-logo: url("${qwenLogoDarkUrl}");
  --skm-qwen-scheme: dark;
  --skm-qwen-page: #212121;
  --skm-qwen-composer: #292929;
  --skm-qwen-sidebar: #111111;
  --skm-qwen-text: #f2f2f2;
  --skm-qwen-secondary: #d0d0d0;
  --skm-qwen-muted: #969696;
  --skm-qwen-faint: #666666;
  --skm-qwen-border: #505050;
  --skm-qwen-hover: #2b2b2b;
  --skm-qwen-bubble: #303030;
  --skm-qwen-active: #292929;
  --skm-qwen-accent: #a59aff;
  --skm-qwen-focus: #777777;
  --skm-qwen-selection: #49416b;
  --skm-qwen-scrollbar: #464646;
}
`
/** Qwen-inspired light skin. Keep the site's controls, model names and message DOM intact. */
