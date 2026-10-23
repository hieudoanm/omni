import Foundation
@testable import OmniCore
import Testing

@Suite("LsofParser")
struct LsofParserTests {
    private let tcpOutput = """
    COMMAND   PID     USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
    node    21894 hieudoan   25u  IPv4 0x3390a1e95d00c687      0t0  TCP *:3000 (LISTEN)
    node    21894 hieudoan   27u  IPv6 0x3390a146ee2b6d69      0t0  TCP *:3000 (LISTEN)
    ControlCe 861 hieudoan   19u  IPv4 0x3390a1e95d48c5cf      0t0  TCP 127.0.0.1:5960 (LISTEN)
    """

    @Test("parses TCP listening ports, deduplicating IPv4/IPv6 wildcards")
    func parsesTCP() {
        let ports = LsofParser.parse(tcpOutput, protocolType: .tcp)

        #expect(ports.count == 2)
        #expect(ports.contains { $0.endpoint.port == 3000 && $0.pid == 21894 && $0.processName == "node" })
        #expect(ports.contains { $0.endpoint.port == 5960 && $0.pid == 861 })
    }

    @Test("marks discovered ports as listening")
    func stateIsListening() {
        let ports = LsofParser.parse(tcpOutput, protocolType: .tcp)
        #expect(ports.allSatisfy { $0.state == .listening })
    }

    @Test("parses UDP sockets")
    func parsesUDP() {
        let output = """
        COMMAND   PID     USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
        mDNSRespo  761 hieudoan   12u  IPv4 0x3390a1e95d4c17cf      0t0  UDP *:5353
        node    18234 hieudoan   33u  IPv6 0x3390a146ee2b6d69      0t0  UDP [::1]:8080
        """

        let ports = LsofParser.parse(output, protocolType: .udp)

        #expect(ports.count == 2)
        #expect(ports.contains { $0.endpoint.port == 5353 && $0.endpoint.address == "*" })
        #expect(ports.contains { $0.endpoint.port == 8080 && $0.endpoint.address == "::1" })
    }

    @Test("sorts results by port then protocol")
    func sortsByPort() {
        let output = """
        COMMAND   PID     USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
        node    4000 hieudoan   25u  IPv4 0x3390a1e95d00c687      0t0  TCP *:4000 (LISTEN)
        node    3000 hieudoan   25u  IPv4 0x3390a1e95d00c687      0t0  TCP *:3000 (LISTEN)
        """

        let ports = LsofParser.parse(output, protocolType: .tcp)
        #expect(ports.map(\.endpoint.port) == [3000, 4000])
    }

    @Test("handles blank lines, headers, and short rows")
    func handlesMalformedLines() {
        let output = """
        COMMAND   PID     USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME

        node    21894 hieudoan   25u  IPv4 0x3390a1e95d00c687      0t0  TCP *:3000 (LISTEN)

        node    3000 hieudoan not enough fields
        """

        let ports = LsofParser.parse(output, protocolType: .tcp)
        #expect(ports.count == 1)
        #expect(ports[0].endpoint.port == 3000)
    }

    @Test("skips rows with non-numeric pid or port")
    func skipsUnparseableRows() {
        let output = """
        COMMAND   PID     USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
        ?         -       root   12u  IPv4 0x3390a1e95d4c17cf      0t0  TCP *:icmp (LISTEN)
        node    18234 hieudoan   33u  IPv6 0x3390a146ee2b6d69      0t0  TCP *:3000 (LISTEN)
        """

        let ports = LsofParser.parse(output, protocolType: .tcp)
        #expect(ports.count == 1)
        #expect(ports[0].pid == 18234)
    }

    @Test("skips connected UDP sockets, keeping listeners")
    func skipsConnectedUDP() {
        let output = """
        COMMAND   PID     USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
        cloudd     703 hieudoan   12u  IPv4 0x3390a1e95d4c17cf      0t0  UDP *:5353
        node    18234 hieudoan   33u  IPv6 0x3390a146ee2b6d69      0t0  UDP [fe80::1]:56000->[ff02::fb]:5353
        """

        let ports = LsofParser.parse(output, protocolType: .udp)
        #expect(ports.count == 1)
        #expect(ports[0].endpoint.port == 5353)
    }

    @Test("parses address and port from a NAME token")
    func parseNameVariants() {
        #expect(LsofParser.parseName("*:3000")?.address == "*")
        #expect(LsofParser.parseName("*:3000")?.port == 3000)
        #expect(LsofParser.parseName("127.0.0.1:5432")?.address == "127.0.0.1")
        #expect(LsofParser.parseName("[::1]:8080")?.address == "::1")
        #expect(LsofParser.parseName("[::1]:8080")?.port == 8080)
        #expect(LsofParser.parseName("*:http") == nil)
        #expect(LsofParser.parseName("no-port-here") == nil)
    }
}
