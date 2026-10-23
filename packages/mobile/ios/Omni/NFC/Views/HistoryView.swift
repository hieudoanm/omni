import SwiftData
import SwiftUI

/// Scan history — port of Android's `nfc/ui/history/HistoryScreen`.
/// Uses SwiftData `@Query` instead of a Room-backed ViewModel flow.
struct HistoryView: View {
    @Environment(\.hud) private var hud
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \TagHistoryItem.scannedAt, order: .reverse)
    private var items: [TagHistoryItem]

    @State private var confirmClear = false

    private static let dateFormat: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM dd, yyyy HH:mm"
        return formatter
    }()

    var body: some View {
        Group {
            if items.isEmpty {
                emptyState
            } else {
                list
            }
        }
        .background(hud.background.ignoresSafeArea())
        .navigationTitle("History")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if !items.isEmpty {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(role: .destructive) {
                        confirmClear = true
                    } label: {
                        Image(systemName: "trash")
                    }
                }
            }
        }
        .confirmationDialog(
            "Clear History",
            isPresented: $confirmClear,
            titleVisibility: .visible
        ) {
            Button("Clear", role: .destructive) {
                clearHistory()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to clear all scan history?")
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Spacer()
            Image(systemName: "antenna.radiowaves.left.and.right")
                .font(.system(size: 48))
                .foregroundStyle(hud.muted)
            Text("No tags scanned yet")
                .hudBody(16)
                .foregroundStyle(hud.muted)
            Spacer()
        }
        .frame(maxWidth: .infinity)
    }

    private var list: some View {
        List(items) { item in
            HistoryRow(item: item, dateFormat: Self.dateFormat)
                .listRowBackground(hud.surfaceVariant)
                .listRowSeparatorTint(hud.border)
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
    }

    private func clearHistory() {
        for item in items {
            modelContext.delete(item)
        }
        try? modelContext.save()
    }
}

private struct HistoryRow: View {
    @Environment(\.hud) private var hud

    let item: TagHistoryItem
    let dateFormat: DateFormatter

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text("UID: \(item.uid)")
                    .hudMono(14)
                    .foregroundStyle(hud.text)
                    .lineLimit(1)
                    .truncationMode(.middle)
                Spacer()
                Text(dateFormat.string(from: item.scannedAt))
                    .hudCaption(12)
                    .foregroundStyle(hud.muted)
            }
            Text(item.techSummary)
                .hudCaption(12)
                .foregroundStyle(hud.muted)
                .lineLimit(1)
                .truncationMode(.tail)
            if !item.records.isEmpty {
                Text("\(item.maxSize)B max / \(item.usedSize)B used")
                    .hudCaption(12)
                    .foregroundStyle(hud.muted)
            }
        }
        .padding(.vertical, 4)
    }
}
