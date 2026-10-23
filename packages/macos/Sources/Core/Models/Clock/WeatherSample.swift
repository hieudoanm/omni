import Foundation

/// A snapshot of current conditions for one city in the World Clock sub-tab.
public struct WeatherSample: Equatable, Sendable {
    public let temperatureCelsius: Double
    public let weatherCode: Int

    public var conditionText: String {
        Self.conditionText(for: weatherCode)
    }

    public init(temperatureCelsius: Double, weatherCode: Int) {
        self.temperatureCelsius = temperatureCelsius
        self.weatherCode = weatherCode
    }

    public static func conditionText(for code: Int) -> String {
        conditions[code] ?? "Unknown"
    }

    private static let conditions: [Int: String] = [
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Rime fog",
        51: "Light drizzle",
        53: "Drizzle",
        55: "Dense drizzle",
        61: "Light rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Light snow",
        73: "Moderate snow",
        75: "Heavy snow",
        80: "Light showers",
        81: "Showers",
        82: "Heavy showers",
        95: "Thunderstorm",
        96: "Storm w/ hail",
        99: "Heavy storm",
    ]
}
