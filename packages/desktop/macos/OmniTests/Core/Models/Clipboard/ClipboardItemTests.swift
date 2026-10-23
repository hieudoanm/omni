import Foundation
@testable import OmniCore
import Testing

@Suite("ClipboardItem")
struct ClipboardItemTests {
    @Test("init with defaults")
    func initWithDefaults() {
        let item = ClipboardItem(content: "hello")
        #expect(item.content == "hello")
        #expect(item.contentType == .text)
        #expect(item.pinned == false)
        #expect(item.copiedCount == 1)
    }

    @Test("init with type")
    func initWithType() {
        let item = ClipboardItem(content: "file.txt", contentType: .file)
        #expect(item.contentType == .file)
    }

    @Test("ContentType codable roundtrip")
    func contentTypeCodable() throws {
        for type: ClipboardItem.ContentType in [.text, .image, .file] {
            let data = try JSONEncoder().encode(type)
            let decoded = try JSONDecoder().decode(ClipboardItem.ContentType.self, from: data)
            #expect(decoded == type)
        }
    }

    @Test("Codable roundtrip preserves all fields")
    func codableRoundtrip() throws {
        let item = ClipboardItem(content: "test content", contentType: .image)
        let data = try JSONEncoder().encode(item)
        let decoded = try JSONDecoder().decode(ClipboardItem.self, from: data)
        #expect(decoded.content == item.content)
        #expect(decoded.contentType == item.contentType)
        #expect(decoded.pinned == item.pinned)
        #expect(decoded.copiedCount == item.copiedCount)
    }

    @Test("id is unique per instance")
    func uniqueIds() {
        let a = ClipboardItem(content: "same")
        let b = ClipboardItem(content: "same")
        #expect(a.id != b.id)
    }
}
