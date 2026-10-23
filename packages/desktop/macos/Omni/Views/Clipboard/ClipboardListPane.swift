import OmniCore
import SwiftUI

/// Search, results, and the pinned-count footer for the Clipboard section. Both
/// surfaces use it; only the surrounding chrome differs.
struct ClipboardListPane: View {
    @ObservedObject var viewModel: ClipboardViewModel
    let items: [ClipboardItem]
    let emptyTitle: String

    @ObservedObject private var store: ClipboardStore

    init(viewModel: ClipboardViewModel, items: [ClipboardItem], emptyTitle: String) {
        self.viewModel = viewModel
        self.items = items
        self.emptyTitle = emptyTitle
        store = viewModel.store
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            searchField

            Divider()

            results

            Divider()

            footer
        }
    }

    @ViewBuilder
    private var results: some View {
        if items.isEmpty {
            emptyState
        } else {
            ClipboardItemList(
                items: items,
                store: store,
                onCopy: { viewModel.copyToClipboard($0) }
            )
        }
    }

    private var searchField: some View {
        HStack(spacing: Spacing.xs) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
                .accessibilityHidden(true)
            TextField("Search clipboard history", text: $viewModel.searchQuery)
                .textFieldStyle(.plain)
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
        }
        .padding(.vertical, Spacing.sm)
    }

    private var emptyState: some View {
        VStack(spacing: Spacing.md) {
            Image(systemName: "doc.on.clipboard")
                .font(.system(size: 36))
                .foregroundColor(.secondary)
            Text(emptyTitle)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.giant)
    }

    private var footer: some View {
        HStack {
            Text("\(store.pinnedCount) pinned")
                .font(.caption)
                .foregroundColor(.secondary)
            Spacer()
            Button("Clear Unpinned") {
                store.clearUnpinned()
            }
            .buttonStyle(.borderless)
            .font(.caption)
            .disabled(store.pinnedCount == store.totalCount)
            .help("Remove all unpinned items")
        }
        .padding(.top, Spacing.compact)
    }
}
