import Foundation
@testable import OmniCore
import Testing

@Suite("BatteryInfoParsing")
struct BatteryInfoParsingTests {
    private func powerSource(
        state: String = "Battery Power",
        isCharging: Bool = false,
        isPresent: Bool = true,
        current: Int = 70,
        max: Int = 100,
        timeToEmpty: Int? = 350,
        timeToFull: Int? = nil,
        health: String? = nil
    ) -> [String: Any] {
        var dict: [String: Any] = [
            "Power Source State": state,
            "Is Charging": isCharging,
            "Is Present": isPresent,
            "Current Capacity": current,
            "Max Capacity": max,
        ]
        if let timeToEmpty {
            dict["Time to Empty"] = timeToEmpty
        }
        if let timeToFull {
            dict["Time to Full Charge"] = timeToFull
        }
        if let health {
            dict["BatteryHealthCondition"] = health
        }
        return dict
    }

    private func smartBattery(cycles: Int? = nil, temperature: Double? = nil) -> [String: Any] {
        var dict: [String: Any] = [:]
        if let cycles {
            dict["CycleCount"] = cycles
        }
        if let temperature {
            dict["Temperature"] = temperature
        }
        return dict
    }

    private func adapter(watts: Int? = nil) -> [String: Any] {
        var dict: [String: Any] = [:]
        if let watts {
            dict["Watts"] = watts
        }
        return dict
    }

    @Test("parses battery power state, ignoring sentinel time remaining")
    func parsesBatteryState() {
        let info = BatteryInfoParsing.parse(
            powerSource: powerSource(state: "Battery Power", timeToEmpty: -1),
            smartBattery: smartBattery(cycles: 403, temperature: 351),
            adapter: nil
        )

        #expect(info != nil)
        #expect(info?.isPresent == true)
        #expect(info?.isACPowered == false)
        #expect(info?.isCharging == false)
        #expect(info?.currentCapacity == 70)
        #expect(info?.maxCapacity == 100)
        #expect(info?.chargePercentage == 70)
        #expect(info?.timeToEmptyMinutes == nil)
        #expect(info?.cycleCount == 403)
        #expect(info?.temperatureCelsius == 35.1)
    }

    @Test("parses AC power, charging, and adapter wattage")
    func parsesACState() {
        let info = BatteryInfoParsing.parse(
            powerSource: powerSource(state: "AC Power", isCharging: true, timeToEmpty: nil, timeToFull: 42),
            smartBattery: nil,
            adapter: adapter(watts: 65)
        )

        #expect(info?.isACPowered == true)
        #expect(info?.isCharging == true)
        #expect(info?.timeToFullMinutes == 42)
        #expect(info?.timeToEmptyMinutes == nil)
        #expect(info?.adapterWatts == 65)
    }

    @Test("keeps unlimited time remaining sentinel as nil")
    func parsesUnlimitedSentinel() {
        let info = BatteryInfoParsing.parse(
            powerSource: powerSource(state: "AC Power", timeToEmpty: -2, timeToFull: -2)
        )
        #expect(info?.timeToEmptyMinutes == nil)
        #expect(info?.timeToFullMinutes == nil)
    }

    @Test("carries battery health condition")
    func parsesHealthCondition() {
        let info = BatteryInfoParsing.parse(
            powerSource: powerSource(state: "AC Power", health: "Check Battery")
        )
        #expect(info?.healthCondition == "Check Battery")
    }

    @Test("treats missing capacity as unparseable")
    func requiresCapacity() {
        let dict = powerSource(current: 70, max: 100)
        var missingCurrent = dict
        missingCurrent["Current Capacity"] = nil
        var missingMax = dict
        missingMax["Max Capacity"] = nil
        var zeroMax = dict
        zeroMax["Max Capacity"] = 0

        #expect(BatteryInfoParsing.parse(powerSource: missingCurrent) == nil)
        #expect(BatteryInfoParsing.parse(powerSource: missingMax) == nil)
        #expect(BatteryInfoParsing.parse(powerSource: zeroMax) == nil)
    }

    @Test("treats non-numeric capacity as unparseable")
    func requiresNumericCapacity() {
        let dict = powerSource(current: 70, max: 100)
        var badCurrent = dict
        badCurrent["Current Capacity"] = "70"
        #expect(BatteryInfoParsing.parse(powerSource: badCurrent) == nil)
    }

    @Test("falls back to present when presence is missing")
    func defaultsPresence() {
        let dict = powerSource(isPresent: true)
        #expect(BatteryInfoParsing.parse(powerSource: dict)?.isPresent == true)
    }
}
