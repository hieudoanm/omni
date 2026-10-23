import Foundation

public struct SystemInfo: Equatable, Sendable {
    public let chip: String
    public let physicalCores: Int
    public let logicalCores: Int
    public let uptime: TimeInterval

    public init(chip: String, physicalCores: Int, logicalCores: Int, uptime: TimeInterval) {
        self.chip = chip
        self.physicalCores = physicalCores
        self.logicalCores = logicalCores
        self.uptime = uptime
    }

    public var coresText: String {
        let cores = physicalCores > 0 ? physicalCores : logicalCores
        guard cores > 0 else { return "unknown cores" }
        return "\(cores) cores"
    }

    public var uptimeText: String {
        let total = Int(uptime)
        guard total > 0 else { return "Up 0m" }
        let days = total / 86400
        let hours = (total % 86400) / 3600
        let minutes = (total % 3600) / 60
        if days > 0 {
            return "Up \(days)d \(hours)h"
        }
        if hours > 0 {
            return "Up \(hours)h \(minutes)m"
        }
        return "Up \(minutes)m"
    }
}
