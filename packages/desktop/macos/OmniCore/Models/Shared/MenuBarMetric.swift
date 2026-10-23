import Foundation

/// A system metric that can be rendered in the menu-bar indicator.
public enum MenuBarMetric: String, CaseIterable, Codable, Sendable, Hashable {
    case cpu
    case memory
    case disk
    case swap

    /// Short label used in Settings and in accessibility text.
    public var title: String {
        switch self {
        case .cpu: return "CPU"
        case .memory: return "Memory"
        case .disk: return "Storage"
        case .swap: return "Swap"
        }
    }

    /// SF Symbol shown next to the value in the menu bar.
    public var systemImage: String {
        switch self {
        case .cpu: return "cpu"
        case .memory: return "memorychip"
        case .disk: return "internaldrive"
        case .swap: return "arrow.triangle.2.circlepath"
        }
    }
}
