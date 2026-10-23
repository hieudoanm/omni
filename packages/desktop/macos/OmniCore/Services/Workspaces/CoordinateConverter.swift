import CoreGraphics

/// Converts between screen-relative pixel rectangles (bottom-left origin,
/// matching CGWindow bounds and NSScreen frames) and normalized rectangles
/// (top-left origin, 0...1 space).
public enum CoordinateConverter {
    public static func toAbsoluteCoordinates(
        normalized: NormalizedRect,
        visibleFrame: CGRect
    ) -> CGRect {
        CGRect(
            x: visibleFrame.origin.x + (normalized.x * visibleFrame.width),
            y: visibleFrame.origin.y + ((1.0 - normalized.y - normalized.height) * visibleFrame.height),
            width: normalized.width * visibleFrame.width,
            height: normalized.height * visibleFrame.height
        )
    }

    public static func toNormalizedCoordinates(
        absolute: CGRect,
        visibleFrame: CGRect
    ) -> NormalizedRect {
        NormalizedRect(
            x: (absolute.origin.x - visibleFrame.origin.x) / visibleFrame.width,
            y: 1.0 - ((absolute.origin.y - visibleFrame.origin.y) / visibleFrame.height) - (absolute.height / visibleFrame.height),
            width: absolute.width / visibleFrame.width,
            height: absolute.height / visibleFrame.height
        )
    }
}
