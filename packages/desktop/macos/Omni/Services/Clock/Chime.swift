import AppKit
import Foundation

/// Plays the completion sounds used by the Clock sub-tabs.
public enum Chime {
    public static func timerFinished() {
        play(named: "Glass")
    }

    /// Called when a work phase ends (next phase is a break).
    public static func workPhaseEnded() {
        play(named: "Glass")
    }

    /// Called when a break phase ends (next phase is work).
    public static func breakPhaseEnded() {
        play(named: "Basso")
    }

    private static func play(named name: String) {
        if let sound = NSSound(named: name) {
            sound.play()
        } else {
            NSSound.beep()
        }
    }
}
