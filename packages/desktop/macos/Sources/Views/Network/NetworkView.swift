import OmniCore
import SwiftUI

/// The Network section: live traffic, listening ports, and IP / DNS lookups.
struct NetworkView: View {
    @ObservedObject var networkViewModel: NetworkViewModel
    @ObservedObject var portsViewModel: PortsViewModel
    @ObservedObject var ipViewModel: IPViewModel

    let layout: ContentLayout

    init(
        networkViewModel: NetworkViewModel,
        portsViewModel: PortsViewModel,
        ipViewModel: IPViewModel,
        layout: ContentLayout = .panel
    ) {
        self.networkViewModel = networkViewModel
        self.portsViewModel = portsViewModel
        self.ipViewModel = ipViewModel
        self.layout = layout
    }

    private enum Section: Hashable, CaseIterable {
        case traffic
        case ports
        case ip

        var title: String {
            switch self {
            case .traffic: return "Traffic"
            case .ports: return "Ports"
            case .ip: return "IP & DNS"
            }
        }
    }

    @State private var section: Section = .traffic

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
            cardHeight: 380
        ) { item in
            sectionContent(item)
        }
    }

    private var header: some View {
        HStack {
            Label("Network", systemImage: "network")
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
        .accessibilityLabel("Network section")
    }

    @ViewBuilder
    private func sectionContent(_ section: Section) -> some View {
        switch section {
        case .traffic:
            TrafficView(viewModel: networkViewModel)
        case .ports:
            PortsSectionView(viewModel: portsViewModel)
        case .ip:
            IPSectionView(viewModel: ipViewModel, layout: layout)
        }
    }

    private func refreshAll() {
        networkViewModel.refresh()
        Task { await portsViewModel.refresh() }
        Task { await ipViewModel.refresh() }
    }
}
