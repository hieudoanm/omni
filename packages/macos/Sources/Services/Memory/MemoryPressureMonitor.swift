import Darwin
import Foundation
import OmniCore

/// Reads the current memory-pressure level through the
/// `kern.memorystatus_vm_pressure_level` sysctl.
///
/// Pressure levels reported by the kernel: 1 = normal, 2 = warning,
/// 4 = critical. This uses the OS's own pressure evaluation rather than a
/// usage-percentage heuristic.
public final class MemoryPressureMonitor {
    public init() {}

    public func read() -> Result<MemoryPressureStatus, MonitorError> {
        var level: Int32 = 0
        var size = MemoryLayout<Int32>.size

        let result = sysctlbyname("kern.memorystatus_vm_pressure_level", &level, &size, nil, 0)
        guard result == 0 else {
            return .failure(.unableToReadMemoryPressure)
        }

        return .success(ThresholdMonitor.memoryPressure(forLevel: Int(level)))
    }
}
