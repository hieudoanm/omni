import Foundation

/// A deterministic `BrewClient` for testing. No real Homebrew is required.
public struct MockBrewClient: BrewClient {
    /// Maps command descriptors (first argument) to a canned response.
    public var responses: [String: ProcessResult]

    public init(responses: [String: ProcessResult] = [:]) {
        self.responses = responses
    }

    public func execute(arguments: [String]) async throws -> ProcessResult {
        let key = arguments.first ?? ""
        if let response = responses[key] {
            return response
        }
        return ProcessResult(stdout: "", stderr: "no mock for \(key)", exitCode: 1)
    }

    /// Builds a successful mock result from raw stdout.
    public static func success(stdout: String = "") -> ProcessResult {
        ProcessResult(stdout: stdout, stderr: "", exitCode: 0)
    }
}
