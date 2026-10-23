import Foundation

/// Resolves the current public IP and performs DNS A-record lookups.
public protocol IPLookupServicing: Sendable {
    func lookupIP() async throws -> IPInfo
    func lookupDNS(domain: String) async throws -> DNSResponse
}

public enum IPLookupError: Error, Equatable {
    case ipLookupFailed
    case dnsLookupFailed
    case invalidDomain
    case invalidResponse

    var message: String {
        switch self {
        case .ipLookupFailed: return "IP lookup failed"
        case .dnsLookupFailed: return "DNS lookup failed"
        case .invalidDomain: return "Enter a valid domain"
        case .invalidResponse: return "Unexpected server response"
        }
    }
}

/// Classifies lookup failures into "offline" vs generic error presentation.
public enum IPNetworkError: Equatable {
    case offline
    case message(String)

    public static func classify(_ error: Error) -> IPNetworkError {
        if let urlError = error as? URLError {
            switch urlError.code {
            case .notConnectedToInternet,
                 .cannotConnectToHost,
                 .cannotFindHost,
                 .networkConnectionLost,
                 .timedOut,
                 .dnsLookupFailed,
                 .internationalRoamingOff:
                return .offline
            default:
                return .message(urlError.localizedDescription)
            }
        }
        if let lookupError = error as? IPLookupError {
            return .message(lookupError.message)
        }
        return .message(error.localizedDescription)
    }
}
