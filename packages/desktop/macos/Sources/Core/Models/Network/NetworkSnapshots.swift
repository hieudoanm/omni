import Foundation

/// One `ifaddrs` entry translated into a value the Core can aggregate.
public struct NetworkAddressSnapshot: Equatable, Sendable {
    public let name: String
    public let isUp: Bool
    public let isAddress: Bool
    public let receivedBytes: UInt32
    public let sentBytes: UInt32

    public init(
        name: String,
        isUp: Bool,
        isAddress: Bool,
        receivedBytes: UInt32,
        sentBytes: UInt32
    ) {
        self.name = name
        self.isUp = isUp
        self.isAddress = isAddress
        self.receivedBytes = receivedBytes
        self.sentBytes = sentBytes
    }
}

public enum NetworkSnapshots {
    /// Collapses per-address entries into one sample per interface.
    ///
    /// `getifaddrs` returns one entry per interface per address family; the
    /// counters are repeated on every entry, so the sample keeps the highest
    /// seen counter and ORs the up/address flags together.
    public static func aggregate(
        _ snapshots: [NetworkAddressSnapshot],
        kindFor: (String) -> NetworkInterfaceKind
    ) -> [NetworkInterfaceSample] {
        var merged: [String: NetworkAddressSnapshot] = [:]
        for snapshot in snapshots {
            guard let existing = merged[snapshot.name] else {
                merged[snapshot.name] = snapshot
                continue
            }
            merged[snapshot.name] = NetworkAddressSnapshot(
                name: snapshot.name,
                isUp: existing.isUp || snapshot.isUp,
                isAddress: existing.isAddress || snapshot.isAddress,
                receivedBytes: max(existing.receivedBytes, snapshot.receivedBytes),
                sentBytes: max(existing.sentBytes, snapshot.sentBytes)
            )
        }

        return merged.values.map { snapshot in
            NetworkInterfaceSample(
                name: snapshot.name,
                kind: kindFor(snapshot.name),
                isUp: snapshot.isUp,
                hasAddress: snapshot.isAddress,
                receivedBytes: snapshot.receivedBytes,
                sentBytes: snapshot.sentBytes
            )
        }
        .sorted { $0.name < $1.name }
    }
}
