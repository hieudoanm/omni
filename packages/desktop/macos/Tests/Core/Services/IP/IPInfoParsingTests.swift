import Foundation
@testable import OmniCore
import Testing

@Suite("IPInfoParsing")
struct IPInfoParsingTests {
    @Test("parses ipinfo payload into IPInfo with loc split into coordinates")
    func parsesIPInfo() {
        let response = IPInfoResponse(
            ip: "1.2.3.4",
            city: "San Francisco",
            region: "California",
            country: "US",
            postal: "94107",
            loc: "37.7749,-122.4194",
            timezone: "America/Los_Angeles",
            org: "AS13335 Cloudflare, Inc."
        )

        let info = IPInfoParsing.parseIPInfo(response)

        #expect(info.ip == "1.2.3.4")
        #expect(info.version == "IPv4")
        #expect(info.city == "San Francisco")
        #expect(info.region == "California")
        #expect(info.countryName == "US")
        #expect(info.countryCode == "US")
        #expect(info.postal == "94107")
        #expect(info.latitude == "37.7749")
        #expect(info.longitude == "-122.4194")
        #expect(info.timezone == "America/Los_Angeles")
        #expect(info.org == "AS13335 Cloudflare, Inc.")
        #expect(info.asn == "AS13335 Cloudflare, Inc.")
        #expect(info.provider == "IPinfo")
        #expect(info.coordinatesText == "37.7749, -122.4194")
    }

    @Test("detects IPv6 from the IP string when loc is missing")
    func detectsIPv6() {
        let info = IPInfoParsing.parseIPInfo(
            IPInfoResponse(ip: "2001:4860:4860::8888")
        )

        #expect(info.version == "IPv6")
        #expect(info.coordinatesText == nil)
    }

    @Test("parses ipapi payload with typed coordinates")
    func parsesIpapi() {
        let response = IpapiResponse(
            ip: "8.8.8.8",
            version: "IPv4",
            city: "Mountain View",
            region: "California",
            countryName: "United States",
            countryCode: "US",
            postal: "94035",
            latitude: 37.422,
            longitude: -122.084,
            timezone: "America/Los_Angeles",
            org: "Google LLC",
            asn: "AS15169"
        )

        let info = IPInfoParsing.parseIpapi(response)

        #expect(info.ip == "8.8.8.8")
        #expect(info.version == "IPv4")
        #expect(info.city == "Mountain View")
        #expect(info.countryName == "United States")
        #expect(info.countryCode == "US")
        #expect(info.latitude == "37.422")
        #expect(info.longitude == "-122.084")
        #expect(info.asn == "AS15169")
        #expect(info.provider == "ipapi")
    }

    @Test("detectVPN flags known shared hosting providers")
    func detectVPNFlagsProviders() {
        #expect(IPInfoParsing.detectVPN(org: "AS13335 Cloudflare, Inc."))
        #expect(IPInfoParsing.detectVPN(org: "Amazon.com, Inc."))
        #expect(IPInfoParsing.detectVPN(org: "Google LLC"))
        #expect(IPInfoParsing.detectVPN(org: "DigitalOcean, LLC"))
        #expect(IPInfoParsing.detectVPN(org: "Microsoft Corporation"))
    }

    @Test("detectVPN returns false for other orgs and nil")
    func detectVPNSkipsOthers() {
        #expect(!IPInfoParsing.detectVPN(org: "Comcast Cable Communications"))
        #expect(!IPInfoParsing.detectVPN(org: nil))
        #expect(!IPInfoParsing.detectVPN(org: ""))
    }
}

@Suite("IPNetworkError")
struct IPNetworkErrorTests {
    @Test("classifies connectivity errors as offline")
    func classifiesOffline() {
        let offlineCodes: [URLError.Code] = [
            .notConnectedToInternet,
            .cannotConnectToHost,
            .cannotFindHost,
            .networkConnectionLost,
            .timedOut,
            .dnsLookupFailed,
        ]
        for code in offlineCodes {
            #expect(IPNetworkError.classify(URLError(code)) == .offline)
        }
    }

    @Test("classifies other URLErrors as messages")
    func classifiesOtherURLErrors() {
        let result = IPNetworkError.classify(URLError(.badServerResponse))

        guard case let .message(text) = result else {
            Issue.record("expected message, got \(result)")
            return
        }
        #expect(!text.isEmpty)
    }

    @Test("classifies lookup errors as messages")
    func classifiesLookupErrors() {
        #expect(IPNetworkError.classify(IPLookupError.dnsLookupFailed) == .message("DNS lookup failed"))
        #expect(IPNetworkError.classify(IPLookupError.invalidDomain) == .message("Enter a valid domain"))
    }
}

@Suite("DNSResponse")
struct DNSResponseTests {
    @Test("decodes a Cloudflare DNS-query JSON response")
    func decodesResponse() throws {
        let json = Data("""
        {
          "Status": 0,
          "Answer": [
            { "name": "example.com", "type": 1, "TTL": 3600, "data": "93.184.216.34" }
          ]
        }
        """.utf8)

        let decoded = try JSONDecoder().decode(DNSResponse.self, from: json)

        #expect(decoded.status == 0)
        #expect(decoded.answers?.count == 1)
        #expect(decoded.answers?.first?.data == "93.184.216.34")
        #expect(decoded.answersText == "93.184.216.34")
    }

    @Test("reports when no answers are present")
    func emptyAnswers() {
        let response = DNSResponse(status: 3, answers: nil)

        #expect(response.answersText == "No A records found")
    }
}
