import Foundation

public struct DiskStats: Equatable, Sendable {
    public let usedBytes: UInt64
    public let totalBytes: UInt64
    public let availableBytes: UInt64
    public let purgeableBytes: UInt64

    public init(
        usedBytes: UInt64,
        totalBytes: UInt64,
        availableBytes: UInt64 = 0,
        purgeableBytes: UInt64 = 0
    ) {
        self.usedBytes = usedBytes
        self.totalBytes = totalBytes
        self.availableBytes = availableBytes
        self.purgeableBytes = purgeableBytes
    }

    public var usageRatio: Double {
        guard totalBytes > 0 else { return 0 }
        return Double(usedBytes) / Double(totalBytes)
    }

    public var usagePercentage: Double {
        usageRatio * 100
    }
}
