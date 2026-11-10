import SwiftUI

/// Omni HUD palette — baseline: `packages/web` (dark sci-fi interface).
/// Mirrors the Android `ui/theme/Color.kt` values exactly.
struct HudPalette: Sendable {
    var background: Color
    var surface: Color
    var surfaceVariant: Color
    var border: Color
    var primary: Color
    var primaryDim: Color
    var secondary: Color
    var text: Color
    var muted: Color

    static let dark = HudPalette(
        background: Color(hex: 0x020813),
        surface: Color(hex: 0x0A1424),
        surfaceVariant: Color(hex: 0x0F1E33),
        border: Color(hex: 0x14304A),
        primary: Color(hex: 0x16DFFF),
        primaryDim: Color(hex: 0x008CFF),
        secondary: Color(hex: 0x8AFAFF),
        text: Color(hex: 0xEDEDED),
        muted: Color(hex: 0x7D93AD)
    )

    static let light = HudPalette(
        background: Color(hex: 0xF2F7FB),
        surface: Color(hex: 0xFFFFFF),
        surfaceVariant: Color(hex: 0xE8F0F8),
        border: Color(hex: 0xC4D8EC),
        primary: Color(hex: 0x008CFF),
        primaryDim: Color(hex: 0x008CFF),
        secondary: Color(hex: 0x0090C8),
        text: Color(hex: 0x0B1526),
        muted: Color(hex: 0x4A5D75)
    )
}

extension Color {
    init(hex: UInt32) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: 1
        )
    }
}

private struct HudPaletteKey: EnvironmentKey {
    static let defaultValue = HudPalette.dark
}

extension EnvironmentValues {
    var hud: HudPalette {
        get { self[HudPaletteKey.self] }
        set { self[HudPaletteKey.self] = newValue }
    }
}
