import CoreGraphics
@testable import OmniCore
import Testing

@Suite("CoordinateConverter")
struct CoordinateConverterTests {
    private let visibleFrame = CGRect(x: 0, y: 25, width: 1728, height: 1053)

    @Test("maps the top-left normalized corner to the visible frame origin")
    func topLeftMapsToOrigin() {
        let absolute = CoordinateConverter.toAbsoluteCoordinates(
            normalized: NormalizedRect(x: 0, y: 0, width: 1, height: 1),
            visibleFrame: visibleFrame
        )
        #expect(absolute == visibleFrame)
    }

    @Test("maps a normalized half to half the visible frame")
    func leftHalf() {
        let absolute = CoordinateConverter.toAbsoluteCoordinates(
            normalized: NormalizedRect(x: 0, y: 0, width: 0.5, height: 1),
            visibleFrame: visibleFrame
        )
        #expect(absolute.origin.x == 0)
        #expect(absolute.origin.y == 25)
        #expect(absolute.width == 864)
        #expect(absolute.height == 1053)
    }

    @Test("flips the y axis so normalized y is measured from the bottom edge")
    func yAxisFlips() {
        let absolute = CoordinateConverter.toAbsoluteCoordinates(
            normalized: NormalizedRect(x: 0, y: 1, width: 1, height: 0),
            visibleFrame: visibleFrame
        )
        #expect(absolute.origin.y == visibleFrame.minY)
    }

    @Test("normalized y 0 with height 0.5 maps to the bottom half")
    func bottomHalf() {
        let absolute = CoordinateConverter.toAbsoluteCoordinates(
            normalized: NormalizedRect(x: 0, y: 0, width: 1, height: 0.5),
            visibleFrame: visibleFrame
        )
        #expect(absolute == CGRect(x: 0, y: 551.5, width: 1728, height: 526.5))
    }

    @Test("roundtrips absolute to normalized and back")
    func roundtrip() {
        let bounds = CGRect(x: 100, y: 200, width: 900, height: 500)
        let normalized = CoordinateConverter.toNormalizedCoordinates(
            absolute: bounds,
            visibleFrame: visibleFrame
        )
        let restored = CoordinateConverter.toAbsoluteCoordinates(
            normalized: normalized,
            visibleFrame: visibleFrame
        )
        #expect(abs(restored.origin.x - bounds.origin.x) < 0.001)
        #expect(abs(restored.origin.y - bounds.origin.y) < 0.001)
        #expect(abs(restored.width - bounds.width) < 0.001)
        #expect(abs(restored.height - bounds.height) < 0.001)
    }

    @Test("inverts normalized coordinates for a screen with negative origin")
    func negativeOriginScreen() {
        let frame = CGRect(x: -1280, y: 0, width: 1280, height: 720)
        let bounds = CGRect(x: -960, y: 0, width: 640, height: 360)
        let normalized = CoordinateConverter.toNormalizedCoordinates(
            absolute: bounds,
            visibleFrame: frame
        )
        #expect(normalized == NormalizedRect(x: 0.25, y: 0.5, width: 0.5, height: 0.5))
    }
}
