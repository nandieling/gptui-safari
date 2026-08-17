# 🎨 gpt-ui

为 NP 架构站点打造现代化 UI，优化视觉体验 图标, 布局, 动画, 全新设计
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

你可以通过以下三种方式使用此样式：

#### 📁 方法一：服务器端替换 CSS 文件

1. 登录服务器，前往目录：/项目根目录/public/styles/
2. 复制其中的一个主题文件夹 例如 Classic， 修改为你想要的主题名称
3. 复制本项目的`theme.css`替换其中的 `theme.css` 文件
4. 前往数据库在 `stylesheets` 表新增一条对应记录
5. 重启服务或刷新浏览器即可生效

#### 🌐 方法二：使用浏览器插件 Stylish（推荐）

- Chrome 插件：[点击安装](https://chromewebstore.google.com/detail/stylish-custom-themes-for/fjnbnpbmkenffdnngjfgmeleoegfcffe?hl=zh-CN&utm_source=ext_sidebar)
- Edge 插件：[点击安装](https://microsoftedge.microsoft.com/addons/detail/stylish-custom-themes-f/pibpbbbcgeakmkmhgnllkkjdgpoabdge)

#### 📌 使用步骤：

1. 安装插件后打开 Stylish 页面；
2. 在「Domains」中添加目标站点域名；
3. 粘贴以下 CSS 代码并保存样式：
   👉 [获取 CSS 样式](https://github.com/gangz1o/gptui/blob/master/theme.css)

#### 🖼 插件操作截图：

添加域名：  
![添加域名](https://invites.fun/assets/files/2025-04-02/1743578626-46293-image.png)

粘贴并保存 CSS：  
![粘贴CSS](https://invites.fun/assets/files/2025-04-02/1743578943-415999-image.png)

#### 🧭 方法三：macOS Safari 扩展

本项目已经包含 macOS Safari Web Extension 工程：

1. 使用 Xcode 打开 `SafariPTTheme/SafariPTTheme.xcodeproj`；
2. 运行 `SafariPTTheme`，并在 Safari「设置 → 扩展」中启用 `gpt-ui`；
3. 打开扩展设置页，选择 `gpt-ui` 或 `agsv` 主题，再添加 PT 站点域名，例如 `tracker.example.com`；
4. 刷新目标 PT 页面，主题即可生效。

首次运行前，在 Xcode 中分别选中 `SafariPTTheme` 和 `SafariPTThemeExtension` 两个 Target，在「Signing & Capabilities」为它们选择同一个 Apple Development Team。Safari 扩展必须使用开发签名才能出现在「设置 → 扩展」中；如果暂时没有开发团队，可在 Safari 的 Develop 菜单开启「Allow Unsigned Extensions」进行本地调试。

扩展只会对已配置的站点应用主题，当前版本仅面向 macOS Safari。

当前构建已按 [savept.icu](https://savept.icu) 的公开收录列表预置域名：抓取日期为 2026-08-06，共 169 个唯一域名，包含列表中的全部收录状态。扩展设置页仍可继续添加或移除域名。

开发检查：

```sh
./Scripts/validate-extension.sh
./Scripts/build-extension.sh
```

域名配置会同步写入 Web Extension 的内容脚本匹配范围和默认域名配置。后续更新收录列表时，可以直接执行：

```sh
./Scripts/configure-domains.sh tracker.example.com
```

该命令会同步更新内容脚本匹配范围和默认域名配置。

---

### ❤️ 鸣谢

- [xiaomlove/nexusphp](https://github.com/xiaomlove/nexusphp) 为本项目提供技术基础支持。

---

## 🧩 许可协议

MIT License © 2025

---

## 🌍 English Guide

### ✨ About

`gpt-ui` is a clean and modern stylesheet tailored for NP-based torrent tracker UIs. It brings a modern look with features like glassmorphism, rounded corners, shadows, and clean layout — heavily inspired by macOS design language.

---

### 🚀 How to Use

You can apply the stylesheet in three different ways:

#### 📁 Option 1: Server-side CSS Replacement

1. Log in to the server and go to the directory: /project root directory/public/styles/.
2. Copy one of the theme folders, for example, Classic, and rename it to the theme name you want.
3. Copy the `theme.css` of this project and replace the `theme.css` file in it.
4. Go to the database and add a corresponding record to the `stylesheets` table.
5. Restart the service or refresh the browser to take effect.

#### 🌐 Option 2: Use Stylish Extension (Recommended)

- For Chrome: [Install Stylish](https://chromewebstore.google.com/detail/stylish-custom-themes-for/fjnbnpbmkenffdnngjfgmeleoegfcffe?hl=en)
- For Edge: [Install Stylish](https://microsoftedge.microsoft.com/addons/detail/stylish-custom-themes-f/pibpbbbcgeakmkmhgnllkkjdgpoabdge)

#### 📌 How to Apply:

1. Open Stylish after installation;
2. Add the domain you want to style under the "Domains" section;
3. Paste the CSS code from below and save:
   👉 [Get CSS Stylesheet](https://github.com/gangz1o/gptui/blob/master/theme.css)

#### 🖼 Screenshots:

Add domain:  
![Add Domain](https://invites.fun/assets/files/2025-04-02/1743578626-46293-image.png)

Paste and save CSS:  
![Paste CSS](https://invites.fun/assets/files/2025-04-02/1743578943-415999-image.png)

#### 🧭 Option 3: macOS Safari Extension

This repository also includes a macOS Safari Web Extension project:

1. Open `SafariPTTheme/SafariPTTheme.xcodeproj` in Xcode;
2. Run `SafariPTTheme`, then enable `gpt-ui` in Safari Settings → Extensions;
3. Open the extension settings, choose `gpt-ui` or `agsv`, and add the PT site domain, for example `tracker.example.com`;
4. Reload the target PT page.

Before the first run, select both the `SafariPTTheme` and `SafariPTThemeExtension` targets in Xcode and choose the same Apple Development Team under Signing & Capabilities. Safari requires a development signature before it registers the extension in Settings → Extensions. If no development team is available yet, enable Allow Unsigned Extensions from Safari's Develop menu for local testing.

The extension only styles configured sites, and this version targets macOS Safari only.

The current build is preconfigured from the public site list at [savept.icu](https://savept.icu): fetched on 2026-08-06, with 169 unique domains. All listed entries were included regardless of their online/offline status. More domains can still be added or removed from the extension settings.

Development checks:

```sh
./Scripts/validate-extension.sh
./Scripts/build-extension.sh
```

The domain configuration is synchronized across the Web Extension content-script matches and default domain configuration. To update it later, run:

```sh
./Scripts/configure-domains.sh tracker.example.com
```

This updates the content-script matches and default domain configuration together.

---

### ❤️ Credits

- Based on [xiaomlove/nexusphp](https://github.com/xiaomlove/nexusphp)

---

## 🧩 License

MIT License © 2025
