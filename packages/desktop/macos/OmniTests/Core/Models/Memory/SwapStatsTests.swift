import Foundation
@testable import OmniCore
import Testing

@Suite("SwapStats")
struct SwapStatsTests {
    @Test("init stores values")
    func initValues() {
        let stats = SwapStats(usedBytes: 2_000_000_000, totalBytes: 8_000_000_000)
        #expect(stats.usedBytes == 2_000_000_000)
        #expect(stats.totalBytes == 8_000_000_000)
    }

    @Test("usageRatio is used over total")
    func ratio() {
        let stats = SwapStats(usedBytes: 4_000_000_000, totalBytes: 8_000_000_000)
        #expect(stats.usageRatio == 0.5)
    }

    @Test("usagePercentage is ratio times 100")
    func percentage() {
        let stats = SwapStats(usedBytes: 6_000_000_000, totalBytes: 8_000_000_000)
        #expect(stats.usagePercentage == 75.0)
    }

    @Test("zero total returns zero ratio")
    func zeroTotal() {
        let stats = SwapStats(usedBytes: 5, totalBytes: 0)
        #expect(stats.usageRatio == 0)
        #expect(stats.usagePercentage == 0)
    }
}
