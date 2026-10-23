import Foundation
@testable import Omni
import Testing

/// History JSON must match the shape Android persists in `tag_history`.
@Suite("NdefRecord history coding")
struct NdefRecordCodableTests {
    @Test("All record kinds round-trip through history JSON")
    func roundTrip() {
        let records: [NdefRecord] = [
            .text("Hello", languageCode: "en"),
            .uri("https://example.com"),
            .mime("text/plain", payload: Data([0x01, 0x02])),
            .aar("com.example.app"),
            .unknown(tnf: 5, type: Data([0x09]), payload: Data([0x07])),
        ]
        let decoded = [NdefRecord].fromHistoryJSON(records.historyJSON)
        #expect(decoded.count == records.count)
        // mime/unknown payloads are not persisted (same as Android).
        #expect(decoded[0] == records[0])
        #expect(decoded[1] == records[1])
        #expect(decoded[2] == .mime("text/plain", payload: Data()))
        #expect(decoded[3] == records[3])
        #expect(decoded[4] == .unknown(tnf: 5, type: Data(), payload: Data()))
    }

    @Test("JSON shape matches Android's keys")
    func jsonShape() {
        let json = [NdefRecord.text("Hi", languageCode: "en")].historyJSON
        #expect(json.contains("\"type\":\"text\""))
        #expect(json.contains("\"text\":\"Hi\""))
        #expect(json.contains("\"languageCode\":\"en\""))
    }

    @Test("Empty and malformed JSON decode to empty arrays")
    func malformed() {
        #expect([NdefRecord].fromHistoryJSON("[]").isEmpty)
        #expect([NdefRecord].fromHistoryJSON("not json").isEmpty)
        #expect([NdefRecord].fromHistoryJSON("").isEmpty)
    }
}
