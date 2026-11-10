import SwiftUI

/// Circular countdown ring shared by the Timer and Pomodoro screens.
///
/// `size` follows the surface: 160 points in the menu-bar panel, as much as
/// the window screen allows.
struct ClockRing<Center: View>: View {
    var size: CGFloat = 160
    let progress: Double
    let color: Color
    @ViewBuilder var center: () -> Center

    var body: some View {
        ZStack {
            Circle()
                .stroke(Palette.track, lineWidth: 8)
            Circle()
                .trim(from: 0, to: max(0, min(1, progress)))
                .stroke(
                    color,
                    style: StrokeStyle(lineWidth: 8, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(Motion.linear(Motion.ring), value: progress)
            center()
        }
        .frame(width: size, height: size)
    }
}
