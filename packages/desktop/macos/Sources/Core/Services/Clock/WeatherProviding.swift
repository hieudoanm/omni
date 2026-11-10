import Foundation

/// Fetches current conditions for a geographic coordinate.
public protocol WeatherProviding: Sendable {
    func weather(latitude: Double, longitude: Double) async throws -> WeatherSample
}

public enum WeatherError: Error {
    case invalidResponse
}
