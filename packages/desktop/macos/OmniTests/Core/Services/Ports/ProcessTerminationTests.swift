import Darwin
@testable import OmniCore
import Testing

@Suite("SignalProcessTerminator")
struct SignalProcessTerminatorTests {
    private let terminator = SignalProcessTerminator()

    @Test("refuses invalid pids")
    func refusesInvalidPIDs() {
        #expect(!terminator.canTerminate(pid: 0))
        #expect(!terminator.canTerminate(pid: -1))
    }

    @Test("refuses to kill the app process itself")
    func refusesSelf() {
        #expect(!terminator.canTerminate(pid: getpid()))
    }

    @Test("accepts a normal pid")
    func acceptsNormalPID() {
        #expect(terminator.canTerminate(pid: 18234))
    }

    @Test("throws when signaling a nonexistent process")
    func nonexistentPIDThrows() {
        #expect(throws: ProcessTerminationError.self) {
            try terminator.terminate(pid: .max)
        }
    }
}
