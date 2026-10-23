import Foundation

public struct SwapStats: Equatable, Sendable {
    public let usedBytes: UInt64
    public let totalBytes: UInt64

    public init(usedBytes: UInt64, totalBytes: UInt64) {
        self.usedBytes = usedBytes
        self.totalBytes = totalBytes
    }

    public var usageRatio: Double {
        guard totalBytes > 0 else { return 0 }
        return Double(usedBytes) / Double(totalBytes)
    }

    public var usagePercentage: Double {
        usageRatio * 100
    }
}
