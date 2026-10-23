import SwiftUI

/// Wraps a section's sub-sections in cards that flow into as many columns as
/// the window can fit, so the dashboard uses its width instead of hiding
/// everything behind a picker.
struct SectionGrid<Item: Hashable, Content: View>: View {
    let items: [Item]
    let title: (Item) -> String
    var minimumColumnWidth: CGFloat = 320
    var cardHeight: CGFloat = 320
    @ViewBuilder let content: (Item) -> Content

    var body: some View {
        ScrollView {
            LazyVGrid(
                columns: [GridItem(.adaptive(minimum: minimumColumnWidth), spacing: Spacing.lg)],
                spacing: Spacing.lg
            ) {
                ForEach(items, id: \.self) { item in
                    SectionCard(
                        title: title(item),
                        height: cardHeight,
                        content: { content(item) }
                    )
                }
            }
            .padding(Spacing.lg)
        }
    }
}
