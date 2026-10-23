import Foundation

public enum NetworkProtocol: String, CaseIterable, Codable, Sendable {
    case tcp
    case udp

    public var title: String {
        rawValue.uppercased()
    }
}

public enum PortState: String, Codable, Sendable {
    case listening
    case established
    case other

    public var title: String {
        rawValue.capitalized
    }
}

/// A listening local endpoint bound to a process.
///
/// Named `PortInfo` rather than `Port` because Foundation exposes its renamed
/// `NSPort` as `Port`, which collides with the model everywhere SwiftUI and
/// the Mach port APIs are imported.
public struct PortInfo: Identifiable, Hashable, Codable, Sendable {
    public let id: String

    public let endpoint: NetworkEndpoint
    public let pid: Int32
    public let processName: String

    public let command: String?
    public let executablePath: String?
    public let workingDirectory: String?

    public let state: PortState

    public init(
        endpoint: NetworkEndpoint,
        pid: Int32,
        processName: String,
        command: String? = nil,
        executablePath: String? = nil,
        workingDirectory: String? = nil,
        state: PortState = .listening
    ) {
        id = "\(endpoint.port)-\(endpoint.protocolType.rawValue)-\(endpoint.address)-\(pid)"
        self.endpoint = endpoint
        self.pid = pid
        self.processName = processName
        self.command = command
        self.executablePath = executablePath
        self.workingDirectory = workingDirectory
        self.state = state
    }

    public func matches(_ query: String) -> Bool {
        let needle = query.lowercased()
        let fields = [
            String(endpoint.port),
            endpoint.protocolType.rawValue,
            endpoint.address,
            String(pid),
            processName,
            command,
            executablePath,
            workingDirectory,
        ]
        return fields.compactMap { $0?.lowercased() }.contains { $0.contains(needle) }
    }
}
