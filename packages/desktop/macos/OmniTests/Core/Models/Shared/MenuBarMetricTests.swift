import Foundation
@testable import OmniCore
import Testing

@Suite("MenuBarMetric")
struct MenuBarMetricTests {
    @Test("every metric has a label and a symbol")
    func presentation() {
        for metric in MenuBarMetric.allCases {
            #expect(!metric.title.isEmpty)
            #expect(!metric.systemImage.isEmpty)
        }
    }

    @Test("labels are unique so Settings toggles read unambiguously")
    func uniqueTitles() {
        let titles = MenuBarMetric.allCases.map(\.title)
        #expect(Set(titles).count == titles.count)
    }

    @Test("canonical order is CPU, Memory, Storage, Swap")
    func order() {
        #expect(MenuBarMetric.allCases == [.cpu, .memory, .disk, .swap])
    }

    @Test("round trips through raw value")
    func roundTrip() {
        for metric in MenuBarMetric.allCases {
            #expect(MenuBarMetric(rawValue: metric.rawValue) == metric)
        }
    }
}
