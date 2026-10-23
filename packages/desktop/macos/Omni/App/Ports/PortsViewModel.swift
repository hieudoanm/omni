import OmniCore
import OSLog
import SwiftUI

private let logger = Logger(
    subsystem: "io.github.hieudoanm.Omni",
    category: "PortsViewModel"
)

/// Monitors processes listening on local TCP/UDP ports.
@MainActor
final class PortsViewModel: ObservableObject {
    @Published private(set) var ports: [PortInfo] = []
    @Published var searchQuery = ""
    @Published private(set) var errorMessage: String?
    @Published private(set) var isLoading = false

    private let settingsStore: SettingsStore
    private let discovery: any PortDiscovering
    private let terminator: any ProcessTerminating
    private var refreshTask: Task<Void, Never>?
    private var visibilityObservation: NSObjectProtocol?
    private var isLiveSurfaceVisible = false

    /// `lsof` is expensive (two subprocess spawns per poll), so it is never
    /// polled faster than this, and not at all while no surface is on screen.
    private static let pollingInterval: TimeInterval = 5

    init(
        settingsStore: SettingsStore,
        discovery: any PortDiscovering = LsofPortDiscoveryService(),
        terminator: any ProcessTerminating = SignalProcessTerminator()
    ) {
        self.settingsStore = settingsStore
        self.discovery = discovery
        self.terminator = terminator
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
        Task { await refresh() }
    }

    var listeningCount: Int {
        ports.filter { $0.state == .listening }.count
    }

    var filteredPorts: [PortInfo] {
        let query = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return ports }
        return ports.filter { $0.matches(query) }
    }

    var isFiltering: Bool {
        !searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    func start() {
        guard refreshTask == nil else { return }
        refreshTask = Task { @MainActor [weak self] in
            while let self, !Task.isCancelled {
                if self.isLiveSurfaceVisible {
                    await self.refresh()
                }
                try? await Task.sleep(for: .seconds(Self.pollingInterval))
            }
        }
    }

    func refresh() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let discovered = try await discovery.discoverPorts()
            if ports != discovered {
                ports = discovered
                logger.debug("Discovered \(discovered.count) ports")
            }
            errorMessage = nil
        } catch {
            logger.error("Port discovery failed: \(String(describing: error), privacy: .public)")
            errorMessage = "Unable to read ports"
        }
    }

    func terminate(_ port: PortInfo, force: Bool) throws {
        if force {
            try terminator.forceTerminate(pid: port.pid)
        } else {
            try terminator.terminate(pid: port.pid)
        }
    }
}
