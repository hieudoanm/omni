import CoreGraphics
import Foundation
@testable import OmniCore
import Testing

@Suite("ScreenInfo")
struct ScreenInfoTests {
    private let screen = ScreenInfo(
        id: 42,
        name: "Studio Display",
        frame: CGRect(x: 0, y: 0, width: 1728, height: 1117),
        visibleFrame: CGRect(x: 0, y: 0, width: 1728, height: 1078)
    )

    @Test("manually computes width and height")
    func dimensions() {
        #expect(screen.width == 1728)
        #expect(screen.height == 1117)
    }

    @Test("equality depends only on id")
    func equalityByIDOnly() {
        let sameID = ScreenInfo(
            id: 42,
            name: "Other",
            frame: CGRect(x: 2000, y: 0, width: 100, height: 100),
            visibleFrame: CGRect(x: 2000, y: 0, width: 100, height: 100)
        )
        let otherID = ScreenInfo(
            id: 1,
            name: "Built-in",
            frame: screen.frame,
            visibleFrame: screen.visibleFrame
        )
        #expect(screen == sameID)
        #expect(screen != otherID)
    }

    @Test("hash follows id")
    func hashFollowsID() {
        var hasher = Hasher()
        screen.hash(into: &hasher)
        var sameIDHasher = Hasher()
        ScreenInfo(
            id: 42,
            name: "Whatever",
            frame: .zero,
            visibleFrame: .zero
        ).hash(into: &sameIDHasher)
        #expect(hasher.finalize() == sameIDHasher.finalize())
    }
}
