import Foundation

/// A monitoring section of Omni, shown as a tab in the menu-bar panel and as a
/// row in the dashboard window's sidebar.
///
/// The panel persists its selection (`Omni.selectedSection`); the window keeps
/// its own `DashboardRoute`, so the two surfaces navigate independently.
public enum SurfaceSection: String, CaseIterable, Codable, Sendable, Hashable {
    case clipboard
    case clock
    case resources
    case network
    case apps

    /// `UserDefaults` key backing `@AppStorage`.
    public static let storageKey = "Omni.selectedSection"

    public static let `default`: SurfaceSection = .resources

    public var title: String {
        switch self {
        case .clipboard: return "Clipboard"
        case .clock: return "Clock"
        case .resources: return "Resources"
        case .network: return "Network"
        case .apps: return "Apps"
        }
    }

    public var systemImage: String {
        switch self {
        case .clipboard: return "doc.on.clipboard"
        case .clock: return "clock"
        case .resources: return "gauge.with.dots.needle.50percent"
        case .network: return "network"
        case .apps: return "macwindow"
        }
    }
}
