import Foundation
@testable import OmniCore
import Testing

@Suite("NetworkEndpoint")
struct NetworkEndpointTests {
    @Test("formats IPv4 address string")
    func ipv4AddressString() {
        let endpoint = NetworkEndpoint(port: 3000, protocolType: .tcp, address: "127.0.0.1")
        #expect(endpoint.addressString == "127.0.0.1:3000")
    }

    @Test("brackets IPv6 addresses")
    func ipv6AddressString() {
        let endpoint = NetworkEndpoint(port: 3000, protocolType: .tcp, address: "::1")
        #expect(endpoint.addressString == "[::1]:3000")
    }

    @Test("builds HTTP URL for an endpoint")
    func httpURL() {
        let endpoint = NetworkEndpoint(port: 3000, protocolType: .tcp, address: "127.0.0.1")
        #expect(endpoint.url?.absoluteString == "http://127.0.0.1:3000")
    }

    @Test("builds HTTP URL for an IPv6 endpoint")
    func ipv6URL() {
        let endpoint = NetworkEndpoint(port: 3000, protocolType: .tcp, address: "::1")
        #expect(endpoint.url?.absoluteString == "http://[::1]:3000")
    }

    @Test("treats localhost like an IPv4 host")
    func localhostAddressString() {
        let endpoint = NetworkEndpoint(port: 3000, protocolType: .tcp, address: "localhost")
        #expect(endpoint.addressString == "localhost:3000")
    }
}
