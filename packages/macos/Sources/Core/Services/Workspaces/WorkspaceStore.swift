import Foundation

/// JSON persistence for saved workspaces.
public final class WorkspaceStore: WorkspaceStoring {
    public static let shared = WorkspaceStore()

    private let fileName = "workspaces.json"
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()
    private let directoryURL: URL

    public init(directoryURL: URL? = nil) {
        self.directoryURL = directoryURL
            ?? FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
            .appendingPathComponent("Workspaces")
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        decoder.dateDecodingStrategy = .iso8601
    }

    public var workspaces: [Workspace] {
        load()
    }

    public func save(_ workspace: Workspace) {
        var all = load()
        all.append(workspace)
        persist(all)
    }

    public func update(_ workspace: Workspace) {
        var all = load()
        if let index = all.firstIndex(where: { $0.id == workspace.id }) {
            all[index] = workspace
            persist(all)
        }
    }

    public func deleteWorkspace(id: UUID) {
        persist(load().filter { $0.id != id })
    }

    private func load() -> [Workspace] {
        guard let data = try? Data(contentsOf: fileURL),
              let decoded = try? decoder.decode([Workspace].self, from: data)
        else {
            return []
        }
        return decoded
    }

    private func persist(_ workspaces: [Workspace]) {
        ensureDirectoryExists()
        guard let data = try? encoder.encode(workspaces) else { return }
        try? data.write(to: fileURL, options: .atomic)
    }

    private func ensureDirectoryExists() {
        try? FileManager.default.createDirectory(
            at: fileURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
    }

    private var fileURL: URL {
        directoryURL.appendingPathComponent(fileName)
    }
}
