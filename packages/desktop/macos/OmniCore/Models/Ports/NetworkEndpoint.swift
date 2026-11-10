import Foundation

/// A local network endpoint: a port number bound to an address on a protocol.
public struct NetworkEndpoint: Hashable, Codable, Sendable {
    public let port: UInt16
    public let protocolType: NetworkProtocol
    public let address: String

    public init(port: UInt16, protocolType: NetworkProtocol, address: String) {
        self.port = port
        self.protocolType = protocolType
        self.address = address
    }

    /// Host portion of the address, bracketed when IPv6.
    public var host: String {
        address.contains("::") ? "[\(address)]" : address
    }

    /// A host:port representation suitable for copying, e.g. `localhost:3000`.
    public var addressString: String {
        "\(host):\(port)"
    }

    /// A best-effort HTTP URL for the endpoint.
    public var url: URL? {
        URL(string: "http://\(addressString)")
    }
}
