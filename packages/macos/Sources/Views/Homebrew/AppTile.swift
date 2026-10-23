import AppKit
import OmniCore
import SwiftUI

/// A large icon tile used by the Applications grid layout.
struct AppTile: View {
    let app: InstalledApp

    var body: some View {
        VStack(spacing: Spacing.sm) {
            Image(nsImage: icon)
                .resizable()
                .frame(width: 56, height: 56)
                .accessibilityHidden(true)

            VStack(spacing: Spacing.iconGap) {
                Text(app.name)
                    .font(.caption.weight(.semibold))
                    .lineLimit(1)
                    .truncationMode(.tail)
                    .multilineTextAlignment(.center)

                if let token = app.caskToken {
                    Text(verbatim: token)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: Radius.large)
                .fill(Palette.quietFill)
        )
        .contentShape(RoundedRectangle(cornerRadius: Radius.large))
    }

    private var icon: NSImage {
        NSWorkspace.shared.icon(forFile: app.path)
    }
}
