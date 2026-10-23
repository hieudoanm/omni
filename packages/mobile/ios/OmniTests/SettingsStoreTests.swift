import Foundation
@testable import Omni
import Testing

@Suite("SettingsStore")
@MainActor
struct SettingsStoreTests {
    private func makeDefaults() -> UserDefaults {
        let suite = "SettingsStoreTests.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suite)!
        defaults.removePersistentDomain(forName: suite)
        return defaults
    }

    @Test("Defaults match Android: autoOpenUrl off, darkMode on")
    func defaults() {
        let store = SettingsStore(defaults: makeDefaults())
        #expect(store.autoOpenUrl == false)
        #expect(store.darkMode == true)
    }

    @Test("Values persist across instances")
    func persistence() {
        let defaults = makeDefaults()
        let store = SettingsStore(defaults: defaults)
        store.autoOpenUrl = true
        store.darkMode = false

        let reloaded = SettingsStore(defaults: defaults)
        #expect(reloaded.autoOpenUrl == true)
        #expect(reloaded.darkMode == false)
    }
}
