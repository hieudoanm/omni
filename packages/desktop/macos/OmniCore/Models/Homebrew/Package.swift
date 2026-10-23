import Foundation

/// A Homebrew package (Formula or Cask).
public struct Package: Identifiable, Hashable, Comparable, Sendable {
    public static func < (lhs: Package, rhs: Package) -> Bool {
        lhs.name.localizedCompare(rhs.name) == .orderedAscending
    }

    public let id: String
    public let name: String
    public let type: PackageType
    public let description: String
    public let homepage: String?
    public let dependencies: [String]
    public let currentVersion: String
    public let installedVersion: String?
    public let status: PackageStatus

    public init(
        name: String,
        type: PackageType,
        description: String = "",
        homepage: String? = nil,
        dependencies: [String] = [],
        currentVersion: String = "",
        installedVersion: String? = nil,
        status: PackageStatus = .notInstalled
    ) {
        id = name
        self.name = name
        self.type = type
        self.description = description
        self.homepage = homepage
        self.dependencies = dependencies
        self.currentVersion = currentVersion
        self.installedVersion = installedVersion
        self.status = status
    }

    public var installedVersionString: String {
        installedVersion ?? "Not installed"
    }
}
