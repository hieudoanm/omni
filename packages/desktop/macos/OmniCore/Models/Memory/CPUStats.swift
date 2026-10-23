import Foundation

public struct CPUStats: Equatable, Sendable {
    public let usage: Double
    public let loadAverage1: Double
    public let loadAverage5: Double
    public let loadAverage15: Double

    public init(
        usage: Double,
        loadAverage1: Double = 0,
        loadAverage5: Double = 0,
        loadAverage15: Double = 0
    ) {
        self.usage = min(max(usage, 0), 100)
        self.loadAverage1 = loadAverage1
        self.loadAverage5 = loadAverage5
        self.loadAverage15 = loadAverage15
    }

    public var loadAverageText: String {
        let format = { String(format: "%.1f", $0) }
        return "Load \(format(loadAverage1)) · \(format(loadAverage5)) · \(format(loadAverage15))"
    }
}
