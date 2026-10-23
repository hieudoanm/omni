import Foundation

public enum ByteFormatter {
    public static func humanReadable(_ bytes: UInt64) -> String {
        let units = ["B", "KB", "MB", "GB", "TB"]
        let value = Double(bytes)
        var result = value
        var unitIndex = 0

        while result >= 1024 && unitIndex < units.count - 1 {
            result /= 1024
            unitIndex += 1
        }

        let unit = units[unitIndex]
        if unitIndex == 0 {
            return "\(Int(result)) \(unit)"
        }

        if result >= 100 {
            return "\(Int(result.rounded())) \(unit)"
        }

        return String(format: "%.1f \(unit)", result)
    }

    public static func usedOverTotal(usedBytes: UInt64, totalBytes: UInt64) -> String {
        "\(humanReadable(usedBytes)) / \(humanReadable(totalBytes))"
    }

    public static func percent(_ value: Double) -> String {
        "\(Int(value.rounded()))%"
    }

    public static func rate(_ bytesPerSecond: Double?) -> String {
        guard let bytesPerSecond, bytesPerSecond >= 0 else { return "--" }
        let units = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"]
        var value = bytesPerSecond
        var unitIndex = 0

        while value >= 1024 && unitIndex < units.count - 1 {
            value /= 1024
            unitIndex += 1
        }

        if unitIndex == 0 {
            return "\(Int(value)) \(units[unitIndex])"
        }
        if value >= 100 {
            return "\(Int(value.rounded())) \(units[unitIndex])"
        }
        return String(format: "%.1f \(units[unitIndex])", value)
    }

    public static func memoryBreakdown(active: UInt64, wired: UInt64, compressed: UInt64) -> String {
        joinedDetails([("Active", active), ("Wired", wired), ("Compressed", compressed)])
    }

    public static func memoryAvailability(inactive: UInt64, cached: UInt64, free: UInt64) -> String {
        joinedDetails([("Cached", cached), ("Inactive", inactive), ("Free", free)])
    }

    public static func diskAvailability(available: UInt64, purgeable: UInt64) -> String {
        joinedDetails([("Free", available), ("Purgeable", purgeable)])
    }

    public static func joinedDetails(_ parts: [(String, UInt64)]) -> String {
        parts.map { "\($0.0) \(humanReadable($0.1))" }.joined(separator: " · ")
    }
}
