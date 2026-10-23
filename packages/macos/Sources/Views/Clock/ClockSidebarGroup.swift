import SwiftUI

/// The Clock rows for the dashboard sidebar: each one gets its own screen
/// instead of sharing one tab, so the section moves as a group of screens.
///
/// The rows arrive filtered — an empty group is not drawn at all, because a
/// header with nothing under it is noise.
struct ClockSidebarGroup: View {
    let rows: [DashboardRoute]

    var body: some View {
        if rows.isEmpty {
            EmptyView()
        } else {
            Section("Clock") {
                ForEach(rows, id: \.self) { route in
                    Label(route.title, systemImage: route.systemImage)
                        .tag(route)
                }
            }
        }
    }
}
