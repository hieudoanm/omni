import Foundation
import OmniCore

/// Countdown timer with selectable presets, driven by a 1-second tick.
@MainActor
final class TimerViewModel: ObservableObject {
    struct Preset: Identifiable, Equatable {
        let label: String
        let seconds: Int

        var id: String {
            label
        }
    }

    static let presets: [Preset] = [
        Preset(label: "1 min", seconds: 60),
        Preset(label: "5 min", seconds: 300),
        Preset(label: "10 min", seconds: 600),
        Preset(label: "15 min", seconds: 900),
        Preset(label: "30 min", seconds: 1800),
        Preset(label: "60 min", seconds: 3600),
    ]

    @Published private(set) var selectedPreset: Preset
    @Published private(set) var secondsRemaining: Int
    @Published private(set) var isRunning = false
    @Published private(set) var isFinished = false

    private var countdownTask: Task<Void, Never>?

    init() {
        let initial = Self.presets[1]
        selectedPreset = initial
        secondsRemaining = initial.seconds
    }

    var totalSeconds: Int {
        selectedPreset.seconds
    }

    var progress: Double {
        guard totalSeconds > 0 else { return 0 }
        return 1 - Double(min(secondsRemaining, totalSeconds)) / Double(totalSeconds)
    }

    var timeText: String {
        ClockFormatter.timer(secondsRemaining)
    }

    func applyPreset(_ preset: Preset) {
        selectedPreset = preset
        secondsRemaining = preset.seconds
        isRunning = false
        isFinished = false
        stopTask()
    }

    func reset() {
        secondsRemaining = totalSeconds
        isRunning = false
        isFinished = false
        stopTask()
    }

    func toggleRunning() {
        if isFinished {
            reset()
        } else if isRunning {
            pause()
        } else {
            start()
        }
    }

    private func start() {
        isRunning = true
        countdownTask = Task { @MainActor [weak self] in
            while let self, !Task.isCancelled {
                try? await Task.sleep(for: .seconds(1))
                guard !Task.isCancelled else { break }
                self.tick()
            }
        }
    }

    private func pause() {
        isRunning = false
        stopTask()
    }

    private func tick() {
        if secondsRemaining <= 1 {
            secondsRemaining = 0
            isRunning = false
            isFinished = true
            stopTask()
            Chime.timerFinished()
        } else {
            secondsRemaining -= 1
        }
    }

    private func stopTask() {
        countdownTask?.cancel()
        countdownTask = nil
    }
}
