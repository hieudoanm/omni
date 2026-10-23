import Foundation

/// The captured result of running a process.
public struct ProcessResult: Sendable {
    public let stdout: String
    public let stderr: String
    public let exitCode: Int32

    public init(stdout: String, stderr: String, exitCode: Int32) {
        self.stdout = stdout
        self.stderr = stderr
        self.exitCode = exitCode
    }

    public var succeeded: Bool {
        exitCode == 0
    }
}

/// Executes Homebrew commands. Views and services never invoke `Process` directly;
/// they go through this abstraction, which also enables deterministic testing.
public protocol BrewClient: Sendable {
    func execute(arguments: [String]) async throws -> ProcessResult
}
