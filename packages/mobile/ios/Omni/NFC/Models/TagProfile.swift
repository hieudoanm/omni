import Foundation
import SwiftData

/// Saved tag profile — mirrors Android's `TagProfile` Room entity.
/// Present for schema parity; no feature consumes it yet (same as Android).
@Model
final class TagProfile {
    @Attribute(.unique) var id: UUID
    var name: String
    var uid: String
    var techSummary: String
    var ndefRecords: String
    var isWritable: Bool
    var maxSize: Int
    var usedSize: Int
    var createdAt: Date

    init(
        name: String,
        uid: String,
        techSummary: String,
        ndefRecords: String,
        isWritable: Bool,
        maxSize: Int,
        usedSize: Int,
        createdAt: Date = Date()
    ) {
        id = UUID()
        self.name = name
        self.uid = uid
        self.techSummary = techSummary
        self.ndefRecords = ndefRecords
        self.isWritable = isWritable
        self.maxSize = maxSize
        self.usedSize = usedSize
        self.createdAt = createdAt
    }
}
