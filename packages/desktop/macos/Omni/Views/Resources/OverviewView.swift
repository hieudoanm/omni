import OmniCore
import SwiftUI

/// Compact at-a-glance overview: CPU, Memory, Storage, Swap, and Battery.
struct OverviewView: View {
    @ObservedObject var memoryViewModel: MemoryViewModel
    @ObservedObject var batteryViewModel: BatteryViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            row(
                icon: "cpu",
                title: "CPU",
                percent: memoryViewModel.cpuPercentText,
                valueText: memoryViewModel.cpuValueText,
                threshold: cpuThreshold
            )

            row(
                icon: "memorychip",
                title: "Memory",
                percent: memoryViewModel.memoryPercentText,
                valueText: memoryViewModel.memoryValueText,
                threshold: memoryThreshold
            )

            row(
                icon: "internaldrive",
                title: "Storage",
                percent: memoryViewModel.diskPercentText,
                valueText: memoryViewModel.diskValueText,
                threshold: diskThreshold
            )

            row(
                icon: "arrow.triangle.2.circlepath",
                title: "Swap",
                percent: memoryViewModel.swapPercentText,
                valueText: memoryViewModel.swapValueText,
                threshold: swapThreshold
            )

            batteryRow
        }
        .frame(maxWidth: .infinity, alignment: .topLeading)
    }

    private var batteryRow: some View {
        HStack(spacing: Spacing.md) {
            Image(systemName: "battery.100percent")
                .foregroundColor(.secondary)
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: Spacing.hairline) {
                Text("Battery")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(batteryViewModel.statusText ?? "Unable to read")
                    .font(.system(.callout, design: .monospaced))
                    .monospacedDigit()
                    .foregroundColor(batteryViewModel.statusText == nil ? .secondary : .primary)
            }

            Spacer()

            Text(batteryViewModel.chargePercentText ?? "—")
                .font(.system(.title3, design: .rounded))
                .fontWeight(.semibold)
                .monospacedDigit()
                .foregroundColor(batteryViewModel.chargePercentText == nil ? .secondary : .primary)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(batteryAccessibilityText)
        .accessibilityAddTraits(.updatesFrequently)
    }

    private var batteryAccessibilityText: String {
        if let charge = batteryViewModel.chargePercentText, let status = batteryViewModel.statusText {
            return "Battery, \(charge), \(status)"
        }
        return "Battery, unable to read"
    }

    private var memoryThreshold: UsageThreshold {
        memoryViewModel.memoryStats.map { ThresholdMonitor.status(for: $0.usagePercentage) } ?? .normal
    }

    private var diskThreshold: UsageThreshold {
        memoryViewModel.diskStats.map { ThresholdMonitor.status(for: $0.usagePercentage) } ?? .normal
    }

    private var cpuThreshold: UsageThreshold {
        memoryViewModel.cpuStats.map { ThresholdMonitor.status(for: $0.usage) } ?? .normal
    }

    private var swapThreshold: UsageThreshold {
        memoryViewModel.swapStats.map { ThresholdMonitor.status(for: $0.usagePercentage) } ?? .normal
    }

    private func row(
        icon: String,
        title: String,
        percent: String,
        valueText: String?,
        threshold: UsageThreshold
    ) -> some View {
        HStack(spacing: Spacing.md) {
            Image(systemName: icon)
                .foregroundColor(.secondary)
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: Spacing.hairline) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(valueText ?? "Unable to read")
                    .font(.system(.callout, design: .monospaced))
                    .monospacedDigit()
                    .foregroundColor(valueText == nil ? .secondary : .primary)
            }

            Spacer()

            Text(percent)
                .font(.system(.title3, design: .rounded))
                .fontWeight(.semibold)
                .monospacedDigit()
                .foregroundColor(Color(usageThreshold: threshold))
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(accessibilityText(title: title, percent: percent, valueText: valueText))
        .accessibilityAddTraits(.updatesFrequently)
    }

    private func accessibilityText(title: String, percent: String, valueText: String?) -> String {
        if let valueText {
            return "\(title), \(percent), \(valueText)"
        }
        return "\(title), \(percent), unable to read"
    }
}
