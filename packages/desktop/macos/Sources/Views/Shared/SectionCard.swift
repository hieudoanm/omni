import SwiftUI

/// A titled card used by the dashboard window to lay sub-sections out side by
/// side. The fill and stroke use `Color.primary` opacity so the card adapts to
/// Light Mode, Dark Mode, and increased transparency without hard-coded colors.
///
/// The height is fixed rather than flexible so a card that contains its own
/// scrolling list gets a definite height to scroll inside.
struct SectionCard<Content: View>: View {
    let title: String
    var systemImage: String?
    var height: CGFloat = SurfaceMetrics.cardHeight
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            header

            content
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .padding(SurfaceMetrics.cardPadding)
        .frame(maxWidth: .infinity)
        .frame(height: height, alignment: .top)
        .background(
            RoundedRectangle(cornerRadius: Radius.large, style: .continuous)
                .fill(Palette.cardFill)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Radius.large, style: .continuous)
                .stroke(Palette.controlFill, lineWidth: 1)
        )
    }

    private var header: some View {
        HStack(spacing: Spacing.xs) {
            if let systemImage {
                Image(systemName: systemImage)
                    .foregroundColor(.secondary)
                    .accessibilityHidden(true)
            }
            Text(title)
                .font(.headline)
        }
        .accessibilityElement(children: .combine)
    }
}
