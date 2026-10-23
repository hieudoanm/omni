import OmniCore
import SwiftUI

/// Every view model the app owns, built once and shared by both surfaces —
/// the menu-bar panel and the dashboard window — so the two always show the
/// same live data and the same settings.
@MainActor
final class AppViewModels {
    static let shared = AppViewModels()

    let clipboard: ClipboardViewModel
    let clock: ClockViewModel
    let ip: IPViewModel
    let memory: MemoryViewModel
    let network: NetworkViewModel
    let ports: PortsViewModel
    let apps: AppsViewModel
    let workspaces: WorkspacesViewModel
    let homebrew: HomebrewViewModel
    let battery: BatteryViewModel

    /// Lets App-menu commands, which live outside any view, open window scenes.
    /// Registered by whichever surface is on screen.
    private var openWindowAction: OpenWindowAction?

    /// Sidebar selection of the single dashboard window, shared with the menu-bar
    /// panel so it can send the user to a specific destination.
    let router = DashboardRouter()

    private init() {
        let settings = SettingsStore()
        clipboard = ClipboardViewModel()
        clock = ClockViewModel()
        ip = IPViewModel()
        memory = MemoryViewModel(settingsStore: settings)
        network = NetworkViewModel(settingsStore: settings)
        ports = PortsViewModel(settingsStore: settings)
        apps = AppsViewModel()
        workspaces = WorkspacesViewModel()
        homebrew = HomebrewViewModel()
        battery = BatteryViewModel(settingsStore: settings)
    }

    func register(openWindow: OpenWindowAction) {
        openWindowAction = openWindow
    }

    func openDashboard() {
        present(id: DashboardView.windowID)
    }

    func openSettings() {
        present(id: SettingsView.windowID)
    }

    /// The Applications Manager is a destination inside the dashboard window, not
    /// a window of its own, so opening it means selecting its route first.
    func openApplications() {
        router.show(.applicationsManager)
        present(id: DashboardView.windowID)
    }

    func refreshAll() {
        memory.refresh()
        battery.refresh()
        clipboard.refresh()
        network.refresh()
        apps.refresh()
        workspaces.refresh()
        Task { await ports.refresh() }
        Task { await ip.refresh() }
    }

    private func present(id: String) {
        guard let openWindowAction else { return }
        WindowPresenter.present(openWindowAction, id: id)
    }
}
