import OmniCore
import SwiftUI

struct InstalledView: View {
    @ObservedObject var viewModel: HomebrewViewModel
    @State private var selectedPackage: Package?
    @State private var searchText = ""
    @State private var sortOrder: SortOrder = .name

    enum SortOrder: String, CaseIterable, Identifiable {
        case name = "Name"
        case type = "Type"

        var id: String {
            rawValue
        }
    }

    private var formulae: [Package] {
        filtered.filter { $0.type == .formula }.sorted()
    }

    private var casks: [Package] {
        filtered.filter { $0.type == .cask }.sorted()
    }

    private var filtered: [Package] {
        let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let base = viewModel.installedPackages
        let result = query.isEmpty ? base : base.filter { $0.name.lowercased().contains(query) }
        if sortOrder == .type {
            return result.sorted { $0.type.rawValue < $1.type.rawValue }
        }
        return result
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            Divider()

            HStack {
                searchField
                Spacer()
                Picker("Sort", selection: $sortOrder) {
                    ForEach(SortOrder.allCases) { order in
                        Text(order.rawValue).tag(order)
                    }
                }
                .pickerStyle(.menu)
                .frame(width: 120)
                .accessibilityLabel("Sort order")
            }
            .padding(Spacing.md)

            Divider()

            if viewModel.installedPackages.isEmpty {
                emptyView
            } else {
                packageList
            }
        }
        .navigationTitle("Installed")
    }

    private var header: some View {
        HStack {
            Text("Installed")
                .font(.largeTitle.bold())
            Spacer()
        }
        .padding(Spacing.xl)
    }

    private var searchField: some View {
        SearchField(prompt: "Search installed", text: $searchText)
    }

    private var packageList: some View {
        List {
            if !formulae.isEmpty {
                Section("Formulae") {
                    ForEach(formulae) { package in
                        row(package)
                    }
                }
            }
            if !casks.isEmpty {
                Section("Casks") {
                    ForEach(casks) { package in
                        row(package)
                    }
                }
            }
        }
    }

    private func row(_ package: Package) -> some View {
        let outdated = viewModel.outdatedNames.contains(package.name)
        return Button {
            selectedPackage = package
        } label: {
            PackageRow(package: package)
            if outdated {
                Text("Update available")
                    .font(.caption)
                    .foregroundStyle(.orange)
                    .accessibilityLabel("Update available")
            }
        }
        .buttonStyle(.plain)
    }

    private var emptyView: some View {
        VStack(spacing: Spacing.md) {
            Image(systemName: "shippingbox")
                .font(Typography.emptyStateTitle)
                .foregroundStyle(.secondary)
            Text("Nothing installed")
                .font(.headline)
            Text("Installed formulae and casks will appear here.")
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func detailSheet(_ package: Package) -> some View {
        PackageDetailView(
            package: package,
            isLoading: viewModel.isLoading,
            onInstall: {
                Task { await viewModel.install(package) }
            },
            onUpgrade: {
                Task { await viewModel.upgrade(package) }
            },
            onUninstall: {
                Task { await viewModel.uninstall(package) }
            }
        )
        .frame(minWidth: 480, minHeight: 420)
    }
}
