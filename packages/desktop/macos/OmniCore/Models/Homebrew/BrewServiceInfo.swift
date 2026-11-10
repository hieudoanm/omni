import Foundation

/// A Homebrew service and its reported status from `brew services list`.
public struct BrewServiceInfo: Identifiable, Hashable, Sendable {
    public let name: String
    public let status: ServiceStatus

    public enum ServiceStatus: String, Sendable {
        case started
        case stopped
        case error
        case unknown

        public var running: Bool {
            self == .started
        }
    }

    public init(name: String, status: ServiceStatus) {
        self.name = name
        self.status = status
    }

    public var id: String {
        name
    }
}
