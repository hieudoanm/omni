import Foundation

/// Detects the Homebrew executable without hard-coding a single architecture.
public struct BrewExecutable: Sendable {
    private let candidatePaths: [String]

    public init(
        candidatePaths: [String] = [
            "/opt/homebrew/bin/brew",
            "/usr/local/bin/brew",
        ]
    ) {
        self.candidatePaths = candidatePaths
    }

    /// Returns the URL of the Homebrew executable, or `nil` if unavailable.
    ///
    /// Search order:
    /// 1. `which brew` on the current PATH.
    /// 2. Known Homebrew installation locations.
    public func locate() -> URL? {
        if let fromPath = locateOnPath() {
            return fromPath
        }
        for path in candidatePaths {
            let url = URL(fileURLWithPath: path)
            if FileManager.default.isExecutableFile(atPath: url.path) {
                return url
            }
        }
        return nil
    }

    public var isAvailable: Bool {
        locate() != nil
    }

    private func locateOnPath() -> URL? {
        guard let whichOutput = runWhich() else { return nil }
        let path = whichOutput.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !path.isEmpty else { return nil }
        let url = URL(fileURLWithPath: path)
        return FileManager.default.isExecutableFile(atPath: url.path) ? url : nil
    }

    private func runWhich() -> String? {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/which")
        process.arguments = ["brew"]
        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = Pipe()
        do {
            try process.run()
        } catch {
            return nil
        }
        process.waitUntilExit()
        guard process.terminationStatus == 0 else { return nil }
        return String(data: pipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8)
    }
}
