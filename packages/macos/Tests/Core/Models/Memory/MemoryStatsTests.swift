import Foundation
@testable import OmniCore
import Testing

@Suite("MemoryStats")
struct MemoryStatsTests {
    @Test("init stores values")
    func initValues() {
        let stats = MemoryStats(usedBytes: 4_000_000_000, totalBytes: 16_000_000_000)
        #expect(stats.usedBytes == 4_000_000_000)
        #expect(stats.totalBytes == 16_000_000_000)
    }

    @Test("usageRatio is used over total")
    func ratio() {
        let stats = MemoryStats(usedBytes: 8_000_000_000, totalBytes: 16_000_000_000)
        #expect(stats.usageRatio == 0.5)
    }

    @Test("usagePercentage is ratio times 100")
    func percentage() {
        let stats = MemoryStats(usedBytes: 12_000_000_000, totalBytes: 16_000_000_000)
        #expect(stats.usagePercentage == 75.0)
    }

    @Test("zero total returns zero ratio")
    func zeroTotal() {
        let stats = MemoryStats(usedBytes: 5, totalBytes: 0)
        #expect(stats.usageRatio == 0)
        #expect(stats.usagePercentage == 0)
    }

    @Test("zero used returns zero percentage")
    func zeroUsed() {
        let stats = MemoryStats(usedBytes: 0, totalBytes: 16_000_000_000)
        #expect(stats.usagePercentage == 0)
    }

    @Test("fully used reaches 100 percent")
    func fullyUsed() {
        let stats = MemoryStats(usedBytes: 16_000_000_000, totalBytes: 16_000_000_000)
        #expect(stats.usagePercentage == 100)
    }

    @Test("init stores breakdown")
    func initBreakdown() {
        let stats = MemoryStats(
            usedBytes: 12_000_000_000,
            totalBytes: 16_000_000_000,
            activeBytes: 8_000_000_000,
            wiredBytes: 3_000_000_000,
            compressedBytes: 1_000_000_000
        )
        #expect(stats.activeBytes == 8_000_000_000)
        #expect(stats.wiredBytes == 3_000_000_000)
        #expect(stats.compressedBytes == 1_000_000_000)
    }

    @Test("init stores availability breakdown")
    func initAvailability() {
        let stats = MemoryStats(
            usedBytes: 1,
            totalBytes: 2,
            inactiveBytes: 3,
            cachedBytes: 4,
            freeBytes: 5
        )
        #expect(stats.inactiveBytes == 3)
        #expect(stats.cachedBytes == 4)
        #expect(stats.freeBytes == 5)
    }

    @Test("breakdown defaults to zero")
    func breakdownDefaults() {
        let stats = MemoryStats(usedBytes: 1, totalBytes: 2)
        #expect(stats.activeBytes == 0)
        #expect(stats.wiredBytes == 0)
        #expect(stats.compressedBytes == 0)
        #expect(stats.inactiveBytes == 0)
        #expect(stats.cachedBytes == 0)
        #expect(stats.freeBytes == 0)
    }

    @Test("equality")
    func equality() {
        let a = MemoryStats(usedBytes: 1, totalBytes: 2)
        let b = MemoryStats(usedBytes: 1, totalBytes: 2)
        let c = MemoryStats(usedBytes: 2, totalBytes: 2)
        let d = MemoryStats(usedBytes: 1, totalBytes: 2, activeBytes: 1)
        #expect(a == b)
        #expect(a != c)
        #expect(a != d)
        #expect(d != b)
    }
}
