import Foundation
@testable import OmniCore
import Testing

@Suite("BatteryInfo")
struct BatteryInfoTests {
    private func makeInfo(
        isPresent: Bool = true,
        isACPowered: Bool = false,
        isCharging: Bool = false,
        currentCapacity: Int = 70,
        maxCapacity: Int = 100,
        timeToEmptyMinutes: Int? = nil,
        timeToFullMinutes: Int? = nil,
        cycleCount: Int? = nil,
        temperatureCelsius: Double? = nil,
        healthCondition: String? = nil,
        adapterWatts: Int? = nil
    ) -> BatteryInfo {
        BatteryInfo(
            isPresent: isPresent,
            isACPowered: isACPowered,
            isCharging: isCharging,
            currentCapacity: currentCapacity,
            maxCapacity: maxCapacity,
            timeToEmptyMinutes: timeToEmptyMinutes,
            timeToFullMinutes: timeToFullMinutes,
            cycleCount: cycleCount,
            temperatureCelsius: temperatureCelsius,
            healthCondition: healthCondition,
            adapterWatts: adapterWatts
        )
    }

    @Test("chargePercentage is current divided by max")
    func chargePercentage() {
        let info = makeInfo(currentCapacity: 70, maxCapacity: 200)
        #expect(info.chargePercentage == 35)
    }

    @Test("chargePercentage clamps above 100")
    func chargePercentageClampsHigh() {
        let info = makeInfo(currentCapacity: 150, maxCapacity: 100)
        #expect(info.chargePercentage == 100)
    }

    @Test("chargePercentage clamps below 0")
    func chargePercentageClampsLow() {
        let info = makeInfo(currentCapacity: -5, maxCapacity: 100)
        #expect(info.chargePercentage == 0)
    }

    @Test("chargePercentage is zero when max capacity is zero")
    func chargePercentageZeroCapacity() {
        let info = makeInfo(currentCapacity: 50, maxCapacity: 0)
        #expect(info.chargePercentage == 0)
    }

    @Test("statusText is 'On battery' when discharging on battery power")
    func statusOnBattery() {
        #expect(makeInfo().statusText == "On battery")
    }

    @Test("statusText is 'Charging' while charging on AC")
    func statusCharging() {
        let info = makeInfo(isACPowered: true, isCharging: true)
        #expect(info.statusText == "Charging")
    }

    @Test("statusText is 'Fully charged' on AC without charging")
    func statusFullyCharged() {
        let info = makeInfo(isACPowered: true, isCharging: false)
        #expect(info.statusText == "Fully charged")
    }

    @Test("powerSourceText reflects AC vs battery")
    func powerSourceText() {
        #expect(makeInfo().powerSourceText == "Battery Power")
        #expect(makeInfo(isACPowered: true).powerSourceText == "AC Power")
    }

    @Test("timeRemainingText formats remaining minutes")
    func timeRemainingFormats() {
        let info = makeInfo(timeToEmptyMinutes: 95)
        #expect(info.timeRemainingText == "1h 35m")
    }

    @Test("timeRemainingText is nil for unknown or negative values")
    func timeRemainingNil() {
        #expect(makeInfo().timeRemainingText == nil)
        #expect(makeInfo(timeToEmptyMinutes: -1).timeRemainingText == nil)
    }

    @Test("timeToFullText formats only when charging estimate exists")
    func timeToFullFormats() {
        #expect(makeInfo(timeToFullMinutes: 45).timeToFullText == "45m")
        #expect(makeInfo(isACPowered: true, timeToFullMinutes: -2).timeToFullText == nil)
    }

    @Test("durationText rounds hours and minutes as Xh Ym, Xh, or Ym")
    func durationText() {
        #expect(BatteryInfo.durationText(minutes: 0) == "0m")
        #expect(BatteryInfo.durationText(minutes: 59) == "59m")
        #expect(BatteryInfo.durationText(minutes: 60) == "1h")
        #expect(BatteryInfo.durationText(minutes: 95) == "1h 35m")
        #expect(BatteryInfo.durationText(minutes: 120) == "2h")
    }

    @Test("capacityText reports current and max capacity")
    func capacityText() {
        #expect(makeInfo(currentCapacity: 4123, maxCapacity: 7661).capacityText == "4123 / 7661 mAh")
    }

    @Test("cycleCountText, temperatureText, adapterText render when present and nil otherwise")
    func optionalWearText() {
        #expect(makeInfo(cycleCount: 403).cycleCountText == "403 cycles")
        #expect(makeInfo(temperatureCelsius: 35.2).temperatureText == "35.2 °C")
        #expect(makeInfo(adapterWatts: 65).adapterText == "65 W")
        #expect(makeInfo().cycleCountText == nil)
        #expect(makeInfo().temperatureText == nil)
        #expect(makeInfo().adapterText == nil)
    }

    @Test("chargeIconName buckets low charge")
    func iconLow() {
        #expect(makeInfo(currentCapacity: 1, maxCapacity: 100).chargeIconName == "battery.0")
    }

    @Test("chargeIconName buckets mid charge")
    func iconMid() {
        #expect(makeInfo(currentCapacity: 40, maxCapacity: 100).chargeIconName == "battery.25")
        #expect(makeInfo(currentCapacity: 60, maxCapacity: 100).chargeIconName == "battery.75")
    }

    @Test("chargeIconName buckets full charge and includes bolt while charging")
    func iconFullAndCharging() {
        #expect(makeInfo(currentCapacity: 99, maxCapacity: 100).chargeIconName == "battery.100")
        #expect(makeInfo(isACPowered: true, isCharging: true, currentCapacity: 40, maxCapacity: 100).chargeIconName == "battery.25.bolt")
    }
}
