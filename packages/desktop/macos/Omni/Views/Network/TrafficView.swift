import OmniCore
import SwiftUI

/// Live download / upload throughput and per-interface traffic.
struct TrafficView: View {
    @ObservedObject var viewModel: NetworkViewModel

    var body: some View {
        if let stats = viewModel.stats {
            ScrollView {
                VStack(alignment: .leading, spacing: Spacing.inset) {
                    speedsSection(stats: stats)

                    totalsSection

                    interfacesSection(stats: stats)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .frame(maxHeight: .infinity)
        } else {
            emptyState
        }
    }

    private func speedsSection(stats: NetworkStats) -> some View {
        HStack(spacing: Spacing.lg) {
            speedColumn(
                title: "Download",
                symbol: "arrow.down",
                rate: stats.totalReceiveBytesPerSecond
            )
            Divider()
                .frame(height: 34)
            speedColumn(
                title: "Upload",
                symbol: "arrow.up",
                rate: stats.totalSendBytesPerSecond
            )
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(accessibilitySpeedsLabel(stats))")
    }

    private func speedColumn(title: String, symbol: String, rate: Double?) -> some View {
        VStack(alignment: .leading, spacing: Spacing.xxs) {
            Label(title, systemImage: symbol)
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.top, Spacing.sm)
            Text(ByteFormatter.rate(rate))
                .font(.system(.title3, design: .monospaced))
                .fontWeight(.semibold)
                .monospacedDigit()
        }
    }

    private var totalsSection: some View {
        VStack(alignment: .leading, spacing: Spacing.xxs) {
            Text("Total (this session)")
                .font(.caption)
                .foregroundColor(.secondary)
            HStack(spacing: Spacing.lg) {
                totalValue(label: "Received", bytes: viewModel.totalReceivedBytes)
                totalValue(label: "Sent", bytes: viewModel.totalSentBytes)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(accessibilityTotalsLabel)")
    }

    private func totalValue(label: String, bytes: UInt64) -> some View {
        VStack(alignment: .leading, spacing: Spacing.hairline) {
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
            Text(ByteFormatter.humanReadable(bytes))
                .font(.system(.callout, design: .monospaced))
                .monospacedDigit()
        }
    }

    private func interfacesSection(stats: NetworkStats) -> some View {
        let interfaces = relevantInterfaces(stats)
        return VStack(alignment: .leading, spacing: Spacing.xs) {
            ForEach(Array(interfaces.enumerated()), id: \.element.sample.name) { _, interface in
                NetworkInterfaceRow(interface: interface)
            }
        }
    }

    private func relevantInterfaces(_ stats: NetworkStats) -> [NetworkInterfaceStats] {
        stats.interfaces.filter { interface in
            let sample = interface.sample
            return sample.isUp
                && (sample.hasAddress || sample.receivedBytes > 0 || sample.sentBytes > 0)
        }
    }

    private var emptyState: some View {
        VStack(spacing: Spacing.md) {
            Image(systemName: "network.slash")
                .font(.system(size: 36))
                .foregroundColor(.secondary)
            Text("Unable to read network stats")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.giant)
    }

    private var accessibilityTotalsLabel: String {
        "Total received \(ByteFormatter.humanReadable(viewModel.totalReceivedBytes)), "
            + "total sent \(ByteFormatter.humanReadable(viewModel.totalSentBytes))"
    }

    private func accessibilitySpeedsLabel(_ stats: NetworkStats) -> String {
        "Download \(ByteFormatter.rate(stats.totalReceiveBytesPerSecond)), "
            + "upload \(ByteFormatter.rate(stats.totalSendBytesPerSecond))"
    }
}

private struct NetworkInterfaceRow: View {
    let interface: NetworkInterfaceStats

    var body: some View {
        HStack(spacing: Spacing.compact) {
            Image(systemName: interface.sample.kind.systemImage)
                .font(.system(size: 15))
                .foregroundColor(.secondary)
                .frame(width: 20)

            VStack(alignment: .leading, spacing: Spacing.hairline) {
                HStack(spacing: Spacing.xs) {
                    Text(interface.sample.name)
                        .font(.system(.callout, design: .monospaced))
                    Text(interface.sample.kind.displayName)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                HStack(spacing: Spacing.xxs) {
                    statusDot
                    Text(statusText)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: Spacing.hairline) {
                Text("↓ \(ByteFormatter.rate(interface.receiveBytesPerSecond))")
                    .font(.system(.caption, design: .monospaced))
                    .monospacedDigit()
                Text("↑ \(ByteFormatter.rate(interface.sendBytesPerSecond))")
                    .font(.system(.caption, design: .monospaced))
                    .monospacedDigit()
            }
        }
        .padding(.vertical, Spacing.tight)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(accessibilityLabel)")
    }

    private var statusText: String {
        switch status {
        case .connected: return "Connected"
        case .up: return "Link up"
        case .down: return "Down"
        }
    }

    private var statusDot: some View {
        Image(systemName: "circle.fill")
            .font(.system(size: 7))
            .foregroundColor(dotColor)
    }

    private var dotColor: Color {
        switch status {
        case .connected: return .green
        case .up: return .orange
        case .down: return .secondary
        }
    }

    private var status: ConnectionStatus {
        if !interface.sample.isUp {
            return .down
        }
        return interface.sample.hasAddress ? .connected : .up
    }

    private var accessibilityLabel: String {
        "\(interface.sample.name) \(interface.sample.kind.displayName), \(statusText), "
            + "download \(ByteFormatter.rate(interface.receiveBytesPerSecond)), "
            + "upload \(ByteFormatter.rate(interface.sendBytesPerSecond))"
    }
}

private enum ConnectionStatus {
    case connected
    case up
    case down
}

private extension NetworkInterfaceKind {
    var systemImage: String {
        switch self {
        case .wifi: return "wifi"
        case .ethernet: return "cable.connector"
        case .other: return "network"
        }
    }
}
