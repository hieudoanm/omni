import Darwin
import Foundation
import OmniCore

/// Reads aggregate CPU load through Mach `host_processor_info`.
///
/// Usage is the delta between two consecutive reads of the per-CPU cumulative
/// tick counters, so the first returned sample reflects load since launch
/// rather than an artificial zero.
public final class CPUMonitor {
    private var previous: ProcessorTicks?

    public init() {
        previous = Self.readTicks()
    }

    public func read() -> Result<CPUStats, MonitorError> {
        guard let current = Self.readTicks(), let previous else {
            return .failure(.unableToReadCPU)
        }
        self.previous = current

        let user = current.user - previous.user
        let system = current.system - previous.system
        let idle = current.idle - previous.idle
        let nice = current.nice - previous.nice
        let total = user + system + idle + nice

        var load: [Double] = [0, 0, 0]
        getloadavg(&load, 3)

        guard total > 0 else {
            return .success(CPUStats(usage: 0, loadAverage1: load[0], loadAverage5: load[1], loadAverage15: load[2]))
        }

        return .success(CPUStats(
            usage: Double(user + system + nice) / Double(total) * 100,
            loadAverage1: load[0],
            loadAverage5: load[1],
            loadAverage15: load[2]
        ))
    }

    private struct ProcessorTicks {
        let user: UInt64
        let system: UInt64
        let idle: UInt64
        let nice: UInt64
    }

    private static func readTicks() -> ProcessorTicks? {
        var processorCount: natural_t = 0
        var dataCount: mach_msg_type_number_t = 0
        var cpuInfo: processor_info_array_t?
        let host = mach_host_self()

        let result = withUnsafeMutablePointer(to: &cpuInfo) { pointer in
            host_processor_info(host, PROCESSOR_CPU_LOAD_INFO, &processorCount, pointer, &dataCount)
        }
        mach_port_deallocate(mach_task_self_, host)

        guard result == KERN_SUCCESS, let info = cpuInfo else {
            return nil
        }
        defer {
            let size = vm_size_t(dataCount) * vm_size_t(MemoryLayout<integer_t>.stride)
            vm_deallocate(mach_task_self_, vm_address_t(UInt(bitPattern: info)), size)
        }

        let stateCount = Int(CPU_STATE_MAX)
        var user: UInt64 = 0
        var system: UInt64 = 0
        var idle: UInt64 = 0
        var nice: UInt64 = 0

        var index = 0
        let count = Int(dataCount)
        while index < count {
            user += UInt64(info[index + Int(CPU_STATE_USER)])
            system += UInt64(info[index + Int(CPU_STATE_SYSTEM)])
            idle += UInt64(info[index + Int(CPU_STATE_IDLE)])
            nice += UInt64(info[index + Int(CPU_STATE_NICE)])
            index += stateCount
        }

        return ProcessorTicks(user: user, system: system, idle: idle, nice: nice)
    }
}
