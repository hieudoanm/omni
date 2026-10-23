import OmniCore
import SwiftUI

/// The app's only window. It hosts both the monitoring sections and the
/// Applications Manager behind one sidebar.
///
/// Unlike the menu-bar panel it is not a tab strip: the sidebar navigates, and
/// each section spreads its sub-sections into cards so the extra width is used.
struct DashboardView: View {
    static let windowID = "dashboard"
    static let windowTitle = "Omni"

    let models: AppViewModels
    @ObservedObject private var router: DashboardRouter

    /// The sidebar search: narrows the sections, and turns an app's name into a
    /// destination of its own.
    @State private var searchQuery = ""

    @Environment(\.openWindow) private var openWindow

    init(models: AppViewModels) {
        self.models = models
        router = models.router
    }

    var body: some View {
        NavigationSplitView {
            sidebar(contents)
        } detail: {
            detail
        }
        .navigationSplitViewStyle(.balanced)
        .frame(
            minWidth: SurfaceLayout.windowMinWidth,
            minHeight: SurfaceLayout.windowMinHeight
        )
        .background(WindowIdentifierTag(identifier: SurfaceVisibilityMonitor.dashboardWindowIdentifier))
        .toolbar { toolbar }
        .onAppear {
            models.register(openWindow: openWindow)
            models.memory.refresh()
        }
        .onDisappear {
            WindowPresenter.restoreMenuBarOnlyMode()
        }
    }

    private func sidebar(_ contents: DashboardSidebar) -> some View {
        VStack(spacing: 0) {
            SearchField(prompt: "Find a section or app", text: $searchQuery)
                .padding(.horizontal, Spacing.md)
                .padding(.bottom, Spacing.sm)

            List(selection: $router.route) {
                if contents.isEmpty {
                    Text("No matches for \u{201C}\(searchQuery.trimmingCharacters(in: .whitespaces))\u{201D}")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                // Alphabetical: Applications, Clipboard, Clock, Monitor.
                ApplicationsSidebarGroup(groups: contents.applications)

                appHits(contents)

                ClipboardSidebarGroup(rows: contents.clipboard)

                ClockSidebarGroup(rows: contents.clock)

                if !contents.monitor.isEmpty {
                    Section("Monitor") {
                        ForEach(contents.monitor, id: \.self) { route in
                            Label(route.title, systemImage: route.systemImage)
                                .tag(route)
                        }
                    }
                }
            }
            .listStyle(.sidebar)
        }
        .navigationSplitViewColumnWidth(
            min: SurfaceMetrics.sidebarMinWidth,
            ideal: SurfaceLayout.sidebarWidth,
            max: SurfaceMetrics.sidebarMaxWidth
        )
    }

    /// What the sidebar shows for the current query.
    private var contents: DashboardSidebar {
        DashboardSidebar(query: searchQuery, installedApps: models.homebrew.installedApps)
    }

    /// Installed apps the query names. They sit with the Applications group,
    /// because that is where they take you.
    @ViewBuilder
    private func appHits(_ contents: DashboardSidebar) -> some View {
        if !contents.appHits.isEmpty {
            Section("Apps matching") {
                ForEach(contents.appHits, id: \.id) { app in
                    Label(app.name, systemImage: "macwindow")
                        .tag(DashboardRoute.app(name: app.name))
                        .help("Open the Apps screen filtered to \(app.name)")
                }
            }
        }
    }

    private var detail: some View {
        content
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            .navigationTitle(router.route.title)
            .navigationSubtitle(subtitle)
    }

    private var subtitle: String {
        switch router.route {
        case .monitor: return "Live"
        case .clipboard: return "Clipboard"
        case .clock: return "Clock"
        case .applications, .app: return "Applications Manager"
        }
    }

    @ToolbarContentBuilder
    private var toolbar: some ToolbarContent {
        ToolbarItem(placement: .primaryAction) {
            Button(action: models.refreshAll) {
                Image(systemName: "arrow.clockwise")
            }
            .help("Refresh All (⌘R)")
        }
        ToolbarItem {
            Button {
                WindowPresenter.present(openWindow, id: SettingsView.windowID)
            } label: {
                Image(systemName: "gear")
            }
            .help("Settings (⌘,)")
        }
    }

    @ViewBuilder
    private var content: some View {
        switch router.route {
        case let .monitor(section):
            monitorContent(section)
        case let .clipboard(section):
            ClipboardView(viewModel: models.clipboard, layout: .window, focus: section)
        case let .clock(section):
            ClockView(viewModel: models.clock, layout: .window, focus: section)
        case let .applications(section):
            HomebrewView(viewModel: models.homebrew, section: section)
        case let .app(name):
            // `.id` so a second search rebuilds the list with the new filter
            // instead of keeping the previous screen's text.
            BrewAppsView(viewModel: models.homebrew, initialQuery: name)
                .id(name)
        }
    }

    /// The window uses `.window` layout everywhere: no segmented pickers, and
    /// each section's sub-sections laid out as cards.
    @ViewBuilder
    private func monitorContent(_ section: SurfaceSection) -> some View {
        switch section {
        case .clipboard:
            ClipboardView(viewModel: models.clipboard, layout: .window)
        case .clock:
            ClockView(viewModel: models.clock, layout: .window)
        case .resources:
            ResourcesView(
                memoryViewModel: models.memory,
                batteryViewModel: models.battery,
                layout: .window
            )
        case .network:
            NetworkView(
                networkViewModel: models.network,
                portsViewModel: models.ports,
                ipViewModel: models.ip,
                layout: .window
            )
        case .apps:
            AppsView(
                appsViewModel: models.apps,
                workspacesViewModel: models.workspaces,
                layout: .window
            )
        }
    }
}
