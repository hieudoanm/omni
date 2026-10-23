import Foundation

/// Visual classification of a network interface.
public enum NetworkInterfaceKind: String, Equatable, Sendable {
    case wifi
    case ethernet
    case other

    public var displayName: String {
        switch self {
        case .wifi: return "Wi-Fi"
        case .ethernet: return "Ethernet"
        case .other: return "Other"
        }
    }
}

/// A single interface observed from the system at one point in time.
public struct NetworkInterfaceSample: Equatable, Sendable {
    public let name: String
    public let kind: NetworkInterfaceKind
    public let isUp: Bool
    public let hasAddress: Bool
    public let receivedBytes: UInt32
    public let sentBytes: UInt32

    public init(
        name: String,
        kind: NetworkInterfaceKind,
        isUp: Bool,
        hasAddress: Bool,
        receivedBytes: UInt32,
        sentBytes: UInt32
    ) {
        self.name = name
        self.kind = kind
        self.isUp = isUp
        self.hasAddress = hasAddress
        self.receivedBytes = receivedBytes
        self.sentBytes = sentBytes
    }

    public var isLoopback: Bool {
        name.hasPrefix("lo")
    }
}

/// Per-interface reading with throughput computed since the previous sample.
public struct NetworkInterfaceStats: Equatable, Sendable {
    public let sample: NetworkInterfaceSample
    public let receiveBytesPerSecond: Double?
    public let sendBytesPerSecond: Double?

    public init(
        sample: NetworkInterfaceSample,
        receiveBytesPerSecond: Double?,
        sendBytesPerSecond: Double?
    ) {
        self.sample = sample
        self.receiveBytesPerSecond = receiveBytesPerSecond
        self.sendBytesPerSecond = sendBytesPerSecond
    }
}

/// Aggregate network traffic for one refresh tick.
public struct NetworkStats: Equatable, Sendable {
    public let interfaces: [NetworkInterfaceStats]
    public let totalReceiveBytesPerSecond: Double?
    public let totalSendBytesPerSecond: Double?
    public let receivedBytes: UInt64
    public let sentBytes: UInt64

    public init(
        interfaces: [NetworkInterfaceStats],
        totalReceiveBytesPerSecond: Double?,
        totalSendBytesPerSecond: Double?,
        receivedBytes: UInt64,
        sentBytes: UInt64
    ) {
        self.interfaces = interfaces
        self.totalReceiveBytesPerSecond = totalReceiveBytesPerSecond
        self.totalSendBytesPerSecond = totalSendBytesPerSecond
        self.receivedBytes = receivedBytes
        self.sentBytes = sentBytes
    }

    /// Computes per-interface and aggregate totals from two samples of raw
    /// counters. Throughput is the delta between the samples divided by the
    /// elapsed time; rates are nil when elapsed is zero (first sample).
    public static func compute(
        previous: [NetworkInterfaceSample],
        current: [NetworkInterfaceSample],
        elapsed: TimeInterval
    ) -> NetworkStats {
        let previousByName = Dictionary(uniqueKeysWithValues: previous.map { ($0.name, $0) })

        var interfaces: [NetworkInterfaceStats] = []
        var receivedBytes: UInt64 = 0
        var sentBytes: UInt64 = 0
        var receiveRate: Double = 0
        var sendRate: Double = 0
        var measuredCount = 0

        for sample in current {
            let previousSample = previousByName[sample.name]
            let deltaIn = previousSample.map { delta(from: $0.receivedBytes, to: sample.receivedBytes) }
            let deltaOut = previousSample.map { delta(from: $0.sentBytes, to: sample.sentBytes) }

            if !sample.isLoopback {
                receivedBytes += deltaIn ?? 0
                sentBytes += deltaOut ?? 0
            }

            var interfaceReceiveRate: Double?
            var interfaceSendRate: Double?
            if let deltaIn, elapsed > 0 {
                interfaceReceiveRate = Double(deltaIn) / elapsed
            }
            if let deltaOut, elapsed > 0 {
                interfaceSendRate = Double(deltaOut) / elapsed
            }

            if interfaceReceiveRate != nil || interfaceSendRate != nil {
                measuredCount += 1
            }
            if let interfaceReceiveRate {
                receiveRate += interfaceReceiveRate
            }
            if let interfaceSendRate {
                sendRate += interfaceSendRate
            }

            interfaces.append(NetworkInterfaceStats(
                sample: sample,
                receiveBytesPerSecond: interfaceReceiveRate,
                sendBytesPerSecond: interfaceSendRate
            ))
        }

        let sorted = interfaces.sorted { $0.sample.name < $1.sample.name }
        return NetworkStats(
            interfaces: sorted,
            totalReceiveBytesPerSecond: measuredCount > 0 ? receiveRate : nil,
            totalSendBytesPerSecond: measuredCount > 0 ? sendRate : nil,
            receivedBytes: receivedBytes,
            sentBytes: sentBytes
        )
    }

    /// Correctly spans the 32-bit counter wrap between two observations.
    public static func delta(from previous: UInt32, to current: UInt32) -> UInt64 {
        if current >= previous {
            return UInt64(current - previous)
        }
        return UInt64(current) + UInt64(UInt32.max - previous) + 1
    }
}
