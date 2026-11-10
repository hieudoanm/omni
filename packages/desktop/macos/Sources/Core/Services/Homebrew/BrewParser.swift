import Foundation

/// The app artifacts a Homebrew cask owns, from `brew info --json=v2`.
public struct InstalledCask: Equatable, Sendable {
    public let token: String
    public let bundleIdentifier: String?
    public let appPaths: [String]

    public init(token: String, bundleIdentifier: String?, appPaths: [String]) {
        self.token = token
        self.bundleIdentifier = bundleIdentifier
        self.appPaths = appPaths
    }
}

/// Parses Homebrew JSON output (`brew info --json=v2`) into structured models.
public enum BrewParser {
    // MARK: - JSON shape (defensive: optional/missing fields tolerated)

    private struct InfoV2: Decodable {
        let formulae: [FormulaJSON]?
        let casks: [CaskJSON]?
    }

    private struct FormulaJSON: Decodable {
        let name: String?
        let desc: String?
        let homepage: String?
        let versions: VersionsJSON?
        let dependencies: [String]?
        let installed: [InstalledJSON]?

        struct VersionsJSON: Decodable {
            let stable: String?
        }

        struct InstalledJSON: Decodable {
            let version: String?
        }
    }

    private struct CaskJSON: Decodable {
        let token: String?
        let name: [String]?
        let desc: String?
        let homepage: String?
        let version: String?
        let installed: String?
    }

    // MARK: - Cask artifact shape (installed apps a cask manages)

    /// A cask record from `brew info --json=v2`. Only the fields needed to map
    /// the cask back to installed app bundles are decoded; the `artifacts`
    /// section is read tolerantly because real casks mix strings, dicts, and
    /// nested structures (e.g. `zap`, `postflight_steps`) that we don't care
    /// about.
    private struct CaskDetails: Decodable {
        let token: String?
        let bundle_id: String?
        let appPaths: [String]

        private enum CodingKeys: String, CodingKey {
            case token
            case bundle_id
            case artifacts
        }

        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            token = try container.decodeIfPresent(String.self, forKey: .token)
            bundle_id = try container.decodeIfPresent(String.self, forKey: .bundle_id)
            let groups = (try? container.decode([ArtifactGroup].self, forKey: .artifacts)) ?? []
            appPaths = groups.flatMap { $0.resolvedAppPaths() }
        }
    }

    /// One element of the top-level `artifacts` array. It is a dictionary keyed
    /// by artifact type (`app`, `binary`, `zap`, ...). Only the `app` entries
    /// and the sibling `target` override are read; everything else is skipped.
    private struct ArtifactGroup: Decodable {
        private struct DynamicKey: CodingKey {
            var stringValue: String
            var intValue: Int? {
                nil
            }

            init?(stringValue: String) {
                self.stringValue = stringValue
            }

            init?(intValue _: Int) {
                nil
            }
        }

        private let app: [AppArtifact]
        private let target: String?

        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: DynamicKey.self)
            if let appKey = DynamicKey(stringValue: "app") {
                app = (try? container.decode([AppArtifact].self, forKey: appKey)) ?? []
            } else {
                app = []
            }
            if let targetKey = DynamicKey(stringValue: "target") {
                target = (try? container.decodeIfPresent(String.self, forKey: targetKey))
            } else {
                target = nil
            }
        }

        /// A single `app` entry: a plain path string, or a `{ "path": ..,
        /// "target": .. }` override.
        private struct AppArtifact: Decodable {
            let path: String
            let target: String?

            init(from decoder: Decoder) throws {
                let container = try decoder.singleValueContainer()
                if let value = try? container.decode(String.self) {
                    path = value
                    target = nil
                    return
                }
                let dict = try container.decode([String: String].self)
                path = dict["path"] ?? ""
                target = dict["target"]
            }
        }

        func resolvedAppPaths() -> [String] {
            // A single relative entry with a sibling `target` (Homebrew's
            // non-default install location) wins over the raw path.
            if app.count == 1, let target, !target.isEmpty, app[0].target == nil {
                return [target]
            }
            return app.map { Self.normalize($0.path, target: $0.target) }
        }

        private static func normalize(_ raw: String, target: String?) -> String {
            if let target, !target.isEmpty {
                return target
            }
            if raw.hasPrefix("/") {
                return raw
            }
            return "/Applications/\(raw)"
        }
    }

    // MARK: - Entry points

    /// Parses a `brew info --json=v2` document into a list of packages.
    public static func parseInfoV2(_ json: String) throws -> [Package] {
        guard let data = json.data(using: .utf8) else {
            throw BrewError.parsingFailed("Output is not valid UTF-8.")
        }
        guard let info = try? JSONDecoder().decode(InfoV2.self, from: data) else {
            throw BrewError.parsingFailed("Output is not valid JSON.")
        }

        let formulae = (info.formulae ?? []).map(formula)
        let casks = (info.casks ?? []).map(cask)
        return formulae + casks
    }

    /// Parses the `casks` section of a `brew info --json=v2` document into the
    /// installed app artifacts each cask owns.
    public static func parseInstalledCasks(_ json: String) throws -> [InstalledCask] {
        struct TopLevel: Decodable {
            let casks: [CaskDetails]?
        }

        guard let data = json.data(using: .utf8) else {
            throw BrewError.parsingFailed("Output is not valid UTF-8.")
        }
        guard let top = try? JSONDecoder().decode(TopLevel.self, from: data) else {
            throw BrewError.parsingFailed("Output is not valid JSON.")
        }

        return (top.casks ?? []).map { details in
            InstalledCask(
                token: details.token ?? "",
                bundleIdentifier: details.bundle_id,
                appPaths: details.appPaths
            )
        }
    }

    /// Parses a `brew outdated --json=v2` document into a list of outdated packages.
    public static func parseOutdatedV2(_ json: String) throws -> [Package] {
        struct Outdated: Decodable {
            let formulae: [FormulaOutdated]?
            let casks: [CaskOutdated]?
        }
        struct FormulaOutdated: Decodable {
            let name: String?
            let installed_versions: [String]?
            let current_version: String?
        }
        struct CaskOutdated: Decodable {
            let token: String?
            let installed_versions: [String]?
            let current_version: String?
        }

        guard let data = json.data(using: .utf8) else {
            throw BrewError.parsingFailed("Output is not valid UTF-8.")
        }
        guard let outdated = try? JSONDecoder().decode(Outdated.self, from: data) else {
            throw BrewError.parsingFailed("Output is not valid JSON.")
        }

        var packages: [Package] = []
        for entry in outdated.formulae ?? [] {
            packages.append(Package(
                name: entry.name ?? "",
                type: .formula,
                currentVersion: entry.current_version ?? "",
                installedVersion: entry.installed_versions?.first,
                status: .outdated
            ))
        }
        for entry in outdated.casks ?? [] {
            packages.append(Package(
                name: entry.token ?? "",
                type: .cask,
                currentVersion: entry.current_version ?? "",
                installedVersion: entry.installed_versions?.first,
                status: .outdated
            ))
        }
        return packages
    }

    /// Parses the columnar output of `brew services list`.
    ///
    /// The first column is the service name; the second is its status (`started`,
    /// `stopped`, `error`, or another value).
    public static func parseServices(_ text: String) -> [BrewServiceInfo] {
        var services: [BrewServiceInfo] = []
        let lines = text.split(whereSeparator: \.isNewline).dropFirst()
        for line in lines {
            let columns = line.split(whereSeparator: \.isWhitespace)
            guard columns.count >= 2 else { continue }
            let name = String(columns[0])
            let status = normalizeStatus(String(columns[1]))
            services.append(BrewServiceInfo(name: name, status: status))
        }
        return services
    }

    private static func normalizeStatus(_ raw: String) -> BrewServiceInfo.ServiceStatus {
        switch raw.lowercased() {
        case "started": return .started
        case "stopped", "none": return .stopped
        case "error": return .error
        default: return .unknown
        }
    }

    /// Parses newline-separated package tokens.
    /// Homebrew returns one token per line for `brew list`, `brew outdated`, etc.
    public static func parseTokens(_ text: String) -> [String] {
        text.split(whereSeparator: \.isNewline)
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
    }

    /// Returns the first non-empty line of the given output.
    public static func firstLine(_ text: String) -> String {
        text.split(whereSeparator: \.isNewline)
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .first(where: { !$0.isEmpty }) ?? ""
    }

    // MARK: - Mapping

    private static func formula(_ json: FormulaJSON) -> Package {
        let installedVersion = json.installed?.compactMap(\.version).first
        return Package(
            name: json.name ?? "",
            type: .formula,
            description: json.desc ?? "",
            homepage: json.homepage,
            dependencies: json.dependencies ?? [],
            currentVersion: json.versions?.stable ?? "",
            installedVersion: installedVersion,
            status: installedVersion == nil ? .notInstalled : .installed
        )
    }

    private static func cask(_ json: CaskJSON) -> Package {
        let installedVersion = nonEmpty(json.installed)
        let displayName = json.name?.first ?? json.token ?? ""
        return Package(
            name: displayName,
            type: .cask,
            description: json.desc ?? "",
            homepage: json.homepage,
            dependencies: [],
            currentVersion: json.version ?? "",
            installedVersion: installedVersion,
            status: installedVersion == nil ? .notInstalled : .installed
        )
    }

    private static func nonEmpty(_ value: String?) -> String? {
        guard let value, !value.isEmpty, value != "N/A" else { return nil }
        return value
    }
}
