import Cocoa
import OmniCore

final class PasteboardManager {
    static let shared = PasteboardManager()

    private let pasteboard = NSPasteboard.general
    private var lastChangeCount: Int

    private init() {
        lastChangeCount = pasteboard.changeCount
    }

    var hasNewContent: Bool {
        pasteboard.changeCount != lastChangeCount
    }

    func getLatestContent() -> String? {
        lastChangeCount = pasteboard.changeCount
        return pasteboard.string(forType: .string)
    }

    func copyToClipboard(_ content: String) {
        pasteboard.clearContents()
        pasteboard.setString(content, forType: .string)
        // Ignore our own writes so the poller doesn't re-import what the app
        // itself just put on the clipboard (self-copy feedback loop).
        lastChangeCount = pasteboard.changeCount
    }
}
