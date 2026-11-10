import Foundation

/// Normalises IOKit power-source dictionaries into a `BatteryInfo` value.
///
/// Parsing is defensive: nil and unknown values are dropped so the model only
/// carries information the OS actually reported. The IOKit `Time to Empty` /
/// `Time to Full Charge` sentinels (`-1` unknown, `-2` unlimited) are folded
/// into `nil`. Dictionary keys mirror the public `IOPSKeys.h` constants.
public enum BatteryInfoParsing {
    public static func parse(
        powerSource: [String: Any],
        smartBattery: [String: Any]? = nil,
        adapter: [String: Any]? = nil
    ) -> BatteryInfo? {
        guard let currentCapacity = intValue(powerSource[currentCapacityKey]),
              let maxCapacity = intValue(powerSource[maxCapacityKey]),
              maxCapacity > 0
        else {
            return nil
        }

        let powerSourceState = stringValue(powerSource[powerSourceStateKey])
        let isACPowered = powerSourceState == acPowerValue

        return BatteryInfo(
            isPresent: boolValue(powerSource[isPresentKey]) ?? true,
            isACPowered: isACPowered,
            isCharging: boolValue(powerSource[isChargingKey]) ?? false,
            currentCapacity: currentCapacity,
            maxCapacity: maxCapacity,
            timeToEmptyMinutes: normalizedMinutes(powerSource[timeToEmptyKey]),
            timeToFullMinutes: normalizedMinutes(powerSource[timeToFullChargeKey]),
            cycleCount: intValue(smartBattery?[smartBatteryCycleCountKey]),
            temperatureCelsius: intValue(smartBattery?[smartBatteryTemperatureKey]).map { Double($0) / 10 },
            healthCondition: emptyAsNil(powerSource[batteryHealthConditionKey]),
            adapterWatts: intValue(adapter?[powerAdapterWattsKey])
        )
    }

    /// Time remaining is in minutes; negatives mean unknown or unlimited and
    /// are not real durations, so drop them.
    private static func normalizedMinutes(_ value: Any?) -> Int? {
        guard let minutes = intValue(value), minutes >= 0 else { return nil }
        return minutes
    }

    private static func intValue(_ value: Any?) -> Int? {
        (value as? NSNumber)?.intValue
    }

    private static func boolValue(_ value: Any?) -> Bool? {
        (value as? NSNumber)?.boolValue
    }

    private static func stringValue(_ value: Any?) -> String? {
        value as? String
    }

    private static func emptyAsNil(_ value: Any?) -> String? {
        guard let string = stringValue(value), !string.isEmpty else { return nil }
        return string
    }

    // Mirror of the IOKit public keys (IOPSKeys.h), kept literal so Core stays
    // free of framework dependencies; the IOKit access lives in the app target.
    private static let powerSourceStateKey = "Power Source State"
    private static let acPowerValue = "AC Power"
    private static let isChargingKey = "Is Charging"
    private static let isPresentKey = "Is Present"
    private static let currentCapacityKey = "Current Capacity"
    private static let maxCapacityKey = "Max Capacity"
    private static let timeToEmptyKey = "Time to Empty"
    private static let timeToFullChargeKey = "Time to Full Charge"
    private static let batteryHealthConditionKey = "BatteryHealthCondition"
    private static let powerAdapterWattsKey = "Watts"

    private static let smartBatteryCycleCountKey = "CycleCount"
    private static let smartBatteryTemperatureKey = "Temperature"
}
