import SwiftUI

/// The app's colour vocabulary.
///
/// Everything is a semantic system colour at a fixed opacity, so the whole app
/// adapts to Light Mode, Dark Mode, and increased transparency without a single
/// hard-coded colour. Feature colours (clock hands, threshold colours, SF Symbol
/// tints) stay local to the feature that owns them — see
/// `Docs/DESIGN-SYSTEM.md` for which is which.
enum Palette {
    /// The card background on top of the window.
    static let cardFill = Color.primary.opacity(0.04)

    /// An unselected control: chips, buttons, rows.
    static let controlFill = Color.primary.opacity(0.08)

    /// The unfilled part of a progress or countdown ring.
    static let track = Color.primary.opacity(0.12)

    /// Hairlines, card outlines, ring strokes.
    static let stroke = Color.primary.opacity(0.15)

    /// Secondary text that needs to recede — a placeholder, a missing value.
    static let dimmed = Color.secondary.opacity(0.4)

    /// A value that stays legible but no longer leads: secondary clock hands.
    static let muted = Color.primary.opacity(0.6)

    /// The lead value of a screen that also has secondary values: the minutes
    /// of a digital face.
    static let lead = Color.primary.opacity(0.8)

    /// The pin in the middle of an analog face.
    static let pin = Color.primary.opacity(0.2)

    /// The element that recedes furthest: the second hand that chases the other
    /// two.
    static let faint = Color.primary.opacity(0.4)

    /// A shadow. Black at 15% keeps the shadow visible in Light Mode without
    /// turning into a smudge in Dark Mode, where nothing else darkens.
    static let shadow = Color.black.opacity(0.15)

    /// A receding fill for a tile that carries no state of its own.
    static let quietFill = Color(nsColor: .quaternaryLabelColor).opacity(0.4)

    /// A receding label: a unit, a weather line.
    static let quietText = Color.secondary.opacity(0.6)

    /// A tinted background behind a badge, 15% so the tint reads as a wash and
    /// the label keeps contrast in both appearances.
    static func tint(_ color: Color) -> Color {
        color.opacity(0.15)
    }
}
