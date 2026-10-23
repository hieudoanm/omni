import SwiftUI

/// Pomodoro timer with work/break phases and a circular progress ring.
struct PomodoroView: View {
    @ObservedObject var viewModel: PomodoroViewModel

    var body: some View {
        GeometryReader { geometry in
            let ringSize = ClockFaceSizing.ring(in: geometry.size)
            VStack(spacing: Spacing.section) {
                presetRow

                phaseBadge

                ring(size: ringSize)

                controls

                Spacer()
            }
            .padding(.vertical, Spacing.md)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }

    private var presetRow: some View {
        HStack(spacing: Spacing.sm) {
            ForEach(PomodoroViewModel.presets) { preset in
                let isSelected = viewModel.selectedPreset == preset
                ChipButton(
                    title: preset.label,
                    isSelected: isSelected,
                    accessibilityLabel: "Set pomodoro to \(preset.workMinutes) minutes work, \(preset.breakMinutes) minutes break"
                ) {
                    viewModel.applyPreset(preset)
                }
            }
        }
    }

    private var phaseBadge: some View {
        CapsuleBadge(
            text: "\(viewModel.phase.title) · \(viewModel.round) / ∞",
            font: .system(.caption, design: .monospaced),
            tint: viewModel.phase == .work ? .accentColor : .green,
            labelColor: .secondary
        )
        .accessibilityLabel(viewModel.statusText)
    }

    private func ring(size: CGFloat) -> some View {
        ClockRing(size: size, progress: viewModel.progress, color: faceColor) {
            HStack(alignment: .firstTextBaseline, spacing: Spacing.hairline) {
                Text(viewModel.timeText)
                    .font(.system(size: min(size * 0.21, Typography.readoutCap), weight: .medium, design: .monospaced))
                    .monospacedDigit()
                Text("min")
                    .font(.system(size: 12, weight: .regular, design: .monospaced))
                    .foregroundColor(.secondary)
            }
        }
    }

    private var controls: some View {
        HStack(spacing: Spacing.xxl) {
            CircleIconButton(systemImage: "arrow.counterclockwise", size: 30, color: .gray) {
                viewModel.reset()
            }
            .disabled(viewModel.secondsRemaining == viewModel.totalSeconds)

            CircleIconButton(
                systemImage: viewModel.isRunning ? "pause.fill" : "play.fill",
                size: 64,
                color: viewModel.isRunning ? .red : faceColor
            ) {
                viewModel.toggleRunning()
            }

            CircleIconButton(systemImage: "forward.end.fill", size: 30, color: .gray) {
                viewModel.skipPhase()
            }
            .help("Skip to next phase")
        }
    }

    private var faceColor: Color {
        viewModel.phase == .work ? .accentColor : .green
    }
}
