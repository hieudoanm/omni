import AppKit
import Foundation

/// Finds, launches, and polls for running applications by bundle identifier.
struct ApplicationLauncher: Sendable {
    func runningPID(bundleIdentifier: String) -> pid_t? {
        NSWorkspace.shared.runningApplications
            .first { $0.bundleIdentifier == bundleIdentifier }?.processIdentifier
    }

    /// Launches an application without activating it. Returns false when the
    /// application cannot be located on disk.
    func launch(bundleIdentifier: String) -> Bool {
        guard let url = NSWorkspace.shared.urlForApplication(withBundleIdentifier: bundleIdentifier) else {
            return false
        }
        let configuration = NSWorkspace.OpenConfiguration()
        configuration.activates = false
        NSWorkspace.shared.openApplication(at: url, configuration: configuration)
        return true
    }

    func waitUntilRunning(bundleIdentifier: String, timeout: TimeInterval) async -> pid_t? {
        let deadline = Date().addingTimeInterval(timeout)
        while Date() < deadline {
            if let pid = runningPID(bundleIdentifier: bundleIdentifier) {
                return pid
            }
            try? await Task.sleep(for: .milliseconds(200))
        }
        return nil
    }
}
