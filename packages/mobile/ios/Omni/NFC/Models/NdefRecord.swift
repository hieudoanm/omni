import Foundation

/// Parsed NDEF record model — mirrors Android's `NdefRecordModel`.
enum NdefRecord: Equatable {
    case text(String, languageCode: String)
    case uri(String)
    case mime(String, payload: Data)
    case aar(String)
    case unknown(tnf: Int, type: Data, payload: Data)
}

// MARK: - History JSON coding

//
// Stored format mirrors the Android implementation: a JSON array of objects
// keyed by record kind, e.g. {"type":"text","text":"...","languageCode":"en"}.

private struct RecordDTO: Codable {
    var type: String
    var text: String?
    var languageCode: String?
    var uri: String?
    var mimeType: String?
    var packageName: String?
    var tnf: Int?
}

private extension NdefRecord {
    init?(dto: RecordDTO) {
        switch dto.type {
        case "text":
            self = .text(dto.text ?? "", languageCode: dto.languageCode ?? "")
        case "uri":
            self = .uri(dto.uri ?? "")
        case "mime":
            self = .mime(dto.mimeType ?? "", payload: Data())
        case "aar":
            self = .aar(dto.packageName ?? "")
        case "unknown":
            self = .unknown(tnf: dto.tnf ?? 0, type: Data(), payload: Data())
        default:
            return nil
        }
    }

    var dto: RecordDTO {
        switch self {
        case let .text(text, languageCode):
            return RecordDTO(type: "text", text: text, languageCode: languageCode)
        case let .uri(uri):
            return RecordDTO(type: "uri", uri: uri)
        case let .mime(mimeType, _):
            return RecordDTO(type: "mime", mimeType: mimeType)
        case let .aar(packageName):
            return RecordDTO(type: "aar", packageName: packageName)
        case let .unknown(tnf, _, _):
            return RecordDTO(type: "unknown", tnf: tnf)
        }
    }
}

extension Array where Element == NdefRecord {
    /// Serialize records to the same JSON shape Android persists in history.
    var historyJSON: String {
        let dtos = map(\.dto)
        guard let data = try? JSONEncoder().encode(dtos),
              let string = String(data: data, encoding: .utf8)
        else { return "[]" }
        return string
    }

    /// Decode records persisted by `historyJSON` (and by Android).
    static func fromHistoryJSON(_ json: String) -> [NdefRecord] {
        guard let data = json.data(using: .utf8),
              let dtos = try? JSONDecoder().decode([RecordDTO].self, from: data)
        else { return [] }
        return dtos.compactMap(NdefRecord.init(dto:))
    }
}
