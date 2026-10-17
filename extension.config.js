/** @type {import('extension').FileConfig} */
// Extension.js uses a fresh profile on every run.
// Prefer that default? Remove the profile config below.
//
// 注意：这台实验机器跑在 root 下，Chromium 必须加 --no-sandbox 才能启动，
// 所以这里常开（上游模板只在 CI=1 时开）。
const profile = (name) => `./dist/extension-profile-${name}`
const rootFlags = ['--no-sandbox', '--disable-gpu']

export default {
  browser: {
    chrome: {profile: profile('chrome'), browserFlags: rootFlags},
    chromium: {profile: profile('chromium'), browserFlags: rootFlags},
    edge: {profile: profile('edge'), browserFlags: rootFlags},
    firefox: {profile: profile('firefox')},
    'chromium-based': {
      profile: profile('chromium-based'),
      browserFlags: rootFlags
    },
    'gecko-based': {profile: profile('gecko-based')}
  }
}
