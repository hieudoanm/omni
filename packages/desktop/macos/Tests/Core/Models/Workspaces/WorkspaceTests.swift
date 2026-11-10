import Foundation
@testable import OmniCore
import Testing

@Suite("Workspace")
struct WorkspaceTests {
    @Test("init applies name with empty windows and default timestamps")
    func initDefaults() {
        let workspace = Workspace(name: "Dev")
        #expect(workspace.name == "Dev")
        #expect(workspace.windows.isEmpty)
        #expect(workspace.appCount == 0)
    }

    @Test("init accepts windows and explicit timestamps")
    func initCustom() {
        let window = WorkspaceWindow(
            bundleIdentifier: "com.apple.Terminal",
            zone: NormalizedRect(x: 0, y: 0, width: 0.5, height: 1)
        )
        let created = Date(timeIntervalSince1970: 1_700_000_000)
        let updated = Date(timeIntervalSince1970: 1_700_000_100)
        let workspace = Workspace(
            name: "Research",
            windows: [window],
            createdAt: created,
            updatedAt: updated
        )
        #expect(workspace.windows == [window])
        #expect(workspace.createdAt == created)
        #expect(workspace.updatedAt == updated)
    }

    @Test("update mutates and bumps updatedAt but not createdAt")
    func updateBumpsTimestamp() {
        let created = Date(timeIntervalSince1970: 1_700_000_000)
        var workspace = Workspace(name: "Dev", createdAt: created, updatedAt: created)
        workspace.update { $0.name = "Prod" }
        #expect(workspace.name == "Prod")
        #expect(workspace.createdAt == created)
        #expect(workspace.updatedAt > created)
    }

    @Test("counts distinct applications")
    func appCountCountsDistinctApplications() {
        let terminal = WorkspaceWindow(
            bundleIdentifier: "com.apple.Terminal",
            zone: NormalizedRect(x: 0, y: 0, width: 0.5, height: 1)
        )
        let safari = WorkspaceWindow(
            bundleIdentifier: "com.apple.Safari",
            zone: NormalizedRect(x: 0.5, y: 0, width: 0.5, height: 1)
        )
        let workspace = Workspace(name: "Dev", windows: [terminal, terminal, safari])
        #expect(workspace.appCount == 2)
    }

    @Test("Codable roundtrip preserves all fields")
    func codableRoundtrip() throws {
        let window = WorkspaceWindow(
            bundleIdentifier: "com.apple.Safari",
            screenID: 42,
            zone: NormalizedRect(x: 0.1, y: 0.2, width: 0.5, height: 0.5)
        )
        let workspace = Workspace(
            name: "Research",
            windows: [window],
            createdAt: Date(timeIntervalSince1970: 1_700_000_000),
            updatedAt: Date(timeIntervalSince1970: 1_700_000_100)
        )
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let data = try encoder.encode(workspace)
        let decoded = try decoder.decode(Workspace.self, from: data)
        #expect(decoded == workspace)
        #expect(decoded.id == workspace.id)
        #expect(decoded.windows == workspace.windows)
    }
}
