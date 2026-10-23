import CoreGraphics

/// The app's spacing scale: every gap, inset and control spacing comes from
/// here.
///
/// The scale is a 4pt grid. `compact` (10) and `inset` (14) are the two
/// deliberate off-grid steps — they match the insets macOS uses on its own
/// capsule controls and section content, so the app sits correctly next to
/// system UI instead of near it.
///
/// Rule: never write a raw number in `padding`, `spacing:` or a `frame`
/// inset. If a value is missing here, the scale is wrong, not the view.
enum Spacing {
    /// A label stacked directly on its value.
    static let hairline: CGFloat = 2
    /// An icon against its label.
    static let iconGap: CGFloat = 3
    /// Badge insets and label-to-value pairs that want air but not a block.
    static let tight: CGFloat = 5
    /// Between a label and its value, and between tightly related lines.
    static let xxs: CGFloat = 4
    /// Inside a capsule control, between an icon and its label.
    static let xs: CGFloat = 6
    /// Between related rows and list items.
    static let sm: CGFloat = 8
    /// System capsule inset.
    static let compact: CGFloat = 10
    /// Between blocks inside a panel, and card gutters.
    static let md: CGFloat = 12
    /// Panel section inset.
    static let inset: CGFloat = 14
    /// Card padding and the gap between window cards.
    static let lg: CGFloat = 16
    /// Between a card's header and its content.
    static let xl: CGFloat = 20
    /// Between groups on a screen.
    static let xxl: CGFloat = 24
    /// Horizontal inset of a window screen.
    static let xxxl: CGFloat = 28
    /// Around an empty state.
    static let huge: CGFloat = 40
    /// The gap that groups a screen's blocks: between the head and the body of
    /// a vertically stacked screen.
    static let section: CGFloat = 18
    /// The deepest inset: empty-state padding inside a card.
    static let giant: CGFloat = 48
}
