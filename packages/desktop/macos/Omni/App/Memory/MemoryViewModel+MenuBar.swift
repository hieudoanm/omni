import OmniCore

/// Composes the menu-bar indicator: one slot per selected metric, each honouring
/// the configured `MenuBarDisplay` style and tinted by its usage threshold.
extension MemoryViewModel {
    var menuBarItems: [MenuBarItemValue] {
        menuBarMetrics.values.map(item(for:))
    }

    private func item(for metric: MenuBarMetric) -> MenuBarItemValue {
        MenuBarItemValue(
            metric: metric,
            text: text(for: metric),
            threshold: threshold(for: metric)
        )
    }

    private func text(for metric: MenuBarMetric) -> String {
        switch menuBarDisplay {
        case .percentage:
            return percentText(for: metric)
        case .value:
            return valueText(for: metric) ?? unavailableText
        case .usedOverTotal:
            return usedOverTotalText(for: metric) ?? unavailableText
        }
    }

    private func percentText(for metric: MenuBarMetric) -> String {
        switch metric {
        case .cpu: return cpuPercentText
        case .memory: return memoryPercentText
        case .disk: return diskPercentText
        case .swap: return swapPercentText
        }
    }

    private func valueText(for metric: MenuBarMetric) -> String? {
        switch metric {
        case .cpu: return cpuValueText
        case .memory: return memoryStats.map { ByteFormatter.humanReadable($0.usedBytes) }
        case .disk: return diskStats.map { ByteFormatter.humanReadable($0.usedBytes) }
        case .swap: return swapStats.map { ByteFormatter.humanReadable($0.usedBytes) }
        }
    }

    private func usedOverTotalText(for metric: MenuBarMetric) -> String? {
        switch metric {
        case .cpu: return cpuValueText
        case .memory: return memoryValueText
        case .disk: return diskValueText
        case .swap: return swapValueText
        }
    }

    private func threshold(for metric: MenuBarMetric) -> UsageThreshold {
        let percentage: Double?
        switch metric {
        case .cpu: percentage = cpuStats?.usage
        case .memory: percentage = memoryStats?.usagePercentage
        case .disk: percentage = diskStats?.usagePercentage
        case .swap: percentage = swapStats?.usagePercentage
        }
        guard let percentage else { return .normal }
        return ThresholdMonitor.status(for: percentage)
    }
}

private let unavailableText = "--"
