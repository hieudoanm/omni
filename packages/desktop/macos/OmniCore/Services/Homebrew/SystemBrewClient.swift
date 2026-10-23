import Foundation

/// Executes real Homebrew commands using the located brew executable.
public struct SystemBrewClient: BrewClient {
    private let executable: BrewExecutable
    private let runner: ProcessRunner

    public init(
        executable: BrewExecutable = BrewExecutable(),
        runner: ProcessRunner = ProcessRunner()
    ) {
        self.executable = executable
        self.runner = runner
    }

    public func execute(arguments: [String]) async throws -> ProcessResult {
        guard let brewURL = executable.locate() else {
            throw BrewError.homebrewUnavailable
        }
        return try await runner.run(executableURL: brewURL, arguments: arguments)
    }
}
