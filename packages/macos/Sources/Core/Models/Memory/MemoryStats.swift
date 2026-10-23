import Foundation

public struct MemoryStats: Equatable, Sendable {
    public let usedBytes: UInt64
    public let totalBytes: UInt64
    public let activeBytes: UInt64
    public let wiredBytes: UInt64
    public let compressedBytes: UInt64
    public let inactiveBytes: UInt64
    public let cachedBytes: UInt64
    public let freeBytes: UInt64

    public init(
        usedBytes: UInt64,
        totalBytes: UInt64,
        activeBytes: UInt64 = 0,
        wiredBytes: UInt64 = 0,
        compressedBytes: UInt64 = 0,
        inactiveBytes: UInt64 = 0,
        cachedBytes: UInt64 = 0,
        freeBytes: UInt64 = 0
    ) {
        self.usedBytes = usedBytes
        self.totalBytes = totalBytes
        self.activeBytes = activeBytes
        self.wiredBytes = wiredBytes
        self.compressedBytes = compressedBytes
        self.inactiveBytes = inactiveBytes
        self.cachedBytes = cachedBytes
        self.freeBytes = freeBytes
    }

    public var usageRatio: Double {
        guard totalBytes > 0 else { return 0 }
        return Double(usedBytes) / Double(totalBytes)
    }

    public var usagePercentage: Double {
        usageRatio * 100
    }
}
