import SwiftUI

struct ContentView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("gpt-ui")
                        .font(.system(size: 28, weight: .semibold, design: .rounded))

                    Text("macOS Safari 的 PT 站点主题扩展")
                        .font(.title3.weight(.medium))

                    Text("请先完成下面任意一种加载方式，再在 Safari 的扩展设置页启用 gpt-ui，并配置需要应用主题的站点域名。")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)

                    Label("主题资源本地加载，不依赖远程字体或第三方脚本", systemImage: "checkmark.shield")
                        .font(.callout)
                        .foregroundStyle(.green)
                }

                GuideSection(
                    title: "方案一：Xcode 本机签名",
                    subtitle: "推荐长期使用。需要登录 Xcode 的 Apple ID，免费个人开发团队也可以用于本机运行。",
                    systemImage: "signature"
                ) {
                    GuideStep(
                        number: 1,
                        title: "打开 Xcode 工程",
                        detail: "打开 SafariPTTheme/SafariPTTheme.xcodeproj，然后在项目导航器中选择 SafariPTTheme。"
                    )
                    GuideStep(
                        number: 2,
                        title: "给两个 Target 选择同一团队",
                        detail: "在 Signing & Capabilities 中分别选中 SafariPTTheme 和 SafariPTThemeExtension，Team 选择同一个 Apple Development Team。若列表为空，先在 Xcode Settings > Accounts 登录 Apple ID。"
                    )
                    GuideStep(
                        number: 3,
                        title: "运行宿主 App",
                        detail: "选择 SafariPTTheme Scheme 和 My Mac，点击 Run。运行成功后打开 Safari > 设置 > 扩展，勾选 gpt-ui 并允许其访问目标网站。"
                    )
                    GuideStep(
                        number: 4,
                        title: "配置主题和站点",
                        detail: "打开 gpt-ui 的扩展设置页，选择 gpt-ui 或 agsv 主题，添加 PT 站点域名，回到目标页面刷新即可。"
                    )
                }

                GuideSection(
                    title: "方案二：Safari 开发者模式加载",
                    subtitle: "适合没有开发团队或临时调试未签名扩展。Safari 重启后通常需要重新允许。",
                    systemImage: "hammer"
                ) {
                    GuideStep(
                        number: 1,
                        title: "显示 Safari 开发菜单",
                        detail: "在 Safari > 设置 > 高级中打开“在菜单栏中显示‘开发’菜单”或“显示网页开发者功能”。"
                    )
                    GuideStep(
                        number: 2,
                        title: "允许未签名扩展",
                        detail: "在菜单栏打开 开发 > 允许未签名的扩展（Develop > Allow Unsigned Extensions）。Safari 重新启动后，请再次检查此项。"
                    )
                    GuideStep(
                        number: 3,
                        title: "用 Xcode 构建并加载",
                        detail: "回到 Xcode 构建或运行 SafariPTTheme 工程；然后在 Safari > 设置 > 扩展中启用 gpt-ui。此模式只放宽 Safari 的加载检查，仍需先生成扩展。"
                    )
                    GuideStep(
                        number: 4,
                        title: "刷新页面验证",
                        detail: "在扩展设置页选择主题并添加域名，打开目标 PT 页面后刷新。调试完成后建议关闭允许未签名扩展。"
                    )
                }

                Text("提示：扩展只会对已配置的站点应用主题，当前版本面向 macOS Safari。")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(28)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(minWidth: 520, idealWidth: 560, minHeight: 650, idealHeight: 760)
    }
}

private struct GuideSection<Content: View>: View {
    let title: String
    let subtitle: String
    let systemImage: String
    let content: Content

    init(
        title: String,
        subtitle: String,
        systemImage: String,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.title = title
        self.subtitle = subtitle
        self.systemImage = systemImage
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label(title, systemImage: systemImage)
                .font(.headline)

            Text(subtitle)
                .font(.callout)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            VStack(alignment: .leading, spacing: 8) {
                content
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.quaternary.opacity(0.45), in: RoundedRectangle(cornerRadius: 12))
    }
}

private struct GuideStep: View {
    let number: Int
    let title: String
    let detail: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text(String(number))
                .font(.caption.weight(.bold))
                .foregroundStyle(.white)
                .frame(width: 24, height: 24)
                .background(Color.accentColor, in: Circle())

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.callout.weight(.semibold))

                Text(detail)
                    .font(.callout)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
