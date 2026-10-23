import OmniCore
import SwiftUI

/// IP and DNS section within the Network section.
struct IPSectionView: View {
    @ObservedObject var viewModel: IPViewModel

    let layout: ContentLayout

    init(viewModel: IPViewModel, layout: ContentLayout = .panel) {
        self.viewModel = viewModel
        self.layout = layout
    }

    private enum Section: Hashable, CaseIterable {
        case myIP
        case dnsLookup

        var title: String {
            switch self {
            case .myIP: return "My IP"
            case .dnsLookup: return "DNS Lookup"
            }
        }
    }

    @State private var section: Section = .myIP

    var body: some View {
        layoutBody
            .task {
                await viewModel.refresh()
            }
    }

    @ViewBuilder
    private var layoutBody: some View {
        switch layout {
        case .panel:
            panelLayout
        case .window:
            windowLayout
        }
    }

    private var panelLayout: some View {
        VStack(alignment: .leading, spacing: 0) {
            sectionPicker

            Divider()

            sectionContent(section)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
    }

    /// The window has the column height to show both halves at once, so the
    /// picker becomes two labelled blocks.
    private var windowLayout: some View {
        VStack(alignment: .leading, spacing: Spacing.compact) {
            ForEach(Section.allCases, id: \.self) { item in
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    Text(item.title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                    sectionContent(item)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    @ViewBuilder
    private func sectionContent(_ section: Section) -> some View {
        switch section {
        case .myIP:
            myIPContent
        case .dnsLookup:
            IPDNSLookupView(viewModel: viewModel)
        }
    }

    private var sectionPicker: some View {
        Picker("Section", selection: $section) {
            ForEach(Section.allCases, id: \.self) { item in
                Text(item.title).tag(item)
            }
        }
        .pickerStyle(.segmented)
        .labelsHidden()
        .accessibilityLabel("IP section")
    }

    @ViewBuilder
    private var myIPContent: some View {
        switch viewModel.state {
        case .idle, .loading:
            loadingState
        case .offline:
            statusState(symbol: "wifi.slash", title: "Offline", detail: "Reconnect to the network and try again.")
        case let .failed(message):
            statusState(symbol: "exclamationmark.triangle", title: message, detail: "Unable to determine IP information.")
        case let .loaded(info):
            IPDetailsView(info: info, vpnDetected: viewModel.vpnDetected)
        }
    }

    private var loadingState: some View {
        VStack(spacing: Spacing.sm) {
            ProgressView()
                .controlSize(.small)
            Text("Looking up your IP…")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.huge)
        .accessibilityElement(children: .combine)
    }

    private func statusState(symbol: String, title: String, detail: String) -> some View {
        VStack(spacing: Spacing.sm) {
            Image(systemName: symbol)
                .font(Typography.emptyStateIcon)
                .foregroundColor(.secondary)
                .accessibilityHidden(true)
            Text(title)
                .font(.headline)
                .multilineTextAlignment(.center)
            Text(detail)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.huge)
        .accessibilityElement(children: .combine)
    }
}
