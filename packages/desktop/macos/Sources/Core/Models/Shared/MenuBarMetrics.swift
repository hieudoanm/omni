import Foundation

/// The ordered, non-empty set of metrics rendered in the menu bar.
///
/// Values are always kept in the canonical `MenuBarMetric.allCases` order so the
/// indicator never reflows when the user toggles metrics in a different order.
public struct MenuBarMetrics: Codable, Equatable, Sendable {
    /// CPU and Storage: the two metrics that need no explanation to read.
    public static let standard = MenuBarMetrics([.cpu, .disk])

    public let values: [MenuBarMetric]

    /// Normalises an arbitrary list: duplicates are dropped, order is canonical,
    /// and an empty selection falls back to `standard` so the menu bar is never
    /// left without a value.
    public init(_ values: [MenuBarMetric]) {
        let unique = Set(values)
        let ordered = MenuBarMetric.allCases.filter(unique.contains)
        self.values = ordered.isEmpty ? MenuBarMetrics.standard.values : ordered
    }

    public func contains(_ metric: MenuBarMetric) -> Bool {
        values.contains(metric)
    }

    /// Removes a metric, keeping the last one so at least one metric remains.
    public func removing(_ metric: MenuBarMetric) -> MenuBarMetrics {
        let remaining = values.filter { $0 != metric }
        return remaining.isEmpty ? self : MenuBarMetrics(remaining)
    }

    /// Adds a metric, keeping the canonical order.
    public func adding(_ metric: MenuBarMetric) -> MenuBarMetrics {
        MenuBarMetrics(values + [metric])
    }
}
