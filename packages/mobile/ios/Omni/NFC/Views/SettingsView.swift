import SwiftUI

/// NFC Toolkit settings — port of Android's `nfc/ui/settings/SettingsScreen`.
struct SettingsView: View {
    @Environment(\.hud) private var hud
    @Environment(SettingsStore.self) private var settings

    var body: some View {
        let bindable = Bindable(settings)
        List {
            Section {
                settingsRow(
                    label: "Auto-open URLs",
                    description: "Automatically open URLs when scanning a tag",
                    isOn: bindable.autoOpenUrl
                )
                settingsRow(
                    label: "Dark mode",
                    description: "Use dark theme",
                    isOn: bindable.darkMode
                )
            }
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
        .background(hud.background.ignoresSafeArea())
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func settingsRow(label: String, description: String, isOn: Binding<Bool>) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .hudBody(16)
                    .foregroundStyle(hud.text)
                Text(description)
                    .hudCaption(12)
                    .foregroundStyle(hud.muted)
            }
            Spacer()
            Toggle("", isOn: isOn)
                .labelsHidden()
                .tint(hud.primary)
        }
        .listRowBackground(hud.surface)
    }
}
