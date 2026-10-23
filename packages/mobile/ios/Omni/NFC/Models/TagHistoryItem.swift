import Foundation
import SwiftData

/// Scan history entry — mirrors Android's `TagHistory` Room entity.
@Model
final class TagHistoryItem {
    @Attribute(.unique) var id: UUID
    var uid: String
    var techSummary: String
    /// JSON array of `NdefRecord.dto` objects (same shape Android writes).
    var ndefRecords: String
    var isWritable: Bool
    var maxSize: Int
    var usedSize: Int
    var scannedAt: Date

    init(
        uid: String,
        techSummary: String,
        ndefRecords: String,
        isWritable: Bool,
        maxSize: Int,
        usedSize: Int,
        scannedAt: Date = Date()
    ) {
        id = UUID()
        self.uid = uid
        self.techSummary = techSummary
        self.ndefRecords = ndefRecords
        self.isWritable = isWritable
        self.maxSize = maxSize
        self.usedSize = usedSize
        self.scannedAt = scannedAt
    }

    /// Records decoded from the persisted JSON.
    var records: [NdefRecord] {
        [NdefRecord].fromHistoryJSON(ndefRecords)
    }
}
