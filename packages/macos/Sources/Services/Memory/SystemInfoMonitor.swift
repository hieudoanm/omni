import Darwin
import Foundation
import OmniCore

/// Reads hardware identifiers and uptime through sysctl.
public final class SystemInfoMonitor {
    public init() {}

    public func read() -> Result<SystemInfo, MonitorError> {
        let chip = Self.readString("hw.model") ?? "Mac"
        let physical = Self.readInt("hw.physicalcpu") ?? 0
        let logical = Self.readInt("hw.logicalcpu") ?? 0
        let bootTime = Self.readBootTime()
        let uptime = bootTime.map { Date().timeIntervalSince($0) } ?? 0

        return .success(SystemInfo(
            chip: chip,
            physicalCores: physical,
            logicalCores: logical,
            uptime: uptime
        ))
    }

    private static func readString(_ name: String) -> String? {
        var size = 0
        guard sysctlbyname(name, nil, &size, nil, 0) == 0, size > 0 else {
            return nil
        }
        var buffer = [CChar](repeating: 0, count: size)
        sysctlbyname(name, &buffer, &size, nil, 0)
        return String(cString: buffer)
    }

    private static func readInt(_ name: String) -> Int? {
        var value: Int32 = 0
        var size = MemoryLayout<Int32>.size
        guard sysctlbyname(name, &value, &size, nil, 0) == 0 else {
            return nil
        }
        return Int(value)
    }

    private static func readBootTime() -> Date? {
        var tv = timeval()
        var size = MemoryLayout<timeval>.size
        guard sysctlbyname("kern.boottime", &tv, &size, nil, 0) == 0 else {
            return nil
        }
        return Date(timeIntervalSince1970: TimeInterval(tv.tv_sec))
    }
}
