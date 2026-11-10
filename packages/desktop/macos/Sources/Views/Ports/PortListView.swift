import OmniCore
import SwiftUI

struct PortListView: View {
    let ports: [PortInfo]
    let isFiltering: Bool
    let isLoading: Bool
    let errorMessage: String?
    let onKill: (PortInfo) -> Void
    let onForceKill: (PortInfo) -> Void

    var body: some View {
        if let errorMessage {
            errorState(errorMessage)
        } else if ports.isEmpty && isLoading {
            loadingState
        } else if ports.isEmpty {
            emptyState
        } else {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 0) {
                    ForEach(ports) { port in
                        PortRow(
                            port: port,
                            onKill: { onKill(port) },
                            onForceKill: { onForceKill(port) }
                        )
                        if port != ports.last {
                            Divider()
                        }
                    }
                }
            }
            .frame(maxHeight: .infinity)
        }
    }

    private func errorState(_ message: String) -> some View {
        VStack(spacing: Spacing.sm) {
            Image(systemName: "exclamationmark.triangle")
                .font(Typography.emptyStateIcon)
                .foregroundColor(.secondary)
                .accessibilityHidden(true)
            Text(message)
                .font(.headline)
            Text("Port discovery needs /usr/sbin/lsof.")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.huge)
        .accessibilityElement(children: .combine)
    }

    private var loadingState: some View {
        VStack(spacing: Spacing.sm) {
            ProgressView()
                .controlSize(.small)
            Text("Loading ports…")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.huge)
        .accessibilityElement(children: .combine)
    }

    private var emptyState: some View {
        VStack(spacing: Spacing.sm) {
            Image(systemName: "cable.connector")
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
        isFiltering ? "No matching ports" : "No active ports"
    }

    private var detail: String {
        isFiltering
            ? "Try a different port, process, or PID."
            : "Listening TCP and UDP ports will appear here."
    }
}
