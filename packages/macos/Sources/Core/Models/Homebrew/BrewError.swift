import Foundation

/// Errors surfaced when communicating with Homebrew.
public enum BrewError: Error, LocalizedError, Sendable {
    case homebrewUnavailable
    case commandFailed(exitCode: Int32, stderr: String)
    case parsingFailed(String)
    case invalidPackageName(String)

    public var errorDescription: String? {
        switch self {
        case .homebrewUnavailable:
            return "Homebrew could not be found on this system."
        case let .commandFailed(exitCode, stderr):
            return "Homebrew command failed (exit code \(exitCode)).\n\(stderr)"
        case let .parsingFailed(detail):
            return "Unable to parse Homebrew output. \(detail)"
        case let .invalidPackageName(name):
            return "\"\(name)\" is not a valid package name."
        }
    }
}
