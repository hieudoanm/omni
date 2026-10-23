import Foundation
@testable import OmniCore
import Testing

@Suite("WeatherSample")
struct WeatherSampleTests {
    @Test("maps Open-Meteo weather codes to readable text")
    func conditionText() {
        #expect(WeatherSample.conditionText(for: 0) == "Clear sky")
        #expect(WeatherSample.conditionText(for: 2) == "Partly cloudy")
        #expect(WeatherSample.conditionText(for: 3) == "Overcast")
        #expect(WeatherSample.conditionText(for: 61) == "Light rain")
        #expect(WeatherSample.conditionText(for: 95) == "Thunderstorm")
        #expect(WeatherSample.conditionText(for: 99) == "Heavy storm")
    }

    @Test("falls back for unknown codes")
    func conditionTextUnknown() {
        #expect(WeatherSample.conditionText(for: -1) == "Unknown")
        #expect(WeatherSample.conditionText(for: 123) == "Unknown")
    }

    @Test("stores temperature without conversion")
    func temperature() {
        let sample = WeatherSample(temperatureCelsius: 31.6, weatherCode: 2)
        #expect(sample.temperatureCelsius == 31.6)
    }

    @Test("decodes the Open-Meteo current payload")
    func parsesPayload() throws {
        let json = Data(
            """
            {"latitude":10.8,"longitude":106.6,"current":{"time":"2026-09-20T10:00","temperature_2m":31.6,"weather_code":2}}
            """.utf8
        )
        let sample = try OpenMeteoParser.parse(json)
        #expect(sample.temperatureCelsius == 31.6)
        #expect(sample.weatherCode == 2)
        #expect(sample.conditionText == "Partly cloudy")
    }

    @Test("throws on malformed payload")
    func parsesInvalidPayload() {
        let json = Data("{}".utf8)
        #expect(throws: WeatherError.self) {
            try OpenMeteoParser.parse(json)
        }
    }
}
