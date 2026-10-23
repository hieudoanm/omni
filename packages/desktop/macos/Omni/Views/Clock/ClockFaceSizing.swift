import CoreGraphics

/// Sizes a clock face to the room its surface has.
///
/// A face stays square so it keeps its circle: the menu-bar panel gives it the
/// ring's size, a window screen up to `SurfaceMetrics.faceLimits`. `fill` is how
/// much of the smaller dimension the face claims, leaving the rest as margin.
enum ClockFaceSizing {
    static func ring(in available: CGSize) -> CGFloat {
        square(in: available, fill: SurfaceMetrics.ringFill, limits: SurfaceMetrics.ringLimits)
    }

    static func face(in available: CGSize) -> CGFloat {
        square(in: available, fill: SurfaceMetrics.faceFill, limits: SurfaceMetrics.faceLimits)
    }

    private static func square(
        in available: CGSize,
        fill: CGFloat,
        limits: ClosedRange<CGFloat>
    ) -> CGFloat {
        let side = min(available.width, available.height) * fill
        return min(max(side, limits.lowerBound), limits.upperBound)
    }
}
