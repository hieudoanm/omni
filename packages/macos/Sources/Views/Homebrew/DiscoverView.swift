import OmniCore
import SwiftUI

struct DiscoverView: View {
    @ObservedObject var viewModel: HomebrewViewModel
    @State private var selectedPackage: Package?

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            Divider()

            searchField

            if viewModel.isLoading && viewModel.searchResults.isEmpty {
                Spacer()
                ProgressView("Searching…")
                    .frame(maxWidth: .infinity)
                Spacer()
            } else if hasQuery {
                resultList
            } else {
                emptyPrompt
            }
        }
        .navigationTitle("Discover")
    }

    private var header: some View {
        HStack {
            Text("Discover")
                .font(.largeTitle.bold())
            Spacer()
        }
        .padding(Spacing.xl)
    }

    private var searchField: some View {
        HStack(spacing: Spacing.sm) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(.secondary)
                .accessibilityHidden(true)
            TextField("Search packages…", text: $viewModel.searchQuery)
                .textFieldStyle(.plain)
                .font(.title3)
                .onSubmit { viewModel.search() }
                .accessibilityLabel("Search packages")
            if !viewModel.searchQuery.isEmpty {
                Button {
                    viewModel.searchQuery = ""
                    viewModel.search()
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(.secondary)
                        .accessibilityLabel("Clear search")
                }
                .buttonStyle(.borderless)
            }
        }
        .padding(Spacing.inset)
        .onChange(of: viewModel.searchQuery) { _ in
            viewModel.search()
        }
    }

    private var hasQuery: Bool {
        !viewModel.searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private var resultList: some View {
        List(viewModel.searchResults) { package in
            Button {
                selectedPackage = package
            } label: {
                PackageRow(package: package)
            }
            .buttonStyle(.plain)
        }
        .sheet(item: $selectedPackage) { package in
            detailSheet(package)
        }
    }

    private var emptyPrompt: some View {
        VStack(spacing: Spacing.md) {
            Image(systemName: "magnifyingglass")
                .font(Typography.emptyStateTitle)
                .foregroundStyle(.secondary)
            Text("Search Homebrew packages")
                .font(.headline)
            Text("Find formulae and casks to install, inspect, and manage.")
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func detailSheet(_ package: Package) -> some View {
        PackageDetailView(
            package: package,
            isLoading: viewModel.isLoading,
            onInstall: {
                Task {
                    await viewModel.install(package)
                    await viewModel.refreshDiscover()
                }
            },
            onUpgrade: {},
            onUninstall: {}
        )
        .frame(minWidth: 480, minHeight: 420)
    }
}
