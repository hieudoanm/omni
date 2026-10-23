import OmniCore
import SwiftUI

/// The Apps section: running apps and saved workspaces.
struct AppsView: View {
    @ObservedObject var appsViewModel: AppsViewModel
    @ObservedObject var workspacesViewModel: WorkspacesViewModel

    let layout: ContentLayout

    init(
        appsViewModel: AppsViewModel,
        workspacesViewModel: WorkspacesViewModel,
        layout: ContentLayout = .panel
    ) {
        self.appsViewModel = appsViewModel
        self.workspacesViewModel = workspacesViewModel
        self.layout = layout
    }

    private enum Section: Hashable, CaseIterable {
        case running
        case workspaces

        var title: String {
            switch self {
            case .running: return "Running"
            case .workspaces: return "Workspaces"
            }
        }

        var systemImage: String {
            switch self {
            case .running: return "macwindow"
            case .workspaces: return "square.grid.2x2"
            }
        }
    }

    @State private var section: Section = .running

    var body: some View {
        switch layout {
        case .panel:
            panelLayout
        case .window:
            windowLayout
        }
    }

    private var panelLayout: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            Divider()

            sectionPicker

            Divider()

            sectionContent(section)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        }
        .padding(Spacing.inset)
    }

    private var windowLayout: some View {
        SectionGrid(
            items: Section.allCases,
            title: \.title,
            minimumColumnWidth: 340,
            cardHeight: 420
        ) { item in
            sectionContent(item)
        }
    }

    private var header: some View {
        HStack {
            Label("Apps", systemImage: "macwindow")
                .font(.headline)
                .accessibilityElement(children: .combine)
            Spacer()
            Button(action: refreshAll) {
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

    private var sectionPicker: some View {
        Picker("Section", selection: $section) {
            ForEach(Section.allCases, id: \.self) { item in
                Text(item.title).tag(item)
            }
        }
        .pickerStyle(.segmented)
        .labelsHidden()
        .accessibilityLabel("Apps section")
    }

    @ViewBuilder
    private func sectionContent(_ section: Section) -> some View {
        switch section {
        case .running:
            RunningAppsSectionView(viewModel: appsViewModel)
        case .workspaces:
            WorkspacesSectionView(viewModel: workspacesViewModel)
        }
    }

    private func refreshAll() {
        appsViewModel.refresh()
        workspacesViewModel.refresh()
    }
}
