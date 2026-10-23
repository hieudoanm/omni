import Foundation
@testable import OmniCore
import Testing

@Suite("ClockFormatter")
struct ClockFormatterTests {
    @Test("timer pads minutes and seconds")
    func timerPads() {
        #expect(ClockFormatter.timer(0) == "00:00")
        #expect(ClockFormatter.timer(59) == "00:59")
        #expect(ClockFormatter.timer(300) == "05:00")
        #expect(ClockFormatter.timer(3600) == "01:00:00")
    }

    @Test("timer clamps negatives to zero")
    func timerClamps() {
        #expect(ClockFormatter.timer(-5) == "00:00")
        #expect(ClockFormatter.timer(-600) == "00:00")
    }

    @Test("countdown pads minutes and seconds")
    func countdownPads() {
        #expect(ClockFormatter.countdown(0) == "00:00")
        #expect(ClockFormatter.countdown(59) == "00:59")
        #expect(ClockFormatter.countdown(3000) == "50:00")
    }

    @Test("stopwatch includes centiseconds")
    func stopwatchFormat() {
        #expect(ClockFormatter.stopwatch(0) == "00:00.00")
        #expect(ClockFormatter.stopwatch(90) == "00:00.09")
        #expect(ClockFormatter.stopwatch(1000) == "00:01.00")
        #expect(ClockFormatter.stopwatch(61500) == "01:01.50")
    }

    @Test("worldClock formats in the given time zone")
    func worldClockUsesTimeZone() throws {
        let timeZone = try #require(TimeZone(identifier: "Asia/Ho_Chi_Minh"))
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = timeZone
        let date = try #require(
            calendar.date(from: DateComponents(year: 2026, month: 1, day: 1, hour: 9, minute: 5, second: 7))
        )
        #expect(ClockFormatter.worldClock(in: timeZone, date: date) == "09:05:07")
    }

    @Test("worldClock pads single digits")
    func worldClockPads() throws {
        let timeZone = try #require(TimeZone(identifier: "Asia/Ho_Chi_Minh"))
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = timeZone
        let date = try #require(
            calendar.date(from: DateComponents(year: 2026, month: 1, day: 1, hour: 7, minute: 8, second: 9))
        )
        #expect(ClockFormatter.worldClock(in: timeZone, date: date) == "07:08:09")
    }
}
