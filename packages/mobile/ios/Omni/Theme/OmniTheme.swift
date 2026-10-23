import SwiftUI

/// Applies the HUD palette resolved from the current color scheme.
/// Pair with `.preferredColorScheme` driven by `SettingsStore.darkMode`.
struct OmniTheme: ViewModifier {
    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        content
            .environment(\.hud, colorScheme == .dark ? .dark : .light)
            .foregroundStyle(hud.text)
    }

    private var hud: HudPalette {
        colorScheme == .dark ? .dark : .light
    }
}

extension View {
    func omniTheme() -> some View {
        modifier(OmniTheme())
    }
}
