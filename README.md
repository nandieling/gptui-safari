# 🎨 gpt-ui

原版https://github.com/gangz1o/gptui的移植safari版。
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
