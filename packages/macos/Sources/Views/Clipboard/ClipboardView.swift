import OmniCore
import SwiftUI

/// The Clipboard section for searchable, one-click copy history.
///
/// The panel is one Clipboard tab with a filter picker, because a popover only
/// has room for one list. The window gives every filter its own screen
/// (`focus`), driven by the sidebar's Clipboard group, and drops the picker.
struct ClipboardView: View {
    @ObservedObject var viewModel: ClipboardViewModel
    @ObservedObject private var store: ClipboardStore

    let layout: ContentLayout
    private var focus: ClipboardViewModel.Section?

    init(
        viewModel: ClipboardViewModel,
        layout: ContentLayout = .panel,
        focus: ClipboardViewModel.Section? = nil
    ) {
        self.viewModel = viewModel
        store = viewModel.store
        self.layout = layout
        self.focus = focus
    }

    @State private var section: ClipboardViewModel.Section = .all

    var body: some View {
        switch layout {
        case .panel:
            panelLayout
        case .window:
            listPane(for: focus ?? .all)
        }
    }

    private var panelLayout: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            Divider()

            filterPicker

            Divider()

            listPane(for: section)
        }
        .padding(Spacing.inset)
    }

    private func listPane(for section: ClipboardViewModel.Section) -> some View {
        ClipboardListPane(
            viewModel: viewModel,
            items: displayedItems(for: section),
            emptyTitle: emptyTitle(for: section)
        )
        .padding(layout == .panel ? 0 : 16)
    }

    private func displayedItems(for section: ClipboardViewModel.Section) -> [ClipboardItem] {
        store.search(viewModel.searchQuery).filter(section.matches)
    }

    private func emptyTitle(for section: ClipboardViewModel.Section) -> String {
        viewModel.searchQuery.isEmpty ? section.emptyTitle : "No matching results"
    }

    private var header: some View {
        HStack {
            Label("Clipboard", systemImage: "doc.on.clipboard")
                .font(.headline)
                .accessibilityElement(children: .combine)
            Spacer()
            Text("\(store.totalCount) items")
                .font(.caption)
                .monospacedDigit()
                .foregroundColor(.secondary)
            Button(action: { viewModel.refresh() }) {
                Image(systemName: "arrow.clockwise")
                    .frame(width: 24, height: 24)
                    .contentShape(Rectangle())
                    .accessibilityLabel("Refresh")
            }
            .buttonStyle(.borderless)
            .help("Refresh")
        }
        .padding(.bottom, Spacing.lg)
    }

    private var filterPicker: some View {
        Picker("Filter", selection: $section) {
            ForEach(ClipboardViewModel.Section.allCases, id: \.self) { item in
                Text(item.title).tag(item)
            }
        }
        .pickerStyle(.segmented)
        .labelsHidden()
        .accessibilityLabel("Clipboard filter")
    }
}
