import SwiftUI

/// A round icon button: the clock controls' reset, play/pause, lap and stop.
///
/// The label is the SF Symbol, so `size` carries the whole contract — the
/// glyph scales with the circle and the button stays a circle at any size.
struct CircleIconButton: View {
    let systemImage: String
    var size: CGFloat = 46
    var color: Color = .accentColor
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: size >= 60 ? 22 : 14, weight: .semibold))
                .foregroundColor(.white)
                .frame(width: size, height: size)
                .background(color, in: Circle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(systemImage)
    }
}
