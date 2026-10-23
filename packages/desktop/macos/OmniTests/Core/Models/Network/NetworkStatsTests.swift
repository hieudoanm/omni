import Foundation
@testable import OmniCore
import Testing

@Suite("NetworkStats")
struct NetworkStatsTests {
    private func sample(
        name: String,
        kind: NetworkInterfaceKind = .other,
        isUp: Bool = true,
        hasAddress: Bool = false,
        received: UInt32 = 0,
        sent: UInt32 = 0
    ) -> NetworkInterfaceSample {
        NetworkInterfaceSample(
            name: name,
            kind: kind,
            isUp: isUp,
            hasAddress: hasAddress,
            receivedBytes: received,
            sentBytes: sent
        )
    }

    @Test("init stores values")
    func initValues() {
        let s = sample(name: "en0", kind: .wifi, hasAddress: true, received: 100, sent: 200)
        let stats = NetworkStats(
            interfaces: [],
            totalReceiveBytesPerSecond: 100,
            totalSendBytesPerSecond: 200,
            receivedBytes: 300,
            sentBytes: 400
        )
        #expect(stats.interfaces.isEmpty)
        #expect(stats.totalReceiveBytesPerSecond == 100)
        #expect(stats.totalSendBytesPerSecond == 200)
        #expect(stats.receivedBytes == 300)
        #expect(stats.sentBytes == 400)
        #expect(s.kind == .wifi)
        #expect(s.hasAddress)
        #expect(s.receivedBytes == 100)
        #expect(s.sentBytes == 200)
    }

    @Test("first sample has zero rates and zero totals")
    func firstSample() {
        let previous = [sample(name: "en0", received: 100, sent: 50)]
        let stats = NetworkStats.compute(previous: previous, current: previous, elapsed: 0)
        #expect(stats.totalReceiveBytesPerSecond == nil)
        #expect(stats.totalSendBytesPerSecond == nil)
        #expect(stats.receivedBytes == 0)
        #expect(stats.sentBytes == 0)
    }

    @Test("deltas divide by elapsed for rates")
    func rates() {
        let previous = [sample(name: "en0", received: 100, sent: 50)]
        let current = [sample(name: "en0", received: 1100, sent: 250)]
        let stats = NetworkStats.compute(previous: previous, current: current, elapsed: 2)
        #expect(stats.totalReceiveBytesPerSecond == 500)
        #expect(stats.totalSendBytesPerSecond == 100)
        #expect(stats.receivedBytes == 1000)
        #expect(stats.sentBytes == 200)
    }

    @Test("new interfaces have no rate until the next sample")
    func newInterfaceNoRate() {
        let previous = [sample(name: "en0", received: 1, sent: 1)]
        let current = [sample(name: "en0", received: 2, sent: 2), sample(name: "en1", received: 50, sent: 50)]
        let stats = NetworkStats.compute(previous: previous, current: current, elapsed: 1)
        guard let en1 = stats.interfaces.first(where: { $0.sample.name == "en1" }) else {
            Issue.record("en1 missing")
            return
        }
        #expect(en1.receiveBytesPerSecond == nil)
        #expect(en1.sendBytesPerSecond == nil)
        #expect(stats.receivedBytes == 1)
        #expect(stats.sentBytes == 1)
    }

    @Test("delta spans the 32-bit counter wrap")
    func deltaWrap() {
        #expect(NetworkStats.delta(from: UInt32.max - 2, to: 4) == 7)
        #expect(NetworkStats.delta(from: 10, to: 20) == 10)
        #expect(NetworkStats.delta(from: 5, to: 5) == 0)
        #expect(NetworkStats.delta(from: 0, to: 0) == 0)
    }

    @Test("loopback traffic is excluded from totals")
    func loopbackExcluded() {
        let previous = [sample(name: "lo0", received: 100, sent: 100)]
        let current = [sample(name: "lo0", received: 200, sent: 300)]
        let stats = NetworkStats.compute(previous: previous, current: current, elapsed: 1)
        #expect(stats.receivedBytes == 0)
        #expect(stats.sentBytes == 0)
    }

    @Test("interfaces sort by name")
    func sortedInterfaces() {
        let previous = [sample(name: "en1"), sample(name: "en0")]
        let stats = NetworkStats.compute(previous: previous, current: previous, elapsed: 0)
        #expect(stats.interfaces.map { $0.sample.name } == ["en0", "en1"])
    }

    @Test("kind displays friendly names")
    func kindDisplayNames() {
        #expect(NetworkInterfaceKind.wifi.displayName == "Wi-Fi")
        #expect(NetworkInterfaceKind.ethernet.displayName == "Ethernet")
        #expect(NetworkInterfaceKind.other.displayName == "Other")
    }

    @Test("loopback is detected by name prefix")
    func loopbackDetection() {
        #expect(sample(name: "lo0").isLoopback)
        #expect(sample(name: "lo1").isLoopback)
        #expect(!sample(name: "en0").isLoopback)
    }
}

@Suite("NetworkSnapshots")
struct NetworkSnapshotsTests {
    private func snapshot(
        name: String,
        isUp: Bool = true,
        isAddress: Bool = false,
        received: UInt32 = 0,
        sent: UInt32 = 0
    ) -> NetworkAddressSnapshot {
        NetworkAddressSnapshot(
            name: name,
            isUp: isUp,
            isAddress: isAddress,
            receivedBytes: received,
            sentBytes: sent
        )
    }

    @Test("aggregate collapses per-address entries into one sample")
    func aggregatePerAddressEntries() {
        let entries = [
            snapshot(name: "en0", isUp: true, received: 100, sent: 50),
            snapshot(name: "en0", isUp: true, isAddress: true),
            snapshot(name: "en0", isUp: true, isAddress: true),
        ]
        let samples = NetworkSnapshots.aggregate(entries) { name in
            name == "en0" ? .wifi : .other
        }
        #expect(samples.count == 1)
        guard let en0 = samples.first else {
            Issue.record("en0 missing")
            return
        }
        #expect(en0.kind == .wifi)
        #expect(en0.hasAddress)
        #expect(en0.isUp)
        #expect(en0.receivedBytes == 100)
        #expect(en0.sentBytes == 50)
    }

    @Test("aggregate ORs the up flag and sorts by name")
    func aggregateOrsUpAndSorts() {
        let entries = [
            snapshot(name: "en5", isUp: false, isAddress: true),
            snapshot(name: "en0", isUp: false),
            snapshot(name: "en0", isUp: true),
        ]
        let samples = NetworkSnapshots.aggregate(entries) { _ in .ethernet }
        #expect(samples.map { $0.name } == ["en0", "en5"])
        #expect(samples[0].isUp)
        #expect(samples[1].hasAddress)
    }
}
