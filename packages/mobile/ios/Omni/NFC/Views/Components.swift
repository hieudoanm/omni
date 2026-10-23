import SwiftUI

/// HUD-styled card container.
struct HudCard<Content: View>: View {
    @Environment(\.hud) private var hud

    var padding: CGFloat = 16
    @ViewBuilder var content: () -> Content

    var body: some View {
        content()
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(hud.surface, in: RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(hud.border, lineWidth: 1)
            )
    }
}

/// Label/value row used across NFC detail screens.
struct InfoRow: View {
    @Environment(\.hud) private var hud

    let label: String
    let value: String

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(label)
                .hudBody(14)
                .foregroundStyle(hud.muted)
                .frame(maxWidth: .infinity, alignment: .leading)
            Text(value)
                .hudMono(14)
                .foregroundStyle(hud.text)
                .lineLimit(1)
                .truncationMode(.middle)
        }
        .padding(.vertical, 2)
    }
}
