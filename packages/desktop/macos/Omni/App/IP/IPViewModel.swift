import OmniCore
import SwiftUI

/// Drives IP lookup and DNS resolution for the IP tab.
@MainActor
final class IPViewModel: ObservableObject {
    enum State: Equatable {
        case idle
        case loading
        case loaded(IPInfo)
        case offline
        case failed(String)
    }

    enum DNSState: Equatable {
        case idle
        case loading
        case loaded(DNSResponse)
        case failed(String)
    }

    @Published private(set) var state: State = .idle
    @Published private(set) var dnsState: DNSState = .idle
    @Published var domain = ""

    private let lookup: any IPLookupServicing

    init(lookup: any IPLookupServicing = IPLookupService()) {
        self.lookup = lookup
    }

    var vpnDetected: Bool {
        guard case let .loaded(info) = state else { return false }
        return IPInfoParsing.detectVPN(org: info.org)
    }

    func refresh() async {
        state = .loading
        do {
            state = try .loaded(await lookup.lookupIP())
        } catch {
            state = Self.state(for: error)
        }
    }

    func lookupDNS() async {
        let trimmed = domain.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        dnsState = .loading
        do {
            dnsState = try .loaded(await lookup.lookupDNS(domain: trimmed))
        } catch {
            dnsState = Self.dnsState(for: error)
        }
    }

    private static func state(for error: Error) -> State {
        switch IPNetworkError.classify(error) {
        case .offline: return .offline
        case let .message(message): return .failed(message)
        }
    }

    private static func dnsState(for error: Error) -> DNSState {
        switch IPNetworkError.classify(error) {
        case .offline: return .failed("Offline — DNS lookup requires a network connection")
        case let .message(message): return .failed(message)
        }
    }
}
