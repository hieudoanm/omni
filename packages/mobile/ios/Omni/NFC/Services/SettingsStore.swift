import Foundation
import Observation

/// User defaults backed settings — mirrors Android's `SettingsDataStore`
/// (keys `auto_open_url` / `dark_mode`, same defaults).
@Observable
@MainActor
final class SettingsStore {
    private enum Keys {
        static let autoOpenUrl = "auto_open_url"
        static let darkMode = "dark_mode"
    }

    private let defaults: UserDefaults

    /// Automatically open URLs when scanning a tag.
    var autoOpenUrl: Bool {
        didSet { defaults.set(autoOpenUrl, forKey: Keys.autoOpenUrl) }
    }

    /// HUD dark theme. Defaults to true, matching Android.
    var darkMode: Bool {
        didSet { defaults.set(darkMode, forKey: Keys.darkMode) }
    }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        autoOpenUrl = defaults.object(forKey: Keys.autoOpenUrl) as? Bool ?? false
        darkMode = defaults.object(forKey: Keys.darkMode) as? Bool ?? true
    }
}
