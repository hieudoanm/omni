import Foundation

/// Geolocation, ASN, and org details resolved for the current device's IP.
public struct IPInfo: Codable, Equatable, Sendable {
    public let ip: String
    public let version: String
    public let city: String?
    public let region: String?
    public let countryName: String?
    public let countryCode: String?
    public let postal: String?
    public let latitude: String?
    public let longitude: String?
    public let timezone: String?
    public let org: String?
    public let asn: String?
    public let provider: String

    public init(
        ip: String,
        version: String,
        city: String? = nil,
        region: String? = nil,
        countryName: String? = nil,
        countryCode: String? = nil,
        postal: String? = nil,
        latitude: String? = nil,
        longitude: String? = nil,
        timezone: String? = nil,
        org: String? = nil,
        asn: String? = nil,
        provider: String
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
        self.provider = provider
    }

    public var coordinatesText: String? {
        guard let latitude, let longitude, !latitude.isEmpty, !longitude.isEmpty else { return nil }
        return "\(latitude), \(longitude)"
    }
}
