import AppKit
import OmniCore
import SwiftUI

/// A row that shows a locally installed app with its icon, metadata, and
/// source-of-truth hint (Homebrew cask).
struct BrewAppRow: View {
    let app: InstalledApp

    var body: some View {
        HStack(spacing: Spacing.md) {
            Image(nsImage: icon)
                .resizable()
                .frame(width: 28, height: 28)
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: Spacing.hairline) {
                HStack(spacing: Spacing.xs) {
                    Text(app.name)
                        .font(.headline)
                    if let token = app.caskToken {
                        Text(verbatim: "Homebrew cask · \(token)")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }

            Spacer()

            if let version = app.version {
                Text(version)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, Spacing.hairline)
    }

    private var icon: NSImage {
        NSWorkspace.shared.icon(forFile: app.path)
    }

    private var subtitle: String {
        let path = URL(fileURLWithPath: app.path)
            .deletingLastPathComponent()
            .path
        if let identifier = app.bundleIdentifier {
            return "\(path) · \(identifier)"
        }
        return path
    }
}
