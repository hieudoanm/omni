import OmniCore
import SwiftUI

final class MemoryViewModel: ObservableObject {
    @Published private(set) var memoryStats: MemoryStats?
    @Published private(set) var diskStats: DiskStats?
    @Published private(set) var swapStats: SwapStats?
    @Published private(set) var cpuStats: CPUStats?
    @Published private(set) var systemInfo: SystemInfo?
    @Published private(set) var memoryPressure: MemoryPressureStatus = .unknown
    @Published var refreshInterval: TimeInterval
    @Published var menuBarDisplay: MenuBarDisplay
    @Published var menuBarMetrics: MenuBarMetrics

    private let memoryMonitor = MemoryMonitor()
    private let diskMonitor = DiskMonitor()
    private let swapMonitor = SwapMonitor()
    private let cpuMonitor = CPUMonitor()
    private let systemMonitor = SystemInfoMonitor()
    private let pressureMonitor = MemoryPressureMonitor()
    private let settingsStore: SettingsStore
    private var refreshTimer: Timer?
    private var visibilityObservation: NSObjectProtocol?
    private var isLiveSurfaceVisible: Bool

    init(settingsStore: SettingsStore = SettingsStore()) {
        self.settingsStore = settingsStore
        refreshInterval = settingsStore.refreshInterval
        menuBarDisplay = settingsStore.menuBarDisplay
        menuBarMetrics = settingsStore.menuBarMetrics
        isLiveSurfaceVisible = SurfaceVisibilityMonitor.shared.isLiveSurfaceVisible

        if case let .success(info) = systemMonitor.read() {
            systemInfo = info
        }

        refresh()
        startAutoRefresh()
        let monitor = SurfaceVisibilityMonitor.shared
        visibilityObservation = monitor.observeVisibilityChange { [weak self] visible in
            DispatchQueue.main.async {
                self?.handleVisibilityChange(visible)
            }
        }
    }

    var memoryPercentText: String {
        guard let stats = memoryStats else { return "--" }
        return "\(stats.usagePercentage.intRounded)%"
    }

    var diskPercentText: String {
        guard let stats = diskStats else { return "--" }
        return "\(stats.usagePercentage.intRounded)%"
    }

    var cpuPercentText: String {
        guard let stats = cpuStats else { return "--" }
        return "\(stats.usage.intRounded)%"
    }

    var swapPercentText: String {
        guard let stats = swapStats else { return "--" }
        return "\(stats.usagePercentage.intRounded)%"
    }

    var memoryValueText: String? {
        memoryStats.map { ByteFormatter.usedOverTotal(usedBytes: $0.usedBytes, totalBytes: $0.totalBytes) }
    }

    var diskValueText: String? {
        diskStats.map { ByteFormatter.usedOverTotal(usedBytes: $0.usedBytes, totalBytes: $0.totalBytes) }
    }

    var swapValueText: String? {
        swapStats.map { ByteFormatter.usedOverTotal(usedBytes: $0.usedBytes, totalBytes: $0.totalBytes) }
    }

    var cpuValueText: String? {
        cpuStats.map { $0.loadAverageText }
    }

    func refresh() {
        if case let .success(stats) = memoryMonitor.read() {
            memoryStats = stats
        }
        if case let .success(stats) = diskMonitor.read() {
            diskStats = stats
        }
        if case let .success(stats) = swapMonitor.read() {
            swapStats = stats
        }
        if case let .success(stats) = cpuMonitor.read() {
            cpuStats = stats
        }
        if case let .success(status) = pressureMonitor.read() {
            memoryPressure = status
        }
    }

    func updateMenuBarDisplay(_ display: MenuBarDisplay) {
        menuBarDisplay = display
        settingsStore.menuBarDisplay = display
    }

    func updateMenuBarMetrics(_ metrics: MenuBarMetrics) {
        menuBarMetrics = metrics
        settingsStore.menuBarMetrics = metrics
    }

    func updateRefreshInterval(_ interval: TimeInterval) {
        guard interval >= 0.5 else { return }
        refreshInterval = interval
        settingsStore.refreshInterval = interval
        restartAutoRefresh()
    }

    private func startAutoRefresh() {
        refreshTimer = Timer.scheduledTimer(withTimeInterval: effectiveInterval(), repeats: true) { [weak self] _ in
            self?.refresh()
        }
    }

    private func restartAutoRefresh() {
        refreshTimer?.invalidate()
        startAutoRefresh()
    }

    private func handleVisibilityChange(_ visible: Bool) {
        isLiveSurfaceVisible = visible
        if visible {
            refresh()
        }
        restartAutoRefresh()
    }

    /// While no surface is showing metrics only the menu-bar label needs data,
    /// so the ticker slows down (never faster than 2s, never slower than 5s) and
    /// resumes the user-selected interval as soon as a surface opens.
    private func effectiveInterval() -> TimeInterval {
        isLiveSurfaceVisible ? refreshInterval : max(min(refreshInterval * 2, 5), 2)
    }

    deinit {
        refreshTimer?.invalidate()
        if let visibilityObservation {
            NotificationCenter.default.removeObserver(visibilityObservation)
        }
    }
}

private extension Double {
    var intRounded: Int {
        Int(rounded())
    }
}
