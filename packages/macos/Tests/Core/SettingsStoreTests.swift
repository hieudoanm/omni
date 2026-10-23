import Foundation
@testable import OmniCore
import Testing

@Suite("SettingsStore")
struct SettingsStoreTests {
    private func makeStore() -> (SettingsStore, URL) {
        let dir = FileManager.default.temporaryDirectory
            .appendingPathComponent("OmniTests/settings-\(UUID().uuidString)")
        let store = SettingsStore(directoryURL: dir)
        return (store, dir)
    }

    @Test("defaults when no file exists")
    func defaults() {
        let (store, dir) = makeStore()
        #expect(store.refreshInterval == 1.0)
        #expect(store.menuBarDisplay == .percentage)
        #expect(store.menuBarMetrics == .standard)
        try? FileManager.default.removeItem(at: dir)
    }

    @Test("modifying settings persists")
    func persist() {
        let (store, dir) = makeStore()
        store.refreshInterval = 5.0
        store.menuBarDisplay = .usedOverTotal
        store.menuBarMetrics = MenuBarMetrics([.memory])
        let loaded = SettingsStore(directoryURL: dir)
        #expect(loaded.refreshInterval == 5.0)
        #expect(loaded.menuBarDisplay == .usedOverTotal)
        #expect(loaded.menuBarMetrics == MenuBarMetrics([.memory]))
        try? FileManager.default.removeItem(at: dir)
    }

    @Test("corrupt settings file falls back to defaults")
    func corruptFile() throws {
        let dir = FileManager.default.temporaryDirectory
            .appendingPathComponent("OmniTests/corrupt-\(UUID().uuidString)")
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        try Data("not json".utf8).write(to: dir.appendingPathComponent("settings.json"))
        let store = SettingsStore(directoryURL: dir)
        #expect(store.refreshInterval == 1.0)
        #expect(store.menuBarDisplay == .percentage)
        #expect(store.menuBarMetrics == .standard)
        try? FileManager.default.removeItem(at: dir)
    }

    @Test("legacy file without menu bar display falls back to percentages")
    func legacyFile() throws {
        let dir = FileManager.default.temporaryDirectory
            .appendingPathComponent("OmniTests/legacy-\(UUID().uuidString)")
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        try Data(#"{"refreshInterval": 2.0}"#.utf8).write(to: dir.appendingPathComponent("settings.json"))
        let store = SettingsStore(directoryURL: dir)
        #expect(store.refreshInterval == 2.0)
        #expect(store.menuBarDisplay == .percentage)
        #expect(store.menuBarMetrics == .standard)
        try? FileManager.default.removeItem(at: dir)
    }
}
