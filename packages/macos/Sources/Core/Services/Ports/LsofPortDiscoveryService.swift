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
        // ProcessRunner drains stdout/stderr concurrently with the wait —
        // `lsof -i` output can exceed the pipe buffer and deadlock a naive
        // waitUntilExit-then-read implementation.
        let result: ProcessResult
        do {
            result = try await ProcessRunner().run(
                executableURL: lsofURL,
                arguments: arguments
            )
        } catch {
            throw PortDiscoveryError.binaryUnavailable(lsofURL.path)
        }

        if result.exitCode == 1 {
            return ""
        }
        guard result.exitCode == 0 else {
            throw PortDiscoveryError.commandFailed(
                status: result.exitCode,
                message: result.stderr
            )
        }
        return result.stdout
    }
}
