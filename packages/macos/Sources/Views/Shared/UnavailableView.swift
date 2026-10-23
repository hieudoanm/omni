import SwiftUI

struct UnavailableView: View {
    let title: String

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.tight) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            HStack(spacing: Spacing.tight) {
                Image(systemName: "exclamationmark.triangle")
                    .font(.caption2)
                Text("Unable to read")
                    .font(.caption)
            }
            .foregroundColor(.secondary)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(title) unavailable, unable to read")
    }
}
