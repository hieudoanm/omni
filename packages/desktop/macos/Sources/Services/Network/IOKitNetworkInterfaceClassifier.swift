import Foundation
import IOKit
import OmniCore

/// Classifies Wi-Fi vs Ethernet by walking the IOKit parent chain of each BSD
/// interface. Results are cached per interface name because the mapping is
/// stable for the lifetime of a boot session.
public final class IOKitNetworkInterfaceClassifier: NetworkInterfaceClassifying, @unchecked Sendable {
    private let lock = NSLock()
    private var cache: [String: NetworkInterfaceKind] = [:]

    public init() {}

    public func kind(for name: String) -> NetworkInterfaceKind {
        lock.lock()
        defer { lock.unlock() }
        if let cached = cache[name] {
            return cached
        }
        let kind = Self.lookup(name: name)
        cache[name] = kind
        return kind
    }

    private static func lookup(name: String) -> NetworkInterfaceKind {
        guard let service = interfaceService(named: name) else {
            return .other
        }
        defer { IOObjectRelease(service) }
        return classify(from: service)
    }

    private static func interfaceService(named name: String) -> io_object_t? {
        guard let matching = IOBSDNameMatching(kIOMainPortDefault, 0, name) else {
            return nil
        }
        var iterator: io_iterator_t = 0
        guard IOServiceGetMatchingServices(kIOMainPortDefault, matching, &iterator) == KERN_SUCCESS else {
            return nil
        }
        defer { IOObjectRelease(iterator) }
        let service = IOIteratorNext(iterator)
        guard service != 0 else { return nil }
        return service
    }

    private static func classify(from service: io_object_t) -> NetworkInterfaceKind {
        var current: io_object_t = service
        var depth = 0
        while current != 0 && depth < Self.maxDepth {
            if isWiFi(current) {
                if current != service {
                    IOObjectRelease(current)
                }
                return .wifi
            }
            if isEthernet(current) {
                if current != service {
                    IOObjectRelease(current)
                }
                return .ethernet
            }
            var parent: io_object_t = 0
            let result = IORegistryEntryGetParentEntry(current, kIOServicePlane, &parent)
            if current != service {
                IOObjectRelease(current)
            }
            guard result == KERN_SUCCESS else { return .other }
            current = parent
            depth += 1
        }
        if current != service && current != 0 {
            IOObjectRelease(current)
        }
        return .other
    }

    private static func isWiFi(_ object: io_object_t) -> Bool {
        if IOObjectConformsTo(object, "IO80211Interface") != 0 {
            return true
        }
        let className = Self.className(of: object)
        return containsCaseInsensitive("80211", in: className)
            || containsCaseInsensitive("WLAN", in: className)
            || containsCaseInsensitive("AirPort", in: className)
    }

    private static func isEthernet(_ object: io_object_t) -> Bool {
        if IOObjectConformsTo(object, "IONetworkEthernet") != 0 {
            return true
        }
        if IOObjectConformsTo(object, "IOEthernetController") != 0 {
            return true
        }
        let className = Self.className(of: object)
        guard containsCaseInsensitive("Ethernet", in: className) else { return false }
        return !containsCaseInsensitive("Interface", in: className)
    }

    private static func containsCaseInsensitive(_ needle: String, in haystack: String) -> Bool {
        haystack.range(of: needle, options: .caseInsensitive) != nil
    }

    private static func className(of object: io_object_t) -> String {
        let capacity = MemoryLayout<io_name_t>.size
        let buffer = UnsafeMutablePointer<CChar>.allocate(capacity: capacity)
        defer { buffer.deallocate() }
        buffer.initialize(repeating: 0, count: capacity)
        IOObjectGetClass(object, UnsafeMutableRawPointer(buffer).assumingMemoryBound(to: io_name_t.self))
        return String(cString: buffer)
    }

    private static let maxDepth = 16
}
