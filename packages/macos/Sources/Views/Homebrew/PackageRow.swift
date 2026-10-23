import OmniCore
import SwiftUI

/// A list row that shows a Formula/Cask with its type, description, and status.
struct PackageRow: View {
    let package: Package

    var body: some View {
        HStack(spacing: Spacing.md) {
            Image(systemName: symbolName)
                .symbolRenderingMode(.hierarchical)
                .font(.title3)
                .foregroundStyle(.secondary)
                .frame(width: 24)
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: Spacing.hairline) {
                HStack(spacing: Spacing.xs) {
                    Text(package.name)
                        .font(.headline)
                    Text(typeLabel)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                if !package.description.isEmpty {
                    Text(package.description)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            if let statusText = statusText {
                Text(statusText)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, Spacing.hairline)
    }

    private var symbolName: String {
        package.type == .formula ? "terminal" : "app.dashed"
    }

    private var typeLabel: String {
        package.type == .formula ? "Formula" : "Cask"
    }

    private var statusText: String? {
        switch package.status {
        case .installed:
            return package.installedVersion ?? "Installed"
        case .outdated:
            return package.installedVersion ?? "Outdated"
        case .notInstalled:
            return nil
        }
    }
}
