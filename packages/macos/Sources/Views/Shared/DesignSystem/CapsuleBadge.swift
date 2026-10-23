import SwiftUI

/// A capsule badge: a short, non-interactive label on a wash of its own tint.
///
/// Badges state something — a provider, a phase, the current preset. If it can
/// be pressed it is a `ChipButton`.
struct CapsuleBadge: View {
    let text: String
    var font: Font = .caption2
    var tint: Color = .accentColor
    var labelColor: Color = .accentColor

    var body: some View {
        Text(text)
            .font(font)
            .tracking(2)
            .padding(.horizontal, Spacing.md)
            .padding(.vertical, Spacing.xxs)
            .background(Palette.tint(tint), in: Capsule())
            .foregroundColor(labelColor)
    }
}
