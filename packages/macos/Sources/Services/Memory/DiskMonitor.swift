import Foundation
import OmniCore

/// Reads disk capacity through Foundation volume resource values.
///
/// Used = total capacity − available capacity (for important usage). The
/// "important usage" metric excludes purgeable files that the system can
/// reclaim, matching what the user perceives as consumed storage. Free and
/// purgeable amounts are exposed for the details view.
public final class DiskMonitor {
    private let targetURL: URL

    public init(targetURL: URL = URL(fileURLWithPath: "/")) {
        self.targetURL = targetURL
    }

    public func read() -> Result<DiskStats, MonitorError> {
        let keys: Set<URLResourceKey> = [
            .volumeTotalCapacityKey,
            .volumeAvailableCapacityForImportantUsageKey,
            .volumeAvailableCapacityForOpportunisticUsageKey,
        ]

        guard let values = try? targetURL.resourceValues(forKeys: keys), let total = values.volumeTotalCapacity, total >= 0 else {
            return .failure(.unavailableFileSystem)
        }

        let totalBytes = UInt64(total)
        let availableBytes = UInt64(values.volumeAvailableCapacityForImportantUsage ?? Int64(total))
        let opportunisticBytes = UInt64(values.volumeAvailableCapacityForOpportunisticUsage ?? Int64(total))
        let purgeableBytes = opportunisticBytes >= availableBytes ? opportunisticBytes - availableBytes : 0
        let usedBytes = totalBytes - min(availableBytes, totalBytes)

        return .success(DiskStats(
            usedBytes: usedBytes,
            totalBytes: totalBytes,
            availableBytes: availableBytes,
            purgeableBytes: purgeableBytes
        ))
    }
}
