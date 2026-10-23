import Foundation

/// Maps installed apps back to the Homebrew cask that manages them.
public struct CaskIndex: Sendable {
    private var byPath: [String: String] = [:]
    private var byBundleIdentifier: [String: String] = [:]

    public init() {}

    public mutating func add(token: String, appPath: String) {
        byPath[appPath] = token
    }

    public mutating func add(token: String, bundleIdentifier: String) {
        byBundleIdentifier[bundleIdentifier] = token
    }

    public func token(for app: InstalledApp) -> String? {
        guard let match = byPath[app.path] ?? app.bundleIdentifier.flatMap({ byBundleIdentifier[$0] }) else {
            return nil
        }
        return match
    }
}

/// Concrete `BrewService` that performs Homebrew commands through a `BrewClient`.
public struct HomebrewService: BrewService {
    private let client: any BrewClient

    public init(client: any BrewClient = SystemBrewClient()) {
        self.client = client
    }

    // MARK: - Detection

    public func isHomebrewAvailable() async -> Bool {
        guard let result = try? await client.execute(arguments: ["--version"]) else {
            return false
        }
        return result.succeeded
    }

    public func brewVersion() async throws -> String {
        let result = try await client.execute(arguments: ["--version"])
        guard result.succeeded else {
            throw BrewError.commandFailed(exitCode: result.exitCode, stderr: result.stderr)
        }
        return BrewParser.firstLine(result.stdout)
    }

    // MARK: - Read operations

    public func listInstalled() async throws -> [Package] {
        async let formulae = tokens(arguments: ["list", "--formula"])
        async let casks = tokens(arguments: ["list", "--cask"])

        let (formulaTokens, caskTokens) = try await (formulae, casks)

        var packages: [Package] = []
        for token in formulaTokens {
            packages.append(Package(name: token, type: .formula, status: .installed))
        }
        for token in caskTokens {
            packages.append(Package(name: token, type: .cask, status: .installed))
        }
        return packages
    }

    // MARK: - Cask index

    public func installedCaskIndex() async throws -> CaskIndex {
        let tokens = try await tokens(arguments: ["list", "--cask"])
        guard !tokens.isEmpty else { return CaskIndex() }

        let result = try await client.execute(arguments: ["info", "--json=v2", "--cask"] + tokens)
        guard result.succeeded else {
            throw BrewError.commandFailed(exitCode: result.exitCode, stderr: result.stderr)
        }

        let casks = try BrewParser.parseInstalledCasks(result.stdout)
        var index = CaskIndex()
        for cask in casks {
            for path in cask.appPaths {
                index.add(token: cask.token, appPath: path)
            }
            if let bundleIdentifier = cask.bundleIdentifier, !bundleIdentifier.isEmpty {
                index.add(token: cask.token, bundleIdentifier: bundleIdentifier)
            }
        }
        return index
    }

    // MARK: - Search

    public func search(query: String) async throws -> [Package] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return [] }

        async let formulaMatches = tokens(arguments: ["search", "--formula", trimmed])
        async let caskMatches = tokens(arguments: ["search", "--cask", trimmed])

        let (formulaTokens, caskTokens) = try await (formulaMatches, caskMatches)

        var packages: [Package] = []
        for token in formulaTokens {
            packages.append(Package(name: token, type: .formula))
        }
        for token in caskTokens {
            packages.append(Package(name: token, type: .cask))
        }
        return packages
    }

    public func info(name: String) async throws -> Package {
        guard isValidName(name) else { throw BrewError.invalidPackageName(name) }

        async let formulaJSON = rawInfo(name: name, type: .formula)
        async let caskJSON = rawInfo(name: name, type: .cask)

        let (formula, cask) = try await (formulaJSON, caskJSON)

        let parsed = (try? BrewParser.parseInfoV2(formula)) ?? []
        if let match = parsed.first(where: { $0.type == .formula }) {
            return match
        }
        let parsedCasks = (try? BrewParser.parseInfoV2(cask)) ?? []
        if let match = parsedCasks.first {
            return match
        }
        throw BrewError.parsingFailed("No package named \"\(name)\".")
    }

    // MARK: - Mutating operations

    public func install(name: String, type: PackageType) async throws -> String {
        guard isValidName(name) else { throw BrewError.invalidPackageName(name) }
        let result = try await runMutation(arguments: ["install", flag(for: type), name])
        return result.stdout
    }

    public func uninstall(name: String, type: PackageType) async throws {
        guard isValidName(name) else { throw BrewError.invalidPackageName(name) }
        _ = try await runMutation(arguments: ["uninstall", flag(for: type), name])
    }

    public func update() async throws -> String {
        let result = try await runMutation(arguments: ["update"])
        return result.stdout
    }

    public func upgradeAll() async throws -> String {
        let result = try await runMutation(arguments: ["upgrade"])
        return result.stdout
    }

    public func upgrade(name: String) async throws -> String {
        guard isValidName(name) else { throw BrewError.invalidPackageName(name) }
        let result = try await runMutation(arguments: ["upgrade", name])
        return result.stdout
    }

    public func outdated() async throws -> [Package] {
        let result = try await client.execute(arguments: ["outdated", "--json=v2"])
        guard result.succeeded else {
            throw BrewError.commandFailed(exitCode: result.exitCode, stderr: result.stderr)
        }
        return try BrewParser.parseOutdatedV2(result.stdout)
    }

    // MARK: - Services

    public func services() async throws -> [BrewServiceInfo] {
        let result = try await client.execute(arguments: ["services", "list"])
        guard result.succeeded else {
            throw BrewError.commandFailed(exitCode: result.exitCode, stderr: result.stderr)
        }
        return BrewParser.parseServices(result.stdout)
    }

    public func startService(name: String) async throws {
        _ = try await runMutation(arguments: ["services", "start", name])
    }

    public func stopService(name: String) async throws {
        _ = try await runMutation(arguments: ["services", "stop", name])
    }

    public func restartService(name: String) async throws {
        _ = try await runMutation(arguments: ["services", "restart", name])
    }

    // MARK: - Private helpers

    private func tokens(arguments: [String]) async throws -> [String] {
        let result = try await client.execute(arguments: arguments)
        guard result.succeeded else {
            throw BrewError.commandFailed(exitCode: result.exitCode, stderr: result.stderr)
        }
        return BrewParser.parseTokens(result.stdout)
    }

    private func rawInfo(name: String, type: PackageType) async throws -> String {
        let result = try await client.execute(
            arguments: ["info", "--json=v2", "--\(type.rawValue)", name]
        )
        guard result.succeeded else {
            throw BrewError.commandFailed(exitCode: result.exitCode, stderr: result.stderr)
        }
        return result.stdout
    }

    private func runMutation(arguments: [String]) async throws -> ProcessResult {
        let result = try await client.execute(arguments: arguments)
        guard result.succeeded else {
            throw BrewError.commandFailed(exitCode: result.exitCode, stderr: result.stderr)
        }
        return result
    }

    private func flag(for type: PackageType) -> String {
        type == .cask ? "--cask" : "--formula"
    }

    private func isValidName(_ name: String) -> Bool {
        let allowed = CharacterSet(charactersIn: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-._@/")
        return name.rangeOfCharacter(from: allowed.inverted) == nil && !name.isEmpty
    }
}
