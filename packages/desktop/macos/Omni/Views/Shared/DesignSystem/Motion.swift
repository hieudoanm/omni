import SwiftUI

/// Animation durations. The app animates values, never decoration, so all three
/// are linear: easing a number that ticks every frame reads as lag.
///
/// Anything that moves a view in or out should respect
/// `Environment.accessibilityReduceMotion` and skip the animation entirely.
enum Motion {
    /// A readout that changes as fast as the clock ticks: the stopwatch, the
    /// seconds in a digital face.
    static let tick: Double = 0.02

    /// A countdown ring sweeping to the next second.
    static let ring: Double = 0.5

    /// The watchface second hand, once per second.
    static let face: Double = 1.0

    /// The panel crossfading between tabs. The only animation in the app that
    /// moves a view rather than a number, so the only one that eases.
    static let crossfade: Double = 0.15

    static func linear(_ duration: Double) -> Animation {
        .linear(duration: duration)
    }
}
