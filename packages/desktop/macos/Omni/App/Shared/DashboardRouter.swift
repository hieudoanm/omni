import SwiftUI

/// Selection for the dashboard window, owned outside the view hierarchy so the
/// menu-bar panel can navigate the window it does not own (for example the
/// Applications Manager button).
@MainActor
final class DashboardRouter: ObservableObject {
    @Published var route: DashboardRoute

    init(route: DashboardRoute = .default) {
        self.route = route
    }

    func show(_ route: DashboardRoute) {
        self.route = route
    }
}
