import Darwin
import Foundation
import OmniCore

/// Reads memory statistics through the Mach VM API (`host_statistics64`).
///
/// Definition of "used" memory (documented, kept consistent across releases):
/// `active + wired + compressed`. This represents pages that are actually in
/// use by the system and applications. Inactive and purgeable pages are
/// excluded because they can be reclaimed without swapping.
public final class MemoryMonitor {
    public init() {}

    public func read() -> Result<MemoryStats, MonitorError> {
        let totalBytes = ProcessInfo.processInfo.physicalMemory

        var stats = vm_statistics64()
        var count = mach_msg_type_number_t(
            MemoryLayout<vm_statistics64_data_t>.stride / MemoryLayout<integer_t>.stride
        )
        let host = mach_host_self()

        let result = withUnsafeMutablePointer(to: &stats) { pointer in
            pointer.withMemoryRebound(to: integer_t.self, capacity: Int(count)) { intPointer in
                host_statistics64(host, HOST_VM_INFO64, intPointer, &count)
            }
        }
        mach_port_deallocate(mach_task_self_, host)

        guard result == KERN_SUCCESS else {
            return .failure(.unableToReadMemory)
        }

        let pageSize = UInt64(vm_page_size)
        let activeBytes = UInt64(stats.active_count) * pageSize
        let wiredBytes = UInt64(stats.wire_count) * pageSize
        let compressedBytes = UInt64(stats.compressor_page_count) * pageSize
        let inactiveBytes = UInt64(stats.inactive_count) * pageSize
        let cachedBytes = UInt64(stats.external_page_count) * pageSize
        let freeBytes = UInt64(stats.free_count) * pageSize
        let usedBytes = activeBytes + wiredBytes + compressedBytes

        return .success(MemoryStats(
            usedBytes: usedBytes,
            totalBytes: totalBytes,
            activeBytes: activeBytes,
            wiredBytes: wiredBytes,
            compressedBytes: compressedBytes,
            inactiveBytes: inactiveBytes,
            cachedBytes: cachedBytes,
            freeBytes: freeBytes
        ))
    }
}
