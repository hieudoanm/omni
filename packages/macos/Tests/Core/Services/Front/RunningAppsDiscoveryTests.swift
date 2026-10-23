import CoreGraphics
import Foundation
@testable import OmniCore
import Testing

@Suite("RunningAppsDiscoveryService")
struct RunningAppsDiscoveryTests {
    @Test("model exposes pid as identity with empty defaults")
    func modelDefaults() {
        let app = RunningAppInfo(pid: 42, name: "Finder")
        #expect(app.id == 42)
        #expect(app.bundleIdentifier == nil)
        #expect(app.windowCount == 0)
        #expect(app.icon == nil)
    }

    @Test("sorts apps by localized standard name")
    func sortsByName() {
        let zulu = RunningAppInfo(pid: 1, name: "Zulu")
        let alfa = RunningAppInfo(pid: 2, name: "Alfa")
        let result = RunningAppsPresenter.sortedByName([zulu, alfa])
        #expect(result.map(\.name) == ["Alfa", "Zulu"])
    }

    @Test("sorts apps with same name by pid deterministically")
    func treatsEqualNamesStably() {
        let a = RunningAppInfo(pid: 1, name: "Safari")
        let b = RunningAppInfo(pid: 2, name: "Safari")
        let result = RunningAppsPresenter.sortedByName([a, b])
        #expect(result.map(\.pid) == [1, 2])
    }

    @Test("counts on-screen windows per owning pid")
    func countsByOwner() {
        let windows: [[String: Any]] = [
            [kCGWindowOwnerPID as String: 100],
            [kCGWindowOwnerPID as String: 100],
            [kCGWindowOwnerPID as String: 101],
            ["name": "no-owner"],
        ]
        let counts = RunningWindowCounter.countsByOwner(from: windows)
        #expect(counts[100] == 2)
        #expect(counts[101] == 1)
        #expect(counts[102] == nil)
    }

    @Test("countsByOwner ignores empty and non-numeric owners")
    func countsIgnoresMalformedWindows() {
        let windows: [[String: Any]] = [
            [:],
            [kCGWindowOwnerPID as String: "not-a-number"],
        ]
        #expect(RunningWindowCounter.countsByOwner(from: windows) == [:])
    }
}
