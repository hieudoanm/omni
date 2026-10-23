import Combine
import Foundation

/// Minimal, local persistence for UI preferences only.
///
/// Per AGENTS.md §57, Brewery never stores package installation state — only
/// UI preferences such as these.
public final class BrewSettingsStore: ObservableObject {
    @Published public var launchAtLogin: Bool {
        didSet { save() }
    }

    @Published public var checkForUpdatesOnLaunch: Bool {
        didSet { save() }
    }

    private let settingsURL: URL

    public init(directoryURL: URL? = nil) {
        let dir: URL
        if let directoryURL {
            dir = directoryURL
        } else {
            let appSupport = FileManager.default.urls(
                for: .applicationSupportDirectory,
                in: .userDomainMask
            ).first!
            dir = appSupport.appendingPathComponent("Omni")
        }
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        settingsURL = dir.appendingPathComponent("settings.json")

        if let data = try? Data(contentsOf: settingsURL),
           let settings = try? JSONDecoder().decode(SettingsData.self, from: data)
        {
            launchAtLogin = settings.launchAtLogin
            checkForUpdatesOnLaunch = settings.checkForUpdatesOnLaunch
        } else {
            launchAtLogin = false
            checkForUpdatesOnLaunch = true
        }
    }

    public func save() {
        let data = SettingsData(
            launchAtLogin: launchAtLogin,
            checkForUpdatesOnLaunch: checkForUpdatesOnLaunch
        )
        if let encoded = try? JSONEncoder().encode(data) {
            try? encoded.write(to: settingsURL)
        }
    }
}

private struct SettingsData: Codable {
    let launchAtLogin: Bool
    let checkForUpdatesOnLaunch: Bool
}
