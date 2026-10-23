import Combine
import Foundation

public final class ClipboardStore: ObservableObject {
    @Published public var items: [ClipboardItem] = []

    /// Maximum retained history items. 0 means unlimited.
    public var maxItems: Int = 0

    private let storageURL: URL
    private let saveQueue = DispatchQueue(label: "io.github.hieudoanm.Omni.clipboard-save")
    private var pendingSaveWork: DispatchWorkItem?

    private static let saveDebounceInterval: TimeInterval = 0.15

    public init(directoryURL: URL? = nil) {
        let dir: URL
        if let d = directoryURL {
            dir = d
        } else {
            let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
            dir = appSupport.appendingPathComponent("Clipper", isDirectory: true)
        }
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        storageURL = dir.appendingPathComponent("clipboard.json")
        load()
    }

    public var totalCount: Int {
        items.count
    }

    public var pinnedCount: Int {
        items.filter(\.pinned).count
    }

    public var textCount: Int {
        items.filter { $0.contentType == .text }.count
    }

    public func add(_ content: String, type: ClipboardItem.ContentType = .text) {
        guard !content.isEmpty else { return }
        if let idx = items.firstIndex(where: { $0.content == content }) {
            items[idx].copiedCount += 1
            let item = items.remove(at: idx)
            items.insert(item, at: 0)
        } else {
            let item = ClipboardItem(content: content, contentType: type)
            items.insert(item, at: 0)
        }
        if maxItems > 0, items.count > maxItems {
            items.removeLast(items.count - maxItems)
        }
        save()
    }

    public func delete(_ item: ClipboardItem) {
        items.removeAll { $0.id == item.id }
        save()
    }

    public func togglePin(_ item: ClipboardItem) {
        if let idx = items.firstIndex(where: { $0.id == item.id }) {
            items[idx].pinned.toggle()
            save()
        }
    }

    public func clearUnpinned() {
        items.removeAll { !$0.pinned }
        save()
    }

    public func search(_ query: String) -> [ClipboardItem] {
        guard !query.isEmpty else { return items }
        return items.filter { $0.content.localizedCaseInsensitiveContains(query) }
    }

    /// Persists the current history asynchronously. Calls are coalesced so a
    /// burst of edits performs a single write of the latest state, and the
    /// (potentially large) JSON encode never blocks the main thread.
    private func save() {
        let snapshot = items
        let targetURL = storageURL
        pendingSaveWork?.cancel()
        let workItem = DispatchWorkItem {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            guard let data = try? encoder.encode(snapshot) else { return }
            try? data.write(to: targetURL, options: .atomic)
        }
        pendingSaveWork = workItem
        saveQueue.asyncAfter(deadline: .now() + Self.saveDebounceInterval, execute: workItem)
    }

    /// Writes any pending state synchronously; used on teardown so a debounced
    /// save is not lost when the app exits.
    public func flushPendingSave() {
        pendingSaveWork?.cancel()
        pendingSaveWork = nil
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        guard let data = try? encoder.encode(items) else { return }
        try? data.write(to: storageURL, options: .atomic)
    }

    private func load() {
        guard let data = try? Data(contentsOf: storageURL) else { return }
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        items = (try? decoder.decode([ClipboardItem].self, from: data)) ?? []
    }

    deinit {
        flushPendingSave()
    }
}
