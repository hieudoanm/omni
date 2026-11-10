import CoreGraphics

/// The two surfaces, sized from `SurfaceMetrics`.
///
/// `SurfaceLayout` is the shape of a surface — how wide the popover is, how big
/// the window opens, how wide its sidebar sits. The numbers themselves belong
/// to `SurfaceMetrics`, which is also where panel and window share the values
/// that must not drift apart.
enum SurfaceLayout {
    static let panelWidth = SurfaceMetrics.panelWidth
    static let panelContentHeight: CGFloat = 620

    static let windowDefaultWidth = SurfaceMetrics.windowWidth
    static let windowDefaultHeight = SurfaceMetrics.windowHeight
    static let windowMinWidth = SurfaceMetrics.windowMinWidth
    static let windowMinHeight = SurfaceMetrics.windowMinHeight
    static let sidebarWidth = SurfaceMetrics.sidebarWidth
}
