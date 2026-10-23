import Foundation
import OmniCore
import SwiftUI

/// Drives clipboard monitoring and history for the Clipboard tab.
@MainActor
final class ClipboardViewModel: ObservableObject {
    let store: ClipboardStore

    @Published var searchQuery = ""

    @Published var isMonitoring: Bool {
        didSet {
            UserDefaults.standard.set(isMonitoring, forKey: Self.monitorKey)
            updateMonitor()
        }
    }

    @Published var maxHistorySize: Int {
        didSet {
            UserDefaults.standard.set(maxHistorySize, forKey: Self.maxHistoryKey)
            store.maxItems = maxHistorySize
        }
    }

    private let monitor: ClipboardMonitor

    private static let monitorKey = "clipboard.monitorEnabled"
    private static let maxHistoryKey = "clipboard.maxHistorySize"

    init(store: ClipboardStore = ClipboardStore()) {
        self.store = store
        let defaults = UserDefaults.standard
        isMonitoring = defaults.object(forKey: Self.monitorKey) as? Bool ?? true
        maxHistorySize = defaults.object(forKey: Self.maxHistoryKey) as? Int ?? 500
        monitor = ClipboardMonitor(store: store)
        store.maxItems = maxHistorySize
        updateMonitor()
    }

    deinit {
        monitor.stop()
    }

    func refresh() {
        monitor.check()
    }

    func copyToClipboard(_ item: ClipboardItem) {
        PasteboardManager.shared.copyToClipboard(item.content)
    }

    /// One clipboard screen. The window gives each its own destination, the way
    /// `ClockViewModel.Section` does; the panel keeps them behind one picker.
    enum Section: String, CaseIterable, Hashable {
        case all
        case text
        case images
        case files
        case pinned

        var title: String {
            switch self {
            case .all: return "All"
            case .text: return "Text"
            case .images: return "Images"
            case .files: return "Files"
            case .pinned: return "Pinned"
            }
        }

        var systemImage: String {
            switch self {
            case .all: return "tray.full"
            case .text: return "text.alignleft"
            case .images: return "photo"
            case .files: return "doc"
            case .pinned: return "pin"
            }
        }

        func matches(_ item: ClipboardItem) -> Bool {
            switch self {
            case .all: return true
            case .text: return item.contentType == .text
            case .images: return item.contentType == .image
            case .files: return item.contentType == .file
            case .pinned: return item.pinned
            }
        }

        var emptyTitle: String {
            switch self {
            case .all: return "Nothing copied yet"
            case .text: return "No text copied yet"
            case .images: return "No images copied yet"
            case .files: return "No files copied yet"
            case .pinned: return "Nothing pinned yet"
            }
        }
    }

    private func updateMonitor() {
        if isMonitoring {
            monitor.start()
            monitor.check()
        } else {
            monitor.stop()
        }
    }
}
