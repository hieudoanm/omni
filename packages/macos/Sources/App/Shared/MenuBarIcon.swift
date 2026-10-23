import OmniCore
import SwiftUI

/// The menu-bar indicator: one compact `symbol + value` slot per selected
/// metric, tinted only once a metric crosses its usage threshold.
struct MenuBarIcon: View {
    @ObservedObject var viewModel: MemoryViewModel

    var body: some View {
        HStack(spacing: Spacing.xs) {
            ForEach(viewModel.menuBarItems) { item in
                HStack(spacing: Spacing.iconGap) {
                    Image(systemName: item.metric.systemImage)
                    Text(item.text)
                }
                .foregroundStyle(color(for: item.threshold))
            }
        }
        .font(.system(size: 11, weight: .medium, design: .monospaced))
        .monospacedDigit()
        .fixedSize()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(accessibilityLabel)
        .accessibilityAddTraits(.updatesFrequently)
    }

    /// Normal stays at the menu bar's own foreground so the indicator reads as
    /// part of the system; only elevated and high metrics are tinted.
    private func color(for threshold: UsageThreshold) -> Color {
        switch threshold {
        case .normal: return .primary
        case .elevated: return .orange
        case .high: return .red
        }
    }

    private var accessibilityLabel: String {
        viewModel.menuBarItems
            .map { "\($0.metric.title) \($0.text)" }
            .joined(separator: ", ")
    }
}
