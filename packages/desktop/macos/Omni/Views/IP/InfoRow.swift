import SwiftUI

/// One label/value line in the IP details list.
struct InfoRow: View {
    let label: String
    let value: String?
    var mono = false

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(label.uppercased())
                .font(.caption2)
                .foregroundColor(.secondary)
            Spacer()
            Text(value ?? "—")
                .font(mono ? .system(.caption, design: .monospaced) : .caption)
                .fontWeight(value == nil ? .regular : .medium)
                .foregroundColor(value == nil ? Palette.dimmed : .primary)
                .multilineTextAlignment(.trailing)
                .textSelection(.enabled)
        }
        .padding(.vertical, Spacing.tight)
        .overlay(alignment: .bottom) {
            Divider()
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label), \(value ?? "unavailable")")
    }
}
