import OmniCore
import SwiftUI

struct DiskView: View {
    let stats: DiskStats?

    var body: some View {
        if let stats {
            ResourceMeter(
                title: "Storage",
                usedBytes: stats.usedBytes,
                totalBytes: stats.totalBytes,
                percentage: stats.usagePercentage,
                detailTexts: [
                    ByteFormatter.diskAvailability(
                        available: stats.availableBytes,
                        purgeable: stats.purgeableBytes
                    ),
                ]
            )
        } else {
            UnavailableView(title: "Storage")
        }
    }
}
