import OmniCore
import SwiftUI

struct ResourceMeter: View {
    let title: String
    let usedBytes: UInt64
    let totalBytes: UInt64
    let percentage: Double
    let detailTexts: [String]

    init(
        title: String,
        usedBytes: UInt64,
        totalBytes: UInt64,
        percentage: Double,
        detailTexts: [String] = []
    ) {
        self.title = title
        self.usedBytes = usedBytes
        self.totalBytes = totalBytes
        self.percentage = percentage
        self.detailTexts = detailTexts
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.tight) {
            HStack {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                Text("\(ByteFormatter.percent(percentage)) used")
                    .font(.caption)
                    .fontWeight(.medium)
                    .monospacedDigit()
                    .foregroundColor(thresholdColor)
            }

            ProgressView(value: fraction)
                .tint(thresholdColor)

            Text(ByteFormatter.usedOverTotal(usedBytes: usedBytes, totalBytes: totalBytes))
                .font(.system(.caption, design: .monospaced))
                .monospacedDigit()
                .foregroundColor(.secondary)

            ForEach(detailTexts, id: \.self) { text in
                Text(text)
                    .font(.caption)
                    .lineLimit(1)
                    .truncationMode(.tail)
                    .foregroundColor(.secondary)
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Self.accessibilityLabel(
            title: title,
            usedBytes: usedBytes,
            totalBytes: totalBytes,
            percentage: percentage
        ))
        .accessibilityAddTraits(.updatesFrequently)
    }

    private var fraction: Double {
        min(max(percentage / 100, 0), 1)
    }

    private var thresholdColor: Color {
        Color(usageThreshold: ThresholdMonitor.status(for: percentage))
    }

    private static func accessibilityLabel(
        title: String,
        usedBytes: UInt64,
        totalBytes: UInt64,
        percentage: Double
    ) -> String {
        "\(title), \(ByteFormatter.percent(percentage)) used, "
            + "\(ByteFormatter.usedOverTotal(usedBytes: usedBytes, totalBytes: totalBytes))"
    }
}
