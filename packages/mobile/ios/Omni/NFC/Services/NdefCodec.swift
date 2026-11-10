import Foundation

/// Pure NDEF record codec — port of Android's `NdefReader` / `NdefWriter`
/// record handling. Operates on `NdefPayload` so it can be unit-tested
/// without CoreNFC hardware sessions.
enum NdefCodec {
    // MARK: - Record parsing (Android: NdefReader.parseRecordUnsafe)

    static func record(from payload: NdefPayload) -> NdefRecord {
        switch payload.tnf {
        case .wellKnown:
            return parseWellKnown(payload)
        case .media:
            return .mime(
                String(decoding: payload.type, as: UTF8.self).lowercased(),
                payload: payload.payload
            )
        case .absoluteURI:
            // TNF_ABSOLUTE_URI stores the URI in the TYPE field; fall back to
            // payload for tags that put it there instead.
            let uri = String(decoding: payload.type, as: UTF8.self)
            return .uri(uri.isEmpty ? String(decoding: payload.payload, as: UTF8.self) : uri)
        case .external:
            let typeName = String(decoding: payload.type, as: UTF8.self)
            if typeName == "android.com:pkg" {
                return .aar(String(decoding: payload.payload, as: UTF8.self))
            }
            return unknownRecord(from: payload)
        case .empty, .unknown, .unchanged:
            return unknownRecord(from: payload)
        }
    }

    private static func unknownRecord(from payload: NdefPayload) -> NdefRecord {
        .unknown(tnf: payload.tnf.rawValue, type: payload.type, payload: payload.payload)
    }

    private static func parseWellKnown(_ payload: NdefPayload) -> NdefRecord {
        let type = String(decoding: payload.type, as: UTF8.self)
        switch type {
        case "T":
            let parsed = parseText(payload.payload)
            return .text(parsed.text, languageCode: parsed.languageCode)
        case "U":
            return .uri(parseUri(payload.payload))
        case "Sp":
            return parseSmartPoster(payload.payload)
        default:
            return unknownRecord(from: payload)
        }
    }

    // MARK: - Text records (Android: parseText)

    /// Payload layout: status byte (bit 7 = UTF-16, bits 0-5 = lang length),
    /// language code, then text bytes.
    static func parseText(_ payload: Data) -> (text: String, languageCode: String) {
        guard let status = payload.first else { return ("", "") }
        let isUtf16 = status & 0x80 != 0
        let languageCodeLength = Int(status & 0x3F)
        guard payload.count >= 1 + languageCodeLength else { return ("", "") }

        let languageCode = String(
            decoding: payload[payload.index(after: payload.startIndex) ..< payload.index(payload.startIndex, offsetBy: 1 + languageCodeLength)],
            as: UTF8.self
        )
        let textStart = payload.index(payload.startIndex, offsetBy: 1 + languageCodeLength)
        let textBytes = payload[textStart...]
        let text: String
        if isUtf16 {
            text = String(data: Data(textBytes), encoding: .utf16) ?? ""
        } else {
            text = String(decoding: textBytes, as: UTF8.self)
        }
        return (text, languageCode)
    }

    static func textPayloadBytes(text: String, languageCode: String) -> Data {
        var bytes = Data()
        let lang = Data(languageCode.utf8)
        bytes.append(UInt8(lang.count & 0x3F)) // UTF-8 encoding, bit 7 clear
        bytes.append(contentsOf: lang)
        bytes.append(contentsOf: text.utf8)
        return bytes
    }

    // MARK: - URI records (Android: parseUri + URI_PREFIX_MAP)

    static let uriPrefixMap: [UInt8: String] = [
        0x00: "",
        0x01: "http://www.",
        0x02: "https://www.",
        0x03: "http://",
        0x04: "https://",
        0x05: "tel:",
        0x06: "mailto:",
        0x07: "ftp://anonymous:anonymous@",
        0x08: "ftp://ftp.",
        0x09: "ftps://",
        0x0A: "ftp://",
        0x0B: "file://",
        0x0C: "content://",
        0x0D: "urn:epc:id:",
        0x0E: "urn:epc:tag:",
        0x0F: "urn:epc:pat:",
        0x10: "urn:epc:raw:",
        0x11: "urn:epc:",
        0x12: "urn:nfc:",
    ]

    static func parseUri(_ payload: Data) -> String {
        guard let prefixCode = payload.first else { return "" }
        let body = String(decoding: payload.dropFirst(), as: UTF8.self)
        return (uriPrefixMap[prefixCode] ?? "") + body
    }

    /// Inverse of `parseUri` — compresses the URI against the prefix map.
    static func uriPayloadBytes(for uri: String) -> Data {
        // Longest matching prefix wins.
        let match = uriPrefixMap
            .filter { !$0.value.isEmpty && uri.hasPrefix($0.value) }
            .max { $0.value.count < $1.value.count }
        let code = match?.key ?? 0x00
        let body = match.map { String(uri.dropFirst($0.value.count)) } ?? uri
        var bytes = Data([code])
        bytes.append(contentsOf: body.utf8)
        return bytes
    }

    // MARK: - Smart poster (Android: parseSmartPoster)

    /// A Smart Poster payload is a nested NDEF message; Android digs out the
    /// first embedded URI record.
    static func parseSmartPoster(_ payload: Data) -> NdefRecord {
        for nested in parseMessage(payload) {
            if nested.tnf == .wellKnown,
               String(decoding: nested.type, as: UTF8.self) == "U"
            {
                return .uri(parseUri(nested.payload))
            }
        }
        return .uri("")
    }

    // MARK: - Record creation (Android: NdefWriter.toNdefRecord)

    static func payload(for record: NdefRecord) -> NdefPayload {
        switch record {
        case let .text(text, languageCode):
            return NdefPayload(
                tnf: .wellKnown,
                type: Data("T".utf8),
                payload: textPayloadBytes(text: text, languageCode: languageCode)
            )
        case let .uri(uri):
            return NdefPayload(
                tnf: .wellKnown,
                type: Data("U".utf8),
                payload: uriPayloadBytes(for: uri)
            )
        case let .mime(mimeType, payload):
            return NdefPayload(
                tnf: .media,
                type: Data(mimeType.utf8),
                payload: payload
            )
        case let .aar(packageName):
            return NdefPayload(
                tnf: .external,
                type: Data("android.com:pkg".utf8),
                payload: Data(packageName.utf8)
            )
        case let .unknown(tnf, type, payload):
            return NdefPayload(
                tnf: NdefPayload.TypeNameFormat(rawValue: tnf) ?? .unknown,
                type: type,
                payload: payload
            )
        }
    }

    // MARK: - Raw NDEF message parsing

    /// Parse a raw NDEF message byte stream into payloads. Used for Smart
    /// Poster payloads and kept tolerant of malformed/truncated input.
    /// Record header order per spec: FLAGS, TYPE_LENGTH, ID_LENGTH?,
    /// PAYLOAD_LENGTH, TYPE, ID, PAYLOAD.
    static func parseMessage(_ data: Data) -> [NdefPayload] {
        var records: [NdefPayload] = []
        var index = data.startIndex

        func read(_ count: Int) -> Data? {
            guard index + count <= data.endIndex else { return nil }
            let slice = data[index ..< index + count]
            index += count
            return Data(slice)
        }

        func readLength(short: Bool) -> Int? {
            guard let bytes = read(short ? 1 : 4) else { return nil }
            return bytes.reduce(0) { ($0 << 8) | Int($1) }
        }

        while index < data.endIndex {
            guard let flags = read(1)?.first else { break }
            let shortRecord = flags & 0x10 != 0
            guard let typeLen = readLength(short: shortRecord) else { break }

            var idLen = 0
            if flags & 0x08 != 0 { // IL — ID length is always one byte
                idLen = readLength(short: true) ?? 0
            }
            guard let payloadLen = readLength(short: shortRecord),
                  let typeBytes = read(typeLen),
                  let _ = read(idLen),
                  let payloadBytes = read(payloadLen)
            else { break }

            let tnfValue = Int(flags & 0x07)
            records.append(NdefPayload(
                tnf: NdefPayload.TypeNameFormat(rawValue: tnfValue) ?? .unknown,
                type: typeBytes,
                identifier: Data(),
                payload: payloadBytes
            ))

            if flags & 0x40 != 0 {
                break
            } // ME — last record
        }
        return records
    }
}
