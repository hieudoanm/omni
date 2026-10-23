import AppKit
import SwiftUI

/// Tags a window with a stable identifier so AppKit notifications can tell the
/// dashboard window apart from the other scenes (Settings, Homebrew).
///
/// SwiftUI scene declarations do not expose their `NSWindow`, so this is the
/// smallest bridge that lets the app reason about window identity.
struct WindowIdentifierTag: NSViewRepresentable {
    let identifier: String

    func makeNSView(context _: Context) -> NSView {
        let view = NSView(frame: .zero)
        DispatchQueue.main.async { tag(view) }
        return view
    }

    func updateNSView(_ nsView: NSView, context _: Context) {
        tag(nsView)
    }

    private func tag(_ view: NSView) {
        view.window?.identifier = NSUserInterfaceItemIdentifier(identifier)
    }
}
