import Foundation

/// Local macOS app discovery and removal. This is not Homebrew-aware: it scans
/// user-facing app directories and reports what it finds. Homebrew cask
/// tracking happens separately via `CaskIndex`.
public enum AppCatalog {
    private static let maxDepth = 4

    /// Default user-facing app directories (Apple's system apps excluded).
    public static var defaultDirectories: [URL] {
        let home = FileManager.default.homeDirectoryForCurrentUser
        return [
            URL(fileURLWithPath: "/Applications"),
            home.appendingPathComponent("Applications"),
        ]
    }

    // MARK: - Enumeration

    /// Recursively collects `.app` bundles under the given directories.
    /// Directory contents are passed in for deterministic testing.
    public static func enumerateApps(in directories: [URL] = defaultDirectories) -> [InstalledApp] {
        var apps: [InstalledApp] = []
        for directory in directories {
            collectApps(directory, depth: 0, into: &apps)
        }
        return apps
    }

    private static func collectApps(_ url: URL, depth: Int, into apps: inout [InstalledApp]) {
        guard depth <= maxDepth else { return }
        let keys: [URLResourceKey] = [.isDirectoryKey, .isPackageKey]
        guard let entries = try? FileManager.default.contentsOfDirectory(
            at: url,
            includingPropertiesForKeys: keys,
            options: [.skipsHiddenFiles]
        ) else { return }

        for entry in entries {
            guard entry.lastPathComponent.hasSuffix(".app") else {
                collectApps(entry, depth: depth + 1, into: &apps)
                continue
            }
            guard let app = makeApp(entry) else { continue }
            apps.append(app)
        }
    }

    private static func makeApp(_ url: URL) -> InstalledApp? {
        guard let bundle = Bundle(url: url) else { return nil }
        let info = bundle.infoDictionary ?? [:]

        let name = (info["CFBundleDisplayName"] as? String)
            ?? (info["CFBundleName"] as? String)
            ?? url.deletingPathExtension().lastPathComponent
        let identifier = info["CFBundleIdentifier"] as? String
        let version = info["CFBundleShortVersionString"] as? String
        let rawCategory = info["LSApplicationCategoryType"] as? String
        let category = InstalledApp.Category(lsCategory: rawCategory) ?? .uncategorized

        return InstalledApp(
            name: name,
            path: url.path,
            bundleIdentifier: identifier,
            version: version,
            category: category
        )
    }

    // MARK: - Removal

    /// Moves an app bundle to the Trash. Recoverable, non-destructive.
    public static func trash(at path: String) throws {
        let url = URL(fileURLWithPath: path).standardizedFileURL
        var resultingURL: NSURL?
        try FileManager.default.trashItem(at: url, resultingItemURL: &resultingURL)
    }
}
