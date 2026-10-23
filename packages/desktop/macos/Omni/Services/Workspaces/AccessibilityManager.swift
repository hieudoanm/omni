import AppKit
import ApplicationServices
import CoreGraphics

/// Thin wrapper over the macOS Accessibility (AX) APIs used to arrange windows.
final class AccessibilityManager: Sendable {
    static let shared = AccessibilityManager()

    var isAccessibilityEnabled: Bool {
        AXIsProcessTrusted()
    }

    func requestAccessibilityPermission() {
        let options = [kAXTrustedCheckOptionPrompt.takeRetainedValue(): true] as CFDictionary
        AXIsProcessTrustedWithOptions(options)
    }

    func getWindowList(pid: pid_t) -> [AXUIElement] {
        let app = AXUIElementCreateApplication(pid)
        var value: CFTypeRef?
        let result = AXUIElementCopyAttributeValue(app, kAXWindowsAttribute as CFString, &value)
        guard result == .success, let windows = value as? [AXUIElement] else {
            return []
        }
        return windows
    }

    func getWindowTitle(_ window: AXUIElement) -> String? {
        var value: CFTypeRef?
        let result = AXUIElementCopyAttributeValue(window, kAXTitleAttribute as CFString, &value)
        guard result == .success else { return nil }
        return value as? String
    }

    func setWindowPosition(_ window: AXUIElement, to point: CGPoint) -> Bool {
        var mutable = point
        guard let value = AXValueCreate(.cgPoint, &mutable) else { return false }
        return AXUIElementSetAttributeValue(window, kAXPositionAttribute as CFString, value) == .success
    }

    func setWindowSize(_ window: AXUIElement, to size: CGSize) -> Bool {
        var mutable = size
        guard let value = AXValueCreate(.cgSize, &mutable) else { return false }
        return AXUIElementSetAttributeValue(window, kAXSizeAttribute as CFString, value) == .success
    }
}
