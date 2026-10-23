import SwiftUI

/// The Clock section.
///
/// The panel is one Clock tab with a segmented picker, because a popover only
/// has room for one screen. The window gives every clock its own screen
/// (`focus`), driven by the sidebar's Clock group, and drops the picker.
struct ClockView: View {
    @ObservedObject var viewModel: ClockViewModel

    let layout: ContentLayout
    private var focus: ClockViewModel.Section?

    init(
        viewModel: ClockViewModel,
        layout: ContentLayout = .panel,
        focus: ClockViewModel.Section? = nil
    ) {
        self.viewModel = viewModel
        self.layout = layout
        self.focus = focus
    }

    @State private var section: ClockViewModel.Section = .watchface

    var body: some View {
        switch layout {
        case .panel:
            panelLayout
        case .window:
            windowLayout
        }
    }

    private var panelLayout: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            Divider()

            sectionPicker

            Divider()

            sectionContent(section)
        }
        .padding(Spacing.inset)
    }

    /// One clock fills the window, centred with room to breathe. `focus` is
    /// always set by the clock routes; the watchface is the sensible fallback.
    private var windowLayout: some View {
        sectionContent(focus ?? .watchface)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(.horizontal, Spacing.xxxl)
            .padding(.vertical, Spacing.xl)
    }

    private var header: some View {
        HStack {
            Label("Clock", systemImage: "clock")
                .font(.headline)
                .accessibilityElement(children: .combine)
            Spacer()
            Text("\(Date.now.formatted(date: .omitted, time: .shortened))")
                .font(.caption)
                .monospacedDigit()
                .foregroundColor(.secondary)
        }
        .padding(.bottom, Spacing.md)
    }

    private var sectionPicker: some View {
        Picker("Section", selection: $section) {
            ForEach(ClockViewModel.Section.allCases, id: \.self) { item in
                Text(item.title).tag(item)
            }
        }
        .pickerStyle(.segmented)
        .labelsHidden()
        .accessibilityLabel("Clock section")
    }

    @ViewBuilder
    private func sectionContent(_ section: ClockViewModel.Section) -> some View {
        switch section {
        case .watchface:
            WatchfaceView()
        case .worldClock:
            WorldClockView(viewModel: viewModel.worldClock)
        case .timer:
            TimerView(viewModel: viewModel.timer)
        case .stopwatch:
            StopwatchView(viewModel: viewModel.stopwatch)
        case .pomodoro:
            PomodoroView(viewModel: viewModel.pomodoro)
        }
    }
}
