import Darwin

/// Terminates processes with Unix signals.
///
/// `terminate` sends SIGTERM for a graceful shutdown; `forceTerminate` sends
/// SIGKILL. The app process itself is always refused.
public struct SignalProcessTerminator: ProcessTerminating {
    public init() {}

    public func canTerminate(pid: Int32) -> Bool {
        pid > 0 && pid != getpid()
    }

    public func terminate(pid: Int32) throws {
        try send(pid: pid, signal: SIGTERM)
    }

    public func forceTerminate(pid: Int32) throws {
        try send(pid: pid, signal: SIGKILL)
    }

    private func send(pid: Int32, signal: Int32) throws {
        guard pid > 0 else { throw ProcessTerminationError.invalidPID(pid) }
        guard pid != getpid() else { throw ProcessTerminationError.refusedToKillAppProcess }
        guard kill(pid, signal) == 0 else {
            throw ProcessTerminationError.killFailed(pid: pid, errno: Darwin.errno)
        }
    }
}
