import Foundation
import OmniCore

final class ClipboardMonitor {
    private var timer: Timer?
    private let store: ClipboardStore
    private let pasteboard = PasteboardManager.shared

    init(store: ClipboardStore) {
        self.store = store
    }

    func start() {
        guard timer == nil else { return }
        timer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] _ in
            self?.check()
        }
    }

    func stop() {
        timer?.invalidate()
        timer = nil
    }

    func check() {
        guard pasteboard.hasNewContent, let content = pasteboard.getLatestContent() else { return }
        store.add(content)
    }
}
