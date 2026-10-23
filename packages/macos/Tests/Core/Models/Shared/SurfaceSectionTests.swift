import Foundation
@testable import OmniCore
import Testing

@Suite("SurfaceSection")
struct SurfaceSectionTests {
    @Test("defaults to Resources")
    func defaultSection() {
        #expect(SurfaceSection.default == .resources)
    }

    @Test("titles and symbols are unique")
    func unique() {
        let titles = SurfaceSection.allCases.map(\.title)
        #expect(Set(titles).count == titles.count)
        let images = SurfaceSection.allCases.map(\.systemImage)
        #expect(Set(images).count == images.count)
    }

    @Test("order matches the menu-bar tab bar")
    func order() {
        #expect(SurfaceSection.allCases == [.clipboard, .clock, .resources, .network, .apps])
    }

    @Test("round trips through raw value for persistence")
    func roundTrip() {
        for section in SurfaceSection.allCases {
            #expect(SurfaceSection(rawValue: section.rawValue) == section)
        }
    }
}
