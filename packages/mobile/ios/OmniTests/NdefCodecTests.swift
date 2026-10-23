import Foundation
@testable import Omni
import Testing

/// Ports the Android `NdefReader` / `NdefWriter` record-handling tests.
@Suite("NdefCodec")
struct NdefCodecTests {
    // MARK: - Text records

    @Test("Text payload round-trips through parse and encode")
    func textRoundTrip() {
        let bytes = NdefCodec.textPayloadBytes(text: "Hello NFC", languageCode: "en")
        let parsed = NdefCodec.parseText(bytes)
        #expect(parsed.text == "Hello NFC")
        #expect(parsed.languageCode == "en")
    }

    @Test("Text payload with empty payload parses to empty strings")
    func textEmpty() {
        let parsed = NdefCodec.parseText(Data())
        #expect(parsed.text == "")
        #expect(parsed.languageCode == "")
    }

    @Test("Well-known text record decodes to .text")
    func wellKnownText() {
        let payload = NdefPayload(
            tnf: .wellKnown,
            type: Data("T".utf8),
            payload: NdefCodec.textPayloadBytes(text: "Hi", languageCode: "en")
        )
        #expect(NdefCodec.record(from: payload) == .text("Hi", languageCode: "en"))
    }

    // MARK: - URI records

    @Test("URI prefix codes expand correctly")
    func uriPrefixes() {
        #expect(NdefCodec.parseUri(Data([0x03]) + Data("example.com".utf8)) == "http://example.com")
        #expect(NdefCodec.parseUri(Data([0x04]) + Data("example.com".utf8)) == "https://example.com")
        #expect(NdefCodec.parseUri(Data([0x00]) + Data("nfc:tag".utf8)) == "nfc:tag")
        #expect(NdefCodec.parseUri(Data()) == "")
    }

    @Test("URI encode picks the longest matching prefix")
    func uriEncode() {
        #expect(NdefCodec.uriPayloadBytes(for: "https://www.example.com") == Data([0x02]) + Data("example.com".utf8))
        #expect(NdefCodec.uriPayloadBytes(for: "custom://thing") == Data([0x00]) + Data("custom://thing".utf8))
    }

    @Test("URI record round-trips")
    func uriRoundTrip() {
        let record = NdefRecord.uri("https://www.example.com")
        let payload = NdefCodec.payload(for: record)
        #expect(NdefCodec.record(from: payload) == record)
    }

    @Test("Well-known URI record decodes to .uri")
    func wellKnownURI() {
        let payload = NdefPayload(
            tnf: .wellKnown,
            type: Data("U".utf8),
            payload: NdefCodec.uriPayloadBytes(for: "https://example.com")
        )
        #expect(NdefCodec.record(from: payload) == .uri("https://example.com"))
    }

    // MARK: - MIME / absolute URI / external records

    @Test("Media record decodes to lowercase mime type")
    func mimeRecord() {
        let payload = NdefPayload(
            tnf: .media,
            type: Data("Text/Plain".utf8),
            payload: Data("abc".utf8)
        )
        #expect(NdefCodec.record(from: payload) == .mime("text/plain", payload: Data("abc".utf8)))
    }

    @Test("Absolute URI record reads the type field")
    func absoluteURIRecord() {
        let payload = NdefPayload(
            tnf: .absoluteURI,
            type: Data("https://example.com/doc".utf8),
            payload: Data()
        )
        #expect(NdefCodec.record(from: payload) == .uri("https://example.com/doc"))
    }

    @Test("Android application record decodes to .aar")
    func aarRecord() {
        let payload = NdefPayload(
            tnf: .external,
            type: Data("android.com:pkg".utf8),
            payload: Data("com.example.app".utf8)
        )
        #expect(NdefCodec.record(from: payload) == .aar("com.example.app"))
    }

    @Test("Unknown TNF decodes to .unknown preserving fields")
    func unknownRecord() {
        let payload = NdefPayload(
            tnf: .unknown,
            type: Data([0x01, 0x02]),
            payload: Data([0xAA])
        )
        #expect(NdefCodec.record(from: payload) == .unknown(tnf: 5, type: Data([0x01, 0x02]), payload: Data([0xAA])))
    }

    // MARK: - Record creation

    @Test("All record kinds produce writable payloads")
    func payloadCreation() {
        #expect(NdefCodec.payload(for: .text("x", languageCode: "en")).tnf == .wellKnown)
        #expect(NdefCodec.payload(for: .uri("https://a.b")).tnf == .wellKnown)
        #expect(NdefCodec.payload(for: .mime("text/plain", payload: Data())).tnf == .media)
        #expect(NdefCodec.payload(for: .aar("com.x")).tnf == .external)
        #expect(NdefCodec.payload(for: .unknown(tnf: 5, type: Data(), payload: Data())).tnf == .unknown)
    }

    // MARK: - NDEF message parsing (smart posters)

    @Test("parseMessage decodes a single-record message")
    func parseMessageSingle() throws {
        // FLAGS: MB|ME|SR, TNF well-known, type "U", short payload.
        var bytes = Data([0xD1]) // MB + ME + SR + TNF=1
        bytes.append(1) // type length
        bytes.append(4) // payload length
        bytes.append(contentsOf: "U".utf8)
        bytes.append(contentsOf: NdefCodec.uriPayloadBytes(for: "https://example.com"))

        let records = NdefCodec.parseMessage(bytes)
        #expect(records.count == 1)
        #expect(records.first?.tnf == .wellKnown)
        #expect(try NdefCodec.record(from: #require(records.first)) == .uri("https://example.com"))
    }

    @Test("Smart poster extracts the embedded URI record")
    func smartPoster() {
        // Build a nested message containing a URI record, then wrap it as an
        // "Sp" payload.
        var inner = Data([0xD1, 0x01])
        let uriBytes = NdefCodec.uriPayloadBytes(for: "https://example.com")
        inner.append(UInt8(uriBytes.count))
        inner.append(contentsOf: "U".utf8)
        inner.append(contentsOf: uriBytes)

        let sp = NdefPayload(tnf: .wellKnown, type: Data("Sp".utf8), payload: inner)
        #expect(NdefCodec.record(from: sp) == .uri("https://example.com"))
    }

    @Test("parseMessage tolerates truncated input")
    func parseMessageTruncated() {
        #expect(NdefCodec.parseMessage(Data([0xD1, 0x05])).isEmpty)
        #expect(NdefCodec.parseMessage(Data()).isEmpty)
    }
}
