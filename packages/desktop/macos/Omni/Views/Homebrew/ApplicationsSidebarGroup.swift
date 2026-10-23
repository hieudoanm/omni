import SwiftUI

/// The Applications rows for the dashboard sidebar: the system apps first, then
/// the Homebrew formula groups — the order the standalone Applications Manager
/// window used.
///
/// The rows arrive filtered; a group with nothing left is not drawn at all.
struct ApplicationsSidebarGroup: View {
    let groups: [(group: HomebrewViewModel.Section.Group, routes: [DashboardRoute])]

    var body: some View {
        if groups.isEmpty {
            EmptyView()
        } else {
            ForEach(groups, id: \.group) { entry in
                Section(entry.group.title) {
                    ForEach(entry.routes, id: \.self) { route in
                        Label(route.title, systemImage: route.systemImage)
                            .tag(route)
                    }
                }
            }
        }
    }
}
