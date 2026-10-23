import Foundation

/// Pretty-printed JSON for the raw-payload disclosure groups in the IP section.
enum JSONText {
    static func string(for value: some Encodable) -> String {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        guard let data = try? encoder.encode(value),
              let text = String(data: data, encoding: .utf8)
        else {
            return "{}"
        }
        return text
    }
}
