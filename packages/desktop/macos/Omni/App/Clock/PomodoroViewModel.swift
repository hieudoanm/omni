import Foundation
import OmniCore

/// Pomodoro timer alternating between work and break phases across rounds.
@MainActor
final class PomodoroViewModel: ObservableObject {
    struct Preset: Identifiable, Equatable {
        let label: String
        let workMinutes: Int
        let breakMinutes: Int

        var id: String {
            label
        }
    }

    enum Phase: Equatable {
        case work
        case `break`

        var title: String {
            self == .work ? "Focus" : "Break"
        }

        var label: String {
            self == .work ? "focus" : "break"
        }
    }

    static let presets: [Preset] = [
        Preset(label: "25 / 5", workMinutes: 25, breakMinutes: 5),
        Preset(label: "50 / 10", workMinutes: 50, breakMinutes: 10),
        Preset(label: "90 / 20", workMinutes: 90, breakMinutes: 20),
    ]

    @Published private(set) var selectedPreset: Preset
    @Published private(set) var phase: Phase = .work
    @Published private(set) var secondsRemaining: Int
    @Published private(set) var isRunning = false
    @Published private(set) var round: Int = 1

    private var countdownTask: Task<Void, Never>?

    init() {
        let initial = Self.presets[1]
        selectedPreset = initial
        secondsRemaining = initial.workMinutes * 60
    }

    var totalSeconds: Int {
        phase == .work
            ? selectedPreset.workMinutes * 60
            : selectedPreset.breakMinutes * 60
    }

    var progress: Double {
        guard totalSeconds > 0 else { return 0 }
        return 1 - Double(min(secondsRemaining, totalSeconds)) / Double(totalSeconds)
    }

    var timeText: String {
        ClockFormatter.countdown(secondsRemaining)
    }

    var statusText: String {
        "Round \(round) · \(phase.title) phase"
    }

    func applyPreset(_ preset: Preset) {
        selectedPreset = preset
        phase = .work
        secondsRemaining = preset.workMinutes * 60
        isRunning = false
        round = 1
        stopTask()
    }

    func reset() {
        secondsRemaining = totalSeconds
        isRunning = false
        stopTask()
    }

    func toggleRunning() {
        if isRunning {
            pause()
        } else {
            start()
        }
    }

    func skipPhase() {
        switchPhase()
        isRunning = false
        stopTask()
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
            let endedWork = phase == .work
            switchPhase()
            if endedWork {
                Chime.workPhaseEnded()
            } else {
                Chime.breakPhaseEnded()
            }
        } else {
            secondsRemaining -= 1
        }
    }

    private func switchPhase() {
        let next: Phase = phase == .work ? .break : .work
        phase = next
        if next == .work {
            round += 1
        }
        secondsRemaining = (next == .work ? selectedPreset.workMinutes : selectedPreset.breakMinutes) * 60
        isRunning = false
        stopTask()
    }

    private func stopTask() {
        countdownTask?.cancel()
        countdownTask = nil
    }
}
