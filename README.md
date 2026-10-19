# 🎨 gpt-ui

原版https://github.com/gangz1o/gptui 的移植safari版。
功能为 NP 架构站点打造现代化 UI，优化视觉体验 图标, 布局, 动画, 全新设计
A modern UI makeover for NP-based torrent sites.

---

🇨🇳 [中文文档](#-中文说明--chinese-guide) | 🇬🇧 [English Guide](#-english-guide)

---

## 🌸 UI 效果图 | Preview

![UI 示例图 1](https://pic.areyouok.tech/file/AgACAgUAAyEGAASNGeNOAAIWpWgLY_wwFey9ZZZshFkwOAt88qBZAAIhxjEbNadgVHOTBvqJTAW5AQADAgADdwADNgQ.png)  
![UI 示例图 2](https://pic.areyouok.tech/file/AgACAgUAAyEGAASNGeNOAAIWpmgLZED7p2VmoASh1NTBOZrsJfmpAAIixjEbNadgVDbuO9wszDdCAQADAgADdwADNgQ.png)  
![UI 示例图 3](https://pic.areyouok.tech/file/AgACAgUAAyEGAASNGeNOAAIWp2gLZZ_Mh-ozrEt2EZnOvP7EuwfcAAIkxjEbNadgVPNeA-s8l703AQADAgADdwADNgQ.png)
![UI 示例图 4](https://pic.areyouok.tech/file/AgACAgUAAyEGAASNGeNOAAIWqGgLZdEbPgyRStTXjxHU68b6dgXBAAIlxjEbNadgVGT4KxcxppE2AQADAgADdwADNgQ.png)
![UI 示例图 5](https://pic.areyouok.tech/file/AgACAgUAAyEGAASNGeNOAAIWqWgLZk4JT3tNWP4iWyYFawe2luZvAAImxjEbNadgVIXJ-2BqEAq3AQADAgADdwADNgQ.png)

---

## 🈶 中文说明 | Chinese Guide

### ✨ 项目简介

`gpt-ui` 是一个专为 NP 架构站点设计的 UI 美化样式，采用毛玻璃、圆角、阴影、响应式设计，整体风格贴近 macOS 的现代审美。

---

### 🚀 使用方式
有两种使用方式：自签名构建运行和打开safari的开发者功能加载插件。建议第一种。

一、自签名构建：
1. 打开Xcode，登录apple id，创建个人team。
 打开`SafariPTTheme/SafariPTTheme.xcodeproj`；分别选中 `SafariPTTheme` 和`SafariPTThemeExtension` 两个 Target，在「Signing & Capabilities」为它们选择同一个 Apple Development Team。
2. 运行 `SafariPTTheme`，并在 Safari「设置 → 扩展」中启用 `gpt-ui`；
3. 打开扩展设置页，选择 `gpt-ui` 或 `agsv` 主题，再添加 PT 站点域名，例如 `tracker.example.com`；
4. 刷新目标 PT 页面，主题即可生效。

二、 开发者功能加载插件
1. Release下载软件安装，打开运行。
2. safari-设置-高级，勾选显示网页开发者功能。设置-开发者，勾选允许未签名的扩展。

扩展只会对已配置的站点应用主题。macOS Safari 使用本仓库的 App 版，Chrome / Edge / Firefox
使用 [`BrowserPTTheme`](BrowserPTTheme/README.md) 组装出的 Manifest V3 包，三者共用同一套主题代码。

当前构建已按 [savept.icu](https://savept.icu) 的公开收录列表预置域名：抓取日期为 2026-08-06，共 169 个唯一域名，包含列表中的全部收录状态。扩展设置页仍可继续添加或移除域名。

开发检查：

```sh
./Scripts/validate-extension.sh
./Scripts/build-extension.sh
./Scripts/check-version-parity.sh   # 三端版本号是否一致
./Scripts/check-repo-hygiene.sh     # 是否误提交了构建产物
```

域名配置会同步写入 Web Extension 的内容脚本匹配范围和默认域名配置。后续更新收录列表时，可以直接执行：

```sh
./Scripts/configure-domains.sh tracker.example.com
```

该命令会同步更新内容脚本匹配范围和默认域名配置。

---

### 🌐 Chrome / Edge / Firefox 版

Safari 之外的浏览器代码放在 [`BrowserPTTheme/`](BrowserPTTheme/README.md)，只提供各浏览器特有的
manifest、后台脚本与打包脚本，内容脚本、设置页和样式表仍然复用本仓库的同一份文件。

```sh
./BrowserPTTheme/build.sh        # 组装 dist/chrome、dist/firefox 并生成 zip / xpi
./BrowserPTTheme/validate.sh     # 校验清单引用、JS 语法、CSS 括号与版本一致性
```

加载方式：Chrome 在 `chrome://extensions` 开启开发者模式后加载 `BrowserPTTheme/dist/chrome`；
Firefox 在 `about:debugging#/runtime/this-firefox` 临时载入
`BrowserPTTheme/dist/firefox/manifest.json`。要求 Chrome / Edge ≥ 114、Firefox ≥ 121。

---

### 🚢 发布 | Release

版本号只在 `SafariPTTheme/project.yml` 的 `MARKETING_VERSION` 维护，当前为 **1.1**，
三个 manifest 由 `Scripts/check-version-parity.sh` 强制对齐。

打 tag 即可自动发布（`.github/workflows/release.yml`）：

```sh
git tag v1.1 && git push origin v1.1
```

Actions 会在 macOS runner 上依次执行 `Scripts/package-mac-app.sh` 与
`BrowserPTTheme/build.sh`，并把四个安装包上传到该 tag 的 Release：

| 文件 | 用途 |
| --- | --- |
| `gpt-ui-1.1-macOS-arm64.zip` | macOS Safari 应用（解压后拖入「应用程序」） |
| `gpt-ui-1.1-macOS-arm64.dmg` | 同上，带 Applications 快捷方式 |
| `gpt-ui-chrome-1.1.zip` | Chrome / Edge，解压后「加载已解压的扩展程序」 |
| `gpt-ui-firefox-1.1.xpi` | Firefox，正式安装需 AMO 签名 |

macOS 包为 ad-hoc 签名，首次打开请右键 →「打开」绕过 Gatekeeper。
CI 以 `CODE_SIGN_STYLE=Manual`、`CODE_SIGN_IDENTITY=-` 并清空 `DEVELOPMENT_TEAM` 的方式签名，
因此 runner 上不需要登录 Apple ID，也不需要描述文件；本地 Xcode 仍使用 `project.yml` 里的团队 ID。
Pull Request 会跑 `.github/workflows/validate.yml`：版本号、仓库忽略项、浏览器包与 Safari 扩展构建。

---

### 🧹 仓库忽略 | Repo hygiene

`.gitignore` 已覆盖以下类别，`./Scripts/check-repo-hygiene.sh` 会在它们被跟踪时报错：

- 构建产物：`build/`（`DerivedData`、`DerivedDataSigned`、`ReleaseDerivedData`、`Packages` 里的 zip / dmg）
- Xcode 用户状态：`xcuserdata/`、`*.xcuserstate`、`xcschememanagement.plist`
- macOS 元数据：各级目录的 `.DS_Store`、`._*`
- 浏览器包输出：`BrowserPTTheme/dist/`
- 本地状态：`.env`、`*.log`、`.vscode/`、`.idea/`

历史上误提交、现已从索引移除的文件（本地文件保留）：
`build/.DS_Store`、`build/DerivedDataSigned/**/.DS_Store`（3 个）、
`SafariPTTheme.xcodeproj/xcuserdata/**/xcschememanagement.plist`、
`SafariPTTheme.xcodeproj/project.xcworkspace/xcuserdata/**/UserInterfaceState.xcuserstate`。

`SafariPTTheme.xcodeproj` 由 xcodegen 依据 `project.yml` 生成，为了直接打开工程仍保留
`project.pbxproj` 与 `contents.xcworkspacedata`，其余 Xcode 私有状态一律不入库。

---

### ❤️ 鸣谢

- [xiaomlove/nexusphp](https://github.com/xiaomlove/nexusphp) 为本项目提供技术基础支持。

---

## 🧩 许可协议

MIT License © 2025

---
