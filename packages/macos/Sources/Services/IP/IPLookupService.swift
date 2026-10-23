import Foundation
import OmniCore

/// Resolves the current public IP via `api.ipify.org`, enriching it with
/// `ipinfo.io` and falling back to `ipapi.co`; resolves DNS via Cloudflare
/// DNS-over-HTTPS. Public remote APIs only — no local shell commands.
public final class IPLookupService: IPLookupServicing {
    private let session: URLSession
    private let timeout: TimeInterval

    public init(session: URLSession = URLSession.shared, timeout: TimeInterval = 10) {
        self.session = session
        self.timeout = timeout
    }

    public func lookupIP() async throws -> IPInfo {
        let ip = try await fetchCurrentIP()
        if let info = try? await IPInfoProvider.ipinfo.lookup(ip: ip, session: session, timeout: timeout) {
            return info
        }
        return try await IPInfoProvider.ipapi.lookup(ip: ip, session: session, timeout: timeout)
    }

    public func lookupDNS(domain: String) async throws -> DNSResponse {
        let trimmed = domain.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, let url = Self.dnsURL(for: trimmed) else { throw IPLookupError.invalidDomain }

        var request = URLRequest(url: url)
        request.timeoutInterval = timeout
        request.setValue("application/dns-json", forHTTPHeaderField: "accept")

        let (data, response) = try await session.data(for: request)
        guard Self.isSuccess(response) else { throw IPLookupError.dnsLookupFailed }
        return try JSONDecoder().decode(DNSResponse.self, from: data)
    }

    private func fetchCurrentIP() async throws -> String {
        guard let url = URL(string: "https://api.ipify.org?format=json") else {
            throw IPLookupError.invalidResponse
        }
        var request = URLRequest(url: url)
        request.timeoutInterval = timeout

        let (data, response) = try await session.data(for: request)
        guard Self.isSuccess(response), data.count < 256 else { throw IPLookupError.ipLookupFailed }
        let payload = try JSONDecoder().decode(IPifyResponse.self, from: data)
        guard !payload.ip.isEmpty else { throw IPLookupError.ipLookupFailed }
        return payload.ip
    }

    private static func dnsURL(for domain: String) -> URL? {
        var components = URLComponents(string: "https://cloudflare-dns.com/dns-query")
        components?.queryItems = [
            URLQueryItem(name: "name", value: domain),
            URLQueryItem(name: "type", value: "A"),
        ]
        return components?.url
    }

    fileprivate static func isSuccess(_ response: URLResponse) -> Bool {
        guard let http = response as? HTTPURLResponse else { return true }
        return (200 ... 299).contains(http.statusCode)
    }
}

/// ipify's plain JSON body: `{ "ip": "1.2.3.4" }`.
private struct IPifyResponse: Codable {
    let ip: String
}

private enum IPInfoProvider {
    case ipinfo
    case ipapi

    func lookup(ip: String, session: URLSession, timeout: TimeInterval) async throws -> IPInfo {
        switch self {
        case .ipinfo:
            return try await lookupIPInfo(ip: ip, session: session, timeout: timeout)
        case .ipapi:
            return try await lookupIpapi(ip: ip, session: session, timeout: timeout)
        }
    }

    private func lookupIPInfo(ip: String, session: URLSession, timeout: TimeInterval) async throws -> IPInfo {
        guard let url = URL(string: "https://ipinfo.io/\(ip)/json") else {
            throw IPLookupError.invalidResponse
        }
        var request = URLRequest(url: url)
        request.timeoutInterval = timeout

        let (data, response) = try await session.data(for: request)
        guard IPLookupService.isSuccess(response) else { throw IPLookupError.ipLookupFailed }
        let payload = try JSONDecoder().decode(IPInfoResponse.self, from: data)
        return IPInfoParsing.parseIPInfo(payload)
    }

    private func lookupIpapi(ip: String, session: URLSession, timeout: TimeInterval) async throws -> IPInfo {
        guard let url = URL(string: "https://ipapi.co/\(ip)/json/") else {
            throw IPLookupError.invalidResponse
        }
        var request = URLRequest(url: url)
        request.timeoutInterval = timeout

        let (data, response) = try await session.data(for: request)
        guard IPLookupService.isSuccess(response) else { throw IPLookupError.ipLookupFailed }
        let payload = try JSONDecoder().decode(IpapiResponse.self, from: data)
        return IPInfoParsing.parseIpapi(payload)
    }
}
