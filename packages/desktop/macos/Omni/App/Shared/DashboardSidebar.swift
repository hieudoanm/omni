import OmniCore

/// The window sidebar's contents for a search query.
///
/// The sidebar has two kinds of destination: the sections it always holds, and
/// the installed apps a query names. Filtering keeps the groups and their order
/// — an empty group disappears rather than showing an empty header — so the
/// window navigates the same way whether or not a search is active.
struct DashboardSidebar {
    /// At most this many app hits, so a one-letter query does not bury the
    /// sections under two hundred rows.
    static let maxAppHits = 6

    let applications: [(group: HomebrewViewModel.Section.Group, routes: [DashboardRoute])]
    let appHits: [InstalledApp]
    let clipboard: [DashboardRoute]
    let clock: [DashboardRoute]
    let monitor: [DashboardRoute]

    var isEmpty: Bool {
        applications.isEmpty && appHits.isEmpty && clipboard.isEmpty && clock.isEmpty && monitor.isEmpty
    }

    init(query: String, installedApps: [InstalledApp]) {
        let needle = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        applications = DashboardRoute.applicationRoutes.compactMap { group in
            let routes = group.routes.filter { $0.matches(needle) }
            return routes.isEmpty ? nil : (group.group, routes)
        }
        clipboard = DashboardRoute.clipboardRoutes.filter { $0.matches(needle) }
        clock = DashboardRoute.clockRoutes.filter { $0.matches(needle) }
        monitor = DashboardRoute.monitoringRoutes.filter { $0.matches(needle) }
        appHits = needle.isEmpty
            ? []
            : Self.apps(matching: needle, in: installedApps)
    }

    private static func apps(matching needle: String, in installedApps: [InstalledApp]) -> [InstalledApp] {
        installedApps
            .filter { app in
                app.name.lowercased().contains(needle)
                    || app.bundleIdentifier?.lowercased().contains(needle) == true
            }
            .sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
            .prefix(maxAppHits)
            .map { $0 }
    }
}
