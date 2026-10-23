import OmniCore
import SwiftUI

/// Battery health section within the Resources tab.
struct BatterySectionView: View {
    @ObservedObject var viewModel: BatteryViewModel

    var body: some View {
        content
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            .task {
                viewModel.start()
            }
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .unavailable:
            statusState(
                symbol: "battery.0",
                title: "Battery unavailable",
                detail: "Unable to read battery information on this Mac."
            )
        case let .loaded(info):
            loadedContent(info)
        }
    }

    private func loadedContent(_ info: BatteryInfo) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.inset) {
                overview(info)

                details(info)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(maxHeight: .infinity)
    }

    private func overview(_ info: BatteryInfo) -> some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: Spacing.hairline) {
                    Text("\(Int(info.chargePercentage.rounded()))%")
                        .font(Typography.percentage)
                        .monospacedDigit()
                    Text(info.statusText)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()
                Image(systemName: info.chargeIconName)
                    .font(.system(size: 34, weight: .medium))
                    .foregroundColor(chargeColor(info))
                    .accessibilityHidden(true)
            }

            ProgressView(value: min(max(info.chargePercentage / 100, 0), 1))
                .tint(chargeColor(info))
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityOverviewLabel(info))
    }

    private func details(_ info: BatteryInfo) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            BatteryRow(label: "Power Source", value: info.powerSourceText)
            BatteryRow(label: "Time Remaining", value: info.timeRemainingText)
            BatteryRow(label: "Time to Full Charge", value: info.timeToFullText)
            BatteryRow(label: "Capacity", value: info.capacityText)
            BatteryRow(label: "Cycle Count", value: info.cycleCountText)
            BatteryRow(label: "Temperature", value: info.temperatureText, mono: true)
            BatteryRow(label: "Condition", value: info.healthCondition, mono: true)
            BatteryRow(label: "Adapter", value: info.adapterText)
        }
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

    private func chargeColor(_ info: BatteryInfo) -> Color {
        if info.isACPowered && !info.isCharging {
            return Color.accentColor
        }
        if info.chargePercentage < 20 {
            return .red
        }
        if info.chargePercentage < 40 {
            return .orange
        }
        return info.isCharging ? .green : Color.accentColor
    }

    private func accessibilityOverviewLabel(_ info: BatteryInfo) -> String {
        let time = info.isCharging
            ? (info.timeToFullText.map { ", \($0) until fully charged" } ?? "")
            : (info.timeRemainingText.map { ", \($0) remaining" } ?? "")
        return "Battery \(Int(info.chargePercentage.rounded())) percent, \(info.statusText)\(time)"
    }
}

private struct BatteryRow: View {
    let label: String
    let value: String?
    var mono = false

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(label.uppercased())
                .font(.caption2)
                .foregroundColor(.secondary)
            Spacer()
            Text(value ?? "—")
                .font(mono ? .system(.caption, design: .monospaced) : .caption)
                .fontWeight(value == nil ? .regular : .medium)
                .foregroundColor(value == nil ? Palette.dimmed : .primary)
                .multilineTextAlignment(.trailing)
                .textSelection(.enabled)
        }
        .padding(.vertical, Spacing.tight)
        .overlay(alignment: .bottom) {
            Divider()
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label), \(value ?? "unavailable")")
    }
}
