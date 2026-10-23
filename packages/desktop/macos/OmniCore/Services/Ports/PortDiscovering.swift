public enum PortDiscoveryError: Error, Sendable {
    case binaryUnavailable(String)
    case commandFailed(status: Int32, message: String)
}

public protocol PortDiscovering: Sendable {
    func discoverPorts() async throws -> [PortInfo]
}
