import Foundation
@testable import OmniCore
import Testing

@Suite("WorkspaceStore")
struct WorkspaceStoreTests {
    private func makeStore() throws -> WorkspaceStore {
        let directory = FileManager.default.temporaryDirectory
            .appendingPathComponent("OmniTests-WorkspaceStore-\(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        return WorkspaceStore(directoryURL: directory)
    }

    private func makeWorkspace(name: String, windowCount: Int = 1) -> Workspace {
        let window = WorkspaceWindow(
            bundleIdentifier: "com.apple.Terminal",
            zone: NormalizedRect(x: 0, y: 0, width: 0.5, height: 1)
        )
        let timestamp = Date(timeIntervalSince1970: 1_700_000_000)
        return Workspace(
            name: name,
            windows: Array(repeating: window, count: windowCount),
            createdAt: timestamp,
            updatedAt: timestamp
        )
    }

    @Test("returns empty when no file exists")
    func emptyWhenMissingFile() throws {
        let store = try makeStore()
        #expect(store.workspaces.isEmpty)
    }

    @Test("saves a workspace and loads it back")
    func saveLoad() throws {
        let store = try makeStore()
        let workspace = makeWorkspace(name: "Dev")
        store.save(workspace)
        #expect(store.workspaces == [workspace])
    }

    @Test("accumulates multiple saves")
    func multipleSaves() throws {
        let store = try makeStore()
        store.save(makeWorkspace(name: "Dev"))
        store.save(makeWorkspace(name: "Research"))
        #expect(store.workspaces.map(\.name).sorted() == ["Dev", "Research"])
    }

    @Test("updates a workspace in place by id")
    func updateByID() throws {
        let store = try makeStore()
        var workspace = makeWorkspace(name: "Dev")
        store.save(workspace)
        workspace.name = "Prod"
        store.update(workspace)
        #expect(store.workspaces == [workspace])
    }

    @Test("does not add a duplicate on update")
    func updateDoesNotDuplicate() throws {
        let store = try makeStore()
        let workspace = makeWorkspace(name: "Dev")
        store.save(workspace)
        store.update(workspace)
        #expect(store.workspaces.count == 1)
    }

    @Test("deletes a workspace by id")
    func deleteByID() throws {
        let store = try makeStore()
        let first = makeWorkspace(name: "Dev")
        let second = makeWorkspace(name: "Research")
        store.save(first)
        store.save(second)
        store.deleteWorkspace(id: first.id)
        #expect(store.workspaces == [second])
    }

    @Test("persists across store instances sharing a directory")
    func persistsAcrossInstances() throws {
        let directory = FileManager.default.temporaryDirectory
            .appendingPathComponent("OmniTests-WorkspaceStore-\(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: directory) }

        let store = WorkspaceStore(directoryURL: directory)
        let workspace = makeWorkspace(name: "Dev")
        store.save(workspace)

        let reloaded = WorkspaceStore(directoryURL: directory)
        #expect(reloaded.workspaces == [workspace])
    }
}
