import Foundation

/// Owns all Homebrew interaction for the UI layer.
///
/// Views depend on this protocol and never invoke `Process` or the brew CLI
/// directly. `HomebrewService` delegates to a `BrewClient`, while tests can
/// substitute a mock implementation.
public protocol BrewService {
    func isHomebrewAvailable() async -> Bool
    func brewVersion() async throws -> String
    func listInstalled() async throws -> [Package]
    func installedCaskIndex() async throws -> CaskIndex
    func search(query: String) async throws -> [Package]
    func info(name: String) async throws -> Package
    func install(name: String, type: PackageType) async throws -> String
    func uninstall(name: String, type: PackageType) async throws
    func update() async throws -> String
    func upgradeAll() async throws -> String
    func upgrade(name: String) async throws -> String
    func outdated() async throws -> [Package]
    func services() async throws -> [BrewServiceInfo]
    func startService(name: String) async throws
    func stopService(name: String) async throws
    func restartService(name: String) async throws
}
