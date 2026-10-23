import OmniCore
import SwiftUI

/// A-record lookup for a domain, part of the IP section.
struct IPDNSLookupView: View {
    @ObservedObject var viewModel: IPViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                inputRow

                result
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, Spacing.xxs)
        }
        .frame(maxHeight: .infinity)
    }

    private var inputRow: some View {
        HStack(spacing: Spacing.xs) {
            TextField("example.com", text: $viewModel.domain)
                .textFieldStyle(.roundedBorder)
                .font(.system(.caption, design: .monospaced))
                .onSubmit { runLookup() }
            Button {
                runLookup()
            } label: {
                Text("Lookup")
                    .font(.caption)
            }
            .disabled(viewModel.domain.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }
    }

    @ViewBuilder
    private var result: some View {
        switch viewModel.dnsState {
        case .idle:
            Text("Enter a domain to look up its A record.")
                .font(.caption)
                .foregroundColor(.secondary)
                .frame(maxWidth: .infinity, alignment: .leading)
        case .loading:
            HStack(spacing: Spacing.xs) {
                ProgressView()
                    .controlSize(.small)
                Text("Looking up…")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        case let .loaded(response):
            VStack(alignment: .leading, spacing: Spacing.xxs) {
                if response.status == 0 {
                    Text(response.answersText)
                        .font(.system(.callout, design: .monospaced))
                        .textSelection(.enabled)
                } else {
                    Text("No A records found")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                DisclosureGroup("Response") {
                    Text(JSONText.string(for: response))
                        .font(.system(.caption, design: .monospaced))
                        .foregroundColor(.secondary)
                        .textSelection(.enabled)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .font(.caption)
            }
        case let .failed(message):
            Label(message, systemImage: "exclamationmark.triangle")
                .font(.caption)
                .foregroundColor(.red)
        }
    }

    private func runLookup() {
        guard !viewModel.domain.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        Task { await viewModel.lookupDNS() }
    }
}
