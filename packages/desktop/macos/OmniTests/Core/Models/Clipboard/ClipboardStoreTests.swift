import Foundation
@testable import OmniCore
import Testing

@Suite("ClipboardStore")
struct ClipboardStoreTests {
    private func makeStore() -> (ClipboardStore, URL) {
        let dir = FileManager.default.temporaryDirectory
            .appendingPathComponent("ClipperTests/\(UUID().uuidString)")
        let store = ClipboardStore(directoryURL: dir)
        return (store, dir)
    }

    @Test("empty store")
    func empty() {
        let (store, dir) = makeStore()
        #expect(store.totalCount == 0)
        #expect(store.pinnedCount == 0)
        #expect(store.textCount == 0)
        try? FileManager.default.removeItem(at: dir)
    }

    @Test("add item")
    func addItem() {
        let (store, dir) = makeStore()
        store.add("hello")
        #expect(store.totalCount == 1)
        #expect(store.items[0].content == "hello")
        try? FileManager.default.removeItem(at: dir)
    }

    @Test("add ignores empty content")
    func addEmpty() {
        let (store, dir) = makeStore()
        store.add("")
        #expect(store.totalCount == 0)
        try? FileManager.default.removeItem(at: dir)
    }

    @Test("duplicate content moves to top and increments count")
    func addDuplicate() {
        let (store, dir) = makeStore()
        store.add("hello")
        store.add("world")
        store.add("hello")
        #expect(store.totalCount == 2)
        #expect(store.items[0].content == "hello")
        #expect(store.items[0].copiedCount == 2)
        #expect(store.items[1].content == "world")
        try? FileManager.default.removeItem(at: dir)
    }

    @Test("add respects maxItems cap")
    func addMaxItems() {
        let (store, dir) = makeStore()
        store.maxItems = 3
        store.add("a")
        store.add("b")
        store.add("c")
        store.add("d")
        #expect(store.totalCount == 3)
        #expect(store.items[0].content == "d")
        try? FileManager.default.removeItem(at: dir)
    }

    @Test("delete item")
    func deleteItem() throws {
        let (store, dir) = makeStore()
        store.add("a")
        store.add("b")
        let item = try #require(store.items.first { $0.content == "a" })
        store.delete(item)
        #expect(store.totalCount == 1)
        #expect(store.items[0].content == "b")
        try? FileManager.default.removeItem(at: dir)
    }

    @Test("toggle pin")
    func togglePin() {
        let (store, dir) = makeStore()
        store.add("pinned")
        let item = store.items[0]
        #expect(item.pinned == false)
        store.togglePin(item)
        #expect(store.items[0].pinned == true)
        store.togglePin(item)
        #expect(store.items[0].pinned == false)
        try? FileManager.default.removeItem(at: dir)
    }

    @Test("clear unpinned keeps pinned")
    func clearUnpinned() {
        let (store, dir) = makeStore()
        store.add("a")
        store.add("b")
        let first = store.items[0]
        store.togglePin(first)
        store.clearUnpinned()
        #expect(store.totalCount == 1)
        #expect(store.items[0].id == first.id)
        try? FileManager.default.removeItem(at: dir)
    }

    @Test("search filters items")
    func search() {
        let (store, dir) = makeStore()
        store.add("Hello World")
        store.add("Goodbye")
        store.add("hello again")
        let results = store.search("hello")
        #expect(results.count == 2)
        try? FileManager.default.removeItem(at: dir)
    }

    @Test("search empty returns all")
    func searchEmpty() {
        let (store, dir) = makeStore()
        store.add("a")
        store.add("b")
        let results = store.search("")
        #expect(results.count == 2)
        try? FileManager.default.removeItem(at: dir)
    }

    @Test("pinnedCount and textCount")
    func counts() {
        let (store, dir) = makeStore()
        store.add("text1")
        store.add("text2")
        store.add("img", type: .image)
        store.togglePin(store.items[0])
        #expect(store.totalCount == 3)
        #expect(store.pinnedCount == 1)
        #expect(store.textCount == 2)
        try? FileManager.default.removeItem(at: dir)
    }

    @Test("persistence across store instances")
    func persistence() {
        let dir = FileManager.default.temporaryDirectory
            .appendingPathComponent("ClipperTests/persist-\(UUID().uuidString)")
        let s1 = ClipboardStore(directoryURL: dir)
        s1.add("persisted")
        s1.flushPendingSave()
        let s2 = ClipboardStore(directoryURL: dir)
        #expect(s2.totalCount == 1)
        #expect(s2.items[0].content == "persisted")
        try? FileManager.default.removeItem(at: dir)
    }
}
