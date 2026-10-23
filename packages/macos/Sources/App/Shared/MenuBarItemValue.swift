import OmniCore

/// One `symbol + value` slot of the menu-bar indicator.
struct MenuBarItemValue: Identifiable, Equatable {
    let metric: MenuBarMetric
    let text: String
    let threshold: UsageThreshold

    var id: MenuBarMetric {
        metric
    }
}
