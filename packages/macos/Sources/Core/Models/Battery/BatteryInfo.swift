import Foundation

/// Snapshot of the internal battery state, power source, and health of the Mac.
public struct BatteryInfo: Equatable, Sendable {
    public let isPresent: Bool
    public let isACPowered: Bool
    public let isCharging: Bool
    public let currentCapacity: Int
    public let maxCapacity: Int
    public let timeToEmptyMinutes: Int?
    public let timeToFullMinutes: Int?
    public let cycleCount: Int?
    public let temperatureCelsius: Double?
    public let healthCondition: String?
    public let adapterWatts: Int?

    public init(
        isPresent: Bool,
        isACPowered: Bool,
        isCharging: Bool,
        currentCapacity: Int,
        maxCapacity: Int,
        timeToEmptyMinutes: Int? = nil,
        timeToFullMinutes: Int? = nil,
        cycleCount: Int? = nil,
        temperatureCelsius: Double? = nil,
        healthCondition: String? = nil,
        adapterWatts: Int? = nil
    ) {
        self.isPresent = isPresent
        self.isACPowered = isACPowered
        self.isCharging = isCharging
        self.currentCapacity = currentCapacity
        self.maxCapacity = maxCapacity
        self.timeToEmptyMinutes = timeToEmptyMinutes
        self.timeToFullMinutes = timeToFullMinutes
        self.cycleCount = cycleCount
        self.temperatureCelsius = temperatureCelsius
        self.healthCondition = healthCondition
        self.adapterWatts = adapterWatts
    }

    /// Charge level as a percentage of max capacity, clamped to 0...100.
    public var chargePercentage: Double {
        guard maxCapacity > 0 else { return 0 }
        return min(max(Double(currentCapacity) / Double(maxCapacity) * 100, 0), 100)
    }

    /// Overall status line shown at the top of the Battery tab.
    public var statusText: String {
        if !isACPowered && !isCharging {
            return "On battery"
        }
        if isCharging {
            return "Charging"
        }
        return "Fully charged"
    }

    public var powerSourceText: String {
        isACPowered ? "AC Power" : "Battery Power"
    }

    /// Time remaining while discharging, or `nil` when not applicable/unknown.
    public var timeRemainingText: String? {
        guard let minutes = timeToEmptyMinutes, minutes >= 0 else { return nil }
        return Self.durationText(minutes: minutes)
    }

    /// Time until fully charged while charging, or `nil` when not applicable/unknown.
    public var timeToFullText: String? {
        guard let minutes = timeToFullMinutes, minutes >= 0 else { return nil }
        return Self.durationText(minutes: minutes)
    }

    public var capacityText: String {
        "\(currentCapacity) / \(maxCapacity) mAh"
    }

    public var cycleCountText: String? {
        cycleCount.map { "\($0) cycles" }
    }

    public var temperatureText: String? {
        temperatureCelsius.map { String(format: "%.1f °C", $0) }
    }

    public var adapterText: String? {
        adapterWatts.map { "\($0) W" }
    }

    /// SF Symbol name for the top-level battery glyph, bucketed by charge level.
    public var chargeIconName: String {
        let level: String
        switch chargePercentage {
        case ..<25: level = "0"
        case ..<50: level = "25"
        case ..<75: level = "75"
        default: level = "100"
        }
        return isCharging ? "battery.\(level).bolt" : "battery.\(level)"
    }

    public static func durationText(minutes: Int) -> String {
        let hours = minutes / 60
        let remainder = minutes % 60
        if hours == 0 {
            return "\(remainder)m"
        }
        if remainder == 0 {
            return "\(hours)h"
        }
        return "\(hours)h \(remainder)m"
    }
}
