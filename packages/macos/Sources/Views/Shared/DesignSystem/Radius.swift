import CoreGraphics

/// Corner radii. Every surface in the app is either a card (`large`), a control
/// or a badge (`medium`), or a hairline detail (`small`).
enum Radius {
    /// Small details: dots, slivers.
    static let small: CGFloat = 6
    /// Controls and badges.
    static let medium: CGFloat = 8
    /// Cards.
    static let large: CGFloat = 10
}
