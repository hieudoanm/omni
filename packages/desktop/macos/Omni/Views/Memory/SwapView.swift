import OmniCore
import SwiftUI

struct SwapView: View {
    let stats: SwapStats?

    var body: some View {
        if let stats, stats.totalBytes > 0 {
            ResourceMeter(
                title: "Swap",
                usedBytes: stats.usedBytes,
                totalBytes: stats.totalBytes,
                percentage: stats.usagePercentage
            )
        } else {
            UnavailableView(title: "Swap")
        }
    }
}
