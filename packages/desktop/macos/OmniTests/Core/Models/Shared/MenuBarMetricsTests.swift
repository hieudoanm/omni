import Foundation
@testable import OmniCore
import Testing

@Suite("MenuBarMetrics")
struct MenuBarMetricsTests {
    @Test("defaults to CPU and Storage")
    func standard() {
        #expect(MenuBarMetrics.standard.values == [.cpu, .disk])
    }

    @Test("canonicalises order regardless of input order")
    func canonicalOrder() {
        #expect(MenuBarMetrics([.disk, .cpu]).values == [.cpu, .disk])
        #expect(MenuBarMetrics([.swap, .memory, .cpu]).values == [.cpu, .memory, .swap])
    }

    @Test("drops duplicates")
    func dedupes() {
        #expect(MenuBarMetrics([.cpu, .cpu, .disk]).values == [.cpu, .disk])
    }

    @Test("empty selection falls back to the standard set")
    func emptyFallsBack() {
        #expect(MenuBarMetrics([]).values == MenuBarMetrics.standard.values)
    }

    @Test("keeps the last metric when removing")
    func removeKeepsOne() {
        let single = MenuBarMetrics([.memory])
        #expect(single.removing(.memory) == single)
        #expect(MenuBarMetrics([.cpu, .disk]).removing(.cpu).values == [.disk])
    }

    @Test("adding re-orders into canonical order")
    func addOrders() {
        #expect(MenuBarMetrics([.disk]).adding(.cpu).values == [.cpu, .disk])
        #expect(MenuBarMetrics([.disk]).adding(.swap).values == [.disk, .swap])
    }

    @Test("contains reports membership")
    func membership() {
        let metrics = MenuBarMetrics([.cpu, .memory])
        #expect(metrics.contains(.memory))
        #expect(!metrics.contains(.swap))
    }

    @Test("round trips through raw values")
    func roundTrip() throws {
        let metrics = MenuBarMetrics([.memory, .swap])
        let data = try JSONEncoder().encode(metrics)
        #expect(try JSONDecoder().decode(MenuBarMetrics.self, from: data) == metrics)
    }
}
