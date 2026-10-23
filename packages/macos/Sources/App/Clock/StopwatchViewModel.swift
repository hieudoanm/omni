import Foundation
import OmniCore

/// Stopwatch with lap timing, updating at 50 Hz.
@MainActor
final class StopwatchViewModel: ObservableObject {
    struct Lap: Identifiable {
        let id = UUID()
        let index: Int
        let elapsedMilliseconds: Int
        let splitMilliseconds: Int
    }

    @Published private(set) var elapsedMilliseconds: Int = 0
    @Published private(set) var isRunning = false
    @Published private(set) var laps: [Lap] = []

    private var tickTask: Task<Void, Never>?
    private var accumulatedMilliseconds: Int = 0
    private var lastTickDate: Date?

    var timeText: String {
        ClockFormatter.stopwatch(elapsedMilliseconds)
    }

    var canReset: Bool {
        elapsedMilliseconds > 0
    }

    func start() {
        guard !isRunning else { return }
        isRunning = true
        lastTickDate = Date()
        tickTask = Task { @MainActor [weak self] in
            while let self, !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(20))
                guard !Task.isCancelled else { break }
                self.tick()
            }
        }
    }

    func stop() {
        isRunning = false
        tickTask?.cancel()
        tickTask = nil
    }

    func reset() {
        stop()
        accumulatedMilliseconds = 0
        elapsedMilliseconds = 0
        laps = []
    }

    func lap() {
        let lastLapMilliseconds = laps.first?.elapsedMilliseconds ?? 0
        laps.insert(
            Lap(
                index: laps.count + 1,
                elapsedMilliseconds: elapsedMilliseconds,
                splitMilliseconds: elapsedMilliseconds - lastLapMilliseconds
            ),
            at: 0
        )
    }

    private func tick() {
        guard let lastTickDate else { return }
        let now = Date()
        let deltaMilliseconds = Int(now.timeIntervalSince(lastTickDate) * 1000)
        self.lastTickDate = now
        accumulatedMilliseconds += max(0, deltaMilliseconds)
        elapsedMilliseconds = accumulatedMilliseconds
    }
}
