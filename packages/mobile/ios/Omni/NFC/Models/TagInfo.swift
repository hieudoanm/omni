import Foundation

/// Read-side model for a scanned tag — mirrors Android's `TagInfo`.
struct TagInfo: Equatable {
    var uid: String
    var techList: [String]
    var isWritable: Bool
    var isNdefFormattable: Bool
    var maxSize: Int
    var usedSize: Int
    var ndefRecords: [NdefRecord]
}
