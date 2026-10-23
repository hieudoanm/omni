import OmniCore
import SwiftUI

@main
struct OmniApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    /// Built once and shared by every scene, so the menu-bar panel and the
    /// dashboard window always show the same live data.
    private let models = AppViewModels.shared

    var body: some Scene {
        MenuBarExtra {
            MenuBarView(models: models)
        } label: {
            MenuBarIcon(viewModel: models.memory)
        }
        .menuBarExtraStyle(.window)

        Window(DashboardView.windowTitle, id: DashboardView.windowID) {
            DashboardView(models: models)
        }
        .defaultSize(
            width: SurfaceLayout.windowDefaultWidth,
            height: SurfaceLayout.windowDefaultHeight
        )
        .windowResizability(.contentMinSize)

        Window(SettingsView.windowTitle, id: SettingsView.windowID) {
            SettingsView(
                memoryViewModel: models.memory,
                clipboardViewModel: models.clipboard
            )
        }
        .windowResizability(.contentSize)
        .commands {
            CommandMenu("Monitor") {
                Button("Refresh All") {
                    AppViewModels.shared.refreshAll()
                }
                .keyboardShortcut("r", modifiers: .command)

                Button("Open Dashboard") {
                    AppViewModels.shared.openDashboard()
                }
                .keyboardShortcut("d", modifiers: [.command, .shift])

                Button("Applications Manager…") {
                    AppViewModels.shared.openApplications()
                }
                .keyboardShortcut("a", modifiers: [.command, .shift])

                Button("Settings…") {
                    AppViewModels.shared.openSettings()
                }
                .keyboardShortcut(",", modifiers: .command)
            }
        }
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    @MainActor
    static let menuBarPanelPositioner = MenuBarPanelPositioner.shared

    @MainActor
    static let surfaceVisibilityMonitor = SurfaceVisibilityMonitor.shared

    func applicationDidFinishLaunching(_: Notification) {
        NSApp.setActivationPolicy(.accessory)
        Task { @MainActor in
            let models = AppViewModels.shared
            Self.surfaceVisibilityMonitor.start()
            models.network.start()
            models.ports.start()
            models.battery.start()
            Self.menuBarPanelPositioner.start()
        }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_: NSApplication) -> Bool {
        false
    }
}
