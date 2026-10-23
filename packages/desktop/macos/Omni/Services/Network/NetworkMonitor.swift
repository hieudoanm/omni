import Darwin
import Foundation
import OmniCore

/// Samples cumulative per-interface byte counters via `getifaddrs`.
///
/// Rates are deltas between two consecutive reads divided by the elapsed time;
/// the first read returns zero rates because there is no previous sample.
public final class NetworkMonitor {
    private let classifier: any NetworkInterfaceClassifying
    private var previous: (samples: [NetworkInterfaceSample], timestamp: Date)?

    public init(classifier: any NetworkInterfaceClassifying = IOKitNetworkInterfaceClassifier()) {
        self.classifier = classifier
    }

    public func read() -> Result<NetworkStats, MonitorError> {
        guard let snapshots = Self.readSnapshots() else {
            return .failure(.unableToReadNetwork)
        }
        let samples = NetworkSnapshots.aggregate(snapshots) { [classifier] name in
            classifier.kind(for: name)
        }
        let now = Date()
        let previousSamples = previous?.samples ?? samples
        let elapsed = previous.map { now.timeIntervalSince($0.timestamp) } ?? 0
        previous = (samples, now)
        return .success(NetworkStats.compute(
            previous: previousSamples,
            current: samples,
            elapsed: elapsed
        ))
    }

    private static func readSnapshots() -> [NetworkAddressSnapshot]? {
        var list: UnsafeMutablePointer<ifaddrs>?
        guard getifaddrs(&list) == 0, let first = list else {
            return nil
        }
        defer { freeifaddrs(list) }

        var snapshots: [NetworkAddressSnapshot] = []
        var cursor: UnsafeMutablePointer<ifaddrs>? = first
        while let current = cursor {
            defer { cursor = current.pointee.ifa_next }
            guard let name = interfaceName(from: current) else { continue }
            let counters = ByteCounters(from: current)
            snapshots.append(NetworkAddressSnapshot(
                name: name,
                isUp: isUp(from: current),
                isAddress: hasIPAddress(from: current),
                receivedBytes: counters.received,
                sentBytes: counters.sent
            ))
        }
        return snapshots
    }

    private static func interfaceName(from current: UnsafeMutablePointer<ifaddrs>) -> String? {
        guard let pointer = current.pointee.ifa_name else { return nil }
        return String(cString: pointer)
    }

    private static func isUp(from current: UnsafeMutablePointer<ifaddrs>) -> Bool {
        let flags = Int32(current.pointee.ifa_flags)
        return (flags & IFF_UP) != 0 && (flags & IFF_RUNNING) != 0
    }

    private static func hasIPAddress(from current: UnsafeMutablePointer<ifaddrs>) -> Bool {
        guard let address = current.pointee.ifa_addr else { return false }
        let family = address.pointee.sa_family
        return family == sa_family_t(AF_INET) || family == sa_family_t(AF_INET6)
    }

    private struct ByteCounters {
        let received: UInt32
        let sent: UInt32

        init(from current: UnsafeMutablePointer<ifaddrs>) {
            guard let data = current.pointee.ifa_data else {
                received = 0
                sent = 0
                return
            }
            let info = data.assumingMemoryBound(to: if_data.self).pointee
            received = info.ifi_ibytes
            sent = info.ifi_obytes
        }
    }
}
