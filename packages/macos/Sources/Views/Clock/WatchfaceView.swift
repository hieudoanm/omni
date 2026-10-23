import OmniCore
import SwiftUI

/// Analog (Dot) and digital (Minimal) clock faces, ticked every second.
struct WatchfaceView: View {
    private enum Face: Hashable {
        case dot
        case minimal
    }

    @State private var face: Face = .dot
    @State private var now = Date()

    var body: some View {
        VStack(spacing: 0) {
            faceContent
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .animation(Motion.linear(Motion.face), value: now)

            Divider()

            HStack(spacing: Spacing.lg) {
                ChipButton(title: "DOT", isSelected: face == .dot) {
                    face = .dot
                }
                ChipButton(title: "MINIMAL", isSelected: face == .minimal) {
                    face = .minimal
                }
            }
            .padding(.vertical, Spacing.md)
        }
        .task {
            while !Task.isCancelled {
                now = Date()
                try? await Task.sleep(for: .seconds(1))
            }
        }
    }

    @ViewBuilder
    private var faceContent: some View {
        switch face {
        case .dot:
            analogFace
        case .minimal:
            minimalFace
        }
    }

    private var analogFace: some View {
        GeometryReader { geometry in
            let minDimension = ClockFaceSizing.face(in: geometry.size)
            ZStack {
                Circle()
                    .fill(Color(nsColor: .controlBackgroundColor))
                    .overlay {
                        Circle().stroke(Palette.stroke, lineWidth: 2)
                    }
                    .shadow(color: Palette.shadow, radius: 12, y: 6)

                handDot(
                    angle: hourAngle,
                    radius: minDimension * 0.30,
                    size: 26,
                    color: .accentColor
                )
                handDot(
                    angle: minuteAngle,
                    radius: minDimension * 0.34,
                    size: 18,
                    color: Palette.muted
                )
                handDot(
                    angle: secondAngle,
                    radius: minDimension * 0.38,
                    size: 10,
                    color: Palette.faint
                )

                Circle()
                    .fill(Palette.pin)
                    .frame(width: 5, height: 5)
            }
            .frame(width: minDimension, height: minDimension)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .padding(Spacing.xl)
    }

    private func handDot(angle: Double, radius: CGFloat, size: CGFloat, color: Color) -> some View {
        Circle()
            .fill(color)
            .shadow(color: Palette.shadow, radius: 4, y: 2)
            .frame(width: size, height: size)
            .offset(
                x: radius * sin(angle * .pi / 180),
                y: -radius * cos(angle * .pi / 180)
            )
    }

    private var minimalFace: some View {
        VStack(spacing: 0) {
            HStack(alignment: .firstTextBaseline, spacing: Spacing.sm) {
                Text(hourText)
                    .foregroundColor(.primary)
                Text(":")
                    .foregroundColor(Palette.dimmed)
                Text(minuteText)
                    .foregroundColor(Palette.lead)
                Text(":")
                    .foregroundColor(Palette.dimmed)
                Text(secondText)
                    .foregroundColor(.secondary)
            }
            .font(Typography.digitalReadout)
            .monospacedDigit()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(Spacing.xxl)
        .overlay {
            Circle()
                .stroke(Palette.stroke, lineWidth: 2)
                .padding(Spacing.xl)
        }
    }

    private var hourText: String {
        ClockFormatter.two(Calendar.current.component(.hour, from: now))
    }

    private var minuteText: String {
        ClockFormatter.two(Calendar.current.component(.minute, from: now))
    }

    private var secondText: String {
        ClockFormatter.two(Calendar.current.component(.second, from: now))
    }

    private var hourAngle: Double {
        let hours = Double(Calendar.current.component(.hour, from: now))
        let minutes = Double(Calendar.current.component(.minute, from: now))
        return (hours.truncatingRemainder(dividingBy: 12)) * 30 + minutes * 0.5
    }

    private var minuteAngle: Double {
        let minutes = Double(Calendar.current.component(.minute, from: now))
        let seconds = Double(Calendar.current.component(.second, from: now))
        return minutes * 6 + seconds * 0.1
    }

    private var secondAngle: Double {
        Double(Calendar.current.component(.second, from: now)) * 6
    }
}
