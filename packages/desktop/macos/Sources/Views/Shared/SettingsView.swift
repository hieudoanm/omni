import OmniCore
import SwiftUI

struct SettingsView: View {
    @ObservedObject var memoryViewModel: MemoryViewModel
    @ObservedObject var clipboardViewModel: ClipboardViewModel
    @State private var launchAtLogin = LaunchAtLogin.isEnabled

    static let windowID = "settings"
    static let windowTitle = "Settings"

    var body: some View {
        Form {
            Section("General") {
                Toggle("Launch at Login", isOn: $launchAtLogin)
                    .toggleStyle(.switch)
            }

            Section("Monitoring") {
                Picker("Refresh Interval", selection: Binding(
                    get: { SelectableInterval(seconds: memoryViewModel.refreshInterval) },
                    set: { memoryViewModel.updateRefreshInterval($0.rawValue) }
                )) {
                    ForEach(SelectableInterval.allCases, id: \.self) { interval in
                        Text(interval.label).tag(interval)
                    }
                }
            }

            Section("Menu Bar") {
                Picker("Values", selection: Binding(
                    get: { memoryViewModel.menuBarDisplay },
                    set: { memoryViewModel.updateMenuBarDisplay($0) }
                )) {
                    ForEach(MenuBarDisplay.allCases, id: \.self) { display in
                        Text(display.title).tag(display)
                    }
                }
                ForEach(MenuBarMetric.allCases, id: \.self) { metric in
                    Toggle(metric.title, isOn: Binding(
                        get: { memoryViewModel.menuBarMetrics.contains(metric) },
                        set: { isOn in updateMenuBarMetric(metric, isOn: isOn) }
                    ))
                }
            }

            Section("Clipboard") {
                Toggle("Monitor clipboard automatically", isOn: $clipboardViewModel.isMonitoring)
                Picker("Max history size", selection: $clipboardViewModel.maxHistorySize) {
                    Text("100").tag(100)
                    Text("500").tag(500)
                    Text("1,000").tag(1000)
                    Text("5,000").tag(5000)
                }
                HStack {
                    Text("Saved items")
                    Spacer()
                    Text("\(clipboardViewModel.store.totalCount)")
                        .foregroundColor(.secondary)
                }
            }

            Section {
                Label {
                    Text("No special permissions required")
                        .font(.caption)
                        .foregroundColor(.secondary)
                } icon: {
                    Image(systemName: "checkmark.shield")
                }
            }
        }
        .formStyle(.grouped)
        .frame(width: 400, height: 480)
        .onChange(of: launchAtLogin) { newValue in
            launchAtLogin = LaunchAtLogin.setEnabled(newValue) ? newValue : LaunchAtLogin.isEnabled
        }
        .onAppear {
            launchAtLogin = LaunchAtLogin.isEnabled
        }
        .onDisappear {
            WindowPresenter.restoreMenuBarOnlyMode()
        }
    }

    /// The last remaining metric cannot be switched off: an empty menu bar
    /// would leave the app with nothing to show.
    private func updateMenuBarMetric(_ metric: MenuBarMetric, isOn: Bool) {
        let metrics = memoryViewModel.menuBarMetrics
        memoryViewModel.updateMenuBarMetrics(
            isOn ? metrics.adding(metric) : metrics.removing(metric)
        )
    }
}

private enum SelectableInterval: Double, CaseIterable {
    case oneSecond = 1.0
    case twoSeconds = 2.0
    case fiveSeconds = 5.0
    case tenSeconds = 10.0

    var label: String {
        switch self {
        case .oneSecond: return "1 second"
        case .twoSeconds: return "2 seconds"
        case .fiveSeconds: return "5 seconds"
        case .tenSeconds: return "10 seconds"
        }
    }

    init(seconds: TimeInterval) {
        let match = SelectableInterval.allCases.first { abs($0.rawValue - seconds) < 0.01 }
        self = match ?? .oneSecond
    }
}
