import Foundation

/// Decodes the Open-Meteo current-weather payload into a `WeatherSample`.
public enum OpenMeteoParser {
    private struct Payload: Decodable {
        struct Current: Decodable {
            let temperature_2m: Double
            let weather_code: Int
        }

        let current: Current
    }

    public static func parse(_ data: Data) throws -> WeatherSample {
        guard let payload = try? JSONDecoder().decode(Payload.self, from: data) else {
            throw WeatherError.invalidResponse
        }
        return WeatherSample(
            temperatureCelsius: payload.current.temperature_2m,
            weatherCode: payload.current.weather_code
        )
    }
}
