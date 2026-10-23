import Foundation
@testable import OmniCore
import Testing

@Suite("ByteFormatter")
struct ByteFormatterTests {
    @Test("bytes unit")
    func bytes() {
        #expect(ByteFormatter.humanReadable(0) == "0 B")
        #expect(ByteFormatter.humanReadable(512) == "512 B")
    }

    @Test("kilobytes")
    func kilobytes() {
        #expect(ByteFormatter.humanReadable(1024) == "1.0 KB")
        #expect(ByteFormatter.humanReadable(1500) == "1.5 KB")
        #expect(ByteFormatter.humanReadable(153_600) == "150 KB")
    }

    @Test("megabytes")
    func megabytes() {
        #expect(ByteFormatter.humanReadable(1_048_576) == "1.0 MB")
        #expect(ByteFormatter.humanReadable(13_000_000) == "12.4 MB")
        #expect(ByteFormatter.humanReadable(113_000_000) == "108 MB")
    }

    @Test("gigabytes")
    func gigabytes() {
        #expect(ByteFormatter.humanReadable(1_073_741_824) == "1.0 GB")
        #expect(ByteFormatter.humanReadable(13_300_000_000) == "12.4 GB")
        #expect(ByteFormatter.humanReadable(412_000_000_000) == "384 GB")
    }

    @Test("terabytes")
    func terabytes() {
        #expect(ByteFormatter.humanReadable(1_299_100_000_000) == "1.2 TB")
        #expect(ByteFormatter.humanReadable(2_199_000_000_000) == "2.0 TB")
    }

    @Test("used over total combines both")
    func usedOverTotal() {
        #expect(ByteFormatter.usedOverTotal(usedBytes: 12_400_000_000, totalBytes: 32_000_000_000) == "11.5 GB / 29.8 GB")
    }

    @Test("percent rounds to whole number with symbol")
    func percent() {
        #expect(ByteFormatter.percent(39.2) == "39%")
        #expect(ByteFormatter.percent(39.6) == "40%")
        #expect(ByteFormatter.percent(100) == "100%")
        #expect(ByteFormatter.percent(0) == "0%")
    }

    @Test("memory breakdown joins labeled values")
    func memoryBreakdown() {
        #expect(ByteFormatter.memoryBreakdown(active: 8_200_000_000, wired: 3_100_000_000, compressed: 1_100_000_000) == "Active 7.6 GB · Wired 2.9 GB · Compressed 1.0 GB")
    }

    @Test("memory availability joins cached inactive and free")
    func memoryAvailability() {
        #expect(ByteFormatter.memoryAvailability(inactive: 6_000_000_000, cached: 4_300_000_000, free: 1_100_000_000) == "Cached 4.0 GB · Inactive 5.6 GB · Free 1.0 GB")
    }

    @Test("disk availability joins free and purgeable")
    func diskAvailability() {
        #expect(ByteFormatter.diskAvailability(available: 82_000_000_000, purgeable: 5_000_000_000) == "Free 76.4 GB · Purgeable 4.7 GB")
    }

    @Test("rate formats bytes per second")
    func rate() {
        #expect(ByteFormatter.rate(0) == "0 B/s")
        #expect(ByteFormatter.rate(512) == "512 B/s")
        #expect(ByteFormatter.rate(1500) == "1.5 KB/s")
        #expect(ByteFormatter.rate(150_000) == "146 KB/s")
        #expect(ByteFormatter.rate(1_300_000) == "1.2 MB/s")
        #expect(ByteFormatter.rate(nil) == "--")
    }

    @Test("rounds large values without excessive precision")
    func noExcessivePrecision() {
        #expect(ByteFormatter.humanReadable(113_000_000_000) == "105 GB")
        #expect(ByteFormatter.humanReadable(13_438_291_000) == "12.5 GB")
    }
}
