import Foundation
@testable import OmniCore
import Testing

@Suite("SystemInfo")
struct SystemInfoTests {
    @Test("cores text uses physical cores")
    func physicalCores() {
        let info = SystemInfo(chip: "Mac15,10", physicalCores: 8, logicalCores: 16, uptime: 0)
        #expect(info.coresText == "8 cores")
    }

    @Test("cores text falls back to logical cores")
    func logicalFallback() {
        let info = SystemInfo(chip: "Mac15,10", physicalCores: 0, logicalCores: 16, uptime: 0)
        #expect(info.coresText == "16 cores")
    }

    @Test("cores text reports unknown when neither available")
    func unknownCores() {
        let info = SystemInfo(chip: "Mac15,10", physicalCores: 0, logicalCores: 0, uptime: 0)
        #expect(info.coresText == "unknown cores")
    }

    @Test("uptime text shows minutes when under an hour")
    func uptimeMinutes() {
        let info = SystemInfo(chip: "Mac15,10", physicalCores: 8, logicalCores: 8, uptime: 600)
        #expect(info.uptimeText == "Up 10m")
    }

    @Test("uptime text shows hours and minutes")
    func uptimeHours() {
        let info = SystemInfo(chip: "Mac15,10", physicalCores: 8, logicalCores: 8, uptime: 3661)
        #expect(info.uptimeText == "Up 1h 1m")
    }

    @Test("uptime text shows days and hours")
    func uptimeDays() {
        let info = SystemInfo(chip: "Mac15,10", physicalCores: 8, logicalCores: 8, uptime: 176_400)
        #expect(info.uptimeText == "Up 2d 1h")
    }

    @Test("uptime text handles zero")
    func uptimeZero() {
        let info = SystemInfo(chip: "Mac15,10", physicalCores: 8, logicalCores: 8, uptime: 0)
        #expect(info.uptimeText == "Up 0m")
    }
}
