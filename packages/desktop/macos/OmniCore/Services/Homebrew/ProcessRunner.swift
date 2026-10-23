import Foundation

/// Runs a process asynchronously, capturing stdout, stderr, and exit code.
///
/// Invokes the executable directly with arguments — never through a shell —
/// and never constructs shell command strings from user input.
public struct ProcessRunner: Sendable {
    public init() {}

    /// Runs the given executable and captures its output.
    ///
    /// The work runs on a background queue so the UI stays responsive, and
    /// both pipes are drained concurrently while the child runs — reading
    /// only after `waitUntilExit()` deadlocks once a pipe's buffer fills.
    public func run(
        executableURL: URL,
        arguments: [String] = []
    ) async throws -> ProcessResult {
        try await withCheckedThrowingContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                let process = Process()
                process.executableURL = executableURL
                process.arguments = arguments

                let stdoutPipe = Pipe()
                let stderrPipe = Pipe()
                process.standardOutput = stdoutPipe
                process.standardError = stderrPipe
                process.standardInput = FileHandle.nullDevice

                do {
                    try process.run()
                } catch {
                    continuation.resume(throwing: error)
                    return
                }

                let stdoutBox = PipeDataBox()
                let stderrBox = PipeDataBox()
                let group = DispatchGroup()
                for (pipe, box) in [(stdoutPipe, stdoutBox), (stderrPipe, stderrBox)] {
                    group.enter()
                    DispatchQueue.global(qos: .userInitiated).async {
                        box.data = pipe.fileHandleForReading.readDataToEndOfFile()
                        group.leave()
                    }
                }

                process.waitUntilExit()
                group.wait()

                continuation.resume(returning: ProcessResult(
                    stdout: String(data: stdoutBox.data, encoding: .utf8) ?? "",
                    stderr: String(data: stderrBox.data, encoding: .utf8) ?? "",
                    exitCode: process.terminationStatus
                ))
            }
        }
    }
}

/// Single-writer box for pipe data drained on a background queue.
private final class PipeDataBox: @unchecked Sendable {
    var data = Data()
}
