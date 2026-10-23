import Darwin
import Foundation
import OmniCore

/// Reads swap usage through the Mach `vm.swapusage` sysctl.
public final class SwapMonitor {
    public init() {}

    public func read() -> Result<SwapStats, MonitorError> {
        var swap = xsw_usage()
        var size = MemoryLayout<xsw_usage>.size

        let result = sysctlbyname("vm.swapusage", &swap, &size, nil, 0)
        guard result == 0 else {
            return .failure(.unableToReadSwap)
        }

        return .success(SwapStats(usedBytes: swap.xsu_used, totalBytes: swap.xsu_total))
    }
}
