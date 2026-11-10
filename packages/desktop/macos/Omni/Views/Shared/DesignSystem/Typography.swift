import SwiftUI

/// Type sizes the macOS semantic styles cannot express.
///
/// Prose, labels and captions use the system styles directly — `.headline` for
/// a card or screen title, `.subheadline` for a value, `.caption` and
/// `.caption2` for supporting text. Those are already the system of record and
/// wrapping them in a token only adds indirection.
///
/// What lives here is the other half: display numerals and the marks an empty
/// state is built from, where an arbitrary point size needs a single owner.
enum Typography {
    /// The icon in an empty state.
    static let emptyStateIcon = Font.system(size: 28, weight: .regular)

    /// A screen-sized mark, used once when the whole section is unavailable.
    static let emptyStateIconLarge = Font.system(size: 48, weight: .regular)

    /// The headline of an empty state.
    static let emptyStateTitle = Font.system(size: 44, weight: .regular)

    /// A single number that is the point of its tile, e.g. battery percentage.
    static let percentage = Font.system(size: 30, weight: .semibold)

    /// The ceiling for a clock readout. Faces scale between their ring's size
    /// and this, so a face never overflows its ring.
    static let readoutCap: CGFloat = 40

    /// The face that only digits can carry: hours, minutes, seconds.
    static let digitalReadout = Font.system(size: 52, weight: .regular, design: .monospaced)

    /// Stopwatch and timer digits when the ring sets the scale.
    static let ringReadout = Font.system(size: 40, weight: .regular, design: .monospaced)
}
