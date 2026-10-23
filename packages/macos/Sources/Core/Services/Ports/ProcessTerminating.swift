public enum ProcessTerminationError: Error, Sendable {
    case invalidPID(Int32)
    case refusedToKillAppProcess
    case killFailed(pid: Int32, errno: Int32)
}

public protocol ProcessTerminating: Sendable {
    func canTerminate(pid: Int32) -> Bool
    func terminate(pid: Int32) throws
    func forceTerminate(pid: Int32) throws
}
