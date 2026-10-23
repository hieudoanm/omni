import OmniCore
import SwiftUI

struct AppRow: View {
    let app: RunningAppInfo
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack(spacing: Spacing.md) {
                appIcon

                VStack(alignment: .leading, spacing: Spacing.hairline) {
                    Text(app.name)
                        .font(.callout)
                        .foregroundColor(.primary)
                        .lineLimit(1)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }

                Spacer()

                if app.windowCount > 0 {
                    Label("\(app.windowCount)", systemImage: "macwindow")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            .padding(.vertical, Spacing.xs)
            .padding(.horizontal, Spacing.compact)
        }
        .buttonStyle(.plain)
        .help("Bring all of \(app.name)'s windows to the front")
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(app.name), \(app.windowCount) windows")
        .accessibilityHint("Brings all windows to the front")
    }

    private var appIcon: some View {
        Group {
            if let icon = app.icon {
                Image(nsImage: icon)
                    .resizable()
            } else {
                Image(systemName: "app.dashed")
                    .foregroundColor(.secondary)
            }
        }
        .frame(width: 20, height: 20)
    }

    private var subtitle: String {
        app.bundleIdentifier ?? "PID \(app.pid)"
    }
}
