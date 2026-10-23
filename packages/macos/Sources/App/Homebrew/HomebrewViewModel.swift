import Combine
import Foundation
import OmniCore
import OSLog

private let logger = Logger(
    subsystem: "io.github.hieudoanm.Omni",
    category: "HomebrewViewModel"
)

/// The central state holder for the UI. All screen data flows through here;
/// views never call `Process` directly.
@MainActor
final class HomebrewViewModel: ObservableObject {
    enum Section: String, Hashable, CaseIterable, Identifiable {
        case discover
        case installed
        case apps
        case updates
        case services

        enum Group: String, Hashable, Identifiable {
            case homebrew
            case applications

            var id: String {
                rawValue
            }

            var title: String {
                switch self {
                case .homebrew: return "Homebrew"
                case .applications: return "Applications"
                }
            }
        }

        var id: String {
            rawValue
        }

        var group: Group {
            switch self {
            case .discover, .installed, .updates, .services: return .homebrew
            case .apps: return .applications
            }
        }

        var title: String {
            switch self {
            case .discover: return "Discover"
            case .installed: return "Installed"
            case .apps: return "Apps"
            case .updates: return "Updates"
            case .services: return "Services"
            }
        }

        var systemImage: String {
            switch self {
            case .discover: return "magnifyingglass"
            case .installed: return "shippingbox"
            case .apps: return "macwindow"
            case .updates: return "arrow.triangle.2.circlepath"
            case .services: return "gearshape.2"
            }
        }
    }

    // MARK: - Published state

    @Published private(set) var isHomebrewAvailable = false
    @Published private(set) var homebrewMissing = false
    @Published var searchQuery = ""
    @Published private(set) var searchResults: [Package] = []
    @Published private(set) var installedPackages: [Package] = []
    @Published private(set) var installedApps: [InstalledApp] = []
    @Published private(set) var outdatedPackages: [Package] = []
    @Published private(set) var services: [BrewServiceInfo] = []
    @Published private(set) var isLoading = false
    @Published var errorMessage: String?
    @Published private(set) var lastUpdate: Date?
    @Published var selectedPackage: Package?
    @Published var homebrewVersion = ""

    /// Names of packages that have an available upgrade.
    var outdatedNames: Set<String> {
        Set(outdatedPackages.map(\.name))
    }

    var launchAtLogin: Bool {
        settingsStore.launchAtLogin
    }

    // MARK: - Dependencies

    private let service: any BrewService
    private let settingsStore: BrewSettingsStore
    private var searchTask: Task<Void, Never>?
    private var hasStarted = false

    init(service: any BrewService = HomebrewService(), settingsStore: BrewSettingsStore = BrewSettingsStore()) {
        self.service = service
        self.settingsStore = settingsStore
    }

    /// The Applications Manager now lives inside the dashboard window, so the
    /// host view is recreated on every route change. Detect Homebrew once.
    func startIfNeeded() async {
        guard !hasStarted else { return }
        hasStarted = true
        await checkHomebrew()
    }

    // MARK: - Homebrew detection

    func checkHomebrew() async {
        let available = await service.isHomebrewAvailable()
        isHomebrewAvailable = available
        homebrewMissing = !available
        if available {
            await loadHomebrewVersion()
            await refreshAll()
        }
    }

    func loadHomebrewVersion() async {
        guard let version = try? await service.brewVersion() else { return }
        homebrewVersion = version
    }

    func updateLaunchAtLogin(_ enabled: Bool) {
        settingsStore.launchAtLogin = enabled
        objectWillChange.send()
    }

    // MARK: - Discover / search

    func search() {
        searchTask?.cancel()
        let query = searchQuery
        guard !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            searchResults = []
            return
        }
        let task = Task { @MainActor [weak self] in
            try? await Task.sleep(for: .milliseconds(300))
            guard !Task.isCancelled, let self else { return }
            do {
                self.searchResults = try await self.service.search(query: query)
            } catch {
                self.searchResults = []
                self.setError("Search failed", error)
            }
        }
        searchTask = task
    }

    func refreshDiscover() async {
        await loadInstalled()
    }

    // MARK: - Installed

    func loadInstalled() async {
        do {
            installedPackages = try await service.listInstalled()
        } catch {
            setError("Unable to load installed packages", error)
        }
    }

    // MARK: - Updates

    func loadOutdated() async {
        do {
            outdatedPackages = try await service.outdated()
        } catch {
            setError("Unable to check for updates", error)
        }
    }

    func refreshHomebrew() async {
        isLoading = true
        defer { isLoading = false }
        do {
            _ = try await service.update()
            lastUpdate = Date()
        } catch {
            setError("Unable to update Homebrew", error)
        }
        await refreshAfterMutation()
    }

    func upgradeAll() async {
        await runMutation("Upgrade all") {
            _ = try await self.service.upgradeAll()
        }
    }

    func upgrade(_ package: Package) async {
        await runMutation("Upgrade \(package.name)") {
            _ = try await self.service.upgrade(name: package.name)
        }
    }

    // MARK: - Services

    func loadServices() async {
        do {
            services = try await service.services()
        } catch {
            setError("Unable to load services", error)
        }
    }

    func startService(_ name: String) async {
        await runMutation("Start \(name)") { try await self.service.startService(name: name) }
    }

    func stopService(_ name: String) async {
        await runMutation("Stop \(name)") { try await self.service.stopService(name: name) }
    }

    func restartService(_ name: String) async {
        await runMutation("Restart \(name)") { try await self.service.restartService(name: name) }
    }

    // MARK: - Package actions

    func install(_ package: Package) async {
        await runMutation("Install \(package.name)") {
            _ = try await self.service.install(name: package.name, type: package.type)
        }
    }

    func uninstall(_ package: Package) async {
        await runMutation("Uninstall \(package.name)") {
            try await self.service.uninstall(name: package.name, type: package.type)
        }
    }

    func loadPackageDetail(_ name: String) async {
        guard let match = installedPackages.first(where: { $0.name == name }) else { return }
        selectedPackage = match
    }

    // MARK: - Apps

    func loadApps() async {
        do {
            let apps = await Task.detached { AppCatalog.enumerateApps() }.value
            let index = try await service.installedCaskIndex()
            installedApps = apps.map { app in
                var marked = app
                marked.caskToken = index.token(for: app)
                return marked
            }
        } catch {
            setError("Unable to load apps", error)
        }
    }

    func trashApp(_ app: InstalledApp) async {
        await runMutation("Move \(app.name) to Trash") {
            try await Task.detached { try AppCatalog.trash(at: app.path) }.value
        }
    }

    func uninstallCaskApp(_ app: InstalledApp) async {
        guard let token = app.caskToken else { return }
        await runMutation("Uninstall \(app.name)") {
            try await self.service.uninstall(name: token, type: .cask)
        }
    }

    // MARK: - Refresh

    func refreshAll() async {
        async let installed: Void = loadInstalled()
        async let outdated: Void = loadOutdated()
        async let services: Void = loadServices()
        async let apps: Void = loadApps()
        _ = await (installed, outdated, services, apps)
    }

    func refreshAfterMutation() async {
        await refreshAll()
    }

    // MARK: - Helpers

    private func runMutation(_ action: String, _ operation: () async throws -> Void) async {
        isLoading = true
        defer { isLoading = false }
        do {
            try await operation()
            errorMessage = nil
        } catch {
            logger.error("\(action) failed: \(String(describing: error), privacy: .public)")
            setError("\(action) failed", error)
        }
        await refreshAfterMutation()
    }

    private func setError(_ title: String, _ error: Error) {
        errorMessage = "\(title). \(error.localizedDescription)"
    }
}
