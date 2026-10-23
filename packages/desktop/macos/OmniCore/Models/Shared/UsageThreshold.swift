import Foundation

public enum UsageThreshold: Sendable {
    case normal
    case elevated
    case high
}

public enum MemoryPressureStatus: String, Sendable {
    case normal
    case warn
    case critical
    case unknown

    public var displayText: String {
        switch self {
        case .normal: return "Normal"
        case .warn: return "Warning"
        case .critical: return "Critical"
        case .unknown: return "Unknown"
        }
    }
}

public enum ThresholdMonitor {
    public static func status(for percentage: Double) -> UsageThreshold {
        if percentage >= 90 {
            return .high
        } else if percentage >= 70 {
            return .elevated
        } else {
            return .normal
        }
    }

    /// Maps the kernel memory-pressure level (`kern.memorystatus_vm_pressure_level`)
    /// to the public status. Levels: 1 = normal, 2 = warning, 4 = critical.
    public static func memoryPressure(forLevel level: Int) -> MemoryPressureStatus {
        switch level {
        case 1: return .normal
        case 2: return .warn
        case 4: return .critical
        default: return .unknown
        }
    }

    public static func status(for stats: MemoryStats) -> MemoryPressureStatus {
        switch status(for: stats.usagePercentage) {
        case .normal: return .normal
        case .elevated: return .warn
        case .high: return .critical
        }
    }

    public static func status(for stats: DiskStats) -> UsageThreshold {
        status(for: stats.usagePercentage)
    }
}
