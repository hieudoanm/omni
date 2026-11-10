import Foundation
@testable import OmniCore
import Testing

@Suite("WorkspaceWindow")
struct WorkspaceWindowTests {
    @Test("init applies bundle identifier and zone with optional defaults")
    func initDefaults() {
        let zone = NormalizedRect(x: 0, y: 0, width: 1, height: 1)
        let window = WorkspaceWindow(bundleIdentifier: "com.apple.Terminal", zone: zone)
        #expect(window.bundleIdentifier == "com.apple.Terminal")
        #expect(window.title == nil)
        #expect(window.screenID == nil)
        #expect(window.zone == zone)
    }

    @Test("init accepts title and screen id")
    func initCustom() {
        let window = WorkspaceWindow(
            bundleIdentifier: "com.apple.Safari",
            title: "Untitled",
            screenID: 7,
            zone: NormalizedRect(x: 0.5, y: 0, width: 0.5, height: 1)
        )
        #expect(window.title == "Untitled")
        #expect(window.screenID == 7)
    }

    @Test("Codable roundtrip preserves title and screen id")
    func codableRoundtripWithOptionalValues() throws {
        let window = WorkspaceWindow(
            bundleIdentifier: "com.apple.Safari",
            title: "Research",
            screenID: 9,
            zone: NormalizedRect(x: 0.25, y: 0.25, width: 0.5, height: 0.5)
        )
        let data = try JSONEncoder().encode(window)
        let decoded = try JSONDecoder().decode(WorkspaceWindow.self, from: data)
        #expect(decoded == window)
    }

    @Test("Codable roundtrip tolerates missing title and screen id")
    func codableRoundtripWithNilOptionals() throws {
        let window = WorkspaceWindow(
            bundleIdentifier: "com.apple.Terminal",
            zone: NormalizedRect(x: 0, y: 0, width: 1, height: 1)
        )
        let data = try JSONEncoder().encode(window)
        let decoded = try JSONDecoder().decode(WorkspaceWindow.self, from: data)
        #expect(decoded.title == nil)
        #expect(decoded.screenID == nil)
        #expect(decoded == window)
    }
}
