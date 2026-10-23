import SwiftData
import SwiftUI

@main
struct OmniApp: App {
    @State private var settings = SettingsStore()

    var body: some Scene {
        WindowGroup {
            HubHomeView()
                .environment(settings)
                .omniTheme()
                .preferredColorScheme(settings.darkMode ? .dark : .light)
        }
        .modelContainer(for: [TagHistoryItem.self, TagProfile.self])
    }
}
