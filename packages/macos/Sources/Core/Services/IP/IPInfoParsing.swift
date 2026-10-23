import Foundation

/// Raw `ipinfo.io` JSON payload.
public struct IPInfoResponse: Codable, Equatable, Sendable {
    public let ip: String
    public let city: String?
    public let region: String?
    public let country: String?
    public let postal: String?
    public let loc: String?
    public let timezone: String?
    public let org: String?

    public init(
        ip: String,
        city: String? = nil,
        region: String? = nil,
        country: String? = nil,
        postal: String? = nil,
        loc: String? = nil,
        timezone: String? = nil,
        org: String? = nil
    ) {
        self.ip = ip
        self.city = city
        self.region = region
        self.country = country
        self.postal = postal
        self.loc = loc
        self.timezone = timezone
        self.org = org
    }
}

/// Raw `ipapi.co` JSON payload.
public struct IpapiResponse: Codable, Equatable, Sendable {
    public let ip: String
    public let version: String?
    public let city: String?
    public let region: String?
    public let countryName: String?
    public let countryCode: String?
    public let postal: String?
    public let latitude: Double?
    public let longitude: Double?
    public let timezone: String?
    public let org: String?
    public let asn: String?

    private enum CodingKeys: String, CodingKey {
        case ip, version, city, region, postal, latitude, longitude, timezone, org, asn
        case countryName = "country_name"
        case countryCode = "country_code"
    }

    public init(
        ip: String,
        version: String? = nil,
        city: String? = nil,
        region: String? = nil,
        countryName: String? = nil,
        countryCode: String? = nil,
        postal: String? = nil,
        latitude: Double? = nil,
        longitude: Double? = nil,
        timezone: String? = nil,
        org: String? = nil,
        asn: String? = nil
    ) {
        self.ip = ip
        self.version = version
        self.city = city
        self.region = region
        self.countryName = countryName
        self.countryCode = countryCode
        self.postal = postal
        self.latitude = latitude
        self.longitude = longitude
        self.timezone = timezone
        self.org = org
        self.asn = asn
    }
}

/// Normalises IPinfo / ipapi responses into `IPInfo`.
public enum IPInfoParsing {
    public static func parseIPInfo(_ response: IPInfoResponse, provider: String = "IPinfo") -> IPInfo {
        let coordinates = response.loc?.split(separator: ",").map(String.init)
        return IPInfo(
            ip: response.ip,
            version: response.ip.contains(":") ? "IPv6" : "IPv4",
            city: response.city,
            region: response.region,
            countryName: response.country,
            countryCode: response.country,
            postal: response.postal,
            latitude: coordinates?.first,
            longitude: coordinates?.dropFirst().first,
            timezone: response.timezone,
            org: response.org,
            asn: response.org,
            provider: provider
        )
    }

    public static func parseIpapi(_ response: IpapiResponse, provider: String = "ipapi") -> IPInfo {
        let detectedVersion = response.version ?? (response.ip.contains(":") ? "IPv6" : "IPv4")
        return IPInfo(
            ip: response.ip,
            version: detectedVersion,
            city: response.city,
            region: response.region,
            countryName: response.countryName,
            countryCode: response.countryCode,
            postal: response.postal,
            latitude: response.latitude.map { String($0) },
            longitude: response.longitude.map { String($0) },
            timezone: response.timezone,
            org: response.org,
            asn: response.asn,
            provider: provider
        )
    }

    /// Flags orgs that are known shared hosting / VPN-like providers.
    public static func detectVPN(org: String?) -> Bool {
        guard let org else { return false }
        let lowercased = org.lowercased()
        return ["cloudflare", "amazon", "google", "digitalocean", "microsoft"]
            .contains { lowercased.contains($0) }
    }
}
