import Foundation
import IOKit
import IOKit.ps
import OmniCore

/// Reads the internal battery through the IOKit power-source APIs.
///
/// Uses `IOPSCopyPowerSourcesInfo` / `IOPSGetPowerSourceDescription` for the
/// live battery state, `IOPSCopyExternalPowerAdapterDetails` for the connected
/// charger, and an IOKit battery service for wear data (cycle count,
/// temperature). Pure parsing lives in `BatteryInfoParsing` so it can be
/// unit-tested without a real battery.
public final class BatteryMonitor {
    public init() {}

    public func read() -> Result<BatteryInfo, MonitorError> {
        guard let blob = IOPSCopyPowerSourcesInfo()?.takeRetainedValue(),
              let sources = IOPSCopyPowerSourcesList(blob)?.takeRetainedValue() as? [AnyObject],
              let first = sources.first,
              let description = IOPSGetPowerSourceDescription(blob, first)?.takeUnretainedValue() as? [String: Any]
        else {
            return .failure(.unableToReadBattery)
        }

        let adapter = IOPSCopyExternalPowerAdapterDetails()?.takeRetainedValue() as? [String: Any]
        let smartBattery = Self.readSmartBatteryProperties()

        guard let info = BatteryInfoParsing.parse(
            powerSource: description,
            smartBattery: smartBattery,
            adapter: adapter
        ) else {
            return .failure(.unableToReadBattery)
        }
        return .success(info)
    }

    /// Reads wear/thermal properties from a battery IOKit service. Intel Macs
    /// expose `AppleSmartBattery` (reports temperature in deci-kelvin), Apple
    /// Silicon exposes `PowerManagementController` (deci-celsius), so the
    /// result is normalised to deci-celsius for `BatteryInfoParsing`. Not every
    /// Mac exposes these, so the result is optional.
    private static func readSmartBatteryProperties() -> [String: Any]? {
        if let properties = readRegistryProperties(serviceName: "AppleSmartBattery"),
           let rawTemperature = properties["Temperature"] as? NSNumber
        {
            let deciCelsius = (rawTemperature.doubleValue / 10 - 273.15) * 10
            var normalized = properties
            normalized["Temperature"] = NSNumber(value: deciCelsius)
            return normalized
        }
        return readRegistryProperties(serviceName: "PowerManagementController")
    }

    private static func readRegistryProperties(serviceName: String) -> [String: Any]? {
        let service = IOServiceGetMatchingService(kIOMainPortDefault, IOServiceMatching(serviceName))
        guard service != IO_OBJECT_NULL else { return nil }
        defer { IOObjectRelease(service) }

        var properties: Unmanaged<CFMutableDictionary>?
        guard IORegistryEntryCreateCFProperties(service, &properties, kCFAllocatorDefault, 0) == KERN_SUCCESS,
              let dictionary = properties?.takeRetainedValue() as? [String: Any]
        else {
            return nil
        }
        return dictionary
    }
}
