import OmniCore
import SwiftUI

/// Running apps section within the Apps tab: bring an app's windows to the front.
struct RunningAppsSectionView: View {
    @ObservedObject var viewModel: AppsViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            searchField

            Divider()

            if viewModel.filteredApps.isEmpty {
                emptyState
            } else {
                AppsListView(
                    apps: viewModel.filteredApps,
                    onSelect: { viewModel.bringAllWindowsToFront($0) }
                )
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
    }

    private var searchField: some View {
        HStack(spacing: Spacing.xs) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
                .accessibilityHidden(true)
            TextField("Search apps", text: $viewModel.searchQuery)
                .textFieldStyle(.plain)
                .font(.system(.body, design: .monospaced))
            if !viewModel.searchQuery.isEmpty {
                Button {
                    viewModel.searchQuery = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.secondary)
                        .accessibilityLabel("Clear search")
                }
                .buttonStyle(.borderless)
                .help("Clear search")
            }
            Spacer()
            Text("\(viewModel.apps.count) running")
                .font(.caption)
                .monospacedDigit()
                .foregroundColor(.secondary)
        }
        .padding(.vertical, Spacing.sm)
    }

    private var emptyState: some View {
        VStack(spacing: Spacing.sm) {
            Image(systemName: "macwindow")
                .font(Typography.emptyStateIcon)
                .foregroundColor(.secondary)
                .accessibilityHidden(true)
            Text(title)
                .font(.headline)
            Text(detail)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.huge)
        .accessibilityElement(children: .combine)
    }

    private var title: String {
        viewModel.isFiltering ? "No matching apps" : "No running apps"
    }

    private var detail: String {
        viewModel.isFiltering
            ? "Try a different app name or bundle ID."
            : "Open apps with a Dock icon will appear here."
    }
}
