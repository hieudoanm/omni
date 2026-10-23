import Foundation

/// Runs a process asynchronously, capturing stdout, stderr, and exit code.
///
/// Invokes the executable directly with arguments — never through a shell —
/// and never constructs shell command strings from user input.
public struct ProcessRunner: Sendable {
    public init() {}

    /// Runs the given executable and captures its output.
    ///
    /// The work runs on a detached (non-main) executor so the UI stays responsive.
    /// Throws `CancellationError` if the surrounding task is cancelled.
    public func run(
        executableURL: URL,
        arguments: [String] = []
    ) async throws -> ProcessResult {
        try await Task.detached(priority: .userInitiated) {
            let process = Process()
            process.executableURL = executableURL
            process.arguments = arguments

            let stdoutPipe = Pipe()
            let stderrPipe = Pipe()
            process.standardOutput = stdoutPipe
            process.standardError = stderrPipe
            process.standardInput = FileHandle.nullDevice

            try process.run()
            process.waitUntilExit()

            let stdout = String(
                data: stdoutPipe.fileHandleForReading.readDataToEndOfFile(),
                encoding: .utf8
            ) ?? ""
            let stderr = String(
                data: stderrPipe.fileHandleForReading.readDataToEndOfFile(),
                encoding: .utf8
            ) ?? ""

            return ProcessResult(
                stdout: stdout,
                stderr: stderr,
                exitCode: process.terminationStatus
            )
        }.value
    }
}
