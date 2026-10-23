import Foundation
@testable import OmniCore
import Testing

@Suite("CPUStats")
struct CPUStatsTests {
    @Test("init stores usage")
    func initValues() {
        let stats = CPUStats(usage: 12.5)
        #expect(stats.usage == 12.5)
    }

    @Test("clamps negative usage to zero")
    func clampsNegative() {
        let stats = CPUStats(usage: -5)
        #expect(stats.usage == 0)
    }

    @Test("clamps usage above 100 to 100")
    func clampsAboveHundred() {
        let stats = CPUStats(usage: 150)
        #expect(stats.usage == 100)
    }

    @Test("init stores load averages")
    func loadAverages() {
        let stats = CPUStats(usage: 10, loadAverage1: 2.5, loadAverage5: 1.5, loadAverage15: 1.0)
        #expect(stats.loadAverage1 == 2.5)
        #expect(stats.loadAverage5 == 1.5)
        #expect(stats.loadAverage15 == 1.0)
    }

    @Test("load averages default to zero")
    func loadAverageDefaults() {
        let stats = CPUStats(usage: 10)
        #expect(stats.loadAverage1 == 0)
        #expect(stats.loadAverage5 == 0)
        #expect(stats.loadAverage15 == 0)
    }

    @Test("load average text joins the three samples")
    func loadAverageText() {
        let stats = CPUStats(usage: 10, loadAverage1: 2.5, loadAverage5: 1.5, loadAverage15: 1.0)
        #expect(stats.loadAverageText == "Load 2.5 · 1.5 · 1.0")
    }
}
