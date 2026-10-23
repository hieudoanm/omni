import Foundation

/// The installation state of a package, derived from Homebrew.
public enum PackageStatus: String, Codable, Sendable {
    case installed
    case notInstalled
    case outdated

    public var installed: Bool {
        self != .notInstalled
    }
}
