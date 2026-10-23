import Foundation
@testable import OmniCore
import Testing

@Suite("Port")
struct PortTests {
    private func makePort(
        portNumber: UInt16 = 3000,
        protocolType: NetworkProtocol = .tcp,
        address: String = "127.0.0.1",
        pid: Int32 = 18234,
        processName: String = "node"
    ) -> PortInfo {
        let endpoint = NetworkEndpoint(port: portNumber, protocolType: protocolType, address: address)
        return PortInfo(
            endpoint: endpoint,
            pid: pid,
            processName: processName,
            command: "next dev",
            executablePath: "/opt/homebrew/bin/node",
            workingDirectory: "/Users/me/Code/my-project"
        )
    }

    @Test("id is stable and unique across endpoint and pid")
    func idUniqueness() {
        let a = makePort()
        let b = makePort(portNumber: 4000)
        #expect(a.id != b.id)
        #expect(a.id == a.id)
    }

    @Test("matches by port number")
    func matchesPort() {
        #expect(makePort().matches("3000"))
    }

    @Test("matches by process name")
    func matchesProcessName() {
        #expect(makePort().matches("node"))
        #expect(makePort().matches("NODE"))
    }

    @Test("matches by pid")
    func matchesPID() {
        #expect(makePort().matches("18234"))
    }

    @Test("matches by project command")
    func matchesCommand() {
        #expect(makePort().matches("next dev"))
    }

    @Test("does not match unrelated query")
    func rejectsUnrelated() {
        #expect(!makePort().matches("postgres"))
    }

    @Test("matches UDP ports")
    func matchesUDP() {
        let udp = makePort(portNumber: 53, protocolType: .udp, processName: "mDNSResponder")
        #expect(udp.matches("udp"))
        #expect(udp.matches("mDNSResponder"))
    }
}
