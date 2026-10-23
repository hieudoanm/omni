import Foundation

/// Distinguishes Homebrew Formulae (CLI software) from Casks (GUI applications).
public enum PackageType: String, Codable, Sendable {
    case formula
    case cask
}
