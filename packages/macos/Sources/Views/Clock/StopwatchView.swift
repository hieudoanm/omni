import OmniCore
import SwiftUI

/// Stopwatch with lap timing and a laps table.
struct StopwatchView: View {
    @ObservedObject var viewModel: StopwatchViewModel

    var body: some View {
        VStack(spacing: Spacing.xl) {
            Spacer()

            Text(viewModel.timeText)
                .font(Typography.ringReadout)
                .monospacedDigit()
                .animation(Motion.linear(Motion.tick), value: viewModel.elapsedMilliseconds)

            controls

            if !viewModel.laps.isEmpty {
                Divider()
                lapsTable
            }

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(.vertical, Spacing.md)
    }

    private var controls: some View {
        HStack(spacing: Spacing.xxl) {
            CircleIconButton(systemImage: "flag.fill", size: 46, color: .gray) {
                viewModel.lap()
            }
            .disabled(!viewModel.isRunning)

            CircleIconButton(
                systemImage: viewModel.isRunning ? "pause.fill" : "play.fill",
                size: 70,
                color: viewModel.isRunning ? .red : .accentColor
            ) {
                if viewModel.isRunning {
                    viewModel.stop()
                } else {
                    viewModel.start()
                }
            }

            CircleIconButton(systemImage: "stop.fill", size: 46, color: .gray) {
                viewModel.stop()
            }
            .disabled(!viewModel.isRunning)

            CircleIconButton(systemImage: "arrow.counterclockwise", size: 46, color: .gray) {
                viewModel.reset()
            }
            .disabled(!viewModel.canReset)
        }
    }

    private var lapsTable: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 0) {
                ForEach(viewModel.laps) { lap in
                    HStack {
                        Text("Lap \(lap.index)")
                            .monospacedDigit()
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("+\(ClockFormatter.stopwatch(lap.splitMilliseconds))")
                            .monospacedDigit()
                            .foregroundColor(.secondary)
                        Text(ClockFormatter.stopwatch(lap.elapsedMilliseconds))
                            .monospacedDigit()
                            .foregroundColor(.primary)
                    }
                    .font(.system(.body, design: .monospaced))
                    .padding(.vertical, Spacing.tight)
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel(
                        "Lap \(lap.index), \(ClockFormatter.stopwatch(lap.elapsedMilliseconds))"
                    )
                }
            }
        }
        .frame(maxHeight: 220)
    }
}
