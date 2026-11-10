import OmniCore
import SwiftUI

/// Drives the Battery tab: a battery snapshot refreshed while metrics are on screen.
@MainActor
final class BatteryViewModel: ObservableObject {
    enum State: Equatable {
        case unavailable
        case loaded(BatteryInfo)
    }

    @Published private(set) var state: State = .unavailable

    var chargePercentText: String? {
        guard case let .loaded(info) = state else { return nil }
        return "\(Int(info.chargePercentage.rounded()))%"
    }

    var statusText: String? {
        guard case let .loaded(info) = state else { return nil }
        return info.statusText
    }

    private let monitor: BatteryMonitor
    private let settingsStore: SettingsStore
    private var refreshTask: Task<Void, Never>?
    private var visibilityObservation: NSObjectProtocol?
    private var isLiveSurfaceVisible: Bool

    init(settingsStore: SettingsStore = SettingsStore(), monitor: BatteryMonitor = BatteryMonitor()) {
        self.settingsStore = settingsStore
        self.monitor = monitor
        let surfaces = SurfaceVisibilityMonitor.shared
        isLiveSurfaceVisible = surfaces.isLiveSurfaceVisible
        visibilityObservation = surfaces.observeVisibilityChange { [weak self] visible in
            Task { @MainActor in self?.handleVisibilityChange(visible) }
        }
    }

    deinit {
        refreshTask?.cancel()
        if let visibilityObservation {
            NotificationCenter.default.removeObserver(visibilityObservation)
        }
    }

    func start() {
        guard refreshTask == nil else { return }
        refreshTask = Task { @MainActor [weak self] in
            while let self, !Task.isCancelled {
                if self.isLiveSurfaceVisible {
                    self.refresh()
                }
                try? await Task.sleep(for: .seconds(self.settingsStore.refreshInterval))
            }
        }
    }

    func refresh() {
        guard case let .success(info) = monitor.read() else {
            state = .unavailable
            return
        }
        state = .loaded(info)
    }

    private func handleVisibilityChange(_ visible: Bool) {
        isLiveSurfaceVisible = visible
        guard visible else { return }
        refresh()
    }
}
