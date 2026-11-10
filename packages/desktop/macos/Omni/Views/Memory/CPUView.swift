import OmniCore
import SwiftUI

struct CPUView: View {
    let stats: CPUStats?

    var body: some View {
        if let stats {
            let threshold = ThresholdMonitor.status(for: stats.usage)
            VStack(alignment: .leading, spacing: Spacing.tight) {
                HStack {
                    Text("CPU")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text(ByteFormatter.percent(stats.usage))
                        .font(.caption)
                        .fontWeight(.medium)
                        .monospacedDigit()
                        .foregroundColor(Color(usageThreshold: threshold))
                }

                ProgressView(value: min(max(stats.usage / 100, 0), 1))
                    .tint(Color(usageThreshold: threshold))

                Text(stats.loadAverageText)
                    .font(.caption)
                    .lineLimit(1)
                    .truncationMode(.tail)
                    .foregroundColor(.secondary)
            }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("CPU, \(ByteFormatter.percent(stats.usage)) used, \(stats.loadAverageText)")
            .accessibilityAddTraits(.updatesFrequently)
        } else {
            UnavailableView(title: "CPU")
        }
    }
}
