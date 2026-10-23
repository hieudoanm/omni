import OmniCore
import SwiftUI

/// Drives the running-apps list for the Apps tab.
@MainActor
final class AppsViewModel: ObservableObject {
    @Published private(set) var apps: [RunningAppInfo] = []
    @Published var searchQuery = ""

    private let provider: any RunningAppProviding
    private var refreshTask: Task<Void, Never>?
    private var visibilityObservation: NSObjectProtocol?
    private var isLiveSurfaceVisible = false

    init(provider: any RunningAppProviding = RunningAppsDiscoveryService()) {
        self.provider = provider
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

    private func handleVisibilityChange(_ visible: Bool) {
        isLiveSurfaceVisible = visible
        guard visible else { return }
        refresh()
    }

    var filteredApps: [RunningAppInfo] {
        let query = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return apps }
        return apps.filter { app in
            app.name.localizedCaseInsensitiveContains(query)
                || (app.bundleIdentifier?.localizedCaseInsensitiveContains(query) ?? false)
        }
    }

    var isFiltering: Bool {
        !searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    func start() {
        guard refreshTask == nil else { return }
        refreshTask = Task { @MainActor [weak self] in
            while let self, !Task.isCancelled {
                if self.isLiveSurfaceVisible {
                    self.refresh()
                }
                try? await Task.sleep(for: .seconds(2))
            }
        }
    }

    func stop() {
        refreshTask?.cancel()
        refreshTask = nil
    }

    func refresh() {
        apps = provider.runningApps()
    }

    func bringAllWindowsToFront(_ app: RunningAppInfo) {
        provider.bringAllWindowsToFront(for: app)
    }
}
