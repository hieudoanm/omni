import OmniCore
import SwiftUI

/// Countdown timer with presets and a circular progress ring.
struct TimerView: View {
    @ObservedObject var viewModel: TimerViewModel

    var body: some View {
        GeometryReader { geometry in
            let ringSize = ClockFaceSizing.ring(in: geometry.size)
            VStack(spacing: Spacing.xxl) {
                presetRow

                Spacer()

                ring(size: ringSize)

                controls

                Spacer()

                presetBadge
            }
            .padding(.vertical, Spacing.md)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }

    private var presetRow: some View {
        HStack(spacing: Spacing.sm) {
            ForEach(TimerViewModel.presets) { preset in
                let isSelected = viewModel.selectedPreset == preset
                ChipButton(
                    title: preset.label,
                    isSelected: isSelected,
                    accessibilityLabel: "Set timer to \(preset.label)"
                ) {
                    viewModel.applyPreset(preset)
                }
            }
        }
    }

    private func ring(size: CGFloat) -> some View {
        ClockRing(
            size: size,
            progress: viewModel.progress,
            color: viewModel.isFinished ? .green : Color.accentColor
        ) {
            VStack(spacing: Spacing.xxs) {
                Text(viewModel.timeText)
                    .font(.system(size: min(size * 0.21, Typography.readoutCap), weight: .medium, design: .monospaced))
                    .monospacedDigit()
                Text(viewModel.isFinished ? "done" : "remaining")
                    .font(.caption)
                    .tracking(2)
                    .foregroundColor(viewModel.isFinished ? Color.secondary : Color.accentColor)
                    .textCase(.uppercase)
            }
        }
    }

    private var controls: some View {
        HStack(spacing: Spacing.xxl) {
            CircleIconButton(systemImage: "arrow.counterclockwise", size: 30) {
                viewModel.reset()
            }
            .disabled(viewModel.timeText == ClockFormatter.timer(viewModel.totalSeconds) && !viewModel.isFinished)

            CircleIconButton(
                systemImage: viewModel.isRunning ? "pause.fill" : "play.fill",
                size: 64,
                color: viewModel.isRunning ? .red : .accentColor
            ) {
                viewModel.toggleRunning()
            }
        }
    }

    private var presetBadge: some View {
        CapsuleBadge(text: viewModel.selectedPreset.label, labelColor: .secondary)
    }
}
