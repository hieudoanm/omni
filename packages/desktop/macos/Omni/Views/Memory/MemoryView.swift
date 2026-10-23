import OmniCore
import SwiftUI

struct MemoryView: View {
    let stats: MemoryStats?

    var body: some View {
        if let stats {
            ResourceMeter(
                title: "Memory",
                usedBytes: stats.usedBytes,
                totalBytes: stats.totalBytes,
                percentage: stats.usagePercentage,
                detailTexts: [
                    ByteFormatter.memoryBreakdown(
                        active: stats.activeBytes,
                        wired: stats.wiredBytes,
                        compressed: stats.compressedBytes
                    ),
                    ByteFormatter.memoryAvailability(
                        inactive: stats.inactiveBytes,
                        cached: stats.cachedBytes,
                        free: stats.freeBytes
                    ),
                ]
            )
        } else {
            UnavailableView(title: "Memory")
        }
    }
}
