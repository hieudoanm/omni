import Foundation

/// Discovers listening TCP ports and UDP sockets by running `lsof`.
///
/// `lsof` is invoked with explicit executable path and arguments — never via a
/// shell. Exit status 1 means "no processes matched" and yields an empty list.
public struct LsofPortDiscoveryService: PortDiscovering {
    private let lsofURL: URL

    public init(lsofPath: String = "/usr/sbin/lsof") {
        lsofURL = URL(fileURLWithPath: lsofPath)
    }

    public func discoverPorts() async throws -> [PortInfo] {
        guard FileManager.default.isExecutableFile(atPath: lsofURL.path) else {
            throw PortDiscoveryError.binaryUnavailable(lsofURL.path)
        }

        async let tcp = run(arguments: ["-nP", "-iTCP", "-sTCP:LISTEN"])
        async let udp = run(arguments: ["-nP", "-iUDP"])

        let (tcpOutput, udpOutput) = try await (tcp, udp)
        return LsofParser.parse(tcpOutput, protocolType: .tcp)
            + LsofParser.parse(udpOutput, protocolType: .udp)
    }

    private func run(arguments: [String]) async throws -> String {
        try await Task.detached(priority: .userInitiated) {
            let process = Process()
            process.executableURL = self.lsofURL
            process.arguments = arguments

            let stdoutPipe = Pipe()
            let stderrPipe = Pipe()
            process.standardOutput = stdoutPipe
            process.standardError = stderrPipe

            do {
                try process.run()
            } catch {
                throw PortDiscoveryError.binaryUnavailable(self.lsofURL.path)
            }
            process.waitUntilExit()

            let output = stdoutPipe.fileHandleForReading.readDataToEndOfFile()
            let errorOutput = stderrPipe.fileHandleForReading.readDataToEndOfFile()

            if process.terminationStatus == 1 {
                return ""
            }
            guard process.terminationStatus == 0 else {
                throw PortDiscoveryError.commandFailed(
                    status: process.terminationStatus,
                    message: String(data: errorOutput, encoding: .utf8) ?? ""
                )
            }
            return String(data: output, encoding: .utf8) ?? ""
        }.value
    }
}
