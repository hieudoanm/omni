import Foundation

/// Controls how the menu-bar indicator renders its values.
public enum MenuBarDisplay: String, CaseIterable, Codable, Sendable {
    case percentage
    case value
    case usedOverTotal

    public var title: String {
        switch self {
        case .percentage: return "Percentages"
        case .value: return "Values"
        case .usedOverTotal: return "Used / Total"
        }
    }
}
