# 🌐 gpt-ui 浏览器版 | Chrome & Firefox

Safari 版移植到 Chrome / Edge / Firefox 的打包层。主题逻辑不做第二份拷贝：内容脚本、设置页、
样式表全部复用仓库现有文件，本目录只放各浏览器特有的 manifest、后台脚本、组装与校验脚本。

The port shares one source of truth with the Safari extension: `content.js`, the options panel
and every stylesheet are copied at build time, so a theme fix lands once and reaches all browsers.

---

## 📁 目录

| 路径 | 作用 |
| --- | --- |
| `chrome/manifest.json` | Chrome / Edge 的 Manifest V3 清单 |
| `firefox/manifest.json` | Firefox 的 Manifest V3 清单（含 `browser_specific_settings`） |
| `shared/background.js` | 后台 service worker：点图标打开设置页，首次安装自动打开 |
| `build.sh` | 组装 `dist/chrome`、`dist/firefox` 并生成压缩包 |
| `validate.sh` | 校验清单、引用文件、JS 语法、CSS 括号、版本一致性 |
| `dist/` | 生成物（已 gitignore），可直接加载 |

复用的源文件：`SafariPTTheme/Extension/Resources/{domain-utils,target-domains,themes,content,options}.js`、
`options.html`、`options.css`、`icon-*.png`，以及仓库根目录的 `theme.css`、`agsv-theme.css`、
`safari-compat.css`、`site-colors.css`。

---

## 🚀 构建

```sh
./BrowserPTTheme/build.sh              # 两个平台都组装 + 打包
./BrowserPTTheme/build.sh chrome       # 只做 Chrome
./BrowserPTTheme/build.sh --no-archive # 只组装目录，不出压缩包
./BrowserPTTheme/validate.sh           # 校验（组装后必跑）
```

产物：

- `BrowserPTTheme/dist/chrome/`、`BrowserPTTheme/dist/firefox/`：解压态目录，直接加载。
- `BrowserPTTheme/dist/gpt-ui-chrome-<版本>.zip`：Chrome / Edge 分发用。
- `BrowserPTTheme/dist/gpt-ui-firefox-<版本>.xpi`：Firefox 分发用。

改了域名收录列表后照常执行 `./Scripts/configure-domains.sh <domain>`，再跑一次
`./BrowserPTTheme/build.sh` 即可把新的 `target-domains.js` 带进两个包。

---

## 🧭 安装

### Chrome / Edge（开发者模式加载）

1. `./BrowserPTTheme/build.sh chrome`
2. 打开 `chrome://extensions`（Edge 为 `edge://extensions`），开启「开发者模式」。
3. 点「加载已解压的扩展程序」，选择 `BrowserPTTheme/dist/chrome`。
4. 扩展卡片 → 详情：需要主题化本地文件时，打开「允许访问文件网址」。

### Firefox（临时加载，重启后失效）

1. `./BrowserPTTheme/build.sh firefox`
2. 打开 `about:debugging#/runtime/this-firefox`，点「临时载入附加组件…」，
   选择 `BrowserPTTheme/dist/firefox/manifest.json`。

### Firefox（永久安装）

上架 AMO 签名后用 `dist/gpt-ui-firefox-<版本>.xpi`：`about:addons` → 齿轮 → 「从文件添加附加组件」。
Developer Edition / Nightly / ESR 可在 `about:config` 里把 `xpinstall.signatures.required`
设为 `false` 直接装未签名包；正式版无签名不能永久安装。

### 通用

首次安装会自动打开设置页；之后点工具栏图标同样打开设置页。在设置页选择主题、
添加 PT 站点域名（例如 `springsunday.net`），刷新页面即生效。

---

## ⚠️ 差异与限制

- 目标为 Manifest V3：Chrome / Edge ≥ 114，Firefox ≥ 121（需要 `:has()`、`backdrop-filter`
  与 service worker 支持）。
- `html[data-gptui-safari-theme]` 属性名沿用 Safari 版命名，三端共用同一套样式，不代表只在 Safari 生效。
- 内容脚本用 `<link>` 注入扩展样式表。站点若下发限制 `style-src` 的 CSP 且未放行扩展来源，
  样式可能被拦；已收录的 PT 站点实测均未下发 CSP。
- Chrome 会在扩展页提示「可以读取和更改所有网站上的数据」，因为翻译功能需要 `<all_urls>` 匹配。
- 三个清单版本号必须一致（Safari / Chrome / Firefox），`validate.sh` 会检查。

---

## ❤️ 许可协议

MIT License © 2025
