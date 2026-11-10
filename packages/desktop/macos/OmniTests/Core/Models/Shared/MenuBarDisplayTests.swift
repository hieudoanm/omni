import Foundation
@testable import OmniCore
import Testing

@Suite("MenuBarDisplay")
struct MenuBarDisplayTests {
    @Test("all styles have distinct titles")
    func titles() {
        #expect(MenuBarDisplay.percentage.title == "Percentages")
        #expect(MenuBarDisplay.value.title == "Values")
        #expect(MenuBarDisplay.usedOverTotal.title == "Used / Total")
    }

    @Test("round trips through raw value")
    func roundTrip() {
        for style in MenuBarDisplay.allCases {
            #expect(MenuBarDisplay(rawValue: style.rawValue) == style)
        }
    }
}
