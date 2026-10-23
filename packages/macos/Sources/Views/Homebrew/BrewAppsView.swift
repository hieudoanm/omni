import AppKit
import OmniCore
import SwiftUI

/// Lists every GUI app installed on the machine, grouped by functional
/// category, with per-app uninstall (Homebrew casks via brew, the rest via
/// Move to Trash).
struct BrewAppsView: View {
    @ObservedObject var viewModel: HomebrewViewModel
    /// Pre-fills the search when the sidebar search sent the user here.
    @State private var searchText: String

    init(viewModel: HomebrewViewModel, initialQuery: String = "") {
        self.viewModel = viewModel
        _searchText = State(initialValue: initialQuery)
    }

    @State private var candidate: InstalledApp?
    @State private var showingConfirmation = false
    @State private var layout: Layout = .list

    enum Layout: String, CaseIterable, Identifiable {
        case list
        case grid

        var id: String {
            rawValue
        }

        var title: String {
            switch self {
            case .list: return "List"
            case .grid: return "Grid"
            }
        }

        var systemImage: String {
            switch self {
            case .list: return "list.bullet"
            case .grid: return "square.grid.2x2"
            }
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            Divider()

            HStack {
                searchField
                Spacer()
                layoutPicker
            }
            .padding(Spacing.md)

            Divider()

            if viewModel.installedApps.isEmpty {
                emptyView
            } else {
                switch layout {
                case .list: contentList
                case .grid: contentGrid
                }
            }
        }
        .navigationTitle("Apps")
        .confirmationDialog(
            candidate?.caskToken != nil ? "Uninstall \(candidate?.name ?? "")?" : "Move \(candidate?.name ?? "") to Trash?",
            isPresented: $showingConfirmation,
            presenting: candidate
        ) { app in
            Button(candidate?.caskToken != nil ? "Uninstall" : "Move to Trash", role: .destructive) {
                runUninstall(app)
            }
            Button("Cancel", role: .cancel) {}
        } message: { app in
            Text(message(app))
        }
    }

    private var header: some View {
        HStack(alignment: .firstTextBaseline) {
            Text("Apps")
                .font(.largeTitle.bold())
            Text("\(viewModel.installedApps.count) installed")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
        }
        .padding(Spacing.xl)
    }

    private var searchField: some View {
        SearchField(prompt: "Search apps", text: $searchText)
    }

    private var layoutPicker: some View {
        Picker("Layout", selection: $layout) {
            ForEach(Layout.allCases) { layout in
                Label(layout.title, systemImage: layout.systemImage)
                    .tag(layout)
            }
        }
        .pickerStyle(.segmented)
        .labelsHidden()
        .accessibilityLabel("Change layout")
    }

    private var contentList: some View {
        List {
            ForEach(groupedApps, id: \.category) { group in
                Section(group.category.rawValue) {
                    ForEach(group.apps) { app in
                        row(app)
                    }
                }
            }
        }
    }

    private var contentGrid: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.xxl) {
                ForEach(groupedApps, id: \.category) { group in
                    VStack(alignment: .leading, spacing: Spacing.compact) {
                        Text(group.category.rawValue)
                            .font(.headline)
                            .padding(.horizontal, Spacing.xl)

                        LazyVGrid(
                            columns: [
                                GridItem(.adaptive(minimum: 100), spacing: Spacing.md),
                            ],
                            spacing: Spacing.md
                        ) {
                            ForEach(group.apps) { app in
                                tile(app)
                            }
                        }
                        .padding(.horizontal, Spacing.xl)
                    }
                }
            }
            .padding(.vertical, Spacing.lg)
        }
    }

    private func tile(_ app: InstalledApp) -> some View {
        Button {
            candidate = app
            showingConfirmation = true
        } label: {
            AppTile(app: app)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(app.name). Select to uninstall.")
        .contextMenu {
            Button(candidateActionTitle(app), role: .destructive) {
                candidate = app
                showingConfirmation = true
            }
        }
    }

    private var groupedApps: [(category: InstalledApp.Category, apps: [InstalledApp])] {
        InstalledApp.Category.allCases.compactMap { category in
            let apps = filteredApps
                .filter { $0.category == category }
                .sorted { $0.name.localizedCompare($1.name) == .orderedAscending }
            return apps.isEmpty ? nil : (category, apps)
        }
    }

    private var filteredApps: [InstalledApp] {
        let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !query.isEmpty else { return viewModel.installedApps }
        return viewModel.installedApps.filter { app in
            app.name.lowercased().contains(query)
                || app.bundleIdentifier?.lowercased().contains(query) == true
        }
    }

    private func row(_ app: InstalledApp) -> some View {
        Button {
            candidate = app
            showingConfirmation = true
        } label: {
            BrewAppRow(app: app)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(app.name). Select to uninstall.")
        .contextMenu {
            Button(candidateActionTitle(app), role: .destructive) {
                candidate = app
                showingConfirmation = true
            }
        }
    }

    private var emptyView: some View {
        VStack(spacing: Spacing.md) {
            Image(systemName: "macwindow")
                .font(Typography.emptyStateTitle)
                .foregroundStyle(.secondary)
            Text("No apps found")
                .font(.headline)
            Text("Installed apps under /Applications and ~/Applications will appear here.")
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func candidateActionTitle(_ app: InstalledApp) -> String {
        app.caskToken != nil ? "Uninstall \(app.name)…" : "Move \(app.name) to Trash…"
    }

    private func message(_ app: InstalledApp) -> String {
        if let token = app.caskToken {
            return "This will remove the Homebrew cask \"\(token)\"."
        }
        return "The app at \(app.path) will be moved to the Trash."
    }

    private func runUninstall(_ app: InstalledApp) {
        Task {
            if app.caskToken != nil {
                await viewModel.uninstallCaskApp(app)
            } else {
                await viewModel.trashApp(app)
            }
        }
    }
}
