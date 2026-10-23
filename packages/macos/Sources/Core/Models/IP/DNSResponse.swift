import Foundation

/// A Cloudflare DNS-over-HTTPS JSON response for an A-record lookup.
public struct DNSResponse: Codable, Equatable, Sendable {
    public let status: Int
    public let answers: [DNSAnswer]?

    private enum CodingKeys: String, CodingKey {
        case status = "Status"
        case answers = "Answer"
    }

    public struct DNSAnswer: Codable, Equatable, Sendable {
        public let name: String
        public let type: Int
        public let ttl: Int
        public let data: String

        private enum CodingKeys: String, CodingKey {
            case name, type, data
            case ttl = "TTL"
        }
    }

    public init(status: Int, answers: [DNSAnswer]?) {
        self.status = status
        self.answers = answers
    }

    public var answersText: String {
        guard let answers, !answers.isEmpty else { return "No A records found" }
        return answers.map(\.data).joined(separator: "\n")
    }
}
