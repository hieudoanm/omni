import Foundation

public final class SettingsStore: ObservableObject {
    @Published public var refreshInterval: TimeInterval {
        didSet { save() }
    }

    @Published public var menuBarDisplay: MenuBarDisplay {
        didSet { save() }
    }

    @Published public var menuBarMetrics: MenuBarMetrics {
        didSet { save() }
    }

    private let settingsURL: URL

    public init(directoryURL: URL? = nil) {
        let dir: URL
        if let d = directoryURL {
            dir = d
        } else {
            let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
            dir = appSupport.appendingPathComponent("Omni")
        }
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        settingsURL = dir.appendingPathComponent("settings.json")

        if let data = try? Data(contentsOf: settingsURL),
           let settings = try? JSONDecoder().decode(SettingsData.self, from: data)
        {
            refreshInterval = settings.refreshInterval
            menuBarDisplay = settings.menuBarDisplay ?? .percentage
            menuBarMetrics = settings.menuBarMetrics ?? .standard
        } else {
            refreshInterval = 1.0
            menuBarDisplay = .percentage
            menuBarMetrics = .standard
        }
    }

    public func save() {
        let data = SettingsData(
            refreshInterval: refreshInterval,
            menuBarDisplay: menuBarDisplay,
            menuBarMetrics: menuBarMetrics
        )
        if let encoded = try? JSONEncoder().encode(data) {
            try? encoded.write(to: settingsURL)
        }
    }
}

private struct SettingsData: Codable {
    let refreshInterval: TimeInterval
    let menuBarDisplay: MenuBarDisplay?
    let menuBarMetrics: MenuBarMetrics?

    init(
        refreshInterval: TimeInterval,
        menuBarDisplay: MenuBarDisplay,
        menuBarMetrics: MenuBarMetrics
    ) {
        self.refreshInterval = refreshInterval
        self.menuBarDisplay = menuBarDisplay
        self.menuBarMetrics = menuBarMetrics
    }
}
