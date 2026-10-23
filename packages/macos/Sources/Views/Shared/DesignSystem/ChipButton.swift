import SwiftUI

/// A capsule chip: a short set of choices where the chosen one fills with the
/// accent colour.
///
/// Used for clock presets, the watchface picker, and anything else that picks
/// one of a few known options. A chip that filters a list is not a chip — that
/// is a filter picker, which stays a segmented control.
struct ChipButton: View {
    let title: String
    let isSelected: Bool
    var accessibilityLabel: String?
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(.caption, design: .monospaced))
                .tracking(2)
                .padding(.horizontal, Spacing.xl)
                .padding(.vertical, Spacing.xs)
                .background(isSelected ? Color.accentColor : Palette.controlFill, in: Capsule())
                .foregroundColor(isSelected ? .white : .primary)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(accessibilityLabel ?? title)
        .accessibilityAddTraits(isSelected ? [.isSelected] : [])
    }
}
