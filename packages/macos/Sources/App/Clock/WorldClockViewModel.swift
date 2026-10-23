import Foundation
import OmniCore
import SwiftUI

/// Drives per-second city times and periodic weather refreshes for the
/// World Clock sub-tab.
@MainActor
final class WorldClockViewModel: ObservableObject {
    let cities: [ClockCity]

    @Published var searchQuery = ""
    @Published private(set) var times: [String]
    @Published private(set) var weather: [WeatherSample?]

    private static let weatherRefreshInterval: TimeInterval = 600

    private let weatherService: any WeatherProviding
    private var tickTask: Task<Void, Never>?
    private var lastWeatherFetch = Date.distantPast

    init(
        cities: [ClockCity] = ClockCities.all,
        weatherService: any WeatherProviding = OpenMeteoWeatherService()
    ) {
        self.cities = cities
        self.weatherService = weatherService
        times = Array(repeating: "", count: cities.count)
        weather = Array(repeating: nil, count: cities.count)
    }

    deinit {
        tickTask?.cancel()
    }

    func start() {
        guard tickTask == nil else { return }
        updateTimes()
        tickTask = Task { @MainActor [weak self] in
            while let self, !Task.isCancelled {
                try? await Task.sleep(for: .seconds(1))
                guard !Task.isCancelled else { break }
                self.updateTimes()
                if Date().timeIntervalSince(self.lastWeatherFetch) >= Self.weatherRefreshInterval {
                    await self.refreshWeather()
                }
            }
        }
    }

    func stop() {
        tickTask?.cancel()
        tickTask = nil
    }

    /// Rows matching the current search query, favorites listed first.
    func cityRows() -> [CityRow] {
        let query = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let filtered: [CityRow] = cities.enumerated().compactMap { index, city -> CityRow? in
            guard query.isEmpty
                || city.label.lowercased().contains(query)
                || city.country.lowercased().contains(query)
            else {
                return nil
            }
            return CityRow(city: city, index: index)
        }
        return filtered.sorted { $0.city.isFavorite && !$1.city.isFavorite }
    }

    private func updateTimes() {
        let date = Date()
        times = cities.map { ClockFormatter.worldClock(in: $0.timeZone, date: date) }
    }

    private func refreshWeather() async {
        lastWeatherFetch = Date()
        for (index, city) in cities.enumerated() {
            if let sample = try? await weatherService.weather(latitude: city.latitude, longitude: city.longitude) {
                weather[index] = sample
            }
        }
    }
}

struct CityRow: Identifiable {
    let city: ClockCity
    let index: Int

    var id: Int {
        index
    }
}
