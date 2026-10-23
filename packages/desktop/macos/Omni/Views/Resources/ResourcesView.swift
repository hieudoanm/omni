import AppKit
import OmniCore
import SwiftUI

/// The Resources section: CPU, Memory, Storage, Swap, Battery, and System Info.
///
/// Surface-level actions (Settings, Dashboard, Quit) belong to the panel footer
/// and the window toolbar, so they are reachable from every section.
struct ResourcesView: View {
    @ObservedObject var memoryViewModel: MemoryViewModel
    @ObservedObject var batteryViewModel: BatteryViewModel

    let layout: ContentLayout

    init(
        memoryViewModel: MemoryViewModel,
        batteryViewModel: BatteryViewModel,
        layout: ContentLayout = .panel
    ) {
        self.memoryViewModel = memoryViewModel
        self.batteryViewModel = batteryViewModel
        self.layout = layout
    }

    private enum Section: Hashable, CaseIterable {
        case overview
        case memory
        case disk
        case cpu
        case swap
        case battery
        case system

        var title: String {
            switch self {
            case .overview: return "Overview"
            case .memory: return "Memory"
            case .disk: return "Disk"
            case .cpu: return "CPU"
            case .swap: return "Swap"
            case .battery: return "Battery"
            case .system: return "System"
            }
        }
    }

    @State private var section: Section = .overview

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
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        }
        .padding(Spacing.inset)
    }

    private var windowLayout: some View {
        SectionGrid(items: Section.allCases, title: \.title, minimumColumnWidth: 300) { item in
            sectionContent(item)
        }
    }

    private var header: some View {
        HStack {
            Label("Resources", systemImage: "gauge.with.dots.needle.50percent")
                .font(.headline)
                .accessibilityElement(children: .combine)
            Spacer()
            Button(action: refreshAll) {
                Image(systemName: "arrow.clockwise")
                    .frame(width: 24, height: 24)
                    .contentShape(Rectangle())
                    .accessibilityLabel("Refresh")
            }
            .buttonStyle(.borderless)
            .help("Refresh")
        }
        .padding(.bottom, Spacing.lg)
    }

    private var sectionPicker: some View {
        Picker("Section", selection: $section) {
            ForEach(Section.allCases, id: \.self) { item in
                Text(item.title).tag(item)
            }
        }
        .pickerStyle(.segmented)
        .labelsHidden()
        .accessibilityLabel("Resources section")
    }

    @ViewBuilder
    private func sectionContent(_ section: Section) -> some View {
        switch section {
        case .overview:
            OverviewView(
                memoryViewModel: memoryViewModel,
                batteryViewModel: batteryViewModel
            )
        case .memory:
            memorySection
        case .disk:
            DiskView(stats: memoryViewModel.diskStats)
        case .cpu:
            CPUView(stats: memoryViewModel.cpuStats)
        case .swap:
            SwapView(stats: memoryViewModel.swapStats)
        case .battery:
            BatterySectionView(viewModel: batteryViewModel)
        case .system:
            SystemInfoView(info: memoryViewModel.systemInfo)
        }
    }

    private var memorySection: some View {
        VStack(alignment: .leading, spacing: Spacing.inset) {
            MemoryView(stats: memoryViewModel.memoryStats)

            pressureRow
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var pressureRow: some View {
        HStack {
            Text("Memory Pressure")
                .font(.caption)
                .foregroundColor(.secondary)
            Spacer()
            Text(memoryViewModel.memoryPressure.displayText)
                .font(.caption)
                .fontWeight(.medium)
                .monospacedDigit()
                .foregroundColor(pressureColor)
        }
        .accessibilityElement(children: .combine)
    }

    private var pressureColor: Color {
        switch memoryViewModel.memoryPressure {
        case .normal: return Color.secondary
        case .warn: return Color.orange
        case .critical: return Color.red
        case .unknown: return Color.secondary
        }
    }

    private func refreshAll() {
        memoryViewModel.refresh()
        batteryViewModel.refresh()
    }
}
