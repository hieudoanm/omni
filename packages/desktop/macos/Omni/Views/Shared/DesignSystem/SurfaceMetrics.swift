import CoreGraphics

/// The geometry of the app's two surfaces and the chrome inside them.
///
/// Two rules live here:
///
/// - A surface's size is a product decision, not a view's business. The panel
///   is compact because a menu-bar popover competes with everything else on
///   screen; the window is generous because it is the place where several
///   sub-sections have to be visible at once.
/// - A control takes its size as a parameter, but the sizes that repeat across
///   surfaces are named so they cannot drift apart.
enum SurfaceMetrics {
    // MARK: Panel

    /// The menu-bar popover. Fixed width: its content is one section at a time.
    static let panelWidth: CGFloat = 600

    /// Section inset inside the popover.
    static let panelPadding = Spacing.inset

    /// A borderless icon button in the panel footer.
    static let iconButtonWidth: CGFloat = 22
    static let iconButtonHeight: CGFloat = 20

    // MARK: Window

    static let windowWidth: CGFloat = 1100
    static let windowHeight: CGFloat = 760
    static let windowMinWidth: CGFloat = 820
    static let windowMinHeight: CGFloat = 560

    /// A window screen: one route, centred, with room to breathe.
    static let screenHorizontalPadding = Spacing.xxxl
    static let screenVerticalPadding = Spacing.xl

    // MARK: Sidebar

    static let sidebarWidth: CGFloat = 200
    static let sidebarMinWidth: CGFloat = 170
    static let sidebarMaxWidth: CGFloat = 280

    // MARK: Cards

    /// A card always has a definite height so a card holding a list has
    /// something to scroll inside. Callers pass a taller one for longer lists.
    /// The default card height, and the smallest one a card is allowed to keep
    /// its content readable.
    static let cardHeight: CGFloat = 320
    static let cardMinHeight: CGFloat = 140
    static let cardPadding = Spacing.lg

    /// A refresh affordance: 24 points square, the smallest target that still
    /// reads as a button in a toolbar.
    static let refreshButtonSide: CGFloat = 24

    // MARK: Clock faces

    /// A countdown ring keeps the panel's size and grows into a window screen.
    static let ringLimits: ClosedRange<CGFloat> = 160 ... 320

    /// The watchface claims more of the screen: it is the whole screen.
    static let faceLimits: ClosedRange<CGFloat> = 200 ... 380

    /// How much of the smaller dimension a face claims, leaving the rest as
    /// margin.
    static let ringFill: CGFloat = 0.7
    static let faceFill: CGFloat = 0.9
}
