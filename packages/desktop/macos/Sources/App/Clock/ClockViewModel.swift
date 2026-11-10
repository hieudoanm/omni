import SwiftUI

/// Owns state for the Clock section's five screens.
///
/// The sub-section lives on the view model, like `HomebrewViewModel.Section`, so
/// `DashboardRoute` can select a single clock screen in the window while the
/// menu-bar panel keeps one Clock tab with a picker.
@MainActor
final class ClockViewModel: ObservableObject {
    let worldClock = WorldClockViewModel()
    let timer = TimerViewModel()
    let stopwatch = StopwatchViewModel()
    let pomodoro = PomodoroViewModel()

    enum Section: String, CaseIterable, Hashable {
        case watchface
        case worldClock
        case timer
        case stopwatch
        case pomodoro

        var title: String {
            switch self {
            case .watchface: return "Watchface"
            case .worldClock: return "World Clock"
            case .timer: return "Timer"
            case .stopwatch: return "Stopwatch"
            case .pomodoro: return "Pomodoro"
            }
        }

        var systemImage: String {
            switch self {
            case .watchface: return "clock"
            case .worldClock: return "globe"
            case .timer: return "timer"
            case .stopwatch: return "stopwatch"
            case .pomodoro: return "hourglass"
            }
        }
    }
}
