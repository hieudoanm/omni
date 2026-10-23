import SwiftUI

/// HUD typography — Orbitron for display/title/label roles, DM Mono for body,
/// matching the web baseline and the Android `HudTypography`.
enum HudFont {
    /// Orbitron variable-font named instances exposed by `orbitron.ttf`.
    static func orbitron(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        let name: String
        switch weight {
        case .black: name = "Orbitron-Black"
        case .heavy: name = "Orbitron-ExtraBold"
        case .bold: name = "Orbitron-Bold"
        case .semibold: name = "Orbitron-SemiBold"
        case .medium: name = "Orbitron-Medium"
        default: name = "Orbitron-Regular"
        }
        return .custom(name, size: size)
    }

    static func mono(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom(weight == .medium ? "DMMono-Medium" : "DMMono-Regular", size: size)
    }
}

extension View {
    /// Orbitron display/title role.
    func hudTitle(_ size: CGFloat = 32, weight: Font.Weight = .bold) -> some View {
        font(HudFont.orbitron(size, weight: weight))
    }

    /// Orbitron label role.
    func hudLabel(_ size: CGFloat = 14, weight: Font.Weight = .bold) -> some View {
        font(HudFont.orbitron(size, weight: weight))
    }

    /// DM Mono body role.
    func hudBody(_ size: CGFloat = 14) -> some View {
        font(HudFont.mono(size))
    }

    /// DM Mono small/caption role.
    func hudCaption(_ size: CGFloat = 12) -> some View {
        font(HudFont.mono(size))
    }

    /// DM Mono in a fixed-pitch style for UID/hex values.
    func hudMono(_ size: CGFloat = 14) -> some View {
        font(HudFont.mono(size))
    }
}
