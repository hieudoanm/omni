import Foundation
@testable import OmniCore
import Testing

@Suite("ThresholdMonitor")
struct ThresholdMonitorTests {
    @Test("normal below 70")
    func normal() {
        #expect(ThresholdMonitor.status(for: 0) == .normal)
        #expect(ThresholdMonitor.status(for: 69.9) == .normal)
    }

    @Test("elevated from 70 to 89")
    func elevated() {
        #expect(ThresholdMonitor.status(for: 70) == .elevated)
        #expect(ThresholdMonitor.status(for: 85) == .elevated)
        #expect(ThresholdMonitor.status(for: 89.9) == .elevated)
    }

    @Test("high at 90 and above")
    func high() {
        #expect(ThresholdMonitor.status(for: 90) == .high)
        #expect(ThresholdMonitor.status(for: 100) == .high)
    }

    @Test("memory pressure maps to status")
    func memoryPressure() {
        #expect(ThresholdMonitor.status(for: MemoryStats(usedBytes: 3, totalBytes: 10)) == .normal)
        #expect(ThresholdMonitor.status(for: MemoryStats(usedBytes: 8, totalBytes: 10)) == .warn)
        #expect(ThresholdMonitor.status(for: MemoryStats(usedBytes: 9, totalBytes: 10)) == .critical)
    }

    @Test("kernel pressure levels map to status")
    func pressureLevel() {
        #expect(ThresholdMonitor.memoryPressure(forLevel: 1) == .normal)
        #expect(ThresholdMonitor.memoryPressure(forLevel: 2) == .warn)
        #expect(ThresholdMonitor.memoryPressure(forLevel: 4) == .critical)
        #expect(ThresholdMonitor.memoryPressure(forLevel: 0) == .unknown)
        #expect(ThresholdMonitor.memoryPressure(forLevel: 3) == .unknown)
    }

    @Test("pressure status display text")
    func pressureDisplayText() {
        #expect(MemoryPressureStatus.normal.displayText == "Normal")
        #expect(MemoryPressureStatus.warn.displayText == "Warning")
        #expect(MemoryPressureStatus.critical.displayText == "Critical")
        #expect(MemoryPressureStatus.unknown.displayText == "Unknown")
    }

    @Test("disk status maps to threshold")
    func diskStatus() {
        #expect(ThresholdMonitor.status(for: DiskStats(usedBytes: 3, totalBytes: 10)) == .normal)
        #expect(ThresholdMonitor.status(for: DiskStats(usedBytes: 8, totalBytes: 10)) == .elevated)
        #expect(ThresholdMonitor.status(for: DiskStats(usedBytes: 9, totalBytes: 10)) == .high)
    }
}
