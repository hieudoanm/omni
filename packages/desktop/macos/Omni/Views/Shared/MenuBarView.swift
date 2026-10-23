import OmniCore
import SwiftUI

/// The menu-bar panel: a fixed-size popover over the same sections the
/// dashboard window shows, with surface-level actions in one footer.
///
/// The footer opens the window surfaces, so it carries one button per window:
/// the Applications Manager is a destination inside the dashboard window
/// (`⇧⌘A`), not a window of its own.
struct MenuBarView: View {
    let models: AppViewModels

    @AppStorage(SurfaceSection.storageKey) private var section = SurfaceSection.default
    @Environment(\.openWindow) private var openWindow

    var body: some View {
        VStack(spacing: 0) {
            tabBar

            Divider()

            content
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                .frame(height: SurfaceLayout.panelContentHeight)

            Divider()

            footer
        }
        .frame(width: SurfaceLayout.panelWidth)
        .onAppear {
            models.register(openWindow: openWindow)
            models.memory.refresh()
        }
        .animation(.easeInOut(duration: Motion.crossfade), value: section)
    }

    private var tabBar: some View {
        Picker("Tab", selection: $section) {
            ForEach(SurfaceSection.allCases, id: \.self) { entry in
                Text(entry.title).tag(entry)
            }
        }
        .pickerStyle(.segmented)
        .labelsHidden()
        .accessibilityLabel("Section")
        .padding(.horizontal, Spacing.md)
        .padding(.vertical, Spacing.sm)
    }

    @ViewBuilder
    private var content: some View {
        switch section {
        case .clipboard:
            ClipboardView(viewModel: models.clipboard)
                .transition(.opacity)
        case .clock:
            ClockView(viewModel: models.clock)
                .transition(.opacity)
        case .resources:
            ResourcesView(
                memoryViewModel: models.memory,
                batteryViewModel: models.battery
            )
            .transition(.opacity)
        case .network:
            NetworkView(
                networkViewModel: models.network,
                portsViewModel: models.ports,
                ipViewModel: models.ip
            )
            .transition(.opacity)
        case .apps:
            AppsView(
                appsViewModel: models.apps,
                workspacesViewModel: models.workspaces
            )
            .transition(.opacity)
        }
    }

    private var footer: some View {
        HStack(spacing: Spacing.compact) {
            iconButton(
                "rectangle.on.rectangle",
                help: "Open Dashboard (⇧⌘D)",
                id: DashboardView.windowID
            )
            iconButton("gear", help: "Settings (⌘,)", id: SettingsView.windowID)

            Spacer()

            Button("Quit") {
                NSApplication.shared.terminate(nil)
            }
            .buttonStyle(.borderless)
            .help("Quit Omni")
        }
        .padding(.horizontal, Spacing.md)
        .padding(.vertical, Spacing.sm)
    }

    private func iconButton(_ systemImage: String, help: String, id: String) -> some View {
        Button {
            WindowPresenter.present(openWindow, id: id)
        } label: {
            Image(systemName: systemImage)
                .frame(
                    width: SurfaceMetrics.iconButtonWidth,
                    height: SurfaceMetrics.iconButtonHeight
                )
                .contentShape(Rectangle())
                .accessibilityLabel(help)
        }
        .buttonStyle(.borderless)
        .help(help)
    }
}
