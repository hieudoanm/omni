import OmniCore

/// What the dashboard window's sidebar can select.
///
/// The window is not a mirror of the menu-bar panel: the Applications Manager
/// and every clipboard filter and clock live here as destinations, so one
/// sidebar navigates four groups.
enum DashboardRoute: Hashable {
    case monitor(SurfaceSection)
    case clipboard(ClipboardViewModel.Section)
    case clock(ClockViewModel.Section)
    case applications(HomebrewViewModel.Section)
    /// An installed app named by the sidebar search. Transient: it never appears
    /// in the sidebar's own group lists, only as a hit while a query is active.
    case app(name: String)

    static let `default`: DashboardRoute = .monitor(.resources)

    /// The Applications Manager entry point: installed applications.
    static let applicationsManager: DashboardRoute = .applications(.apps)

    var title: String {
        switch self {
        case let .monitor(section): return section.title
        case let .clipboard(section): return section.title
        case let .clock(section): return section.title
        case let .applications(section): return section.title
        case let .app(name): return name
        }
    }

    /// Matches the sidebar's search. An empty query matches everything, so the
    /// unfiltered sidebar is just the empty-query result.
    func matches(_ query: String) -> Bool {
        let needle = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !needle.isEmpty else { return true }
        return title.lowercased().contains(needle)
    }

    var systemImage: String {
        switch self {
        case let .monitor(section): return section.systemImage
        case let .clipboard(section): return section.systemImage
        case let .clock(section): return section.systemImage
        case let .applications(section): return section.systemImage
        case .app: return "macwindow"
        }
    }

    /// Clipboard and Clock are not here: each of their filters is a screen in
    /// the window, so they get their own groups.
    static var monitoringRoutes: [DashboardRoute] {
        SurfaceSection.allCases
            .filter { $0 != .clipboard && $0 != .clock }
            .map(DashboardRoute.monitor)
    }

    static var clipboardRoutes: [DashboardRoute] {
        ClipboardViewModel.Section.allCases.map(DashboardRoute.clipboard)
    }

    static var clockRoutes: [DashboardRoute] {
        ClockViewModel.Section.allCases.map(DashboardRoute.clock)
    }

    /// Applications first, then the Homebrew formula groups — the order the
    /// standalone Applications Manager window used.
    static var applicationRoutes: [(group: HomebrewViewModel.Section.Group, routes: [DashboardRoute])] {
        [
            (.applications, [.applications(.apps)]),
            (.homebrew, [
                .applications(.discover),
                .applications(.installed),
                .applications(.updates),
                .applications(.services),
            ]),
        ]
    }
}
