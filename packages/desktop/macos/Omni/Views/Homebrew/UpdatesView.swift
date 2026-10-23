import OmniCore
import SwiftUI

struct UpdatesView: View {
    @ObservedObject var viewModel: HomebrewViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            Divider()

            if viewModel.outdatedPackages.isEmpty {
                upToDateView
            } else {
                outdatedList
            }
        }
        .navigationTitle("Updates")
    }

    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: Spacing.xxs) {
                Text("Updates")
                    .font(.largeTitle.bold())
                Text(summaryText)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Button {
                Task { await viewModel.refreshHomebrew() }
            } label: {
                Label("Check for Updates", systemImage: "arrow.clockwise.circle")
            }
            .disabled(viewModel.isLoading)
            if case let count = viewModel.outdatedPackages.count, count > 0 {
                Button {
                    Task { await viewModel.upgradeAll() }
                } label: {
                    Label("Upgrade All", systemImage: "arrow.up.circle")
                }
                .disabled(viewModel.isLoading)
            }
        }
        .padding(Spacing.xl)
    }

    private var summaryText: String {
        let count = viewModel.outdatedPackages.count
        return count == 1 ? "1 package can be upgraded" : "\(count) packages can be upgraded"
    }

    private var outdatedList: some View {
        List(viewModel.outdatedPackages) { package in
            HStack {
                VStack(alignment: .leading, spacing: Spacing.hairline) {
                    Text(package.name)
                        .font(.headline)
                    HStack(spacing: Spacing.xs) {
                        Text(package.installedVersion ?? "unknown")
                            .strikethrough()
                            .foregroundStyle(.secondary)
                        Image(systemName: "arrow.right")
                            .foregroundStyle(.secondary)
                            .font(.caption)
                        Text(package.currentVersion)
                    }
                    .font(.subheadline)
                }
                Spacer()
                Button {
                    Task { await viewModel.upgrade(package) }
                } label: {
                    Image(systemName: "arrow.up")
                        .accessibilityLabel("Upgrade \(package.name)")
                }
                .disabled(viewModel.isLoading)
            }
            .padding(.vertical, Spacing.xxs)
        }
    }

    private var upToDateView: some View {
        VStack(spacing: Spacing.md) {
            Image(systemName: "checkmark.seal")
                .font(Typography.emptyStateTitle)
                .foregroundStyle(.green)
            Text("All packages are up to date")
                .font(.headline)
            Text("Use Check for Updates to refresh Homebrew metadata.")
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
